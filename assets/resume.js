(() => {
'use strict';

const csrf=document.querySelector('meta[name="csrf-token"]').content;
const statusEl=document.getElementById('status');
const expEl=document.getElementById('experience');
const historyEl=document.getElementById('history');
const basicForm=document.getElementById('basicForm');
const jobsForm=document.getElementById('jobsForm');
const educationForm=document.getElementById('educationForm');
const overflowPages=document.getElementById('overflowPages');
const photoFrame=document.getElementById('photoFrame');
const photoOverlay=document.getElementById('photoOverlay');
const photoZoom=document.getElementById('photoZoom');
const photoZoomValue=document.getElementById('photoZoomValue');
const resetPhotoBtn=document.getElementById('resetPhotoBtn');
const removePhotoBtn=document.getElementById('removePhotoBtn');
const photoAdjustmentControls=document.getElementById('photoAdjustmentControls');
const photoOptionalHelp=document.getElementById('photoOptionalHelp');

let currentId=null;
let photoPath='';
let saveTimer=null;
let saving=false;
let state={};

const defaults={
  name:'Jose Davila',
  address:'213 Fordham Circle, Pueblo, CO\n81005, United States',
  phoneEmail:'719-859-5823 / 719-400-4022\ndavila.jose.84@outlook.com',
  profileTitle:'Opportunist',
  profileText:'Results-driven leader with extensive experience in operations, customer service, and team supervision. Proven ability to manage staff, streamline processes, and maintain high service standards across fast-paced environments. Known for reliability, adaptability, and a calm, professional presence under pressure.',
  skillsTitle:'Skills',
  skillsText:'Team Leadership                         Experienced\nShift & Staff Supervision               Experienced\nCustomer Service Excellence             Experienced\nCash & POS Management                    Experienced\nScheduling & Coordination                Beginner\nConflict Resolution                      Experienced\nInventory Control                        Expert\nOperational Efficiency                   Novice',
  detailsTitle:'Details',
  detailsText:'Nationality\nHispanic\nDate / Place of birth\n08/04/1984\nHumacao, Puerto Rico',
  employmentTitle:'Employment History',
  educationTitle:'Education',
  edu1Qualification:'A+ MCSE, Computer\nEngineering Technology',
  edu1School:'Job Corps Academy, Edison',
  edu1Note:'Microsoft Certified System Engineer',
  edu2Qualification:'High School Diploma',
  edu2School:'Eastside High School, Paterson',
  photo_crop:{x:0,y:0,scale:1},
  jobs:[
    {title:'Shift Lead',employerLine:"Love's Arby's, Trinidad, CO",start:'Oct 2025',end:'Nov 2025',description:'•  Supervised daily shift operations to ensure smooth workflow and exceptional customer experience.\n•  Led team members during peak hours, maintaining efficiency, accuracy, and service quality.\n•  Managed cash handling, register balancing, and POS transactions with precision.\n•  Supported opening and closing procedures, inventory checks, and overall store readiness.'},
    {title:'Cashier',employerLine:'KFC/Taco Bell, Trinidad, CO',start:'Apr 2024',end:'Oct 2025',description:'•  Operated both Front Counter and Drive Thru registers simultaneously during high-volume shifts.\n•  Maintained speed, accuracy, and customer service standards while managing multiple order flows.\n•  Handled cash, card, and POS transactions with consistent accuracy.\n•  Supported team efficiency by adapting quickly to peak demand and staffing needs.'},
    {title:'Dispatcher',employerLine:'XLN Transport LLC, Jamison, PA',start:'Dec 2020',end:'Dec 2023',description:'•  Coordinated dispatch, routing, and real-time tracking of fleet vehicles.\n•  Maintained accurate call logs and electronic records.\n•  Prioritized and managed over 25 daily service calls.\n•  Communicated professionally with customers, drivers, and internal staff.\n•  Supported staff scheduling and operational planning.'},
    {title:'Manager',employerLine:'The Beehive Showbar, Greensburg, PA',start:'Feb 2020',end:'Nov 2020',description:'•  Oversaw daily operations, staff performance, and customer satisfaction.\n•  Increased revenue through promotions and service improvements.\n•  Reduced operational waste by over 75% through process optimization.\n•  Planned events and adjusted staffing and inventory to meet demand.'},
    {title:'Lead Flagger',employerLine:'Flagger Force, Greensburg, PA',start:'Jun 2019',end:'Jan 2020',description:'•  Directed crews and assigned tasks to ensure safe and timely project completion.\n•  Trained staff on safety procedures, resulting in zero reported injuries.'},
    {title:'3rd Keyholder',employerLine:'Dollar General, Johnstown, PA',start:'May 2018',end:'Aug 2019',description:'•  Supported store management with daily operations and cash controls.\n•  Reduced shrinkage through inventory oversight and security awareness.\n•  Assisted with staff training and customer issue resolution.'},
    {title:'Sales',employerLine:'Sprint (Nextel), New Jersey',start:'Jan 1995',end:'May 2020',description:'Dynamic and customer-focused Sprint Phone Salesman with a proven ability to match customers with the perfect devices and wireless plans. Skilled in product demonstrations, closing sales, and delivering exceptional service that builds loyalty and drives store performance.'}
  ]
};

const baseSlots=[
 {page:1,x:24,y:429.8,w:174,employerY:449.5,dateY:472.9,descY:494.5,descH:154},
 {page:1,x:211.8,y:429.8,w:174,employerY:449.5,dateY:472.9,descY:494.5,descH:192},
 {page:1,x:399.5,y:429.8,w:174,employerY:449.5,dateY:472.9,descY:494.5,descH:160},
 {page:2,x:24,y:42,w:174,employerY:61.7,dateY:97.6,descY:119.2,descH:152},
 {page:2,x:211.8,y:42,w:174,employerY:61.7,dateY:85.1,descY:106.7,descH:155},
 {page:2,x:399.5,y:42,w:174,employerY:61.7,dateY:85.1,descY:106.7,descH:155},
 {page:2,x:24,y:284.8,w:174,employerY:304.5,dateY:327.8,descY:348.2,descH:108},
 {page:2,x:211.8,y:284.8,w:174,employerY:304.5,dateY:327.8,descY:348.2,descH:108},
 {page:2,x:399.5,y:284.8,w:174,employerY:304.5,dateY:327.8,descY:348.2,descH:108}
];

const continuationSlots=[
 {x:24,y:78},{x:211.8,y:78},{x:399.5,y:78},
 {x:24,y:390},{x:211.8,y:390},{x:399.5,y:390}
];

function esc(v){
 return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
function splitDateLine(v){
 const parts=String(v||'').split(/\s+(?:-|–|—|to)\s+/i);
 return {start:(parts[0]||'').trim(),end:(parts.slice(1).join(' - ')||'').trim()};
}
function normalizeData(data){
 const d={...defaults,...(data||{})};

 d.skills=Array.isArray(data?.skills)
   ? data.skills.map(x=>({name:String(x?.name||''),level:String(x?.level||'')}))
   : parseSkillsText(d.skillsText);

 d.details=Array.isArray(data?.details)
   ? data.details.map(x=>({label:String(x?.label||''),value:String(x?.value||'')}))
   : parseDetailsText(d.detailsText);

 const jobs=Array.isArray(data?.jobs)?data.jobs:defaults.jobs;
 d.jobs=jobs.map((j,i)=>{
   const fromLine=splitDateLine(j.dateLine||'');
   return {
     number:String(i+1),
     title:String(j.title||''),
     employerLine:String(j.employerLine||''),
     start:String(j.start||fromLine.start||''),
     end:String(j.end||fromLine.end||''),
     description:String(j.description||'')
   };
 });
 if(!d.jobs.length)d.jobs=[blankJob()];
 d.photo_path=data?.photo_path||'';
 const crop=data?.photo_crop||{};
 d.photo_crop={
   x:clampNumber(crop.x,-1,1,0),
   y:clampNumber(crop.y,-1,1,0),
   scale:clampNumber(crop.scale,1,3,1)
 };
 return d;
}
function clampNumber(value,min,max,fallback){
 const n=Number(value);
 return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback;
}
function blankJob(){
 return {number:'',title:'',employerLine:'',start:'',end:'',description:''};
}
function dateLine(job){
 const a=(job.start||'').trim(), b=(job.end||'').trim();
 return [a,b].filter(Boolean).join(' - ');
}

const inputPlaceholders={
 name:'Full Name',
 address:'Street Address, City, State ZIP',
 phoneEmail:'Phone Number / Email Address',
 profileTitle:'Professional Title / Profile Heading',
 profileText:'Professional Summary / About You',
 skillsTitle:'Skills',
 detailsTitle:'Details',
 educationTitle:'Education',
 edu1Qualification:'Degree, Certificate, or Qualification',
 edu1School:'School / Institution and Location',
 edu1Note:'Certification, Concentration, or Additional Note',
 edu2Qualification:'Degree, Diploma, or Qualification',
 edu2School:'School / Institution and Location'
};

function placeholderFor(key,label=''){
 return inputPlaceholders[key] || label || '';
}

function formField(label,key,value,type='input',extra=''){
 const placeholder=placeholderFor(key,label);
 const control=type==='textarea'
   ? `<textarea data-key="${key}" placeholder="${esc(placeholder)}" ${extra}>${esc(value)}</textarea>`
   : `<input data-key="${key}" value="${esc(value)}" placeholder="${esc(placeholder)}" ${extra}>`;
 return `<label class="form-field">${esc(label)}${control}</label>`;
}

const skillLevels=['Novice','Beginner','Intermediate','Experienced','Expert'];

function parseSkillsText(value){
 const lines=String(value||'').split(/\r?\n/).map(v=>v.trim()).filter(Boolean);
 return lines.map(line=>{
   const match=line.match(/^(.*?)\s{2,}(\S.*)$/);
   if(match)return {name:match[1].trim(),level:match[2].trim()};
   const known=skillLevels.find(level=>line.toLowerCase().endsWith(level.toLowerCase()));
   if(known)return {name:line.slice(0,line.length-known.length).trim(),level:known};
   return {name:line,level:''};
 });
}

function getSkills(){
 if(!Array.isArray(state.skills))state.skills=parseSkillsText(state.skillsText);
 return state.skills;
}

function setSkills(skills){
 state.skills=skills;
 state.skillsText=skills.map(skill=>{
   const name=String(skill.name||'').trim();
   const level=String(skill.level||'').trim();
   if(!name&&!level)return '';
   return `${name}    ${level}`.trimEnd();
 }).filter(Boolean).join('\n');
}

function addSkill(){
 const skills=getSkills();
 skills.push({name:'',level:''});
 setSkills(skills);
 renderStaticForms();
 renderPreview();
 queueSave();
 requestAnimationFrame(()=>{
   const rows=basicForm.querySelectorAll('.skill-edit-row');
   rows[rows.length-1]?.querySelector('input')?.focus();
 });
}

function removeSkill(index){
 const skills=getSkills();
 if(index<0||index>=skills.length)return;
 skills.splice(index,1);
 setSkills(skills);
 renderStaticForms();
 renderPreview();
 queueSave();
}

function skillEditorRows(){
 return getSkills().map((skill,i)=>`
   <div class="skill-edit-row">
     <button type="button" class="mini-remove" data-remove-skill="${i}" title="Remove skill">×</button>
     <label class="form-field skill-edit-name">Skill
       <input data-skill="${i}" data-skill-part="name" value="${esc(skill.name)}" placeholder="Skill name">
     </label>
     <label class="form-field skill-edit-level">Level
       <select data-skill="${i}" data-skill-part="level">
         <option value="">Select level</option>
         ${skillLevels.map(level=>`<option value="${esc(level)}" ${skill.level===level?'selected':''}>${esc(level)}</option>`).join('')}
       </select>
     </label>
   </div>`).join('');
}

function parseDetailsText(value){
 const lines=String(value||'').split(/\r?\n/);
 if(!lines.some(line=>line.trim()))return [];
 const rows=[];
 if(lines[0]!==undefined)rows.push({label:(lines[0]||'').trim(),value:(lines[1]||'').trim()});
 if(lines[2]!==undefined)rows.push({label:(lines[2]||'').trim(),value:lines.slice(3).join('\n').trim()});
 return rows;
}

const demographicOptions=[
 'American',
 'Hispanic / Latino',
 'White / Caucasian',
 'Black / African American',
 'Asian',
 'Native American / Alaska Native',
 'Native Hawaiian / Pacific Islander',
 'Middle Eastern / North African',
 'Multiracial / Multiethnic',
 'Other',
 'Prefer not to say'
];

function getDetails(){
 if(!Array.isArray(state.details))state.details=parseDetailsText(state.detailsText);
 return state.details;
}

function setDetails(rows){
 state.details=rows;
 state.detailsText=rows.map(row=>{
   const label=String(row.label||'').trim();
   const value=String(row.value||'').trim();
   return [label,value].filter(Boolean).join('\n');
 }).filter(Boolean).join('\n');
}

function addDetail(){
 const details=getDetails();
 details.push({label:'',value:''});
 setDetails(details);
 renderStaticForms();
 renderPreview();
 queueSave();
 requestAnimationFrame(()=>{
   const rows=basicForm.querySelectorAll('.detail-edit-card');
   rows[rows.length-1]?.querySelector('input')?.focus();
 });
}

function removeDetail(index){
 const details=getDetails();
 if(index<0||index>=details.length)return;
 details.splice(index,1);
 setDetails(details);
 renderStaticForms();
 renderPreview();
 queueSave();
}

function detailValueControl(detail,i){
 const isNationality=String(detail.label||'').trim().toLowerCase()==='nationality';
 if(isNationality){
   const current=String(detail.value||'');
   const exists=demographicOptions.includes(current);
   return `
     <select data-detail="${i}" data-detail-part="value">
       <option value="">Select nationality / demographic</option>
       ${!exists&&current?`<option value="${esc(current)}" selected>${esc(current)}</option>`:''}
       ${demographicOptions.map(value=>`<option value="${esc(value)}" ${current===value?'selected':''}>${esc(value)}</option>`).join('')}
     </select>`;
 }
 return `<textarea data-detail="${i}" data-detail-part="value" placeholder="Enter detail value">${esc(detail.value)}</textarea>`;
}

function detailEditorRows(){
 return getDetails().map((detail,i)=>`
   <div class="detail-edit-card">
     <button type="button" class="mini-remove" data-remove-detail="${i}" title="Remove detail">×</button>
     <label class="form-field detail-edit-label">Detail
       <input data-detail="${i}" data-detail-part="label" value="${esc(detail.label)}" placeholder="Detail label">
     </label>
     <label class="form-field detail-edit-value">Value
       ${detailValueControl(detail,i)}
     </label>
   </div>`).join('');
}

function renderStaticForms(){
 basicForm.innerHTML=`
   <section class="form-section">
     <div class="section-heading"><h2>Personal & Profile</h2></div>
     <div class="form-grid">
       <div class="full">${formField('Name','name',state.name)}</div>
       ${formField('Address','address',state.address,'textarea')}
       ${formField('Phone / Email','phoneEmail',state.phoneEmail,'textarea')}
       ${formField('Profile heading','profileTitle',state.profileTitle)}
       <div class="full">${formField('Profile','profileText',state.profileText,'textarea')}</div>
     </div>
   </section>

   <section class="form-section">
     <div class="section-heading dynamic-heading">
       <h2>Skills</h2>
       <button type="button" class="section-add-btn" id="addSkillBtn">+ Add Skill</button>
     </div>
     <div class="form-grid">
       <div class="full">${formField('Skills heading','skillsTitle',state.skillsTitle)}</div>
       <div class="full skill-editor">${skillEditorRows()}</div>
     </div>
   </section>

   <section class="form-section">
     <div class="section-heading dynamic-heading">
       <h2>Details</h2>
       <button type="button" class="section-add-btn" id="addDetailBtn">+ Add Detail</button>
     </div>
     <div class="form-grid">
       <div class="full">${formField('Details heading','detailsTitle',state.detailsTitle)}</div>
       <div class="full details-editor">${detailEditorRows()}</div>
     </div>
   </section>`;

 educationForm.innerHTML=`
   <section class="form-section">
     <div class="section-heading"><h2>Education</h2></div>
     <div class="form-grid">
       ${formField('Education heading','educationTitle',state.educationTitle)}
       <span></span>
       ${formField('Qualification 1','edu1Qualification',state.edu1Qualification,'textarea')}
       ${formField('School 1','edu1School',state.edu1School)}
       ${formField('Note 1','edu1Note',state.edu1Note)}
       <span></span>
       ${formField('Qualification 2','edu2Qualification',state.edu2Qualification)}
       ${formField('School 2','edu2School',state.edu2School)}
     </div>
   </section>`;

 document.getElementById('addSkillBtn')?.addEventListener('click',addSkill);
 document.getElementById('addDetailBtn')?.addEventListener('click',addDetail);

 basicForm.querySelectorAll('[data-remove-skill]').forEach(btn=>{
   btn.addEventListener('click',()=>removeSkill(Number(btn.dataset.removeSkill)));
 });
 basicForm.querySelectorAll('[data-remove-detail]').forEach(btn=>{
   btn.addEventListener('click',()=>removeDetail(Number(btn.dataset.removeDetail)));
 });
}

function renderJobsForm(){
 jobsForm.innerHTML=state.jobs.map((j,i)=>`
   <article class="job-card" data-job-card="${i}">
     <div class="job-card-head">
       <strong>Employment ${i+1}</strong>
       <div class="job-actions">
         <button type="button" data-action="up" data-job="${i}" ${i===0?'disabled':''}>↑</button>
         <button type="button" data-action="down" data-job="${i}" ${i===state.jobs.length-1?'disabled':''}>↓</button>
         <button type="button" class="danger" data-action="remove" data-job="${i}" ${state.jobs.length===1?'disabled':''}>Remove</button>
       </div>
     </div>
     <div class="form-grid">
       ${jobField('Job title','title',j.title,i)}
       ${jobField('Employer / Location','employerLine',j.employerLine,i)}
       ${jobField('Start','start',j.start,i,'input','placeholder="e.g. Jan 2024"')}
       ${jobField('End','end',j.end,i,'input','placeholder="e.g. Present"')}
       <div class="full">${jobField('Description','description',j.description,i,'textarea')}</div>
     </div>
   </article>`).join('');
}
function jobField(label,key,value,index,type='input',extra=''){
 const placeholders={
   title:'Job Title',
   employerLine:'Employer / Company, City, State',
   start:'Start Date, e.g. Jan 2024',
   end:'End Date or Present',
   description:'Responsibilities, accomplishments, duties, and results'
 };
 const placeholder=placeholders[key]||label;
 const control=type==='textarea'
  ? `<textarea data-job="${index}" data-part="${key}" placeholder="${esc(placeholder)}" ${extra}>${esc(value)}</textarea>`
  : `<input data-job="${index}" data-part="${key}" value="${esc(value)}" placeholder="${esc(placeholder)}" ${extra}>`;
 return `<label class="form-field">${esc(label)}${control}</label>`;
}
function allPreviewFields(){return [...document.querySelectorAll('.field')]}
function autoShrink(el){
 const original=parseFloat(getComputedStyle(el).getPropertyValue('--fs'))||10;
 const min=parseFloat(getComputedStyle(el).getPropertyValue('--min'))||6;
 let size=original;
 el.style.fontSize=size+'pt';
 while(size>min && (el.scrollHeight>el.clientHeight+1 || el.scrollWidth>el.clientWidth+1)){
   size-=0.25;
   el.style.fontSize=size+'pt';
 }
}
function createPreviewField(host,job,index,slot,overflow=false){
 const parts=[
  ['heading',`${index+1}  ${job.title||''}`,slot.y,16,12,7,1.1],
  ['employerLine',job.employerLine||'',slot.employerY??slot.y+22,overflow?30:22,12,7,1.15],
  ['dateLine',dateLine(job),slot.dateY??slot.y+58,15,10,6,1.1],
  ['description',job.description||'',slot.descY??slot.y+80,slot.descH??210,10,5.5,1.08]
 ];
 parts.forEach(([part,value,y,h,fs,min,lh])=>{
   const el=document.createElement('div');
   el.className='field job-field'+(overflow?' overflow-job':'');
   el.dataset.job=String(index);
   el.dataset.part=part;
   el.style.cssText=`--x:${slot.x};--y:${y};--w:${slot.w||174};--h:${h};--fs:${fs};--min:${min};--lh:${lh}`;
   el.textContent=value;
   host.appendChild(el);
   autoShrink(el);
 });
}

function flowJobCard(job,index){
 return `<article class="flow-job-card">
   <div class="flow-job-heading">${esc(index+1)}&nbsp;&nbsp;${esc(job.title||'')}</div>
   <div class="flow-job-employer">${esc(job.employerLine||'')}</div>
   <div class="flow-job-dates">${esc(dateLine(job))}</div>
   <div class="flow-job-description">${esc(job.description||'')}</div>
 </article>`;
}
function flowEducation(){
 return `<section class="flow-education">
   <div class="flow-section-title">${esc(state.educationTitle||'Education')}</div>
   <div class="flow-education-grid">
     <div class="flow-education-item">
       <div class="flow-education-qualification">${esc(state.edu1Qualification||'')}</div>
       <div class="flow-education-school">${esc(state.edu1School||'')}</div>
       <div class="flow-education-note">${esc(state.edu1Note||'')}</div>
     </div>
     <div class="flow-education-item">
       <div class="flow-education-qualification">${esc(state.edu2Qualification||'')}</div>
       <div class="flow-education-school">${esc(state.edu2School||'')}</div>
     </div>
     <div class="flow-education-item"></div>
   </div>
 </section>`;
}
function dynamicPageSurface(pageNumber){
 if(pageNumber===2){
   const host=document.getElementById('page2Dynamic');
   host.innerHTML='';
   return host;
 }
 const page=document.createElement('section');
 page.className='page continuation-page';
 page.dataset.page=String(pageNumber);
 page.innerHTML='<div class="dynamic-page-surface continuation-surface"></div>';
 overflowPages.appendChild(page);
 return page.querySelector('.dynamic-page-surface');
}
function renderDynamicEmploymentPages(){
 const afterFirstPage=state.jobs.slice(3);
 const chunks=[];
 // Page 1 remains reserved for the latest three employments. Continuation
 // pages use three compact rows before another page is created.
 const pageCapacity=9;

 // Always keep page 2 present. Jobs are never truncated: each additional
 // group of nine creates another A4 page.
 if(afterFirstPage.length===0){
   chunks.push([]);
 }else{
   for(let i=0;i<afterFirstPage.length;i+=pageCapacity){
     chunks.push(afterFirstPage.slice(i,i+pageCapacity));
   }
 }

 let globalIndex=3;
 chunks.forEach((jobsOnPage,pageIndex)=>{
   const pageNumber=2+pageIndex;
   const host=dynamicPageSurface(pageNumber);
   const continued=pageNumber>2 ? ' (continued)' : '';
   host.innerHTML=`<div class="flow-continuation-title">Employment History${continued}</div>
     <div class="flow-job-grid">${jobsOnPage.map((job,local)=>flowJobCard(job,globalIndex+local)).join('')}</div>`;
   globalIndex+=jobsOnPage.length;

   // Education follows the final employment row. Adding jobs therefore pushes
   // it downward and, once another page is needed, moves it to that final page.
   if(pageIndex===chunks.length-1){
     host.insertAdjacentHTML('beforeend',flowEducation());
     host.insertAdjacentHTML('beforeend','<div class="flow-timeline" aria-label="Employment duration timeline"><svg viewBox="0 0 547.28 105" preserveAspectRatio="none"></svg></div>');
   }
 });
}
function renderSkillsPreview(){
 const host=document.getElementById('skillsPreview');
 if(!host)return;
 host.innerHTML='';
 const skills=getSkills();
 host.style.gridTemplateRows=`repeat(${Math.max(skills.length,1)},1fr)`;
 skills.forEach(skill=>{
   const row=document.createElement('div');
   row.className='skills-preview-row';

   const name=document.createElement('div');
   name.className='skills-preview-name';
   name.textContent=skill.name||'';

   const level=document.createElement('div');
   level.className='skills-preview-level';
   level.textContent=skill.level||'';

   row.append(name,level);
   host.appendChild(row);
   autoShrink(name);
   autoShrink(level);
 });
}

function renderDetailsPreview(){
 const host=document.getElementById('detailsPreview');
 if(!host)return;

 host.innerHTML='';

 const details=getDetails();
 host.style.gridTemplateRows=`repeat(${Math.max(details.length,1)},1fr)`;
 details.forEach((detail,i)=>{
   const row=document.createElement('div');
   row.className='details-preview-row';
   row.dataset.detailRow=String(i);

   const label=document.createElement('div');
   label.className='details-preview-label';
   label.textContent=detail.label||'';

   const value=document.createElement('div');
   value.className='details-preview-value';
   value.textContent=detail.value||'';

   row.append(label,value);
   host.appendChild(row);

   autoShrink(label);
   autoShrink(value);
 });
}

function renderPreview(){
 document.querySelectorAll('.field[data-key]').forEach(el=>{
   el.textContent=state[el.dataset.key]??'';
   autoShrink(el);
 });
 renderSkillsPreview();
 renderDetailsPreview();

 const p1=document.getElementById('page1Jobs');
 if(p1)p1.innerHTML='';
 overflowPages.innerHTML='';

 // Page 1 keeps the three jobs that belong to the original first-page design.
 // Everything after job 3 is handled by the dynamic A4 page flow below.
 state.jobs.slice(0,3).forEach((job,i)=>{
   const slot=baseSlots[i];
   createPreviewField(p1,job,i,slot,false);
 });

 renderDynamicEmploymentPages();
 document.querySelectorAll('.employment-timeline svg, .flow-timeline svg').forEach(svg=>renderEmploymentTimeline(svg,state.jobs));

 if(state.photo_path)showPhoto(state.photo_path); else hidePhoto(false);
 updateExperience();
}
function bindFormInput(container){
 const handleChange=e=>{
   const el=e.target;
   if(el.dataset.key){
     state[el.dataset.key]=el.value;
   }else if(el.dataset.skill!==undefined && el.dataset.skillPart){
     const skills=getSkills();
     const i=Number(el.dataset.skill);
     if(skills[i]){
       skills[i][el.dataset.skillPart]=el.value;
       setSkills(skills);
     }
   }else if(el.dataset.detail!==undefined && el.dataset.detailPart){
     const details=getDetails();
     const i=Number(el.dataset.detail);
     if(details[i]){
       details[i][el.dataset.detailPart]=el.value;
       setDetails(details);
     }
   }else if(el.dataset.job!==undefined && el.dataset.part){
     const i=Number(el.dataset.job);
     if(state.jobs[i])state.jobs[i][el.dataset.part]=el.value;
   }else return;
   renderPreview();
   queueSave();
 };
 container.addEventListener('input',handleChange);
 container.addEventListener('change',e=>{
   if(e.target.matches('select[data-skill], select[data-detail]'))handleChange(e);
 });
}
function addJob(){
 state.jobs.push(blankJob());
 renderJobsForm();
 renderPreview();
 queueSave();
 requestAnimationFrame(()=>{
   const card=jobsForm.querySelector(`[data-job-card="${state.jobs.length-1}"]`);
   card?.scrollIntoView({behavior:'smooth',block:'center'});
   card?.querySelector('input')?.focus();
 });
}
function mutateJob(action,index){
 if(action==='remove' && state.jobs.length>1)state.jobs.splice(index,1);
 if(action==='up' && index>0)[state.jobs[index-1],state.jobs[index]]=[state.jobs[index],state.jobs[index-1]];
 if(action==='down' && index<state.jobs.length-1)[state.jobs[index+1],state.jobs[index]]=[state.jobs[index],state.jobs[index+1]];
 renderJobsForm();
 renderPreview();
 queueSave();
}
function collect(){
 const d=JSON.parse(JSON.stringify(state));
 d.skills=getSkills().map(skill=>({
   name:String(skill.name||'').trim(),
   level:String(skill.level||'').trim()
 }));
 d.details=getDetails().map(detail=>({
   label:String(detail.label||'').trim(),
   value:String(detail.value||'').trim()
 }));
 d.jobs=(d.jobs||[]).map((j,i)=>({
   number:String(i+1),
   title:(j.title||'').trim(),
   employerLine:(j.employerLine||'').trim(),
   start:(j.start||'').trim(),
   end:(j.end||'').trim(),
   dateLine:dateLine(j),
   description:(j.description||'').trim()
 }));
 d.photo_path=photoPath||d.photo_path||'';
 return d;
}
function eligible(d){
 const j=d.jobs?.[0]||{};
 return String(d.name||'').trim()!=='' && String(j.title||'').trim()!=='' && String(j.employerLine||'').trim()!=='';
}
function parseMonth(v){
 v=(v||'').trim();
 if(!v)return null;
 if(/present|current/i.test(v)){const n=new Date();return new Date(n.getFullYear(),n.getMonth(),1)}
 const normalized=v.replace(/[.,]/g,' ').replace(/\s+/g,' ').trim();
 const d=new Date('1 '+normalized);
 return isNaN(d)?null:new Date(d.getFullYear(),d.getMonth(),1);
}
function monthIndex(d){
 return d.getFullYear()*12+d.getMonth();
}
/*
 * The timeline and Total Employment Experience deliberately use this one
 * parser.  An end date is the first day of its displayed month (exclusive),
 * so Jan 2024 through Jan 2025 is exactly 12 elapsed months.
 */
function employmentRanges(jobs){
 const ranges=[];
 for(const [index,job] of (jobs||[]).entries()){
   let start=parseMonth(job.start);
   let end=parseMonth(job.end||'Present');
   if(!start||!end)continue;
   if(end<start)[start,end]=[end,start];
   ranges.push({index,job,start,end,startMonth:monthIndex(start),endMonth:monthIndex(end)});
 }
 return ranges;
}
function experienceMonths(jobs){
 const ranges=employmentRanges(jobs)
   .map(range=>[range.startMonth,range.endMonth])
   .sort((a,b)=>a[0]-b[0]);
 if(!ranges.length)return 0;

 const merged=[];
 for(const range of ranges){
   const last=merged[merged.length-1];
   if(!last || range[0]>last[1])merged.push([...range]);
   else if(range[1]>last[1])last[1]=range[1];
 }
 return merged.reduce((total,[startMonth,endMonth])=>total+Math.max(0,endMonth-startMonth),0);
}
function updateExperience(){
 const m=experienceMonths(state.jobs);
 const y=Math.floor(m/12);
 const r=m%12;

 const parts=[];
 if(y)parts.push(`${y} year${y===1?'':'s'}`);
 if(r)parts.push(`${r} month${r===1?'':'s'}`);

 expEl.textContent=`Total Employment Experience: ${parts.length?parts.join(', '):'0 months'}`;
}

function monthDurationLabel(months){const y=Math.floor(months/12),m=months%12,parts=[];if(y)parts.push(`${y} year${y===1?'':'s'}`);if(m)parts.push(`${m} month${m===1?'':'s'}`);return parts.length?parts.join(', '):'Less than 1 month'}
function svgEl(name,attrs={},text=''){const el=document.createElementNS('http://www.w3.org/2000/svg',name);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,String(v)));if(text!=='')el.textContent=text;return el}
function renderEmploymentTimeline(svg,jobs){
 while(svg.lastChild)svg.removeChild(svg.lastChild);
 const ranges=employmentRanges(jobs),W=547.28,H=105,left=14,right=10,axisY=75,plotW=W-left-right;
 svg.appendChild(svgEl('rect',{x:0,y:0,width:W,height:H,fill:'#fff'}));
 if(!ranges.length){svg.appendChild(svgEl('line',{x1:left,y1:axisY,x2:W-right,y2:axisY,class:'timeline-axis'}));svg.appendChild(svgEl('text',{x:W/2,y:95,'text-anchor':'middle',class:'timeline-empty'},'Add employment dates to build the timeline'));return}
 const earliest=Math.min(...ranges.map(r=>r.startMonth)),latest=Math.max(...ranges.map(r=>r.endMonth)),domainStart=Math.floor(earliest/12)*12,domainEnd=Math.max(domainStart+12,Math.ceil((latest+1)/12)*12),domainMonths=domainEnd-domainStart,xForMonth=m=>left+((m-domainStart)/domainMonths)*plotW;
 svg.appendChild(svgEl('line',{x1:left,y1:axisY,x2:W-right,y2:axisY,class:'timeline-axis'}));
 const startYear=Math.floor(domainStart/12),endYear=Math.ceil(domainEnd/12),spanYears=Math.max(1,endYear-startYear),tickStep=spanYears>24?4:spanYears>12?2:1;
 for(let year=startYear;year<=endYear;year+=tickStep){const x=xForMonth(year*12);svg.appendChild(svgEl('line',{x1:x,y1:axisY-3,x2:x,y2:axisY+3,class:'timeline-tick'}));svg.appendChild(svgEl('text',{x,y:94,'text-anchor':'middle',class:'timeline-year'},`’${String(year).slice(-2)}`));}
 const ordered=[...ranges].sort((a,b)=>a.startMonth-b.startMonth||b.endMonth-a.endMonth||a.index-b.index),laneEnds=[];
 ordered.forEach(r=>{let lane=laneEnds.findIndex(end=>r.startMonth>=end);if(lane<0){lane=laneEnds.length;laneEnds.push(r.endMonth)}else laneEnds[lane]=r.endMonth;r.lane=lane;});
 const laneCount=Math.max(1,laneEnds.length),top=8,bottom=axisY-8,available=Math.max(12,bottom-top),gap=laneCount>5?1.25:2.25,barH=Math.max(4,Math.min(9,(available-gap*(laneCount-1))/laneCount)),pitch=barH+gap,used=laneCount*barH+(laneCount-1)*gap,startY=top+Math.max(0,(available-used)/2);
 ranges.forEach(r=>{const x1=Math.max(left,Math.min(W-right,xForMonth(r.startMonth))),x2=Math.max(left,Math.min(W-right,xForMonth(r.endMonth))),width=Math.max(2.5,x2-x1),y=startY+r.lane*pitch,months=Math.max(0,r.endMonth-r.startMonth),group=svgEl('g',{class:'timeline-job'}),cx=Math.max(left+5,Math.min(W-right-5,x1+Math.min(6,width/2))),cy=Math.max(5,y-5.2);group.appendChild(svgEl('title',{},`Employment ${r.index+1}: ${dateLine(r.job)} — ${monthDurationLabel(months)}`));group.appendChild(svgEl('line',{x1,y1:y+barH,x2:x1,y2:axisY,class:'timeline-guide'}));group.appendChild(svgEl('rect',{x:x1,y,width,height:barH,rx:barH/2,ry:barH/2,class:'timeline-bar'}));group.appendChild(svgEl('circle',{cx,cy,r:4.8,class:'timeline-number-circle'}));group.appendChild(svgEl('text',{x:cx,y:cy+2.25,'text-anchor':'middle',class:'timeline-number'},String(r.index+1)));svg.appendChild(group);});
}

function setStatus(s){statusEl.textContent=s}
function queueSave(){
 setStatus('Changes pending...');
 clearTimeout(saveTimer);
 saveTimer=setTimeout(saveNow,750);
}
async function saveNow(){
 if(saving)return currentId;
 const d=collect();
 if(!eligible(d)){setStatus('Waiting for name + first job');return null}
 saving=true;setStatus('Saving...');
 try{
   const res=await fetch('api/save.php',{
     method:'POST',
     headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},
     body:JSON.stringify({id:currentId,resume:d})
   });
   const out=await res.json();
   if(!res.ok||!out.ok)throw new Error(out.error||'Save failed');
   currentId=out.id;
   setStatus('Saved '+new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}));
   await refreshHistory();
   return currentId;
 }catch(e){
   console.error(e);setStatus('Save failed');return null;
 }finally{saving=false}
}
async function refreshHistory(){
 const res=await fetch('api/list.php');
 if(!res.ok)return;
 const out=await res.json();
 historyEl.innerHTML='<option value="">History - Name / Date</option>';
 (out.resumes||[]).forEach(r=>{
   const o=document.createElement('option');
   o.value=r.id;
   const dt=new Date((r.updated_at||'').replace(' ','T'));
   o.textContent=`${r.name} - ${isNaN(dt)?r.updated_at:dt.toLocaleString()}`;
   if(String(r.id)===String(currentId))o.selected=true;
   historyEl.appendChild(o);
 });
}
function renderAll(data){
 state=normalizeData(data);
 photoPath=state.photo_path||'';
 renderStaticForms();
 renderJobsForm();
 renderPreview();
}
async function loadResume(id){
 const res=await fetch('api/load.php?id='+encodeURIComponent(id));
 const out=await res.json();
 if(!res.ok||!out.ok){setStatus(out.error||'Load failed');return}
 currentId=out.resume.id;
 const loadedData=out.resume.data||{};
 if(out.resume.photo_path && !loadedData.photo_path)loadedData.photo_path=out.resume.photo_path;
 renderAll(loadedData);
 setStatus('Loaded');
 await refreshHistory();
}
function newResume(){
 currentId=null;
 photoPath='';

 // A new resume starts with zero personal/resume data.
 // Guidance lives only in HTML placeholders and is never stored.
 const blankData={
   name:'',
   address:'',
   phoneEmail:'',
   profileTitle:'',
   profileText:'',
   skillsTitle:'Skills',
   skillsText:'',
   skills:[{name:'',level:''}],
   detailsTitle:'Details',
   detailsText:'',
   details:[
     {label:'Nationality',value:''},
     {label:'Date / Place of birth',value:''}
   ],
   employmentTitle:'Employment History',
   educationTitle:'Education',
   edu1Qualification:'',
   edu1School:'',
   edu1Note:'',
   edu2Qualification:'',
   edu2School:'',
   photo_path:'',
   photo_crop:{x:0,y:0,scale:1},
   jobs:[blankJob()]
 };

 renderAll(blankData);
 historyEl.value='';
 setStatus('New resume - enter name + first job');
}
function ensurePhotoCrop(){
 if(!state.photo_crop || typeof state.photo_crop!=='object'){
   state.photo_crop={x:0,y:0,scale:1};
 }
 state.photo_crop.x=clampNumber(state.photo_crop.x,-1,1,0);
 state.photo_crop.y=clampNumber(state.photo_crop.y,-1,1,0);
 state.photo_crop.scale=clampNumber(state.photo_crop.scale,1,3,1);
 return state.photo_crop;
}
function syncPhotoControls(){
 const crop=ensurePhotoCrop();
 const percent=Math.round(crop.scale*100);
 const hasPhoto=Boolean(state.photo_path);
 photoZoom.value=String(percent);
 photoZoomValue.textContent=percent+'%';
 resetPhotoBtn.disabled=!hasPhoto;
 photoZoom.disabled=!hasPhoto;
 if(removePhotoBtn)removePhotoBtn.hidden=!hasPhoto;
 if(photoAdjustmentControls)photoAdjustmentControls.hidden=!hasPhoto;
 if(photoOptionalHelp)photoOptionalHelp.hidden=hasPhoto;
}
function applyPhotoCrop(){
 const crop=ensurePhotoCrop();
 if(!photoOverlay.naturalWidth || !photoOverlay.naturalHeight || !photoFrame.clientWidth || !photoFrame.clientHeight)return;
 const fw=photoFrame.clientWidth, fh=photoFrame.clientHeight;
 const base=Math.max(fw/photoOverlay.naturalWidth,fh/photoOverlay.naturalHeight);
 const renderedW=photoOverlay.naturalWidth*base*crop.scale;
 const renderedH=photoOverlay.naturalHeight*base*crop.scale;
 const maxX=Math.max(0,(renderedW-fw)/2);
 const maxY=Math.max(0,(renderedH-fh)/2);
 photoOverlay.style.width=renderedW+'px';
 photoOverlay.style.height=renderedH+'px';
 photoOverlay.style.left=((fw-renderedW)/2 + crop.x*maxX)+'px';
 photoOverlay.style.top=((fh-renderedH)/2 + crop.y*maxY)+'px';
}
function showPhoto(path){
 photoPath=path;state.photo_path=path;
 photoFrame.classList.add('has-photo');
 if(photoOverlay.dataset.path!==path){
   photoOverlay.dataset.path=path;
   photoOverlay.src=path+(path.includes('?')?'&':'?')+'v='+Date.now();
 }
 photoOverlay.style.display='block';
 if(photoOverlay.complete)applyPhotoCrop();
 syncPhotoControls();
}
function hidePhoto(clearState=true){
 photoPath='';
 if(clearState)state.photo_path='';
 photoFrame.classList.remove('has-photo');
 photoOverlay.removeAttribute('src');
 delete photoOverlay.dataset.path;
 photoOverlay.style.display='none';
 photoOverlay.style.width='';
 photoOverlay.style.height='';
 photoOverlay.style.left='';
 photoOverlay.style.top='';
 syncPhotoControls();
}
function resetPhotoCrop(save=true){
 state.photo_crop={x:0,y:0,scale:1};
 syncPhotoControls();
 applyPhotoCrop();
 if(save)queueSave();
}

