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
					var keystore = {};

					// Decrypt private key
					keystore.privateKey = openpgp.key.readArmored(keystore.private).keys[0].decrypt(passphrase);
					keystore.publicKey = data.publicKey;

					// Decrypt symmetric keys
					$.each(keystore.symmetric, function(i, k) {
						keystore.symmetric[i] = App.crypto.pgp.decrypt();
					});

					// Write keystore to sessionStorage
					sessionStorage.setItem('keystore', keystore);
				}, 'json');
			}
		}
	}
};

// Initialize app
$(function() {
	App.init();
});
