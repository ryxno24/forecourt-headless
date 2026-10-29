#!/usr/bin/env bash
set -euo pipefail

cd /var/www/html

for _ in $(seq 1 30); do
  [ -f wp-config.php ] && break
  sleep 2
done

if ! wp core is-installed 2>/dev/null; then
  wp core install \
    --url="$WP_URL" \
    --title="Forecourt" \
    --admin_user="$WP_ADMIN_USER" \
    --admin_password="$WP_ADMIN_PASSWORD" \
    --admin_email="$WP_ADMIN_EMAIL" \
    --skip-email
fi

dropin="$(find /plugins-dropin -maxdepth 1 -name 'advanced-custom-fields-pro*.zip' | head -n 1)"

if [ -n "$dropin" ]; then
  echo "Using ACF Pro from $(basename "$dropin")"
  if wp plugin is-installed secure-custom-fields; then
    wp plugin deactivate secure-custom-fields --quiet || true
    wp plugin delete secure-custom-fields
  fi
  wp plugin is-installed advanced-custom-fields-pro || wp plugin install "$dropin"
  wp plugin activate advanced-custom-fields-pro
else
  echo "No ACF Pro zip found, using Secure Custom Fields"
  if wp plugin is-active advanced-custom-fields-pro; then
    wp plugin deactivate advanced-custom-fields-pro
  fi
  wp plugin is-installed secure-custom-fields || wp plugin install secure-custom-fields
  wp plugin activate secure-custom-fields
fi

for plugin in akismet hello; do
  if wp plugin is-installed "$plugin"; then
    wp plugin delete "$plugin"
  fi
done

wp theme activate forecourt-headless
wp rewrite structure '/%postname%/'
wp option update blog_public 0
wp option update blogdescription "Sell your car in 24 hours"
wp option update timezone_string "Europe/London"

if [ -f /scripts/seed.php ] && [ -f /seed/home.json ]; then
  wp eval-file /scripts/seed.php
fi

echo
echo "WordPress admin: $WP_URL/wp-admin  ($WP_ADMIN_USER / $WP_ADMIN_PASSWORD)"
echo "Page API:        $WP_URL/wp-json/forecourt/v1/page/home"
echo "Mailpit:         http://localhost:${MAILPIT_PORT:-8025}"
