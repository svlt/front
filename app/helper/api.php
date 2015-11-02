<?php

namespace Helper;

class Api {

	/**
	 * Get the API base URL
	 * If the API URL is set to an array, this will randomly return an endpoint
	 * @return string
	 */
	static function baseUrl() {
		$api = \App::fw()->get('api');
		if(is_array($api)) {
			return $api[array_rand($api)];
		}
		return $api;
	}

	/**
	 * Call the API
	 * @param  string     $path
	 * @param  string     $method
	 * @param  array|null $data
	 * @param  array|null $headers
	 * @return mixed
	 */
	static function call($path, $method = 'GET', array $data = null, array $headers = null) {

		// Build curl request
		$url = self::baseUrl() . ltrim($path, '/');
		$token = \App::fw()->get('COOKIE.session_token');
		if(strtoupper($method) == 'GET') {
			if($token) {
				$data['_token'] = $token;
			}
			if($data !== null) {
				$url .= '?' . http_build_query($data);
			}
			$curl = curl_init($url);
		} else {
			if($token) {
				$url .= '?_token=' . urlencode($token);
			}
			$curl = curl_init($url);
			curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
		}

		// Set curl options
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($curl, CURLOPT_FOLLOWLOCATION, 1);

		// Add any custom headers
		if($headers) {
			curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
		}

		// Perform request
		$data = curl_exec($curl);
		curl_close($curl);

		// Decode object
		$obj = json_decode($data);
		if($obj !== null) {
			return $obj;
		}
		return $data;

	}

}
