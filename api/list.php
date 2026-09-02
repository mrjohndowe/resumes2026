<?php
declare(strict_types=1);
require_once __DIR__.'/../includes/auth.php';
$u=require_login();
if($u['role']==='admin'){
    $s=db()->query('SELECT r.id,r.name,r.updated_at,r.total_months,u.username owner FROM resumes r JOIN users u ON u.id=r.owner_id ORDER BY r.updated_at DESC');
} else {
    $s=db()->prepare('SELECT id,name,updated_at,total_months FROM resumes WHERE owner_id=? ORDER BY updated_at DESC');
    $s->execute([$u['id']]);
}
json_out(['ok'=>true,'resumes'=>$s->fetchAll()]);
