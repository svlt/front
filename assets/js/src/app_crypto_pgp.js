/**
 * Methods for PGP cryptography
 * @type {Object}
 */
module.exports = {

	/**
	 * Generate a PGP key pair
	 * @param  {Integer}  bits
	 * @param  {String}   username
	 * @param  {String}   passphrase
	 * @param  {Function} callback
	 * @return {Object}   Promise
	 */
	genKeyPair: function(bits, username, passphrase, callback) {
		var options = {
			numBits: bits,
			userId: username,
			passphrase: passphrase,
		};
		return openpgp.generateKeyPair(options).then(function(data) {
			callback(data);
		});
	},

	/**
	 * Encrypt a message with a PGP public key
	 * @param  {String}   message
	 * @param  {String}   publicKey
	 * @param  {Function} callback
	 * @return {Object}   Promise
	 */
	encrypt: function(message, publicKey, callback) {
		publicKey = openpgp.key.readArmored(publicKey);
		return openpgp.encryptMessage(publicKey.keys, message).then(function(data) {
			callback(data);
		});
	},

	/**
	 * Encrypt and sign a message with a PGP public and private key
	 * @param  {String}   message
	 * @param  {String}   publicKey
	 * @param  {String}   privateKey
	 * @param  {Function} callback
	 * @return {Object}   Promise
	 */
	encryptSigned: function(message, publicKey, privateKey, callback) {
		publicKey = openpgp.key.readArmored(publicKey);
		if(typeof privateKey == 'string') {
			privateKey = openpgp.key.readArmored(privateKey).keys[0];
		}
		return openpgp.signAndEncryptMessage(publicKey.keys, privateKey, message).then(function(data) {
			callback(data);
		});
	},

	/**
	 * Decrypt an armored PGP message with a PGP private key
	 * @param  {String}   message
	 * @param  {String}   privateKey
	 * @param  {Function} callback
	 * @return {Object}   Promise
	 */
	decrypt: function(message, privateKey, callback) {
		message = openpgp.message.readArmored(message);
		if(typeof privateKey == 'string') {
			privateKey = openpgp.key.readArmored(privateKey).keys[0];
		}
		return openpgp.decryptMessage(privateKey, message).then(function(data) {
			callback(data);
		});
	},

	/**
	 * Decrypt and verify an armored PGP message
	 * with a PGP private and public key
	 * @param  {String}   message
	 * @param  {String}   privateKey
	 * @param  {String}   publicKey
	 * @param  {Function} callback
	 * @return {Object}   Promise
	 */
	decryptAndVerify: function(message, privateKey, publicKey, callback) {
		message = openpgp.message.readArmored(message);
		publicKey = openpgp.key.readArmored(publicKey);
		if(typeof privateKey == 'string') {
			privateKey = openpgp.key.readArmored(privateKey).keys[0];
		}
		return openpgp.decryptAndVerifyMessage(privateKey, publicKey.keys, message).then(function(data) {
			// Check data.signatures[0].valid for verification
			// data.text contains the cleartext
			callback(data);
		});
	}

};
