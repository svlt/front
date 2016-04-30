<?php

namespace Helper\Api;

class Post extends \Helper\Api {

	/**
	 * Get the stream posts
	 * @return object
	 */
	static function getStream() {
		// TODO: Display buddy posts
		$user = \App::fw()->get('user');
		return self::call('u/' . $user->username . '/posts.json');
	}

	/**
	 * Get a page of posts
	 * @param  string $page_username
	 * @return object
	 */
	static function getPage($page_username) {
		return self::call('u/' . $page_username . '/posts.json');
	}

}
