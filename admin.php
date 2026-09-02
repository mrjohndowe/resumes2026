<?php
declare(strict_types=1);
require_once __DIR__.'/includes/auth.php';
$u=require_admin();
$msg='';$err='';
if($_SERVER['REQUEST_METHOD']==='POST'){
  verify_csrf();
  $action=$_POST['action']??'';
  try{
    if($action==='create_user'){
      $username=trim($_POST['username']??'');$password=(string)($_POST['password']??'');$role=$_POST['role']??'user';
      if(strlen($username)<3||strlen($password)<10)throw new RuntimeException('Username must be 3+ characters and password 10+ characters.');
      if(!in_array($role,['admin','user'],true))$role='user';
      $s=db()->prepare('INSERT INTO users(username,password_hash,role) VALUES(?,?,?)');
      $s->execute([$username,password_hash($password,PASSWORD_DEFAULT),$role]);$msg='User created.';
    } elseif($action==='reset_password'){
      $id=(int)($_POST['user_id']??0);$password=(string)($_POST['password']??'');
      if(strlen($password)<10)throw new RuntimeException('Password must be at least 10 characters.');
      $s=db()->prepare('UPDATE users SET password_hash=? WHERE id=?');$s->execute([password_hash($password,PASSWORD_DEFAULT),$id]);$msg='Password reset.';
    } elseif($action==='change_role'){
      $id=(int)($_POST['user_id']??0);$role=$_POST['role']??'user';
      if(!in_array($role,['admin','user'],true))throw new RuntimeException('Invalid role.');
      if($id===(int)$u['id'] && $role!=='admin')throw new RuntimeException('You cannot remove your own administrator role.');
      $s=db()->prepare('UPDATE users SET role=? WHERE id=?');$s->execute([$role,$id]);$msg='Role changed.';
    } elseif($action==='delete_user'){
      $id=(int)($_POST['user_id']??0);
      if($id===(int)$u['id'])throw new RuntimeException('You cannot delete your own account.');
      $s=db()->prepare('DELETE FROM users WHERE id=?');$s->execute([$id]);$msg='User deleted.';
    } elseif($action==='delete_resume'){
      $id=(int)($_POST['resume_id']??0);
      $s=db()->prepare('SELECT photo_path FROM resumes WHERE id=?');$s->execute([$id]);$r=$s->fetch();
      if($r && str_starts_with((string)$r['photo_path'],'uploads/'))@unlink(__DIR__.'/'.$r['photo_path']);
      $s=db()->prepare('DELETE FROM resumes WHERE id=?');$s->execute([$id]);$msg='Resume deleted.';
    }
  }catch(Throwable $e){$err=$e instanceof PDOException?'Database operation failed.':$e->getMessage();}
}
$users=db()->query('SELECT id,username,role,created_at,updated_at FROM users ORDER BY username')->fetchAll();
$resumes=db()->query('SELECT r.id,r.name,r.total_months,r.updated_at,u.username owner FROM resumes r JOIN users u ON u.id=r.owner_id ORDER BY r.updated_at DESC')->fetchAll();
?>
<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title><?=htmlspecialchars(APP_NAME)?> - Admin</title><link rel="stylesheet" href="assets/resume.css"></head><body>
<main class="admin"><p><a href="index.php">&larr; Resume editor</a> &nbsp; <a href="logout.php">Logout</a></p>
<h1>Admin</h1>
<?php if($msg):?><p><?=htmlspecialchars($msg)?></p><?php endif;?><?php if($err):?><div class="error"><?=htmlspecialchars($err)?></div><?php endif;?>
<h2>Create user</h2>
<form method="post"><input type="hidden" name="csrf" value="<?=htmlspecialchars(csrf_token())?>"><input type="hidden" name="action" value="create_user">
<input name="username" placeholder="Username" required><input type="password" name="password" placeholder="Password (10+ characters)" required>
<select name="role"><option value="user">User</option><option value="admin">Admin</option></select><button>Create</button></form>
<h2>Users</h2><table><thead><tr><th>Username</th><th>Role</th><th>Created</th><th>Actions</th></tr></thead><tbody>
<?php foreach($users as $row):?><tr><td><?=htmlspecialchars($row['username'])?></td><td><?=htmlspecialchars($row['role'])?></td><td><?=htmlspecialchars($row['created_at'])?></td><td>
<form class="inline" method="post"><input type="hidden" name="csrf" value="<?=htmlspecialchars(csrf_token())?>"><input type="hidden" name="action" value="change_role"><input type="hidden" name="user_id" value="<?=$row['id']?>">
<select name="role"><option <?=$row['role']==='user'?'selected':''?> value="user">User</option><option <?=$row['role']==='admin'?'selected':''?> value="admin">Admin</option></select><button>Set role</button></form>
<form class="inline" method="post"><input type="hidden" name="csrf" value="<?=htmlspecialchars(csrf_token())?>"><input type="hidden" name="action" value="reset_password"><input type="hidden" name="user_id" value="<?=$row['id']?>"><input type="password" name="password" placeholder="New password" required><button>Reset password</button></form>
<?php if((int)$row['id']!==(int)$u['id']):?><form class="inline" method="post" onsubmit="return confirm('Delete this user and all their resumes?')"><input type="hidden" name="csrf" value="<?=htmlspecialchars(csrf_token())?>"><input type="hidden" name="action" value="delete_user"><input type="hidden" name="user_id" value="<?=$row['id']?>"><button>Delete</button></form><?php endif;?>
</td></tr><?php endforeach;?></tbody></table>
<h2>Stored resumes</h2><table><thead><tr><th>Name</th><th>Owner</th><th>Employment</th><th>Last saved</th><th>Actions</th></tr></thead><tbody>
<?php foreach($resumes as $r): $y=intdiv((int)$r['total_months'],12);$m=(int)$r['total_months']%12;?><tr><td><?=htmlspecialchars($r['name'])?></td><td><?=htmlspecialchars($r['owner'])?></td><td><?=$y?>y <?=$m?>m</td><td><?=htmlspecialchars($r['updated_at'])?></td><td><a href="index.php#resume-<?=$r['id']?>" onclick="sessionStorage.setItem('resumeToLoad','<?=$r['id']?>')">Open</a>
<form class="inline" method="post" onsubmit="return confirm('Delete this resume?')"><input type="hidden" name="csrf" value="<?=htmlspecialchars(csrf_token())?>"><input type="hidden" name="action" value="delete_resume"><input type="hidden" name="resume_id" value="<?=$r['id']?>"><button>Delete</button></form></td></tr><?php endforeach;?></tbody></table>
</main></body></html>