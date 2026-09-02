<?php
declare(strict_types=1);

function normalize_name(string $name): string {
    $name = trim(mb_strtolower($name, 'UTF-8'));
    $name = preg_replace('/\s+/u', ' ', $name) ?? $name;
    return $name;
}
function parse_month(?string $value): ?DateTimeImmutable {
    $v = trim((string)$value);
    if ($v === '') return null;
    if (preg_match('/^(\d{4})-(\d{2})$/', $v, $m)) {
        return DateTimeImmutable::createFromFormat('!Y-m-d', "{$m[1]}-{$m[2]}-01") ?: null;
    }
    $formats = ['!M Y','!F Y','!m/Y','!m-Y','!Y/m'];
    foreach ($formats as $f) {
        $d = DateTimeImmutable::createFromFormat($f, $v);
        if ($d) return $d->modify('first day of this month');
    }
    $ts = strtotime($v);
    return $ts ? (new DateTimeImmutable('@'.$ts))->setTimezone(new DateTimeZone(APP_TIMEZONE))->modify('first day of this month') : null;
}
function total_employment_months(array $jobs): int {
    /*
     * Elapsed months of employment with overlapping periods merged.
     *
     * Do not add an extra month to the end date. For example:
     * Jan 2024 -> Jan 2025 = 12 months, not 13.
     */
    $ranges = [];
    $now = new DateTimeImmutable('first day of this month');

    foreach ($jobs as $job) {
        $start = parse_month($job['start'] ?? '');
        if (!$start) {
            continue;
        }

        $endRaw = trim((string)($job['end'] ?? ''));
        $end = ($endRaw === '' || preg_match('/present|current/i', $endRaw))
            ? $now
            : parse_month($endRaw);

        if (!$end) {
            continue;
        }

        if ($end < $start) {
            [$start, $end] = [$end, $start];
        }

        $startMonth = ((int)$start->format('Y') * 12) + ((int)$start->format('n') - 1);
        $endMonth   = ((int)$end->format('Y') * 12) + ((int)$end->format('n') - 1);

        $ranges[] = [$startMonth, $endMonth];
    }

    if (!$ranges) {
        return 0;
    }

    usort($ranges, static fn(array $a, array $b): int => $a[0] <=> $b[0]);

    $merged = [];

    foreach ($ranges as $range) {
        $lastIndex = count($merged) - 1;

        if ($lastIndex < 0 || $range[0] > $merged[$lastIndex][1]) {
            $merged[] = $range;
            continue;
        }

        if ($range[1] > $merged[$lastIndex][1]) {
            $merged[$lastIndex][1] = $range[1];
        }
    }

    $months = 0;

    foreach ($merged as [$startMonth, $endMonth]) {
        $months += max(0, $endMonth - $startMonth);
    }

    return $months;
}
