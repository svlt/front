<?php

namespace Helper\Api;

class User extends \Helper\Api {

	/**
	 * Get a user by username
	 * @param  string $username
	 * @return object
	 */
	static function get($username) {
		return self::call('u/' . $username . '.json');
	}

	/**
	 * Get a user's public key by username
	 * @param  string $username
	 * @return object
	 */
	static function getKey($username) {
		return self::call('u/' . $username . '/key.json');
	}

}
