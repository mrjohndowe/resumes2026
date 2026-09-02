<?php declare(strict_types=1);

$settings = [
    'APP_NAME' => 'Resume 2026',
    'APP_TIMEZONE' => 'America/Denver',
    'DB_HOST' => 'localhost',
    'DB_PORT' => '3306',
    'DB_NAME' => 'resume',
    'DB_USER' => 'resume',
    'DB_PASS' => 'resume',
    'SESSION_NAME' => 'resume2026',
    'MAX_PHOTO_BYTES' => 5 * 1024 * 1024,
];
foreach ($settings as $key => $value) {
    if (!defined($key)) {
        define($key, $value);
    }
}

date_default_timezone_set(APP_TIMEZONE);
