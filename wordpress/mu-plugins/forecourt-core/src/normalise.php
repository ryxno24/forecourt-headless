<?php

defined('ABSPATH') || exit;

function forecourt_text(mixed $value): ?string
{
	$text = is_scalar($value) ? trim(sanitize_text_field((string) $value)) : '';

	return $text === '' ? null : $text;
}

function forecourt_multiline(mixed $value): ?string
{
	$text = is_scalar($value) ? trim(sanitize_textarea_field((string) $value)) : '';

	return $text === '' ? null : $text;
}

function forecourt_html(mixed $value): ?string
{
	$html = is_string($value) ? trim(wp_kses_post($value)) : '';

	return trim(wp_strip_all_tags($html)) === '' ? null : $html;
}

function forecourt_normalise_image(mixed $image): ?array
{
	if (is_numeric($image) && function_exists('acf_get_attachment')) {
		$image = acf_get_attachment((int) $image);
	}

	if (!is_array($image) || empty($image['url'])) {
		return null;
	}

	return [
		'url' => esc_url_raw($image['url']),
		'alt' => forecourt_text($image['alt'] ?? '') ?? '',
		'width' => (int) ($image['width'] ?? 0),
		'height' => (int) ($image['height'] ?? 0),
	];
}

function forecourt_anchor(mixed $value): ?string
{
	$text = forecourt_text($value);
	$anchor = $text === null ? '' : sanitize_title($text);

	return $anchor === '' ? null : $anchor;
}

function forecourt_normalise_link(mixed $link): ?array
{
	if (!is_array($link) || !is_string($link['url'] ?? null)) {
		return null;
	}

	if (str_starts_with($link['url'], '#')) {
		$anchor = forecourt_anchor(substr($link['url'], 1));
		$url = $anchor === null ? '' : "#{$anchor}";
	} else {
		$url = esc_url_raw($link['url']);
	}

	if ($url === '') {
		return null;
	}

	return [
		'label' => forecourt_text($link['title'] ?? '') ?? $url,
		'url' => $url,
		'newTab' => ($link['target'] ?? '') === '_blank',
	];
}

/**
 * Maps repeater rows and drops any row missing one of the required keys,
 * so the frontend never receives a card without a title or an FAQ without a question.
 */
function forecourt_normalise_rows(mixed $rows, callable $map, array $required): array
{
	if (!is_array($rows)) {
		return [];
	}

	$items = array_map($map, array_values(array_filter($rows, 'is_array')));

	return array_values(array_filter($items, function (array $item) use ($required): bool {
		foreach ($required as $key) {
			if ($item[$key] === null) {
				return false;
			}
		}

		return true;
	}));
}

function forecourt_normalise_trust_points(mixed $rows): array
{
	return array_column(forecourt_normalise_rows(
		$rows,
		fn (array $point) => ['text' => forecourt_text($point['text'] ?? '')],
		['text']
	), 'text');
}

function forecourt_normalise_section(array $row, int $index): array
{
	$layout = (string) ($row['acf_fc_layout'] ?? 'unknown');
	$base = [
		'layout' => $layout,
		'id' => "{$layout}-{$index}",
		'anchor' => forecourt_anchor($row['anchor'] ?? ''),
	];

	$fields = match ($layout) {
		'hero' => [
			'heading' => forecourt_text($row['heading'] ?? ''),
			'eyebrow' => forecourt_text($row['eyebrow'] ?? ''),
			'body' => forecourt_multiline($row['body'] ?? ''),
			'primaryCta' => forecourt_normalise_link($row['primary_cta'] ?? null),
			'secondaryCta' => forecourt_normalise_link($row['secondary_cta'] ?? null),
			'image' => forecourt_normalise_image($row['image'] ?? null),
			'trustPoints' => forecourt_normalise_trust_points($row['trust_points'] ?? []),
		],
		'text_image' => [
			'heading' => forecourt_text($row['heading'] ?? ''),
			'body' => forecourt_html($row['body'] ?? ''),
			'image' => forecourt_normalise_image($row['image'] ?? null),
			'imagePosition' => ($row['image_position'] ?? '') === 'left' ? 'left' : 'right',
			'cta' => forecourt_normalise_link($row['cta'] ?? null),
		],
		'cards' => [
			'heading' => forecourt_text($row['heading'] ?? ''),
			'intro' => forecourt_multiline($row['intro'] ?? ''),
			'numbered' => (bool) ($row['numbered'] ?? false),
			'items' => forecourt_normalise_rows($row['items'] ?? [], fn (array $item) => [
				'title' => forecourt_text($item['title'] ?? ''),
				'body' => forecourt_multiline($item['body'] ?? ''),
				'icon' => forecourt_normalise_image($item['icon'] ?? null),
			], ['title']),
		],
		'testimonials' => [
			'heading' => forecourt_text($row['heading'] ?? ''),
			'items' => forecourt_normalise_rows($row['items'] ?? [], fn (array $item) => [
				'quote' => forecourt_multiline($item['quote'] ?? ''),
				'name' => forecourt_text($item['name'] ?? ''),
				'location' => forecourt_text($item['location'] ?? ''),
				'rating' => is_numeric($item['rating'] ?? null) ? max(1, min(5, (int) $item['rating'])) : null,
			], ['quote', 'name']),
		],
		'stats' => [
			'heading' => forecourt_text($row['heading'] ?? ''),
			'items' => forecourt_normalise_rows($row['items'] ?? [], fn (array $item) => [
				'value' => forecourt_text($item['value'] ?? ''),
				'label' => forecourt_text($item['label'] ?? ''),
			], ['value', 'label']),
		],
		'cta' => [
			'heading' => forecourt_text($row['heading'] ?? ''),
			'body' => forecourt_multiline($row['body'] ?? ''),
			'cta' => forecourt_normalise_link($row['cta'] ?? null),
			'variant' => ($row['variant'] ?? '') === 'dark' ? 'dark' : 'brand',
		],
		'faq' => [
			'heading' => forecourt_text($row['heading'] ?? ''),
			'items' => forecourt_normalise_rows($row['items'] ?? [], fn (array $item) => [
				'question' => forecourt_text($item['question'] ?? ''),
				'answer' => forecourt_html($item['answer'] ?? ''),
			], ['question', 'answer']),
		],
		'contact' => [
			'heading' => forecourt_text($row['heading'] ?? ''),
			'intro' => forecourt_multiline($row['intro'] ?? ''),
			'trustPoints' => forecourt_normalise_trust_points($row['trust_points'] ?? []),
			'successMessage' => forecourt_multiline($row['success_message'] ?? ''),
		],
		default => [],
	};

	return $base + $fields;
}

function forecourt_normalise_sections(mixed $rows): array
{
	if (!is_array($rows)) {
		return [];
	}

	$rows = array_values(array_filter($rows, 'is_array'));

	return array_map('forecourt_normalise_section', $rows, array_keys($rows));
}
