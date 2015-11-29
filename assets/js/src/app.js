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

		// Initialize profile banners
		$('.card-profile-banner, .profile-banner').each(function(i, el) {
			var $this = $(this);
			if($this.css('background-image') == 'none') {
				$this.geopattern($this.data('username'));
				$this.css('background-size', '360px');
				$this.css('background-position', 'center bottom');
			}
		});

	},

	Session: {

		login: function(username, passphrase, callback) {
			$.post(API + 'auth.json', {
				action: 'salt',
				username: username
			}, function(data) {
				var hash = bin2hex(openpgp.crypto.hash.digest(openpgp.enums.hash.sha512, data.salt + passphrase));
				callback(hash);
			}, 'json');
		},

		registerKeygen: function(username, passphrase, callback) {
			var options = {
				numBits: 2048,
				userId: username + '@svlt',
				passphrase: passphrase,
			};
			openpgp.generateKeyPair(options).then(function(data) {
				var salt = btoa(openpgp.crypto.random.getRandomBytes(64)).substr(0,64),
					pass = bin2hex(openpgp.crypto.hash.digest(openpgp.enums.hash.sha512, salt + passphrase)),
					symm = btoa(openpgp.crypto.hash.digest(openpgp.enums.hash.sha512, openpgp.crypto.random.getRandomBytes(256)));
				callback(data, salt, pass, symm);
			});
		},

		keystore: {

			update: function() {
				$.get(API + 'keystore.json', function(data) {

				}, 'json');
			}

		}

	}

};

// Initialize app
$(function() {
	App.init();
});
