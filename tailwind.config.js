<?php
declare(strict_types=1);

const BOOTSTRAP_SUPER_USERNAME = 'admin';
const BOOTSTRAP_SUPER_PASSWORD_HASH = '$2y$12$6HGXOG29pBZZ6XogPH4opuhShGmRKvxkZ.2ndRjwfgxWk0rd8M8Ce';
const BACKUP_SECRET = 'gss-change-this-private-backup-secret-2026';

function resolve_data_dir(): string {
  $env = trim((string)(getenv('GSS_DATA_DIR') ?: ''));
  if ($env !== '') return rtrim($env, '/\\');
  $documentRoot = realpath((string)($_SERVER['DOCUMENT_ROOT'] ?? ''));
  if ($documentRoot) return dirname($documentRoot) . '/gosharesplit-data';
  return dirname(__DIR__, 3) . '/gosharesplit-data';
}

define('DATA_DIR', resolve_data_dir());
define('OFFERS_FILE', DATA_DIR . '/offers.json');
define('SUGGESTIONS_FILE', DATA_DIR . '/suggestions.json');
define('ALERTS_FILE', DATA_DIR . '/alerts.json');
define('REPORTS_FILE', DATA_DIR . '/reports.json');
define('CATALOG_FILE', DATA_DIR . '/catalog.json');
define('SETTINGS_FILE', DATA_DIR . '/settings.json');
define('USERS_FILE', DATA_DIR . '/users.json');
define('ACTIVITY_FILE', DATA_DIR . '/activity.json');
define('LEGACY_DATA_DIR', __DIR__ . '/data');
