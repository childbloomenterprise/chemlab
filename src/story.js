import { storyStyle } from './story-style.js';
// A separate, manually paced explanation before students enter the apparatus.
export function createStory(onStage) {
  const style=document.createElement('style');style.textContent=storyStyle;document.head.append(style);
  const section = document.createElement('section');
  section.id = 'science-story';
  section.className = 'science-story';
  section.setAttribute('aria-labelledby', 'story-title');
  section.innerHTML = `<div class="story-heading"><span class="eyebrow">UNDERSTAND IT · THEN TRY IT</span><h2 id="story-title">A journey of <em>little separations.</em></h2><p><strong>Fractional distillation</strong> separates a mixture of miscible liquids using differences in volatility, through repeated vaporisation and condensation in a fractionating column.</p></div>
    <div class="story-grid"><div><div class="story-tabs" role="group" aria-label="Choose an explanation step">${['Heat the mixture', 'Repeat in the column', 'Cool the vapour', 'Collect a fraction'].map((x,i)=>`<button type="button" data-story-step="${i}" aria-pressed="${i===0}"><span>0${i+1}</span>${x}</button>`).join('')}</div><h3 id="story-subtitle"></h3><p id="story-description"></p><div class="story-options"><label><input id="story-packing" type="checkbox" checked> Show packing in the column</label><button type="button" id="story-motion" class="text-btn" aria-pressed="false">Pause particles</button></div><p class="story-hint" id="story-hint"></p><button type="button" id="story-try" class="primary-btn">See this in the 3D lab →</button></div>
    <div class="story-visual"><svg viewBox="0 0 640 470" role="img" aria-labelledby="story-svg-title story-svg-desc"><title id="story-svg-title">From mixed liquid to an enriched fraction</title><desc id="story-svg-desc">Orange A and blue B represent components. Both vaporise; repeated contact in the column enriches rising vapour in A, while liquid returns downwards. The condenser cools vapour into liquid.</desc><defs><linearGradient id="story-temperature" x2="0" y2="1"><stop stop-color="#82b8af"/><stop offset="1" stop-color="#d17d45"/></linearGradient></defs>
    <g fill="#e4eadd" stroke="#738d78" stroke-width="3"><path d="M110 325V285h60v40a66 66 0 1 1-60 0Z"/><rect x="110" y="65" width="60" height="220" rx="8"/><path d="m170 80 270 135-15 30L170 115Z"/><path d="M440 215v100h-15v-70"/><path d="M419 304h28v32l45 85H375l44-85Z"/></g>
    <path d="M82 375a60 60 0 0 0 116 0Z" fill="#75a99b"/><path d="m393 398-12 20h105l-12-20Z" fill="#dda360"/>
    <g id="story-beads" fill="#b8cbae">${Array.from({length:24},(_,i)=>`<circle cx="${122+(i%3)*18}" cy="${90+Math.floor(i/3)*24}" r="7"/>`).join('')}</g>
    <rect x="72" y="429" width="140" height="14" rx="7" fill="#bf693e"/><rect x="84" y="65" width="7" height="220" rx="3" fill="url(#story-temperature)"/>
    <g class="story-cooler" fill="none" stroke="#438ba3" stroke-width="4"><path d="m212 75 217 109M219 66l-7 9 13 4"/><path d="m205 100 206 104-18 36-206-103Z"/></g>
    <g class="story-particles">${Array.from({length:14},(_,i)=>`<circle class="story-vapour ${i%4===0?'story-blue':''}" r="${i%4===0?5:6}" style="animation-delay:-${i*.47}s"/>`).join('')}${Array.from({length:7},(_,i)=>`<circle class="story-reflux ${i%3===0?'story-orange':''}" r="5" style="animation-delay:-${i*.65}s"/>`).join('')}</g>
    <g fill="#344f41" font-family="inherit" font-size="17"><text x="20" y="31">MIXTURE</text><text x="190" y="46">REPEATED CONTACT</text><text x="397" y="165">COOL</text><text x="473" y="367">COLLECT</text><text x="186" y="192">vapour ↑</text><text x="186" y="225">liquid ↓</text></g></svg><div class="story-legend"><span><i class="particle a"></i>A · more volatile</span><span><i class="particle b"></i>B · less volatile</span></div><p>Illustration only · no predicted temperatures or purity</p></div></div>
    <div class="story-check"><h3>Before we enter: does the column act like a filter?</h3><div><button type="button" data-story-answer="wrong">Yes, it traps component B</button><button type="button" data-story-answer="right">No, it repeats phase changes</button></div><p id="story-answer" role="status"></p></div>`;
  document.querySelector('#lesson').before(section);
  const visual=section.querySelector('.story-visual');
  visual.insertAdjacentHTML('afterbegin','<div class="story-phase-banner"><strong id="story-phase">Liquid → vapour</strong><small>PHYSICAL CHANGE · MOLECULES STAY INTACT</small></div>');
  const svg=visual.querySelector('svg'),ns='http://www.w3.org/2000/svg';
  svg.querySelector('defs').insertAdjacentHTML('beforeend','<linearGradient id="story-glass-gradient"><stop stop-color="#b5cebb" stop-opacity=".6"/><stop offset=".45" stop-color="#ffffff" stop-opacity=".9"/><stop offset="1" stop-color="#b2ccba" stop-opacity=".6"/></linearGradient><linearGradient id="story-liquid-gradient" x2="0" y2="1"><stop stop-color="#9bbeb1"/><stop offset="1" stop-color="#568675"/></linearGradient>');
  svg.querySelector('g').setAttribute('fill','url(#story-glass-gradient)');
  svg.querySelector('path[fill="#75a99b"]').classList.add('story-liquid');
  svg.querySelector('path[fill="#dda360"]').classList.add('story-receiver-liquid');
  const highlight=document.createElementNS(ns,'rect');highlight.setAttribute('class','story-stage-highlight');highlight.setAttribute('rx','12');svg.append(highlight);
  const water=document.createElementNS(ns,'g');water.setAttribute('class','story-cooling-water story-particles');
  for(let i=0;i<7;i++){const dot=document.createElementNS(ns,'circle');dot.setAttribute('r','3');dot.setAttribute('class','story-water-dot');dot.style.animationDelay=`-${i*.57}s`;water.append(dot);}svg.append(water);
  const nav = document.createElement('button'); nav.className='nav-item';nav.textContent='The idea';nav.type='button';
  document.querySelector('.main-nav').prepend(nav);
  nav.addEventListener('click',()=>section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
  const descriptions = [
    ['Give the molecules an escape route.', 'Heat supplies energy. Both components can enter the vapour, but the more volatile component A contributes more readily. Different volatility makes separation possible.'],
    ['A staircase of tiny separations.', 'Think of each contact as another chance to separate. Vapour meets cooler packing and returning liquid. Repeated condensation and vaporisation make the rising vapour richer in A; returning liquid is richer in B.'],
    ['Turn the journey back into liquid.', 'The enriched vapour enters the inner tube of the condenser. Cooling water flows through the surrounding jacket from the lower inlet to the upper outlet, removing heat so vapour condenses.'],
    ['Catch a fraction, not a promise of purity.', 'The receiver collects the condensed liquid: the distillate. An early fraction is richer in the more volatile component. Collecting different portions gives different fractions; complete purity is not guaranteed.']
  ];
  let step=0;
  function render(){
    section.dataset.storyStep=step;
    section.querySelector('#story-phase').textContent=['01 · Liquid → vapour','02 · Repeated vapour ⇄ liquid contact','03 · Vapour → liquid','04 · Liquid fraction collected'][step];
    const areas=[[67,292,150,153],[99,55,83,235],[185,65,260,185],[368,295,132,135]];
    ['x','y','width','height'].forEach((name,i)=>highlight.setAttribute(name,areas[step][i]));
    section.querySelectorAll('[data-story-step]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===step)));
    section.querySelector('#story-subtitle').textContent=descriptions[step][0];
    section.querySelector('#story-description').textContent=descriptions[step][1];
    section.querySelector('#story-hint').textContent=section.querySelector('#story-packing').checked?'Packing adds surface area for repeated vapour–liquid contact.':'Packing hidden for visibility. Removing packing in a real column reduces contact and usually worsens separation.';
  }
  section.addEventListener('click',e=>{
    const tab=e.target.closest('[data-story-step]');if(tab){step=Number(tab.dataset.storyStep);render();}
    const answer=e.target.closest('[data-story-answer]');if(answer)section.querySelector('#story-answer').textContent=answer.dataset.storyAnswer==='right'?'Exactly. Both components can rise; repeated phase changes enrich the vapour.':'Try again: packing provides contact surfaces. It does not selectively trap one component.';
  });
  section.querySelector('#story-motion').addEventListener('click',e=>{const paused=section.classList.toggle('story-paused');e.target.textContent=paused?'Play particles':'Pause particles';e.target.setAttribute('aria-pressed',String(paused));});
  section.querySelector('#story-packing').addEventListener('change',e=>{section.querySelector('#story-beads').style.opacity=e.target.checked?'1':'0';render();});
  section.querySelector('#story-try').addEventListener('click',()=>{onStage(step+1);document.querySelector('#lesson').scrollIntoView({behavior:'smooth'});});
  render();
}
