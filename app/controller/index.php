<?php

namespace Controller;

class Index extends \Controller {

	/**
	 * GET /
	 * @param \Base $fw
	 */
	function index(\Base $fw) {
		if($this->_getUser()) {
			$fw->reroute('/stream');
			return;
		}
		$this->_render('index/index.html');
	}

	/**
	 * GET /style
	 * @param \Base $fw
	 */
	function style(\Base $fw) {
		$this->_render('index/style.html');
	}

	/**
	 * GET /manifest.json
	 * @param \Base $fw
	 */
	function manifest(\Base $fw) {
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

	/**
	 * GET /register
	 * @param \Base $fw
	 */
	function register(\Base $fw) {
		$this->_render('index/register.html');
	}

	/**
	 * POST /register
	 * @param \Base $fw
	 */
	function registerPost(\Base $fw) {
		try {
			$token = \Helper\Api\User::register($fw->get('POST'));
			$fw->set('COOKIE.session_token', $token);
			$fw->reroute('/stream');
		} catch(\Exception $e) {
			$fw->set('error', $e->getMessage());
			\App::error(403);
		}
	}

	/**
	 * GET /auth
	 * @param \Base $fw
	 */
	function auth(\Base $fw) {
		$this->_render('index/auth.html');
	}

	/**
	 * POST /cspreport
	 * Content-Security-Policy violation report endpoint
	 *
	 * @param \Base $fw
	 */
	function cspreport(\Base $fw) {
		$log = new \Log('cspreport.log');
		$log->write(file_get_contents('php://input'));
	}

}
