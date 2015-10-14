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
		// TODO: Verify registration data, setup session, redirect to stream
	}

	function auth($fw) {
		$this->_render('index/auth.html');
	}

	function authPost($fw) {
		// TODO: Verify login data, setup session, redirect to stream
	}

}
