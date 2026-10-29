<?php

defined('ABSPATH') || exit;

add_action('template_redirect', function (): void {
	if (is_admin() || wp_doing_ajax() || is_preview()) {
		return;
	}

	$path = wp_parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

	wp_redirect(forecourt_frontend_url() . $path, 302);
	exit;
});

add_action('send_headers', function (): void {
	header('X-Robots-Tag: noindex, nofollow', true);
});

add_filter('rest_endpoints', function (array $endpoints): array {
	if (is_user_logged_in()) {
		return $endpoints;
	}

	foreach (array_keys($endpoints) as $route) {
		if (str_starts_with($route, '/wp/v2/users')) {
			unset($endpoints[$route]);
		}
	}

	return $endpoints;
});

add_action('phpmailer_init', function (PHPMailer\PHPMailer\PHPMailer $mailer): void {
	$host = forecourt_env('FORECOURT_SMTP_HOST');

	if ($host === '') {
		return;
	}

	$mailer->isSMTP();
	$mailer->Host = $host;
	$mailer->Port = (int) forecourt_env('FORECOURT_SMTP_PORT', '25');
	$mailer->SMTPAuth = false;
	$mailer->SMTPAutoTLS = false;
});

add_filter('xmlrpc_enabled', '__return_false');

add_action('admin_menu', function (): void {
	remove_menu_page('edit-comments.php');
});

add_filter('comments_open', '__return_false');
