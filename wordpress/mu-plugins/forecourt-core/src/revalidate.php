<?php

defined('ABSPATH') || exit;

function forecourt_revalidate(array $tags): void
{
	static $sent = [];

	$tags = array_values(array_diff(array_unique($tags), $sent));
	$secret = forecourt_shared_secret();

	if (!$tags || $secret === '') {
		return;
	}

	$sent = array_merge($sent, $tags);
	$base = untrailingslashit(forecourt_env('FORECOURT_FRONTEND_INTERNAL_URL', forecourt_frontend_url()));

	wp_remote_post("{$base}/api/revalidate", [
		'blocking' => false,
		'timeout' => 2,
		'headers' => [
			'Content-Type' => 'application/json',
			'X-Forecourt-Secret' => $secret,
		],
		'body' => wp_json_encode(['tags' => $tags]),
	]);
}

/**
 * Runs after ACF has written its fields (priority 10), so the frontend
 * never refetches a page before its new content is saved.
 */
add_action('acf/save_post', function (int|string $post_id): void {
	if (in_array($post_id, ['options', 'option'], true)) {
		forecourt_revalidate(['settings']);
		return;
	}

	$post = get_post((int) $post_id);

	if ($post && $post->post_type === 'page' && !wp_is_post_revision($post) && !wp_is_post_autosave($post)) {
		forecourt_revalidate(["page:{$post->post_name}"]);
	}
}, 20);

add_action('transition_post_status', function (string $new, string $old, WP_Post $post): void {
	if ($post->post_type === 'page' && $old === 'publish' && $new !== 'publish') {
		$slug = preg_replace('/__trashed$/', '', $post->post_name);
		forecourt_revalidate(["page:{$slug}"]);
	}
}, 10, 3);
