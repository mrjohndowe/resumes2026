<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/auth.php';

$user = require_login();

/*
|--------------------------------------------------------------------------
| Latest resume for the CURRENT logged-in account
|--------------------------------------------------------------------------
| This intentionally stays scoped to owner_id even for administrators.
| Admins can still use History/Admin to open other users' records, but
| signing in should never automatically open somebody else's resume.
*/

$stmt = db()->prepare(
    'SELECT id, name, updated_at, total_months
     FROM resumes
     WHERE owner_id = ?
     ORDER BY updated_at DESC, id DESC
     LIMIT 1'
);

$stmt->execute([(int)$user['id']]);

$resume = $stmt->fetch();

json_out([
    'ok' => true,
    'resume' => $resume ?: null,
]);
