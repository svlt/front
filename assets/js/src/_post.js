/**
 * Post-related stuffs
 * @type {Object}
 */
module.exports = {

	/**
	 * Save a new post
	 * @param  {string}   text
	 * @param  {int}      user_id
	 * @param  {function} callback
	 * @return {[type]}
	 */
	post: function(text, user_id, callback) {
		var symmKey = App.session.keystore.getSymmetricKey(user_id),
			cipherText = App.crypto.symmetric.encrypt(text, symmKey);
		$.post(API + 'post.json', {
			text: cipherText,
			user_id: user_id
		}, callback);
	}

};
