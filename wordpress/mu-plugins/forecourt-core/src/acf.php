<?php

defined('ABSPATH') || exit;

const FORECOURT_ACF_JSON_DIR = FORECOURT_CORE_DIR . '/acf-json';

add_filter('acf/settings/save_json', fn () => FORECOURT_ACF_JSON_DIR);

add_filter('acf/settings/load_json', function (array $paths): array {
	return [FORECOURT_ACF_JSON_DIR];
});

add_action('acf/init', function (): void {
	if (!function_exists('acf_add_options_page')) {
		return;
	}

	acf_add_options_page([
		'page_title' => 'Site Settings',
		'menu_title' => 'Site Settings',
		'menu_slug' => 'site-settings',
		'capability' => 'edit_theme_options',
		'icon_url' => 'dashicons-admin-site-alt3',
		'position' => 59,
		'redirect' => false,
	]);
});

add_action('admin_notices', function (): void {
	if (function_exists('acf_get_field_groups')) {
		return;
	}

	echo '<div class="notice notice-error"><p>Forecourt requires ACF Pro or Secure Custom Fields. Run <code>make setup</code> to install it.</p></div>';
});
