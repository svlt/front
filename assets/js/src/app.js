$(function() {

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
		}
	});

});
