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
			$fw->set('title', $user->name);
			$fw->set('this_user', $user);
			$stream = \Helper\Api\Post::getPage($user->username);
			$fw->set('posts', $stream);
			$this->_render('user/single.html');
		} else {
			$fw->error(404);
		}
	}

	/**
	 * GET /stream
	 * @param Base $fw
	 */
	function stream($fw) {
		$this->_requireLogin();
		$stream = \Helper\Api\Post::getStream();
		$fw->set('posts', $stream);
		$this->_render('user/stream.html');
	}

	/**
	 * GET|POST /logout
	 * @param Base $fw
	 */
	function logout($fw) {
		if($fw->get('COOKIE.session_token') == $fw->get('GET.session')) {
			\Helper\Api\User::logout();
			$fw->set('COOKIE.session_token', null);
			$fw->reroute('/');
		} else {
			$fw->error(400);
		}
	}

}
