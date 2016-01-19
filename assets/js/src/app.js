/**
 * Core App class
 * Contains global methods for running the core functionality of the site
 * @type {Object}
 */
var App = {

	/**
	 * Initialize the application
	 * @return {Void}
	 */
	init: function() {

		/**
		 * Convert binary string to hexadecimal representation
		 * @param  {String} s
		 * @return {String}
		 */
		window.bin2hex = function(s) {
			var i, l, o = '', n;
			s += '';
			for (i = 0, l = s.length; i < l; i++) {
				n = s.charCodeAt(i).toString(16);
				o += n.length < 2 ? '0' + n : n;
			}
			return o;
		};

		// Configure OpenPGP
		openpgp.initWorker(BASE + '/assets/bower_components/openpgp/dist/openpgp.worker.min.js');
		openpgp.config.show_version = false;
		openpgp.config.show_comment = false;

		// Initialize inline tooltips and popovers
		$('[data-toggle="tooltip"]').tooltip();
		$('[data-toggle="popover"]').popover();

		// Use localStorage instead of sessionStorage if persistent flag is set
		if(localStorage.getItem('persistent')) {
			App.store = localStorage;
		} else {
			App.store = sessionStorage;
		}
	},

	/**
	 * Methods for cryptography
	 * @type {Object}
	 */
	crypto: {

		/**
		 * Generate secure random bytes
		 * @param  {Integer} bytes
		 * @return {String}
		 */
		randBytes: function(bytes) {
			if(!bytes)
				bytes = 256;
			return openpgp.crypto.random.getRandomBytes(bytes);
		},

		/**
		 * Generate a SHA-512 hash of a string
		 * @param  {String} str
		 * @return {String}
		 */
		sha512: function(str) {
			return openpgp.crypto.hash.digest(openpgp.enums.hash.sha512, str);
		},

		/**
		 * Methods for PGP cryptography
		 * @type {Object}
		 */
		pgp: {

			/**
			 * Generate a PGP key pair
			 * @param  {Integer}  bits
			 * @param  {String}   username
			 * @param  {String}   passphrase
			 * @param  {Function} callback
			 * @return {Object}   Promise
			 */
			genKeyPair: function(bits, username, passphrase, callback) {
				var options = {
					numBits: bits,
					userId: username,
					passphrase: passphrase,
				};
				return openpgp.generateKeyPair(options).then(function(data) {
					callback(data);
				});
			},

			/**
			 * Encrypt a message with a PGP public key
			 * @param  {String}   message
			 * @param  {String}   publicKey
			 * @param  {Function} callback
			 * @return {Object}   Promise
			 */
			encrypt: function(message, publicKey, callback) {
				publicKey = openpgp.key.readArmored(publicKey);
				return openpgp.encryptMessage(publicKey.keys, message).then(function(data) {
					callback(data);
				});
			},

			/**
			 * Encrypt and sign a message with a PGP public and private key
			 * @param  {String}   message
			 * @param  {String}   publicKey
			 * @param  {String}   privateKey
			 * @param  {Function} callback
			 * @return {Object}   Promise
			 */
			encryptSigned: function(message, publicKey, privateKey, callback) {
				publicKey = openpgp.key.readArmored(publicKey);
				if(typeof privateKey == 'string') {
					privateKey = openpgp.key.readArmored(privateKey).keys[0];
				}
				return openpgp.signAndEncryptMessage(publicKey.keys, privateKey, message).then(function(data) {
					callback(data);
				});
			},

			/**
			 * Decrypt an armored PGP message with a PGP private key
			 * @param  {String}   message
			 * @param  {String}   privateKey
			 * @param  {Function} callback
			 * @return {Object}   Promise
			 */
			decrypt: function(message, privateKey, callback) {
				message = openpgp.message.readArmored(message);
				if(typeof privateKey == 'string') {
					privateKey = openpgp.key.readArmored(privateKey).keys[0];
				}
				return openpgp.decryptMessage(privateKey, message).then(function(data) {
					callback(data);
				});
			},

			/**
			 * Decrypt and verify an armored PGP message
			 * with a PGP private and public key
			 * @param  {String}   message
			 * @param  {String}   privateKey
			 * @param  {String}   publicKey
			 * @param  {Function} callback
			 * @return {Object}   Promise
			 */
			decryptAndVerify: function(message, privateKey, publicKey, callback) {
				message = openpgp.message.readArmored(message);
				publicKey = openpgp.key.readArmored(publicKey);
				if(typeof privateKey == 'string') {
					privateKey = openpgp.key.readArmored(privateKey).keys[0];
				}
				return openpgp.decryptAndVerifyMessage(privateKey, publicKey.keys, message).then(function(data) {
					// Check data.signatures[0].valid for verification
					// data.text contains the cleartext
					callback(data);
				});
			}

		},

		/**
		 * Methods for symmetric cryptography
		 * @type {Object}
		 */
		symmetric: {

			/**
			 * Encrypt a message with a symmetric key
			 * @param  {String} message
			 * @param  {String} key
			 * @return {String}
			 */
			encrypt: function(message, key) {
				return btoa(sjcl.encrypt(key, message));
			},

			/**
			 * Decrypt a message with a symmetric key
			 * @param  {String} message
			 * @param  {String} key
			 * @return {String}
			 */
			decrypt: function(message, key) {
				return sjcl.decrypt(key, atob(message));
			}

		}
	},

	/**
	 * Methods for manipulating the session
	 * @type {Object}
	 */
	session: {

		/**
		 * Authenticate a user with login credentials
		 * @param  {string}   username
		 * @param  {string}   passphrase
		 * @param  {Function} success
		 * @param  {Function} fail
		 * @return {Object}   jqXHR
		 */
		login: function(username, passphrase, success, fail) {
			// Load salt from API
			return $.post(API + 'auth.json', {
				action: 'salt',
				username: username
			}, function(data) {
				if(data.salt) {
					// Generate hash from salt + passphrase
					var hash = bin2hex(App.crypto.sha512(data.salt + passphrase));

					// Authenticate
					$.post(API + 'auth.json', {
						action: 'auth',
						username: username,
						password_hash: hash
					}, function(data) {

						// Set cookie and update keystore
						if(data.token) {
							Cookies.set('session_token', data.token);
							App.session.keystore.update(passphrase, success);
						} else {
							fail(data);
						}

					}, 'json');
				} else {
					fail(data);
				}
			}, 'json');
		},

		/**
		 * Register a new user
		 * @param  {String}   username   [description]
		 * @param  {String}   passphrase [description]
		 * @param  {Function} callback   [description]
		 * @return {Void}
		 */
		registerKeygen: function(username, passphrase, callback) {
			App.crypto.pgp.genKeyPair(2048, username, passphrase, function(data) {
				var salt = btoa(App.crypto.randBytes(64)).substr(0, 64),
					pass = bin2hex(App.crypto.sha512(salt + passphrase)),
					symm = btoa(App.crypto.sha512(App.crypto.randBytes(256)));
				App.crypto.pgp.encrypt(symm, data.publicKeyArmored, function(symmEncrypted) {
					callback(data, salt, pass, symmEncrypted);
				});
			});
		},

		/**
		 * Methods for updating and reading the keystore
		 * @type {Object}
		 */
		keystore: {

			/**
			 * Update the keystore in App.store
			 * @param  {String}   passphrase
			 * @param  {Function} callback
			 * @return {Object}   jqXHR
			 */
			update: function(passphrase, callback) {
				return $.get(API + 'keystore.json', {
					_token: Cookies.get('session_token')
				}, function(data) {

					// Read private/public keys
					var privateKey = openpgp.key.readArmored(data.private).keys[0],
						publicKey = data.public;

					// Decrypt private key
					if(!privateKey.decrypt(passphrase)) {
						throw 'Unable to decrypt private key!';
					}

					// Decrypt and store symmetric keys
					var total = Object.keys(data.symmetric).length,
						count = 0;
					$.each(data.symmetric, function(i, k) {
						App.crypto.pgp.decrypt(k, privateKey, function(key) {
							App.store.setItem('keystore.symmetric.' + i, key);
							count ++;
							if(count == total && typeof callback == 'function') {
								callback(total);
							}
						});
					});

					// Write own keys to sessionStorage
					App.store.setItem('keystore.privateKey', privateKey.armor());
					App.store.setItem('keystore.publicKey', publicKey);

				}, 'json');
			},

			/**
			 * Get the current user's armored public key
			 * @return {String}
			 */
			getPublicKey: function() {
				return App.store.getItem('keystore.publicKey');
			},

			/**
			 * Get the current user's armored private key
			 * @return {String}
			 */
			getPrivateKey: function() {
				return App.store.getItem('keystore.publicKey');
			},

			/**
			 * Get a user's symmetric key by user ID
			 * @param  {Integer} userId
			 * @return {String}
			 */
			getSymmetricKey: function(userId) {
				return App.store.getItem('keystore.symmetric.' + userId);
			}
		}
	}
};

// Initialize app
$(function() {
	App.init();
});
