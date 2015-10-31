<?php

namespace Controller;

class User extends \Controller {

	/**
	 * GET /u/@username
	 * @param Base $fw
	 * @param array $params
	 */
	function base($fw, $params) {
		$user = \Helper\Api\User::get($params['username']);
		if($user->id) {
			$fw->set('this_user', $user);
			$this->_render('user/single.html');
		} else {
			$fw->error(404);
		}
	}

}
