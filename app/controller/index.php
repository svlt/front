<?php

namespace Controller;

class Index extends \Controller {

	function index($fw) {
		if($this->_getUser()) {
			$fw->reroute('/stream');
			return;
		}
		$this->_render('index/index.html');
	}

	function register($fw) {
		$this->_render('index/register.html');
	}

	function registerPost($fw) {
		try {
			$token = \Helper\Api\User::register($fw->get('POST'));
			$fw->set('COOKIE.session_token', $token);
			$fw->reroute('/stream');
		} catch(\Exception $e) {
			$fw->set('error', $e->getMessage());
			\App::error(403);
		}
	}

	function auth($fw) {
		$this->_render('index/auth.html');
	}

	function authPost($fw) {
		try {
			$token = \Helper\Api\User::auth($fw->get('POST'));
			$fw->set('COOKIE.session_token', $token);
			$fw->reroute('/stream');
		} catch(\Exception $e) {
			$fw->set('error', $e->getMessage());
			$this->_render('index/auth.html');
		}
	}

}
