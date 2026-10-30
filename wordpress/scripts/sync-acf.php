<?php

if (!function_exists('acf_get_local_json_files')) {
	WP_CLI::error('ACF Pro or Secure Custom Fields must be active before syncing field groups.');
}

acf_update_setting('json', false);

foreach (acf_get_local_json_files() as $key => $file) {
	$group = json_decode(file_get_contents($file), true, 512, JSON_THROW_ON_ERROR);
	$existing = acf_get_field_group_post($key);

	if ($existing) {
		if ((int) get_post_modified_time('U', true, $existing) >= (int) ($group['modified'] ?? 0)) {
			continue;
		}

		$group['ID'] = $existing->ID;
	}

	acf_import_field_group($group);
	WP_CLI::log("Synced field group: {$group['title']}");
}
