// Core App class
var App = {
	init: function() {
		// Global Functions
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
	crypto: {
		randBytes: function(bytes) {
			if(!bytes)
				bytes = 256;
			return openpgp.crypto.random.getRandomBytes(bytes);
		},
		sha512: function(str) {
			return openpgp.crypto.hash.digest(openpgp.enums.hash.sha512, str);
		},
		pgp: {
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
			encrypt: function(message, publicKey, callback) {
				publicKey = openpgp.key.readArmored(publicKey);
				return openpgp.encryptMessage(publicKey.keys, message).then(function(data) {
					callback(data);
				});
			},
			encryptSigned: function(message, publicKey, privateKey, callback) {
				publicKey = openpgp.key.readArmored(publicKey);
				if(typeof privateKey == 'string') {
					privateKey = openpgp.key.readArmored(privateKey).keys[0];
				}
				return openpgp.signAndEncryptMessage(publicKey.keys, privateKey, message).then(function(data) {
					callback(data);
				});
			},
			decrypt: function(message, privateKey, callback) {
				message = openpgp.message.readArmored(message);
				if(typeof privateKey == 'string') {
					privateKey = openpgp.key.readArmored(privateKey).keys[0];
				}
				return openpgp.decryptMessage(privateKey, message).then(function(data) {
					callback(data);
				});
			},
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
		symmetric: {
			encrypt: function(message, key) {
				return btoa(sjcl.encrypt(key, message));
			},
			decrypt: function(message, key) {
				return sjcl.decrypt(key, atob(message));
			}
		}
	},
	session: {
		login: function(username, passphrase, callback) {
			$.post(API + 'auth.json', {
				action: 'salt',
				username: username
			}, function(data) {
				var hash = bin2hex(App.crypto.sha512(data.salt + passphrase));
				callback(hash);
			}, 'json');
		},
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
		keystore: {
			update: function(passphrase) {
				$.get(API + 'keystore.json', {
					_token: Cookies.get('session_token')
				}, function(data) {
					// Decrypt private key
					var privateKey = openpgp.key.readArmored(keystore.private).keys[0].decrypt(passphrase),
						publicKey = data.publicKey;

					// Write own keys to sessionStorage
					App.store.setItem('keystore.privateKey', privateKey);
					App.store.setItem('keystore.publicKey', publicKey);

					// Decrypt and store symmetric keys
					$.each(data.symmetric, function(i, k) {
						console.log(k);
						App.crypto.pgp.decrypt(k, keystore.privateKey, function(key) {
							App.store.set('keystore.symmetric.' + i, key);
						});
					});
				}, 'json');
			},
			getPublicKey: function() {
				App.store.getItem('keystore.publicKey');
			},
			getPrivateKey: function() {
				App.store.getItem('keystore.publicKey');
			},
			getSymmetricKey: function(userId) {
				App.store.getItem('keystore.symmetric.' + userId);
			}
		}
	}
};

// Initialize app
$(function() {
	App.init();
});
