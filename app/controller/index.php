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

}
