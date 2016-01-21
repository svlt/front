/**
 * Methods for symmetric cryptography
 * @type {Object}
 */
module.exports = {

	/**
	 * Encrypt a message with a symmetric key
	 * @param  {String} message
	 * @param  {String} key
	 * @return {String}
	 */
	encrypt: function(message, key) {
		return btoa(sjcl.encrypt(key, message));
	},

	/**
	 * Decrypt a message with a symmetric key
	 * @param  {String} message
	 * @param  {String} key
	 * @return {String}
	 */
	decrypt: function(message, key) {
		return sjcl.decrypt(key, atob(message));
	}

};
