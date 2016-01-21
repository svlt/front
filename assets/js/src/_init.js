/**
 * Initialize the application
 * @return {Void}
 */
module.exports = function init() {

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

};
