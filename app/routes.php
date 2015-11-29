<?php

$fw = App::fw();

// Index (public pages)
$fw->route('GET /', 'Controller\\Index->index');
$fw->route('GET /manifest.json', 'Controller\\Index->manifest');
$fw->route('GET /register', 'Controller\\Index->register');
$fw->route('POST /register', 'Controller\\Index->registerPost');
$fw->route('GET /auth', 'Controller\\Index->auth');
$fw->route('POST /auth', 'Controller\\Index->authPost');

// Users
$fw->route('GET /stream', 'Controller\\User->stream');
$fw->route('GET /u/@username', 'Controller\\User->base');
$fw->route('GET|POST /logout', 'Controller\\User->logout');

// Posts
$fw->route('GET /post', 'Controller\\Post->post');
$fw->route('GET /post/@id', 'Controller\\Post->single');

// Handle errors
$fw->set('ONERROR', function(Base $fw) {
	$controller = new Controller\Index;
	switch($fw->get('ERROR.code')) {
		case 404:
			$fw->set('title', '404 Not Found');
			echo Template::instance()->render("error/404.html");
			break;
		case 401:
			$fw->set('title', '404 Not Authorized');
			echo Template::instance()->render("error/401.html");
			break;
		default:
			echo Template::instance()->render("error/general.html");
	}
});
