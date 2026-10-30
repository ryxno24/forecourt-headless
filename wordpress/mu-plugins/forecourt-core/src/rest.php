<?php

defined('ABSPATH') || exit;

const FORECOURT_REST_NAMESPACE = 'forecourt/v1';

add_action('rest_api_init', function (): void {
	register_rest_route(FORECOURT_REST_NAMESPACE, '/page/(?P<slug>[a-z0-9-]+)', [
		'methods' => WP_REST_Server::READABLE,
		'callback' => 'forecourt_rest_get_page',
		'permission_callback' => '__return_true',
		'args' => [
			'slug' => ['sanitize_callback' => 'sanitize_title'],
		],
	]);

	register_rest_route(FORECOURT_REST_NAMESPACE, '/settings', [
		'methods' => WP_REST_Server::READABLE,
		'callback' => 'forecourt_rest_get_settings',
		'permission_callback' => '__return_true',
	]);
});

function forecourt_rest_uncached(array $data): WP_REST_Response
{
	$response = new WP_REST_Response($data);
	$response->header('Cache-Control', 'no-store');

	return $response;
}

function forecourt_rest_get_page(WP_REST_Request $request): WP_REST_Response|WP_Error
{
	$page = get_page_by_path($request['slug'], OBJECT, 'page');

	if (!$page || $page->post_status !== 'publish' || post_password_required($page)) {
		return new WP_Error('forecourt_not_found', 'Page not found.', ['status' => 404]);
	}

	return forecourt_rest_uncached(forecourt_get_page_data($page));
}

function forecourt_get_page_data(WP_Post $page): array
{
	return [
		'id' => $page->ID,
		'slug' => $page->post_name,
		'title' => get_the_title($page),
		'modified' => get_post_modified_time('c', true, $page),
		'seo' => [
			'title' => forecourt_text(get_field('seo_title', $page->ID)),
			'description' => forecourt_multiline(get_field('seo_description', $page->ID)),
			'ogImage' => forecourt_normalise_image(get_field('seo_og_image', $page->ID)),
			'noindex' => (bool) get_field('seo_noindex', $page->ID),
		],
		'sections' => forecourt_normalise_sections(get_field('sections', $page->ID)),
	];
}

function forecourt_rest_get_settings(): WP_REST_Response
{
	return forecourt_rest_uncached(forecourt_get_settings_data());
}

function forecourt_get_settings_data(): array
{
	$option = fn (string $name) => get_field($name, 'option');

	$score = $option('rating_score');
	$count = $option('rating_count');

	return [
		'siteName' => forecourt_text($option('site_name')) ?? get_bloginfo('name'),
		'phone' => forecourt_text($option('phone')),
		'email' => is_email($option('email')) ? sanitize_email($option('email')) : null,
		'address' => forecourt_multiline($option('address')),
		'footerText' => forecourt_multiline($option('footer_text')),
		'headerCta' => forecourt_normalise_link($option('header_cta')),
		'rating' => is_numeric($score) && is_numeric($count) && (int) $count > 0
			? ['score' => round((float) $score, 1), 'count' => (int) $count]
			: null,
		'defaultSeo' => [
			'title' => forecourt_text($option('default_seo_title')),
			'description' => forecourt_multiline($option('default_seo_description')),
			'ogImage' => forecourt_normalise_image($option('default_og_image')),
		],
	];
}
