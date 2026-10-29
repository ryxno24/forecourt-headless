<?php

defined('ABSPATH') || exit;

add_action('after_setup_theme', function (): void {
	add_theme_support('title-tag');
	add_theme_support('post-thumbnails');
});
