<?php

abstract class Controller {

	/**
	 * Get the currently logged in user, if any
	 * @return int|bool
	 */
	protected function _getUser() {
		return \App::fw()->get('user') ?: false;
	}

	/**
	 * Require a user to be logged in. Redirects to /login if a session is not found.
	 * @return int|bool
	 */
	protected function _requireLogin() {
		$id = $this->_getUser();
		if(!$id) {
			$fw = \App::fw();
			if(empty($_GET)) {
				$fw->reroute('/login?to=' . urlencode($fw->get('PATH')));
			} else {
				$fw->reroute('/login?to=' . urlencode($fw->get('PATH')) . urlencode('?' . http_build_query($_GET)));
			}
			$fw->unload();
		}
		return $id;
	}

	/**
	 * Render a view
	 * @param string  $file
	 * @param string  $mime
	 * @param array   $hive
	 * @param integer $ttl
	 */
	protected function _render($file, $mime = 'text/html', array $hive = null, $ttl = 0) {
		if(!headers_sent() && $mime == 'text/html') {
			$fw = \Base::instance();
			header("Content-Security-Policy: default-src: 'self'; " .
				"script-src 'self' 'unsafe-inline'; " .
				"style-src 'self' https://fonts.googleapis.com; " .
				"font-src 'self' https://fonts.gstatic.com; " .
				"base-uri 'none'; " .
				"form-action 'self'; " .
				"frame-ancestors 'none'; " .
				"plugin-types 'none'; " .
				"report-uri " . $fw->get("BASE") . "/cspreport");
		}
		echo \Template::instance()->render($file, $mime, $hive, $ttl);
	}

}