bindFormInput(basicForm);
bindFormInput(jobsForm);
bindFormInput(educationForm);
document.getElementById('addJobBtn').addEventListener('click',addJob);
jobsForm.addEventListener('click',e=>{
 const btn=e.target.closest('button[data-action]');
 if(!btn)return;
 mutateJob(btn.dataset.action,Number(btn.dataset.job));
});
document.getElementById('newBtn').addEventListener('click',newResume);
document.getElementById('printBtn').addEventListener('click',()=>window.print());
historyEl.addEventListener('change',()=>{if(historyEl.value)loadResume(historyEl.value)});
photoOverlay.addEventListener('load',applyPhotoCrop);
window.addEventListener('resize',applyPhotoCrop);
photoZoom.addEventListener('input',()=>{
 if(!state.photo_path)return;
 const crop=ensurePhotoCrop();
 crop.scale=clampNumber(Number(photoZoom.value)/100,1,3,1);
 photoZoomValue.textContent=Math.round(crop.scale*100)+'%';
 applyPhotoCrop();
 queueSave();
});
resetPhotoBtn.addEventListener('click',()=>resetPhotoCrop(true));

if(removePhotoBtn)removePhotoBtn.addEventListener('click',async()=>{
 if(!state.photo_path)return;
 if(currentId){
   try{
     const fd=new FormData();
     fd.append('resume_id',String(currentId));
     fd.append('action','remove');
     const res=await fetch('api/photo.php',{method:'POST',headers:{'X-CSRF-Token':csrf},body:fd});
     const out=await res.json();
     if(!res.ok||!out.ok)throw new Error(out.error||'Could not remove photo');
   }catch(err){
     console.error(err);
     alert(err.message||'Could not remove photo');
     return;
   }
 }
 state.photo_crop={x:0,y:0,scale:1};
 hidePhoto(true);
 renderPreview();
 queueSave();
});

