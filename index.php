<?php
declare(strict_types=1);
require_once __DIR__.'/includes/auth.php';
$u=require_login();
?>
<!doctype html>
<html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="csrf-token" content="<?=htmlspecialchars(csrf_token())?>">
<title><?=htmlspecialchars(APP_NAME)?></title>
<link rel="stylesheet" href="assets/resume.css?v=20260901-pack-page-2">
</head><body>
<header class="toolbar no-print">
  <strong><?=htmlspecialchars(APP_NAME)?></strong>
  <select id="history"><option value="">History - Name / Date</option></select>
  <button id="newBtn" type="button">New</button>
  <button id="printBtn" type="button">Print</button>
  <span id="status">Loading...</span>
  <span id="experience">Total Employment Experience: 0 months</span>
  <?php if($u['role']==='admin'): ?><a class="button-link" href="admin.php">Admin</a><?php endif; ?>
  <a class="button-link" href="logout.php">Logout</a>
</header>

<div class="editor-shell">
  <aside id="formPanel" class="form-panel no-print" aria-label="Resume form">
    <div class="form-panel-head">
      <h1>Resume Form</h1>
      <p>Fill in the form. The document preview updates instantly.</p>
    </div>
    <section class="form-section photo-controls" id="photoControls">
      <div class="section-heading"><h2>Profile Photo</h2></div>
      <div class="photo-control-row">
        <label class="primary-btn photo-upload-btn" for="photoInput">Choose / Replace photo</label>
        <button id="removePhotoBtn" type="button" class="primary-btn danger-btn" hidden>Remove photo</button>
      </div>
      <div id="photoAdjustmentControls" hidden>
        <div class="photo-control-row">
          <button id="resetPhotoBtn" type="button" class="primary-btn secondary-btn">Reset position</button>
        </div>
        <label class="photo-zoom-label" for="photoZoom">Zoom <span id="photoZoomValue">100%</span></label>
        <input id="photoZoom" class="photo-zoom" type="range" min="100" max="300" step="1" value="100">
        <p class="photo-help">Drag the photo directly inside the circle on the resume. Use Zoom for a tighter crop. Position and zoom are saved automatically.</p>
      </div>
      <p id="photoOptionalHelp" class="photo-help">Photo is optional. If you do not upload one, the photo area stays blank.</p>
    </section>
    <div id="basicForm"></div>
    <section class="form-section">
      <div class="section-heading">
        <h2>Employment</h2>
        <button id="addJobBtn" class="primary-btn" type="button">+ Add employment</button>
      </div>
      <div id="jobsForm"></div>
    </section>
    <div id="educationForm"></div>
  </aside>

  <main id="workspace" aria-label="Resume preview">
    <section class="page" data-page="1">
      <img class="page-bg" src="assets/page-1.png" alt="">
      <input id="photoInput" class="photo-input-hidden no-print" type="file" accept="image/jpeg,image/png,image/webp">
      <div id="photoFrame" class="photo-frame" aria-label="Profile photo. Drag to reposition.">
        <img id="photoOverlay" class="photo-overlay" alt="">
      </div>
      <div class="field" data-key="name" style="--x:24;--y:16;--w:350;--h:58;--fs:48;--min:18;--lh:1.05"></div>
      <div class="field" data-key="address" style="--x:24;--y:170.7;--w:174;--h:29;--fs:12;--min:7;--lh:1.15"></div>
      <div class="field" data-key="phoneEmail" style="--x:211.8;--y:170.7;--w:163;--h:29;--fs:12;--min:7;--lh:1.15"></div>
      <div class="field" data-key="profileTitle" style="--x:24;--y:218.4;--w:170;--h:16;--fs:12;--min:7;--lh:1.1"></div>
      <div class="field" data-key="profileText" style="--x:24;--y:242.6;--w:174;--h:137;--fs:10;--min:6;--lh:1.12"></div>
      <div class="field" data-key="skillsTitle" style="--x:211.8;--y:218.4;--w:80;--h:16;--fs:12;--min:7;--lh:1.1"></div>
      <div id="skillsPreview" class="skills-preview" style="--x:211.8;--y:242.6;--w:172;--h:138"></div>
      <div class="field" data-key="detailsTitle" style="--x:399.5;--y:218.4;--w:80;--h:16;--fs:12;--min:7;--lh:1.1"></div>
      <div id="detailsPreview" class="details-preview" style="--x:399.5;--y:242.6;--w:174;--h:70"></div>
      <div class="field" data-key="employmentTitle" style="--x:24;--y:405.6;--w:150;--h:16;--fs:12;--min:7;--lh:1.1"></div>
      <div id="page1Jobs"></div>
      <div class="employment-timeline" aria-label="Employment duration timeline">
        <svg viewBox="0 0 547.28 105" preserveAspectRatio="none"></svg>
      </div>
    </section>
    <section class="page" data-page="2">
      <img class="page-bg" src="assets/page-2.png" alt="">
      <div id="page2Dynamic" class="dynamic-page-surface"></div>
    </section>
    <div id="overflowPages"></div>
  </main>
</div>
<script>window.RESUME_USER=<?=json_encode($u,JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT)?>;</script>
<script src="assets/resume.js?v=20260901-pack-page-2"></script>
</body></html>
