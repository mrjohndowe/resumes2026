<?php
declare(strict_types=1);
require_once __DIR__.'/includes/auth.php';

$error='';
$count=(int)db()->query('SELECT COUNT(*) FROM users')->fetchColumn();
$setup = $count===0;

if ($_SERVER['REQUEST_METHOD']==='POST') {
    verify_csrf();
    $username=trim($_POST['username']??'');
    $password=(string)($_POST['password']??'');
    if ($setup) {
        if (strlen($username)<3 || strlen($password)<10) {
            $error='Use a username of at least 3 characters and a password of at least 10 characters.';
        } else {
            $s=db()->prepare('INSERT INTO users(username,password_hash,role) VALUES(?,?,?)');
            $s->execute([$username,password_hash($password,PASSWORD_DEFAULT),'admin']);
            session_regenerate_id(true);
            $_SESSION['user_id']=(int)db()->lastInsertId();
            header('Location: index.php'); exit;
        }
    } else {
        $s=db()->prepare('SELECT * FROM users WHERE username=?');
        $s->execute([$username]);
        $u=$s->fetch();
        if ($u && password_verify($password,$u['password_hash'])) {
            session_regenerate_id(true);
            $_SESSION['user_id']=(int)$u['id'];
            header('Location: index.php'); exit;
        }
        $error='Invalid username or password.';
    }
}
?>
<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title><?=htmlspecialchars(APP_NAME)?> - <?= $setup?'Setup':'Login' ?></title>
<link rel="stylesheet" href="assets/resume.css"></head><body class="auth-body">
<form class="auth-card" method="post">
<h1><?=htmlspecialchars(APP_NAME)?></h1>
<h2><?= $setup?'Create first administrator':'Private login' ?></h2>
<?php if($error): ?><div class="error"><?=htmlspecialchars($error)?></div><?php endif; ?>
<input type="hidden" name="csrf" value="<?=htmlspecialchars(csrf_token())?>">
<label>Username<input name="username" required autocomplete="username"></label>
<label>Password<input type="password" name="password" required autocomplete="<?= $setup?'new-password':'current-password' ?>"></label>
<button type="submit"><?= $setup?'Create administrator':'Log in' ?></button>
<?php if($setup): ?><p class="muted">The setup screen disappears after the first administrator is created.</p><?php endif; ?>
</form></body></html>
