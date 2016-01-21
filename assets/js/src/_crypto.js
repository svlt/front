/**
 * Methods for cryptography
 * @type {Object}
 */
module.exports = {

	/**
	 * Generate secure random bytes
	 * @param  {Integer} bytes
	 * @return {String}
	 */
	randBytes: function(bytes) {
		if(!bytes)
			bytes = 256;
		return openpgp.crypto.random.getRandomBytes(bytes);
	},

	/**
	 * Generate a SHA-512 hash of a string
	 * @param  {String} str
	 * @return {String}
	 */
	sha512: function(str) {
		return openpgp.crypto.hash.digest(openpgp.enums.hash.sha512, str);
	},

	pgp: require('./_crypto_pgp.js'),
	symmetric: require('./_crypto_symmetric.js')

};
