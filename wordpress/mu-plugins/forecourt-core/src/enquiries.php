<?php

defined('ABSPATH') || exit;

const FORECOURT_ENQUIRY_LIMIT = 5;
const FORECOURT_ENQUIRY_WINDOW = 10 * MINUTE_IN_SECONDS;

add_action('init', function (): void {
	register_post_type('enquiry', [
		'labels' => [
			'name' => 'Enquiries',
			'singular_name' => 'Enquiry',
		],
		'public' => false,
		'show_ui' => true,
		'show_in_rest' => false,
		'menu_icon' => 'dashicons-email-alt',
		'supports' => ['title', 'editor'],
		'capability_type' => 'post',
		'capabilities' => ['create_posts' => 'do_not_allow'],
		'map_meta_cap' => true,
	]);
});

add_action('rest_api_init', function (): void {
	register_rest_route(FORECOURT_REST_NAMESPACE, '/enquiries', [
		'methods' => WP_REST_Server::CREATABLE,
		'callback' => 'forecourt_rest_create_enquiry',
		'permission_callback' => 'forecourt_has_valid_secret',
	]);
});

function forecourt_enquiry_client_ip(WP_REST_Request $request): string
{
	$forwarded = trim((string) $request->get_header('x-forecourt-client-ip'));
	$ip = filter_var($forwarded, FILTER_VALIDATE_IP) ? $forwarded : ($_SERVER['REMOTE_ADDR'] ?? '');

	return (string) $ip;
}

function forecourt_enquiry_rate_limited(string $ip): bool
{
	$key = 'forecourt_enquiry_' . md5($ip);
	$count = (int) get_transient($key);

	if ($count >= FORECOURT_ENQUIRY_LIMIT) {
		return true;
	}

	set_transient($key, $count + 1, FORECOURT_ENQUIRY_WINDOW);

	return false;
}

function forecourt_validate_enquiry(array $body): array
{
	$data = [
		'name' => forecourt_text($body['name'] ?? '') ?? '',
		'email' => trim((string) ($body['email'] ?? '')),
		'phone' => preg_replace('/[^\d+]/', '', (string) ($body['phone'] ?? '')),
		'registration' => strtoupper(preg_replace('/\s+/', '', (string) ($body['registration'] ?? ''))),
		'mileage' => preg_replace('/[,\s]/', '', (string) ($body['mileage'] ?? '')),
		'message' => forecourt_multiline($body['message'] ?? '') ?? '',
	];

	$errors = [];

	if (mb_strlen($data['name']) < 2 || mb_strlen($data['name']) > 100) {
		$errors['name'] = 'Enter your name.';
	}

	if (!is_email($data['email'])) {
		$errors['email'] = 'Enter a valid email address.';
	}

	if (!preg_match('/^(?:\+44|0)\d{9,10}$/', $data['phone'])) {
		$errors['phone'] = 'Enter a valid UK phone number.';
	}

	if (!preg_match('/^(?=.*[A-Z])(?=.*\d)[A-Z\d]{2,7}$/', $data['registration'])) {
		$errors['registration'] = 'Enter a valid UK registration.';
	}

	if (!ctype_digit($data['mileage']) || (int) $data['mileage'] > 500000) {
		$errors['mileage'] = 'Enter your mileage as a number.';
	}

	if (mb_strlen($data['message']) > 1000) {
		$errors['message'] = 'Keep your message under 1000 characters.';
	}

	$data['email'] = sanitize_email($data['email']);
	$data['mileage'] = (int) $data['mileage'];

	return [$data, $errors];
}

function forecourt_rest_create_enquiry(WP_REST_Request $request): WP_REST_Response|WP_Error
{
	if (forecourt_enquiry_rate_limited(forecourt_enquiry_client_ip($request))) {
		return new WP_Error('forecourt_rate_limited', 'Too many enquiries. Please try again later.', ['status' => 429]);
	}

	$body = $request->get_json_params() ?: $request->get_body_params();

	if (trim((string) ($body['website'] ?? '')) !== '') {
		return new WP_REST_Response(['ok' => true], 201);
	}

	[$data, $errors] = forecourt_validate_enquiry(is_array($body) ? $body : []);

	if ($errors) {
		return new WP_REST_Response(['errors' => $errors], 422);
	}

	$summary = implode("\n", [
		"Name: {$data['name']}",
		"Email: {$data['email']}",
		"Phone: {$data['phone']}",
		"Registration: {$data['registration']}",
		'Mileage: ' . number_format($data['mileage']),
		'Message: ' . ($data['message'] ?: 'None'),
	]);

	$post_id = wp_insert_post([
		'post_type' => 'enquiry',
		'post_status' => 'private',
		'post_title' => "{$data['registration']} - {$data['name']}",
		'post_content' => esc_html($summary),
		'meta_input' => $data,
	], true);

	if (is_wp_error($post_id)) {
		return new WP_Error('forecourt_enquiry_failed', 'Could not save the enquiry.', ['status' => 500]);
	}

	$sent = wp_mail(
		get_option('admin_email'),
		"New valuation request: {$data['registration']}",
		$summary . "\n\n" . admin_url("post.php?post={$post_id}&action=edit"),
		["Reply-To: {$data['name']} <{$data['email']}>"]
	);

	if (!$sent) {
		error_log("[forecourt] enquiry {$post_id} saved but notification email failed");
	}

	return new WP_REST_Response(['ok' => true], 201);
}
