<?php

final class App {

	static private $_fw;

	/**
	 * Initialize the app
	 */
	static function init() {

		// Initialize Composer autoloader
		require_once 'vendor/autoload.php';

		// Initialize framework
		self::$_fw = Base::instance();
		self::$_fw->mset([
			'AUTOLOAD' => 'app/',
			'ESCAPE' => false,
			'PREFIX' => 'dict.',
			'PACKAGE' => 'svlt/front',
			'UI' => 'app/view/',
			'JAR.httponly' => false,
		]);

		// Load configuration
		if(is_file('config.php')) {
			self::$_fw->mset(require('config.php'));
		} else {
			throw new Exception('No config.php file found.');
		}

		// Initialize routes
		require_once 'routes.php';

		// Load user if any
		if($token = self::$_fw->get('COOKIE.session_token')) {
			$user = \Helper\Api\User::get('me');
			if(isset($user->id)) {
				self::$_fw->set('user', $user);
			}
		}

		// Run app
		self::$_fw->run();

	}

	/**
	 * Get a router instance
	 * @return Base
	 */
	static function fw() {
		return self::$_fw;
	}

	/**
	 * Trigger router error
	 * @param int $code
	 */
	static function error($code = null) {
		return self::$_fw->error($code);
	}

}
