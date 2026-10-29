<?php
/**
 * Plugin Name: Forecourt Core
 * Description: Content model, REST API and enquiry handling for the Forecourt headless site.
 * Version: 1.0.0
 * Requires PHP: 8.3
 */

defined('ABSPATH') || exit;

define('FORECOURT_CORE_DIR', __DIR__ . '/forecourt-core');

require_once FORECOURT_CORE_DIR . '/src/config.php';
require_once FORECOURT_CORE_DIR . '/src/acf.php';
require_once FORECOURT_CORE_DIR . '/src/headless.php';
require_once FORECOURT_CORE_DIR . '/src/normalise.php';
require_once FORECOURT_CORE_DIR . '/src/rest.php';
require_once FORECOURT_CORE_DIR . '/src/enquiries.php';
require_once FORECOURT_CORE_DIR . '/src/revalidate.php';
