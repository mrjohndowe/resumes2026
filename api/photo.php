<?php
declare(strict_types=1);
require_once __DIR__.'/../includes/auth.php';
$u=require_login();verify_csrf();
$id=(int)($_POST['resume_id']??0);
$action=(string)($_POST['action']??'upload');
if($id<1) json_out(['ok'=>false,'error'=>'Missing resume'],422);
if($u['role']==='admin'){
    $s=db()->prepare('SELECT id,photo_path FROM resumes WHERE id=?');$s->execute([$id]);
}else{
    $s=db()->prepare('SELECT id,photo_path FROM resumes WHERE id=? AND owner_id=?');$s->execute([$id,$u['id']]);
}
$r=$s->fetch();if(!$r)json_out(['ok'=>false,'error'=>'Resume not found'],404);
if($action==='remove'){
    $old=(string)($r['photo_path']??'');
    if(str_starts_with($old,'uploads/')){@unlink(__DIR__.'/../'.$old);}
    $s=db()->prepare('UPDATE resumes SET photo_path=NULL WHERE id=?');$s->execute([$id]);
    json_out(['ok'=>true,'path'=>'']);
}
if(empty($_FILES['photo'])) json_out(['ok'=>false,'error'=>'Missing photo'],422);
$f=$_FILES['photo'];
if($f['error']!==UPLOAD_ERR_OK)json_out(['ok'=>false,'error'=>'Upload failed'],400);
if($f['size']>MAX_PHOTO_BYTES)json_out(['ok'=>false,'error'=>'Photo is too large (5 MB maximum)'],422);
$fi=new finfo(FILEINFO_MIME_TYPE);$mime=$fi->file($f['tmp_name']);
$ext=['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp'][$mime]??null;
if(!$ext)json_out(['ok'=>false,'error'=>'Use JPEG, PNG, or WebP'],422);
$dir=realpath(__DIR__.'/../uploads') ?: (__DIR__.'/../uploads');
if(!is_dir($dir))mkdir($dir,0755,true);
$name='resume-'.$id.'-'.bin2hex(random_bytes(8)).'.'.$ext;
$target=$dir.DIRECTORY_SEPARATOR.$name;
if(!move_uploaded_file($f['tmp_name'],$target))json_out(['ok'=>false,'error'=>'Could not store upload'],500);
@chmod($target,0644);
$old=(string)($r['photo_path']??'');
if(str_starts_with($old,'uploads/')){@unlink(__DIR__.'/../'.$old);}
$path='uploads/'.$name;
$s=db()->prepare('UPDATE resumes SET photo_path=? WHERE id=?');$s->execute([$path,$id]);
json_out(['ok'=>true,'path'=>$path]);
