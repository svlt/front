$(function() {

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
