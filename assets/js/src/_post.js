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
	 * @return {promise}
	 */
	post: function(text, user_id, callback) {
		var symmKey = App.session.keystore.getSymmetricKey(user_id),
			cipherText = App.crypto.symmetric.encrypt(text, symmKey);
		return $.post(API + 'post.json', {
			content: cipherText,
			user_id: user_id,
			_token: Cookies.get('session_token')
		}, callback);
	},

	/**
	 * Decrypt symmetrically encrypted cyphertexts
	 * @return {void}
	 */
	decrypt: function() {
		$('.has-ciphertext').each(function(i, el) {
			var $el = $(el),
				symmKey = App.session.keystore.getSymmetricKey($el.attr('data-page-id')),
				plaintext = App.crypto.symmetric.decrypt($el.attr('data-ciphertext'), symmKey);
			$el.removeClass('has-ciphertext').addClass('had-ciphertext').text(plaintext);
		});
	}

};
