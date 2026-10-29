<?php

require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

if (!function_exists('update_field')) {
	WP_CLI::error('ACF Pro or Secure Custom Fields must be active before seeding.');
}

$seed = json_decode(file_get_contents('/seed/home.json'), true, 512, JSON_THROW_ON_ERROR);

$seed_image = function (string $file, string $alt): int {
	$existing = get_posts([
		'post_type' => 'attachment',
		'post_status' => 'inherit',
		'meta_key' => '_forecourt_seed_file',
		'meta_value' => $file,
		'fields' => 'ids',
		'numberposts' => 1,
	]);

	if ($existing) {
		return (int) $existing[0];
	}

	$tmp = wp_tempnam($file);
	copy('/seed/images/' . $file, $tmp);

	$id = media_handle_sideload(['name' => $file, 'tmp_name' => $tmp], 0);

	if (is_wp_error($id)) {
		WP_CLI::error("Could not import {$file}: " . $id->get_error_message());
	}

	update_post_meta($id, '_wp_attachment_image_alt', $alt);
	update_post_meta($id, '_forecourt_seed_file', $file);

	return $id;
};

$resolve = function (mixed $value) use (&$resolve, $seed_image): mixed {
	if (!is_array($value)) {
		return $value;
	}

	if (isset($value['seed_image'])) {
		return $seed_image($value['seed_image'], $value['alt'] ?? '');
	}

	return array_map($resolve, $value);
};

foreach (['sample-page' => 'page', 'hello-world' => 'post'] as $slug => $type) {
	$post = get_page_by_path($slug, OBJECT, $type);
	if ($post) {
		wp_delete_post($post->ID, true);
	}
}

$page = get_page_by_path('home', OBJECT, 'page');
$page_id = wp_insert_post([
	'ID' => $page?->ID ?? 0,
	'post_type' => 'page',
	'post_status' => 'publish',
	'post_title' => $seed['page']['title'],
	'post_name' => 'home',
], true);

if (is_wp_error($page_id)) {
	WP_CLI::error($page_id->get_error_message());
}

update_option('show_on_front', 'page');
update_option('page_on_front', $page_id);

update_field('field_page_sections', $resolve($seed['page']['sections']), $page_id);

foreach ($resolve($seed['page']['seo']) as $name => $value) {
	update_field('field_seo_' . $name, $value, $page_id);
}

foreach ($resolve($seed['settings']) as $name => $value) {
	update_field('field_settings_' . $name, $value, 'option');
}

WP_CLI::success("Seeded page #{$page_id} with " . count($seed['page']['sections']) . ' sections.');
