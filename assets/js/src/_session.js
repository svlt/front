/**
 * Methods for manipulating the session
 * @type {Object}
 */
module.exports = {

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
				//
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

};
