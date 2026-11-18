import { createLab } from './model.js';
import { createStory } from './story.js';
import { createSolventSession } from './solvent-session.js';
import { createPresentation } from './presentation.js';
import { createImmersiveScenes } from './immersive-scenes.js';
import { STEPS, PARTS, PRODUCTS, QUESTIONS, initialState, advance, selectStage, STAGE_SECONDS } from './lesson.js';

const $=s=>document.querySelector(s);
const icon=id=>`<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;
let mode='explore',state=initialState(),selected='column',focused=false,labels=true,rotating=false,product=0,quizIndex=0,answers=[],comparison=false;
let presenting=false,lab=null,toastTimer,lastTime=0,illustrationTime=0;
let summary=false, inspector=null;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3200);}
function renderCopy(){
  const panel=$('#copy-panel');
  if(mode==='explore'){
    panel.innerHTML=`<div class="topic-tag">A CLASS XI CHEMISTRY EXPLORATION</div><h1>Fractional<br><em>distillation.</em></h1><p class="intro">A little heat. A clever column.<br>Discover how a mixture becomes<br>different fractions.</p><button class="primary-btn" data-action="start">Start the experiment ${icon('arrow')}</button><button class="text-btn" data-action="focus">${icon('focus')} Take a look inside the column</button><div class="concept-note"><span class="eyebrow">SMALL DIFFERENCE. BETTER SEPARATION.</span><p>Close boiling points?<br><strong>Let repeated vaporisation and condensation do the work.</strong></p></div>`;
  }else if(mode==='process'){
    const s=STEPS[state.step];
    const short=['Two mixed liquids. One connected apparatus.','Heat → faster molecules → vapour.','Repeated contact enriches the rising vapour.','Cooling removes heat. Vapour becomes liquid.','Collect a fraction richer in liquid A.'];
    const cues=[['Inspect each part','Click any label to open its animation.'],['Watch the flask','Both colours escape; orange is more volatile.'],['Watch the two directions','Vapour rises. Condensed liquid returns.'],['Follow the blue cooling water','Lower inlet → water jacket → upper outlet.'],['Watch the receiver fill','The early distillate contains more liquid A.']];
    panel.innerHTML=summary?`<div class="topic-tag">EXPERIMENT RECAP</div><h1 class="stage-heading">Follow the<br><em>whole journey.</em></h1><div class="recap">${STEPS.slice(1).map((x,i)=>`<button data-step="${i+1}"><b>0${i+1}</b><span>${x.name}</span>${icon('arrow')}</button>`).join('')}</div><p class="stage-description">Repeated vaporisation + condensation → better separation.</p><button class="primary-btn" data-mode="quiz">Try the quick check ${icon('arrow')}</button>`:`<div class="stage-counter">YOU CONTROL THE PACE <span class="counter-line"></span> ${state.step+1} / 5</div><h1 class="stage-heading">${s.title}</h1><p class="stage-description">${short[state.step]}</p><div class="watch-card"><span class="eyebrow">LOOK FOR THIS</span><h3>${cues[state.step][0]}</h3><p>${cues[state.step][1]}</p></div><div class="stage-actions"><button class="primary-btn" data-action="pause">${icon(state.playing?'pause':'play')}${state.playing?'Pause animation':'Play animation'}</button><button class="text-btn" data-action="replay">${icon('reset')}Replay this stage</button></div><button class="text-btn" data-action="stage-view">${icon('focus')}${focused?'Show full apparatus':'Magnify this stage'}</button><p class="manual-note">Stays here until you choose Continue.</p>`;
  }else if(mode==='world'){
    panel.innerHTML=`<div class="topic-tag">FROM THE LAB TO EVERYDAY LIFE</div><h1 class="stage-heading">Same principle.<br><em>Much bigger scale.</em></h1><p class="stage-description">Crude oil contains many hydrocarbons. A refinery separates it into useful fractions in a tall tower: hotter below, cooler above.</p><div class="world-products">${PRODUCTS.map((p,i)=>`<button class="product-btn ${i===product?'active':''}" data-product="${i}" aria-pressed="${i===product}" style="--product-color:${p.color}"><span class="product-dot"></span>${p.name}</button>`).join('')}</div><div class="mini-equation"><b>${PRODUCTS[product].name} → ${['Cars','Aircraft','Trucks','Ships & industry'][product]}</b><br>${PRODUCTS[product].text}<button class="text-btn" data-action="product-open">Explore this fraction ${icon('arrow')}</button></div>`;
  }else if(quizIndex>=QUESTIONS.length){
    const score=answers.filter((a,i)=>a===QUESTIONS[i].correct).length;
    panel.innerHTML=`<div class="topic-tag">EXPLORATION COMPLETE</div><h1 class="stage-heading">${score===3?'Clearly<br><em>understood.</em>':'Keep your<br><em>curiosity boiling.</em>'}</h1><div class="score-value">${score}<small> / 3</small></div><p class="score-line">${score===3?'You have the key idea: repeated condensation and vaporisation improve separation.':'Revisit the column, then try again. Every cycle makes things clearer.'}</p><button class="primary-btn" data-action="retry">Try the questions again ${icon('reset')}</button><button class="text-btn" data-action="start">Replay the experiment ${icon('arrow')}</button>`;
  }else{
    const q=QUESTIONS[quizIndex],answer=answers[quizIndex],answered=answer!==undefined;
    panel.innerHTML=`<div class="topic-tag">A LITTLE CHECK-IN</div><div class="quiz-count">QUESTION ${String(quizIndex+1).padStart(2,'0')} / 03</div><h1 class="quiz-question">${q.question}</h1><div class="quiz-options">${q.options.map((o,i)=>`<button class="quiz-option ${answered?(i===q.correct?'correct':i===answer?'wrong':''):''}" data-answer="${i}" ${answered?'disabled':''}><span>${String.fromCharCode(65+i)}</span>${o}</button>`).join('')}</div>${answered?`<p class="quiz-feedback" role="status"><strong>${answer===q.correct?'Exactly right.':'Let’s clear that up.'}</strong> ${q.explanation}</p><button class="primary-btn quiz-next" data-action="quiz-next">${quizIndex===2?'See your result':'Next question'} ${icon('arrow')}</button>`:''}`;
  }
}
function renderDetail(){
  const detail=$('#apparatus-detail');
  if(mode==='world'){
    detail.innerHTML=`<span class="detail-number">${String(product+1).padStart(2,'0')}</span><div class="detail-copy"><h3>Different fractions, different condensation ranges.</h3><p>Lighter fractions generally leave higher in the cooler tower; heavier fractions collect lower down.</p></div><button class="detail-link" data-action="sources">Read the science ${icon('arrow')}</button>`;
    return;
  }
  const p=PARTS[selected]||PARTS.column;
  detail.innerHTML=`<span class="detail-number">${p.number}</span><div class="detail-copy"><h3>${focused?'Inside the fractionating column':p.name}</h3><p>${focused?'Orange-rich vapour rises; blue-rich liquid returns. Packing provides a large surface for repeated contact.':p.text}</p></div><button class="detail-link" data-action="focus">${focused?'Full apparatus':'A closer look'} ${icon(focused?'arrow':'focus')}</button>`;
}
function renderControls(){
  const play=$('#play');play.dataset.playing=state.playing;
  play.innerHTML=icon('arrow')+`<span>${mode!=='process'?'Start guided lesson':summary?'Restart lesson':state.step===4?'Show summary':'Continue → '+STEPS[state.step+1].name}</span>`;
  play.setAttribute('aria-label',play.textContent);
  document.querySelectorAll('.step').forEach((el,i)=>{el.classList.toggle('active',i===state.step);el.classList.toggle('done',i<state.step);if(i===state.step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
  $('#previous').disabled=state.step===0;$('#next').disabled=summary;
}
function setMode(next){
  mode=next;summary=false;closeInspector();state={...state,playing:next==='process'};focused=false;
  document.body.dataset.mode=mode;
  if(mode==='process')selected=STEPS[state.step].part;
  if(mode==='quiz'&&quizIndex<QUESTIONS.length)selected=QUESTIONS[quizIndex].part;
  document.querySelectorAll('.nav-item').forEach(el=>{const active=el.dataset.mode===mode;el.classList.toggle('active',active);if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
  $('#focus-badge').hidden=true;$('#model-legend').hidden=mode==='world';
  $('#lab-caption').textContent='Drag to rotate · Use + / − to zoom';
  $('.scene-stamp').innerHTML=mode==='world'?'FIG. 02 <span>/</span> PETROLEUM FRACTIONATION':'FIG. 01 <span>/</span> FRACTIONAL DISTILLATION';
  $('#viewport').setAttribute('aria-label',mode==='world'?'Rotatable 3D refinery tower with outlets for petrol, kerosene, diesel and fuel oil':'Rotatable 3D fractional distillation apparatus');
  lab?.setMode(mode);lab?.select(selected);lab?.setProduct(product);
  renderCopy();renderDetail();renderControls();if(mode==='process')stageView();
}
function inspect(id){
  if(id.startsWith('product-')){product=Number(id.split('-')[1]);lab?.setProduct(product);renderCopy();renderDetail();openInspector(id);return;}
  if(id.startsWith('world-')){openInspector(id);return;}
  selected=id;lab?.select(id);renderDetail();openInspector(id);
}
function setFocus(value){
  if(mode==='world'){setMode('explore');}
  focused=value;selected='column';lab?.select(selected);lab?.focus(value);$('#focus-badge').hidden=!value;
  if(mode==='process')renderCopy();
  if(mode==='explore'){
    const button=$('[data-action="focus"]');if(button)button.innerHTML=icon('focus')+(value?'Back to the full apparatus':'Take a look inside the column');
  }
  $('#lab-caption').textContent=value?'Repeated contact. Progressive enrichment.':'Drag to rotate · Use + / − to zoom';renderDetail();
}
function stageView(){
  focused=state.step===2&&!summary;lab?.focus(focused);lab?.spotlight(summary?'all':STEPS[state.step].part);
  $('#focus-badge').hidden=!focused;
  $('#lab-caption').textContent=summary?'Heat → fractionate → condense → collect':'Manual lesson · animation repeats until you continue';
}
function goStage(i){
  closeInspector();if(mode!=='process')setMode('process');
  if(i>4){summary=true;state={...state,playing:false,elapsed:12};$('#lab-caption').textContent='Experiment recap · select a stage to revisit';lab?.focus(false);lab?.spotlight('all');focused=false;$('#focus-badge').hidden=true;}
  else {summary=false;state=selectStage(state,i);selected=STEPS[state.step].part;lab?.select(selected);stageView();}
  renderCopy();renderControls();renderDetail();
}
function togglePlay(){if(mode!=='process'){goStage(0);return;}state={...state,playing:!state.playing};renderCopy();}
function continueLesson(){if(mode!=='process'||summary)goStage(0);else goStage(state.step+1);}
function restart(){goStage(0);toast('Set up. Continue whenever you are ready.');}
function closeInspector(){const panel=$('#inspector');if(panel)panel.remove();inspector=null;}
function openInspector(id){
  closeInspector();inspector=id;
  const isProduct=id.startsWith('product-'),i=isProduct?Number(id.split('-')[1]):0;
  const p=isProduct?PRODUCTS[i]:PARTS[id]||{name:id==='world-tower'?'Fractionating tower':'Crude-oil furnace',text:'Heat the mixture, then separate fractions across a temperature gradient.'};
  const stage={flask:1,heater:1,column:2,thermometer:2,condenser:3,inlet:3,outlet:3,receiver:4}[id]??0;
  const box=document.createElement('section');box.id='inspector';box.className='inspector';box.setAttribute('aria-label',p.name+' explanation');
  box.innerHTML=`<div class="inspector-head"><span class="eyebrow">${isProduct?'FOLLOW THIS FRACTION':'APPARATUS EXPLORER'}</span><button class="tool" data-action="close-inspector" aria-label="Close explanation">${icon('close')}</button></div><h2>${p.name}</h2><div class="mini-demo demo-${isProduct?'product':id}"><div class="demo-vessel"><i></i><i></i><i></i><i></i><i></i><i></i></div><span>${isProduct?['CAR FUEL','JET FUEL','TRUCK FUEL','SHIPS / INDUSTRY'][i]:['condenser','inlet','outlet'].includes(id)?'VAPOUR → COOL → LIQUID':id==='column'?'VAPOUR ↑ · LIQUID ↓':id==='receiver'?'DROP BY DROP':id==='thermometer'?'SENSES VAPOUR TEMPERATURE':'HEAT → PARTICLE MOTION'}</span></div><p>${p.text}</p>${isProduct?`<div class="fraction-options">${PRODUCTS.map((x,j)=>`<button data-product="${j}" class="${i===j?'active':''}">${x.name}</button>`).join('')}</div><button class="primary-btn" data-action="close-inspector">Watch highlighted flow ${icon('arrow')}</button>`:`<button class="primary-btn" data-step="${stage}">Show in the experiment ${icon('arrow')}</button>`}`;
  $('#viewport').append(box);box.querySelector('button').focus();
}
async function present(){
  presenting=!presenting;document.body.classList.toggle('presenting',presenting);$('#present').setAttribute('aria-pressed',String(presenting));
  $('#present').innerHTML=icon('expand')+`<span>${presenting?'Exit presentation':'Present'}</span><kbd>F</kbd>`;
  if(presenting){
    toast('Presentation mode · Next or → for the next page · Space pauses the lab');
    if(!document.fullscreenElement){try{await document.documentElement.requestFullscreen();}catch{toast('TV layout enabled. Use your browser’s fullscreen control for an edge-to-edge view.');}}
  }else if(document.fullscreenElement){try{await document.exitFullscreen();}catch{}}
}
document.addEventListener('fullscreenchange',()=>{
  if(!document.fullscreenElement&&presenting){presenting=false;document.body.classList.remove('presenting');$('#present').setAttribute('aria-pressed','false');$('#present').innerHTML=icon('expand')+'<span>Present</span><kbd>F</kbd>';}
});
document.addEventListener('click',e=>{
  const nav=e.target.closest('button[data-mode]');if(nav){setMode(nav.dataset.mode);$('#lesson').scrollIntoView({behavior:reducedMotion?'instant':'smooth'});return;}
  const step=e.target.closest('[data-step]');if(step){goStage(Number(step.dataset.step));return;}
  const prod=e.target.closest('[data-product]');if(prod){inspect('product-'+prod.dataset.product);return;}
  const answer=e.target.closest('[data-answer]');if(answer&&answers[quizIndex]===undefined){answers[quizIndex]=Number(answer.dataset.answer);renderCopy();return;}
  const action=e.target.closest('[data-action]')?.dataset.action;
  if(action==='start')goStage(0);
  if(action==='pause')togglePlay();
  if(action==='replay')goStage(state.step);
  if(action==='stage-view'){if(state.step===2)setFocus(!focused);else lab?.zoomPart(STEPS[state.step].part);}
  if(action==='close-inspector')closeInspector();
  if(action==='product-open')openInspector('product-'+product);
  if(action==='focus'){if(focused)setFocus(false);else if(mode==='explore'&&e.target.closest('#copy-panel'))setFocus(true);else openInspector(selected);}
  if(action==='compare'){comparison=!comparison;renderCopy();}
  if(action==='sources')$('#notes-dialog').showModal();
  if(action==='quiz-next'){quizIndex++;if(quizIndex<QUESTIONS.length){selected=QUESTIONS[quizIndex].part;lab?.select(selected);renderDetail();}renderCopy();}
  if(action==='retry'){quizIndex=0;answers=[];setMode('quiz');}
});
$('#play').addEventListener('click',continueLesson);$('#next').addEventListener('click',()=>goStage(state.step+1));$('#previous').addEventListener('click',()=>goStage(state.step-1));$('#restart').addEventListener('click',restart);
$('#labels-toggle').addEventListener('click',()=>{labels=!labels;lab?.labels(labels);$('#labels-toggle').classList.toggle('active',labels);$('#labels-toggle').setAttribute('aria-pressed',labels);});
$('#rotate-toggle').addEventListener('click',()=>{rotating=!rotating;lab?.rotate(rotating);$('#rotate-toggle').classList.toggle('active',rotating);$('#rotate-toggle').setAttribute('aria-pressed',rotating);});
$('#view-reset').addEventListener('click',()=>{lab?.reset();toast('View reset');});
$('#present').addEventListener('click',present);
$('#open-notes').addEventListener('click',()=>{$('#notes-dialog').showModal();});$('#close-notes').addEventListener('click',()=>$('#notes-dialog').close());
$('#notes-dialog').addEventListener('click',e=>{if(e.target===$('#notes-dialog')){const b=e.target.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)e.target.close();}});
document.addEventListener('keydown',e=>{
  if(e.ctrlKey||e.metaKey||e.altKey||e.target.matches('input,textarea,select')||$('#notes-dialog').open)return;
  if(e.key===' '){if(e.target.closest('button,a'))return;e.preventDefault();togglePlay();}
  else if(e.key==='ArrowRight'){e.preventDefault();goStage(state.step+1);}
  else if(e.key==='ArrowLeft'){e.preventDefault();goStage(state.step-1);}
  else if(e.key.toLowerCase()==='f'){e.preventDefault();present();}
  else if(e.key.toLowerCase()==='l')$('#labels-toggle').click();
  else if(e.key.toLowerCase()==='r')restart();
  else if(e.key==='Escape'&&inspector)closeInspector();
  else if(e.key==='Escape'&&presenting&&!document.fullscreenElement)present();
});
renderCopy();renderDetail();renderControls();
createStory(goStage);
createSolventSession(goStage);
createPresentation(setMode);
createImmersiveScenes();
try{
  lab=createLab($('#viewport'),inspect);$('#scene-loading').remove();lab.select(selected);
}catch(error){
  console.error('Unable to initialize 3D view:',error);
  $('#scene-loading').innerHTML='<strong>Your browser could not start the 3D view.</strong><span style="animation:none;border:0;width:auto;height:auto;text-align:center;max-width:290px">Try a recent Chrome or Edge browser with hardware acceleration. The guided explanations and quiz still work.</span>';
}
function frame(now){
  const dt=lastTime?Math.min((now-lastTime)/1000,.12):0;lastTime=now;
  if(!document.hidden){
    const priorStep=state.step,priorPlaying=state.playing;state=advance(state,dt);
    if(priorStep!==state.step){selected=STEPS[state.step].part;lab?.select(selected);renderCopy();renderDetail();renderControls();}
    if(priorPlaying&&!state.playing){renderControls();toast('Experiment complete. Try the quick check.');}
    if(state.playing||((mode==='world'||mode==='explore')&&!reducedMotion))illustrationTime+=dt;
    lab?.setState(state);lab?.render(now,illustrationTime);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

$('#enter-lab').addEventListener('click',()=>{goStage(0);document.querySelector('.opening').classList.add('intro-paused');$('#intro-motion').textContent='Play intro animation';$('#intro-motion').setAttribute('aria-pressed','true');});
$('#intro-motion').addEventListener('click',()=>{const paused=document.querySelector('.opening').classList.toggle('intro-paused');$('#intro-motion').textContent=paused?'Play intro animation':'Pause intro animation';$('#intro-motion').setAttribute('aria-pressed',String(paused));});

$('#zoom-in').addEventListener('click',()=>lab?.zoom(1.2));
$('#zoom-out').addEventListener('click',()=>lab?.zoom(1/1.2));
const cutaway=document.createElement('button');cutaway.id='cutaway-toggle';cutaway.className='tool';cutaway.type='button';cutaway.textContent='Cutaway';cutaway.setAttribute('aria-label','Toggle transparent cutaway view');cutaway.setAttribute('aria-pressed','false');
$('.view-tools').append(cutaway);
cutaway.addEventListener('click',()=>{const active=cutaway.getAttribute('aria-pressed')!=='true';cutaway.setAttribute('aria-pressed',String(active));cutaway.classList.toggle('active',active);lab?.cutaway(active);toast(active?'Cutaway: follow particles inside the glass':'Glass view restored');});
