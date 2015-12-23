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

	function style($fw) {
		$this->_render('index/style.html');
	}

	function manifest($fw) {
		header('Content-type: application/json');
		echo json_encode([
			'lang' => 'en',
			'name' => $fw->get('site.name'),
			'icons' => [
				[
					'src' => 'https://vault.im/~alan/logo/svlt.min.svg',
					'sizes' => '512x512',
					'type' => 'image/svg+xml',
				]
			],
			'start_url' => $fw->get('BASE') . '/',
			'scope' => $fw->get('BASE') . '/',
			'display' => 'minimal-ui',
			'background_color' => '#f5f8fa',
			'theme_color' => '#0087cb',
		]);
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
