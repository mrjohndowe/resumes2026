<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';

function boot_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    session_name(SESSION_NAME);
    session_set_cookie_params([
        'httponly' => true,
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'samesite' => 'Lax',
        'path' => '/',
    ]);
    session_start();
}
boot_session();

function current_user(): ?array {
    if (empty($_SESSION['user_id'])) return null;
    $s = db()->prepare('SELECT id, username, role FROM users WHERE id = ?');
    $s->execute([(int)$_SESSION['user_id']]);
    return $s->fetch() ?: null;
}
function require_login(): array {
    $u = current_user();
    if (!$u) {
        if (str_starts_with($_SERVER['REQUEST_URI'] ?? '', '/api/')) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(['ok'=>false,'error'=>'Authentication required']);
            exit;
        }
        header('Location: login.php');
        exit;
    }
    return $u;
}
function require_admin(): array {
    $u = require_login();
    if (($u['role'] ?? '') !== 'admin') {
        http_response_code(403);
        exit('Forbidden');
    }
    return $u;
}
function csrf_token(): string {
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}
function verify_csrf(): void {
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? $_POST['csrf'] ?? '';
    if (!hash_equals($_SESSION['csrf'] ?? '', (string)$token)) {
        http_response_code(419);
        header('Content-Type: application/json');
        echo json_encode(['ok'=>false,'error'=>'Invalid CSRF token']);
        exit;
    }
}
function json_input(): array {
    $raw = file_get_contents('php://input') ?: '';
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}
function json_out(array $data, int $status=200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);
    exit;
}
