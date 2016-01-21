/**
 * Core App class
 * Contains global methods for running the core functionality of the site
 * @type {Object}
 */
window.App = {
	init: require('./app_init.js'),
	crypto: require('./app_crypto.js'),
	session: require('./app_session.js')
};

// Initialize app
$(function() {
	App.init();
});
