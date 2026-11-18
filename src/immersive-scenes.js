import { createLab } from './model.js';
import { PARTS } from './lesson.js';

// Every apparatus view uses the same geometry and animation engine as the main lab.
export function createImmersiveScenes(){
  const style=document.createElement('style');style.textContent=sceneStyle;document.head.append(style);
  function mount(parent,kind){
    const original=parent.querySelector('svg');
    if(original){original.hidden=true;original.style.display='none';original.setAttribute('aria-hidden','true');}
    const block=document.createElement('div');block.className='immersive-block';block.dataset.scene=kind;
    block.innerHTML=`<div class="immersive-header"><span>LIVE 3D · ${kind==='solvent'?'ACETONE + BENZENE':'FRACTIONAL DISTILLATION'}</span><span>Drag to rotate</span></div><div class="immersive-viewport" role="group" aria-label="Interactive ${kind==='solvent'?'acetone and benzene':'fractional distillation'} apparatus"><div class="immersive-labels"></div><p class="immersive-loading">Preparing your 3D apparatus…</p></div><div class="immersive-tools" role="group" aria-label="3D ${kind} scene controls"><button type="button" data-view="pause" aria-pressed="false">Pause</button><button type="button" data-view="in" aria-label="Zoom in">+</button><button type="button" data-view="out" aria-label="Zoom out">−</button><button type="button" data-view="cut" aria-pressed="false">Cutaway</button><button type="button" data-view="column" aria-pressed="false">Inside column</button><button type="button" data-view="labels" aria-pressed="true">Labels</button><button type="button" data-view="reset">Reset view</button></div><div class="immersive-detail" aria-live="polite"><strong>Explore the apparatus</strong><span>Click a label or a glass part to learn what it does.</span></div>`;
    if(original)original.after(block);else parent.append(block);
    const host=block.querySelector('.immersive-viewport'),labels=block.querySelector('.immersive-labels'),detail=block.querySelector('.immersive-detail');
    let lab=null,visible=false,failed=false,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,elapsed=0,last=0,current=-1,inside=false,cut=false,showLabels=true;
    const pause=block.querySelector('[data-view=pause]');pause.textContent=paused?'Play':'Pause';pause.setAttribute('aria-pressed',String(paused));
    function stage(){if(kind==='intro')return 4;if(kind==='story')return Math.min(4,Number(document.querySelector('#science-story').dataset.storyStep||0)+1);return [0,1,3,4][Number(document.querySelector('#solvent-session').dataset.solventStep||0)];}
    function selected(id){
      const part=PARTS[id]||PARTS.column;lab?.select(id);detail.replaceChildren();const title=document.createElement('strong'),text=document.createElement('span');title.textContent=part.name;text.textContent=part.text;
      if(kind==='solvent'&&id==='flask')text.textContent='A mixture of acetone and benzene. Both can evaporate; the rising vapour becomes richer in acetone.';
      if(kind==='solvent'&&id==='receiver')text.textContent='Collects condensed liquid richer in acetone. Both substances remain chemically unchanged.';
      detail.append(title,text);
    }
    function init(){if(lab||failed)return;try{lab=createLab(host,selected,{labelsContainer:labels});lab.setMode('process');lab.select('flask');host.querySelector('.immersive-loading').remove();}catch(error){failed=true;host.querySelector('.immersive-loading').textContent='3D is unavailable. Enable hardware acceleration in a recent Chrome or Edge browser. The lesson text and stage controls remain available.';console.warn('3D apparatus unavailable',error);}}
    function sync(){
      const next=stage();if(next===current)return;current=next;elapsed=0;lab?.focus(false);inside=false;block.querySelector('[data-view=column]').setAttribute('aria-pressed','false');
      const id=['column','flask','column','condenser','receiver'][current];lab?.spotlight(id);lab?.select(id);
      detail.querySelector('strong').textContent=['Set up the mixture','Heat: both components vaporise','Fractionate: vapour rises, liquid returns','Condense: cooling water removes heat','Collect: the distillate enters the receiver'][current];
      detail.querySelector('span').textContent=kind==='solvent'?'Orange: acetone · Blue: benzene. Particle colours illustrate identity; both real liquids are colourless.':'Orange A is more volatile. Blue B is less volatile. This is an illustrative flow, not a purity prediction.';
    }
    const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){init();sync();}},{rootMargin:'80px'});visibility.observe(host);
    block.addEventListener('click',e=>{const button=e.target.closest('[data-view]');if(!button)return;const action=button.dataset.view;
      if(action==='pause'){paused=!paused;pause.textContent=paused?'Play':'Pause';pause.setAttribute('aria-pressed',String(paused));}
      if(action==='in')lab?.zoom(1.2);if(action==='out')lab?.zoom(1/1.2);
      if(action==='reset')lab?.reset();
      if(action==='cut'){cut=!cut;lab?.cutaway(cut);button.setAttribute('aria-pressed',String(cut));}
      if(action==='labels'){showLabels=!showLabels;lab?.labels(showLabels);button.setAttribute('aria-pressed',String(showLabels));}
      if(action==='column'){inside=!inside;lab?.focus(inside);button.setAttribute('aria-pressed',String(inside));}
    });
    function externallyPaused(){return kind==='intro'?document.querySelector('.opening').classList.contains('intro-paused'):kind==='story'?document.querySelector('#science-story').classList.contains('story-paused'):document.querySelector('#solvent-session').classList.contains('solvent-paused');}
    function frame(now){requestAnimationFrame(frame);const dt=last?Math.min((now-last)/1000,.08):0;last=now;if(!visible||!lab||document.hidden)return;sync();const running=!paused&&!externallyPaused();if(running)elapsed+=dt;
      if(kind==='story')lab.packing(document.querySelector('#story-packing').checked);
      lab.setState({step:current,elapsed,playing:running});lab.render(now,elapsed);
    }requestAnimationFrame(frame);
  }
  const opening=document.querySelector('.opening-art');opening.setAttribute('role','group');opening.setAttribute('aria-label','Interactive 3D introduction to the complete distillation apparatus');mount(opening,'intro');
  mount(document.querySelector('.story-visual'),'story');
  mount(document.querySelector('.solvent-animation'),'solvent');
}
const sceneStyle=`
.deck-active .immersive-labels .part-label{font-size:clamp(10px,.85vw,16px);padding:6px;min-height:30px}
.opening-art>.orbit,.opening-art>.intro-tag,.opening-art>.opening-note{display:none}.immersive-block{position:relative;width:100%;min-width:0}.immersive-header{display:flex;justify-content:space-between;gap:10px;padding:12px 8px;color:#536b5c;font-size:11px;letter-spacing:1px}.immersive-viewport{height:clamp(390px,47vw,680px);min-height:360px;position:relative;isolation:isolate;overflow:hidden;border-radius:16px;background:radial-gradient(ellipse at 55% 45%,#e2eada,transparent 75%);touch-action:pan-y}.immersive-viewport>canvas{position:absolute;inset:0;width:100%;height:100%;display:block;cursor:grab}.immersive-viewport>canvas:active{cursor:grabbing}.immersive-labels{position:absolute;inset:0;pointer-events:none;z-index:2}.immersive-labels .part-label{font-size:clamp(11px,.9vw,17px);padding:8px;min-height:34px;white-space:normal;max-width:45%;text-align:left}.immersive-loading{position:absolute;inset:40% 8% auto;text-align:center;font-size:17px;color:#536b5c;line-height:1.7}.immersive-tools{display:flex;flex-wrap:wrap;gap:7px;justify-content:center;padding:12px 0}.immersive-tools button{min-width:44px;min-height:44px;padding:10px 12px;font:inherit;font-size:13px;background:#fafbf5;border:1px solid #b4c5a8;border-radius:7px;color:#244437;cursor:pointer}.immersive-tools button[aria-pressed=true]{background:#244437;color:#fff}.immersive-tools button:focus-visible{outline:3px solid #c85c34;outline-offset:2px}.immersive-detail{border-top:1px solid #cbd7c2;padding:14px 8px;display:grid;gap:7px;color:#345340;font-size:15px;line-height:1.5;min-height:88px}.immersive-detail strong{font-size:18px}.story-visual .immersive-viewport{height:clamp(360px,39vw,570px)}.story-visual{padding:16px}.story-visual .story-phase-banner{margin-bottom:6px}.solvent-animation .immersive-viewport{height:clamp(380px,43vw,640px)}.opening-art .immersive-block{border:1px solid #c8d4bf;border-radius:20px;padding:12px;box-sizing:border-box;background:#f8f9f166}.deck-active .immersive-viewport,.deck-active .story-visual .immersive-viewport,.deck-active .solvent-animation .immersive-viewport{height:clamp(270px,39vh,650px);min-height:260px}.deck-active .immersive-detail{font-size:13px;min-height:0;padding:9px}.deck-active .immersive-detail strong{font-size:15px}.deck-active .immersive-tools{padding:7px 0;gap:5px}.deck-active .immersive-tools button{min-height:40px;padding:8px;font-size:12px}.deck-active .opening-art .immersive-viewport{height:48vh}.deck-active .immersive-header{padding:6px;font-size:10px}.deck-active[data-deck-layout=definition] .story-visual{max-width:900px}.deck-active[data-deck-layout=definition] .immersive-viewport{height:34vh}.deck-active .story-visual>p,.deck-active .thermal-caption{display:none}@media(max-width:650px){.immersive-viewport,.story-visual .immersive-viewport,.solvent-animation .immersive-viewport{height:430px}.immersive-labels .part-label{font-size:11px;padding:6px}.immersive-tools{gap:5px}.immersive-tools button{font-size:12px}.immersive-detail{font-size:14px}.immersive-header{font-size:9px}}@media(prefers-reduced-motion:reduce){.immersive-block{scroll-behavior:auto}}
`;
