<?php

namespace Controller;

class User extends \Controller {

	/**
	 * GET /u/@username
	 * @param Base $f3
	 * @param array $params
	 */
	function base($f3, $params) {
		$user = \Helper\Api\User::get($params['username']);
		$f3->set('this_user', $user);
		$this->_render('user/single.html');
	}

}