let photoDrag=null;
photoFrame.addEventListener('pointerdown',e=>{
 if(!state.photo_path || e.button>0)return;
 const crop=ensurePhotoCrop();
 const fw=photoFrame.clientWidth,fh=photoFrame.clientHeight;
 if(!photoOverlay.naturalWidth||!photoOverlay.naturalHeight||!fw||!fh)return;
 const base=Math.max(fw/photoOverlay.naturalWidth,fh/photoOverlay.naturalHeight);
 const rw=photoOverlay.naturalWidth*base*crop.scale;
 const rh=photoOverlay.naturalHeight*base*crop.scale;
 photoDrag={
   pointerId:e.pointerId,
   startX:e.clientX,startY:e.clientY,
   startOffsetX:crop.x*Math.max(0,(rw-fw)/2),
   startOffsetY:crop.y*Math.max(0,(rh-fh)/2),
   maxX:Math.max(0,(rw-fw)/2),
   maxY:Math.max(0,(rh-fh)/2)
 };
 photoFrame.setPointerCapture(e.pointerId);
 e.preventDefault();
});
photoFrame.addEventListener('pointermove',e=>{
 if(!photoDrag || photoDrag.pointerId!==e.pointerId)return;
 const crop=ensurePhotoCrop();
 const dx=e.clientX-photoDrag.startX,dy=e.clientY-photoDrag.startY;
 crop.x=photoDrag.maxX>0?clampNumber((photoDrag.startOffsetX+dx)/photoDrag.maxX,-1,1,0):0;
 crop.y=photoDrag.maxY>0?clampNumber((photoDrag.startOffsetY+dy)/photoDrag.maxY,-1,1,0):0;
 applyPhotoCrop();
});
function finishPhotoDrag(e){
 if(!photoDrag || photoDrag.pointerId!==e.pointerId)return;
 try{photoFrame.releasePointerCapture(e.pointerId)}catch(_){}
 photoDrag=null;
 queueSave();
}
photoFrame.addEventListener('pointerup',finishPhotoDrag);
photoFrame.addEventListener('pointercancel',finishPhotoDrag);

