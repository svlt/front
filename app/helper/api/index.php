<?php

namespace Helper\Api;

class Index extends \Helper\Api {

	/**
	 * Send a ping request to the API
	 * @return string
	 */
	static function ping() {
		return self::call('ping.json');
	}

}
