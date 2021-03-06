/**
 * Core App class
 * Contains global methods for running the core functionality of the site
 * @type {Object}
 */
window.App = {
	init: require('./_init.js'),
	crypto: require('./_crypto.js'),
	session: require('./_session.js'),
	post: require('./_post.js')
};
