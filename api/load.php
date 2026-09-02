<?php
declare(strict_types=1);
require_once __DIR__.'/../includes/auth.php';
$u=require_login();$id=(int)($_GET['id']??0);
if($id<1) json_out(['ok'=>false,'error'=>'Invalid id'],422);
if($u['role']==='admin'){
    $s=db()->prepare('SELECT * FROM resumes WHERE id=?');$s->execute([$id]);
}else{
    $s=db()->prepare('SELECT * FROM resumes WHERE id=? AND owner_id=?');$s->execute([$id,$u['id']]);
}
$r=$s->fetch();if(!$r)json_out(['ok'=>false,'error'=>'Resume not found'],404);
$data=json_decode($r['resume_json'],true); if(!is_array($data))$data=[];
json_out(['ok'=>true,'resume'=>['id'=>(int)$r['id'],'name'=>$r['name'],'total_months'=>(int)$r['total_months'],'photo_path'=>$r['photo_path'],'data'=>$data]]);