document.getElementById('photoInput').addEventListener('change',async e=>{
 const f=e.target.files?.[0];if(!f)return;
 if(!currentId)currentId=await saveNow();
 if(!currentId){alert('Enter the name and first job before uploading a photo.');e.target.value='';return}
 const fd=new FormData();fd.append('photo',f);fd.append('resume_id',String(currentId));
 const res=await fetch('api/photo.php',{method:'POST',headers:{'X-CSRF-Token':csrf},body:fd});
 const out=await res.json();
 if(!res.ok||!out.ok){alert(out.error||'Photo upload failed');return}
 state.photo_crop={x:0,y:0,scale:1};showPhoto(out.path);renderPreview();queueSave();e.target.value='';
});

async function loadLatestForCurrentUser(){
 try{
   const res=await fetch('api/latest.php',{cache:'no-store'});
   const out=await res.json();

   if(!res.ok || !out.ok){
     throw new Error(out.error || 'Could not find latest resume');
   }

   if(out.resume?.id){
     await loadResume(out.resume.id);
     return true;
   }

   return false;
 }catch(err){
   console.error(err);
   return false;
 }
}

(async()=>{
 /*
  * Startup priority:
  * 1. A specific resume requested by Admin/another page.
  * 2. The latest resume belonging to the logged-in user.
  * 3. A completely blank NEW resume when that user has no resumes.
  */
 await refreshHistory();

 const pending=sessionStorage.getItem('resumeToLoad');

 if(pending){
   sessionStorage.removeItem('resumeToLoad');
   await loadResume(pending);
   return;
 }

 const loaded=await loadLatestForCurrentUser();

 if(!loaded){
   newResume();
 }
})();
})();
