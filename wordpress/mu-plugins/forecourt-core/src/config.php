<?php

defined('ABSPATH') || exit;

function forecourt_env(string $key, string $default = ''): string
{
	$value = getenv($key);

	return $value === false || $value === '' ? $default : $value;
}

function forecourt_frontend_url(): string
{
	return untrailingslashit(forecourt_env('FORECOURT_FRONTEND_URL', 'http://localhost:3000'));
}

function forecourt_shared_secret(): string
{
	return forecourt_env('FORECOURT_SHARED_SECRET');
}

function forecourt_has_valid_secret(WP_REST_Request $request): bool
{
	$expected = forecourt_shared_secret();
	$provided = (string) $request->get_header('x-forecourt-secret');

	return $expected !== '' && hash_equals($expected, $provided);
}
