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

	/**
	 * Register a user
	 * @param  array $data
	 * @return string Session token
	 */
	static function register($data) {
		$response = self::call('register.json', 'POST', $data);
		if(!empty($response->token)) {
			return $response->token;
		}
		throw new \Exception($response->error);
	}

	/**
	 * Log out the current user
	 * @return object
	 */
	static function logout() {
		return self::call('logout.json', 'POST');
	}

}
