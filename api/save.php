<?php
declare(strict_types=1);
require_once __DIR__.'/../includes/auth.php';
require_once __DIR__.'/../includes/functions.php';
$u=require_login(); verify_csrf();
$in=json_input();
$data=$in['resume']??[];
if(!is_array($data)) json_out(['ok'=>false,'error'=>'Invalid resume data'],422);
$name=trim((string)($data['name']??''));
$j1=$data['jobs'][0]??[];
if($name==='' || trim((string)($j1['title']??''))==='' || trim((string)($j1['employerLine']??''))==='') {
    json_out(['ok'=>false,'error'=>'Name and first job title/employer are required'],422);
}
$nameKey=normalize_name($name);
$total=total_employment_months(is_array($data['jobs']??null)?$data['jobs']:[]);
$photo=trim((string)($data['photo_path']??''));
$pdo=db();
$id=(int)($in['id']??0);

try {
    if($id>0){
        if($u['role']==='admin'){
            $s=$pdo->prepare('SELECT owner_id FROM resumes WHERE id=?');$s->execute([$id]);
        } else {
            $s=$pdo->prepare('SELECT owner_id FROM resumes WHERE id=? AND owner_id=?');$s->execute([$id,$u['id']]);
        }
        $row=$s->fetch(); if(!$row) json_out(['ok'=>false,'error'=>'Resume not found'],404);
        $owner=(int)$row['owner_id'];
        $s=$pdo->prepare('UPDATE resumes SET name=?,name_key=?,resume_json=?,total_months=?,photo_path=? WHERE id=?');
        $s->execute([$name,$nameKey,json_encode($data,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES),$total,$photo?:null,$id]);
    } else {
        $owner=(int)$u['id'];
        $sql='INSERT INTO resumes(owner_id,name,name_key,resume_json,total_months,photo_path)
              VALUES(?,?,?,?,?,?)
              ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id),name=VALUES(name),resume_json=VALUES(resume_json),total_months=VALUES(total_months),photo_path=VALUES(photo_path)';
        $s=$pdo->prepare($sql);
        $s->execute([$owner,$name,$nameKey,json_encode($data,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES),$total,$photo?:null]);
        $id=(int)$pdo->lastInsertId();
    }
    json_out(['ok'=>true,'id'=>$id,'total_months'=>$total]);
} catch(PDOException $e){
    if((int)$e->errorInfo[1]===1062) json_out(['ok'=>false,'error'=>'A resume with that name already exists for this owner'],409);
    json_out(['ok'=>false,'error'=>'Database save failed'],500);
}
