import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PRODUCTS } from './lesson.js';

const V=(x,y,z=0)=>new THREE.Vector3(x,y,z);
const UP=V(0,1,0);
const C={ green:0x577961, glass:0xc4ddce, metal:0x82938a, dark:0x344f41, orange:0xe39849, blue:0x3d90b3, cream:0xd9dfcb };
export function createLab(container,onSelect){
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
  renderer.setClearColor(0x000000,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.92;
  const canvas=renderer.domElement;canvas.setAttribute('aria-label','3D model: drag to rotate, use zoom buttons. Use the labelled buttons to inspect each part.');
  container.prepend(canvas);
  const scene=new THREE.Scene();
  const pmrem=new THREE.PMREMGenerator(renderer);const env=pmrem.fromScene(new RoomEnvironment(),.04);scene.environment=env.texture;pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xfbf9ec,0x7d917b,1.8));
  const sun=new THREE.DirectionalLight(0xfff9eb,2.5);sun.position.set(-3,9,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-7;sun.shadow.camera.right=7;sun.shadow.camera.top=8;sun.shadow.camera.bottom=-7;sun.shadow.normalBias=.035;scene.add(sun);
  const rim=new THREE.DirectionalLight(0xffffff,2.5);rim.position.set(3,6,-6);scene.add(rim);
  const camera=new THREE.OrthographicCamera(-6,6,4.3,-4.3,.1,100);
  const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.07;controls.enableZoom=false;controls.enablePan=false;controls.minZoom=.72;controls.maxZoom=2.2;controls.minPolarAngle=.35;controls.maxPolarAngle=Math.PI*.52;controls.autoRotateSpeed=.75;
  let spotlight='all', intro=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width=1,height=1,mode='explore',focused=false,showLabels=true,selected='column',product=0,state={step:0,elapsed:0},lastFrame=0;
  const apparatus=new THREE.Group(),closeup=new THREE.Group(),refinery=new THREE.Group();scene.add(apparatus,closeup,refinery);closeup.visible=false;refinery.visible=false;
  const clickable=[];const labelElements=[];
  const glass=new THREE.MeshPhysicalMaterial({color:0x8bad9a,metalness:.07,roughness:.12,transparent:true,opacity:.38,side:THREE.DoubleSide,depthWrite:false,clearcoat:1,envMapIntensity:.8});
  const glassEdge=new THREE.MeshStandardMaterial({color:0xadc5b1,metalness:.45,roughness:.18,transparent:true,opacity:.8});
  const steel=new THREE.MeshStandardMaterial({color:C.metal,metalness:.72,roughness:.25});
  const dark=new THREE.MeshStandardMaterial({color:C.dark,metalness:.38,roughness:.4});
  const cream=new THREE.MeshStandardMaterial({color:C.cream,roughness:.65,metalness:.08});
  const orange=new THREE.MeshStandardMaterial({color:C.orange,roughness:.25,metalness:.1,emissive:0x7a2e00,emissiveIntensity:.1});
  const blue=new THREE.MeshStandardMaterial({color:C.blue,roughness:.25,metalness:.1,emissive:0x07536f,emissiveIntensity:.12});
  const jacket=new THREE.MeshPhysicalMaterial({color:0xaed8d2,transparent:true,opacity:.3,roughness:.06,metalness:.1,depthWrite:false,side:THREE.DoubleSide,clearcoat:1});
  const liquidMat=new THREE.MeshPhysicalMaterial({color:0x6faaa0,roughness:.12,metalness:.05,transparent:true,opacity:.76,clearcoat:1});
  function mesh(geometry,material,position,parent=apparatus,part){
    const m=new THREE.Mesh(geometry,material);if(position)m.position.copy(position);parent.add(m);
    if(material!==glass&&material!==jacket){m.castShadow=true;m.receiveShadow=true;}
    if(part){m.userData.part=part;clickable.push(m);}return m;
  }
  function cylinder(a,b,r,material=glass,parent=apparatus,part,r2=r,segments=40){
    const d=b.clone().sub(a);const m=mesh(new THREE.CylinderGeometry(r2,r,d.length(),segments,1,material===glass||material===jacket),material,a.clone().add(b).multiplyScalar(.5),parent,part);m.quaternion.setFromUnitVectors(UP,d.normalize());return m;
  }
  function ring(center,r,t=.027,material=glassEdge,parent=apparatus,axis=UP){const m=mesh(new THREE.TorusGeometry(r,t,8,48),material,center,parent);m.quaternion.setFromUnitVectors(V(0,0,1),axis.clone().normalize());return m;}
  function tube(points,r,material=glass,parent=apparatus,part){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),55,r,10,false),material,null,parent,part);}
  function arrow(a,b,color,parent){cylinder(a,b,.025,color,parent);const d=b.clone().sub(a).normalize();const m=mesh(new THREE.ConeGeometry(.095,.22,18),color,b,parent);m.quaternion.setFromUnitVectors(UP,d);}
  function lathe(points,mat,pos,parent,part){return mesh(new THREE.LatheGeometry(points.map(p=>new THREE.Vector2(...p)),64),mat,pos,parent,part);}
  // A low, softly lit platform anchors every model in the same virtual laboratory.
  mesh(new THREE.CylinderGeometry(4.5,4.55,.12,96),new THREE.MeshStandardMaterial({color:0xbac9a8,roughness:.85}),V(0,.06,0),scene);
  ring(V(0,.132,0),4.22,.009,new THREE.MeshStandardMaterial({color:0xc3cfb5,roughness:.8}),scene);
  const ground=mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.11}),V(0,-.005,0),scene);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;
  // Stand, clamps and an electric heating mantle.
  mesh(new THREE.BoxGeometry(1.25,.13,.85),dark,V(-2.7,.21,-.35));
  cylinder(V(-2.9,.28,-.45),V(-2.9,6.05,-.45),.045,steel);
  for(const y of [3.05,5.25]){cylinder(V(-2.9,y,-.45),V(-2,y,0),.04,steel);ring(V(-2,y,0),.255,.036,dark);mesh(new THREE.SphereGeometry(.07,12,8),dark,V(-2.8,y,.02));}
  const heater=lathe([[0,0],[.74,0],[.86,.13],[.95,.56],[.88,.65],[.67,.64],[.58,.24],[0,.24]],new THREE.MeshStandardMaterial({color:0xc9c7b2,roughness:.55}),V(-2,.25,0),apparatus,'heater');
  ring(V(-2,.91,0),.85,.045,steel);
  const heaterGlow=mesh(new THREE.TorusGeometry(.55,.09,12,48),new THREE.MeshStandardMaterial({color:0xb96535,emissive:0xf27c2a,emissiveIntensity:0,roughness:.65}),V(-2,.62,0));heaterGlow.rotation.x=Math.PI/2;
  const heatLight=new THREE.PointLight(0xf5a449,0,3);heatLight.position.set(-2,.9,0);apparatus.add(heatLight);
  const knob=mesh(new THREE.CylinderGeometry(.1,.1,.08,24),dark,V(-2,.52,.84));knob.rotation.x=Math.PI/2;
  tube([V(-2.75,.4,-.3),V(-3.35,.24,-.6),V(-3.7,.2,-.15)],.025,dark);
  // Open-neck round-bottom flask; the lower liquid surface stays horizontal.
  const flaskGeometry=new THREE.SphereGeometry(.81,56,40,0,Math.PI*2,.31,Math.PI-.31);
  mesh(flaskGeometry,glass,V(-2,1.55,0),apparatus,'flask');
  cylinder(V(-2,2.31,0),V(-2,2.86,0),.247,glass,apparatus,'flask');
  ring(V(-2,2.85,0),.25,.034);
  const flaskLiquid=mesh(new THREE.SphereGeometry(.765,48,28,0,Math.PI*2,Math.PI/2,Math.PI/2),liquidMat,V(-2,1.55,0),apparatus,'flask');
  const surface=mesh(new THREE.CircleGeometry(.765,48),liquidMat,V(-2,1.55,0),apparatus);surface.rotation.x=-Math.PI/2;
  // Fractionating column packed with glass beads.
  cylinder(V(-2,2.86,0),V(-2,5.45,0),.255,glass,apparatus,'column');
  for(let y=2.95;y<5.5;y+=.32)ring(V(-2,y,0),.258,.014,glassEdge);
  const beadMat=new THREE.MeshPhysicalMaterial({color:0xc5d8b9,roughness:.12,metalness:.2,transparent:true,opacity:.55,depthWrite:false});
  const beads=new THREE.InstancedMesh(new THREE.SphereGeometry(.065,10,8),beadMat,72);const dummy=new THREE.Object3D();
  for(let i=0;i<72;i++){const a=i*2.4;dummy.position.set(-2+Math.cos(a)*.135,3.03+(i/72)*2.25,Math.sin(a)*.135);dummy.updateMatrix();beads.setMatrixAt(i,dummy.matrix);}apparatus.add(beads);beads.userData.part='column';clickable.push(beads);
  ring(V(-2,5.47,0),.255,.038);
  cylinder(V(-2,5.45,0),V(-2,6.08,0),.19,glass,apparatus,'thermometer');
  const stopper=mesh(new THREE.CylinderGeometry(.205,.18,.17,32),dark,V(-2,6.07,0),apparatus,'thermometer');
  cylinder(V(-2,5.56,0),V(-2,6.8,0),.042,new THREE.MeshStandardMaterial({color:0xdbe2d0,roughness:.2}),apparatus,'thermometer');
  cylinder(V(-2,5.57,.038),V(-2,6.55,.038),.015,new THREE.MeshStandardMaterial({color:0xb64d37,roughness:.5}),apparatus);
  mesh(new THREE.SphereGeometry(.07,16,12),orange,V(-2,5.6,0),apparatus,'thermometer');
  for(let i=0;i<9;i++)cylinder(V(-2.06,6.2+i*.057,.035),V(-1.99,6.2+i*.057,.035),.006,dark);
  // Side arm and sloped condenser, with separate vapour and water paths.
  const inletPoint=V(-1.11,5.35,0),outletPoint=V(1.55,3.30,0),direction=outletPoint.clone().sub(inletPoint).normalize();
  tube([V(-2,5.69,0),V(-1.62,5.69,0),inletPoint],.105,glass,apparatus,'condenser');
  cylinder(inletPoint,outletPoint,.245,jacket,apparatus,'condenser');
  cylinder(inletPoint.clone().addScaledVector(direction,-.12),outletPoint.clone().addScaledVector(direction,.14),.095,glass,apparatus,'condenser');
  for(const p of [inletPoint,outletPoint]){ring(p,.25,.035,glassEdge,apparatus,direction);ring(p,.1,.021,glassEdge,apparatus,direction);}
  const waterIn=outletPoint.clone().addScaledVector(direction,-.27),waterOut=inletPoint.clone().addScaledVector(direction,.27);
  cylinder(waterIn,waterIn.clone().add(V(.04,.01,.49)),.058,jacket,apparatus,'inlet');
  cylinder(waterOut,waterOut.clone().add(V(-.02,.45,0)),.058,jacket,apparatus,'outlet');
  const hoseMat=new THREE.MeshStandardMaterial({color:0x70b8b1,roughness:.6,transparent:true,opacity:.6});
  tube([waterIn.clone().add(V(.04,.01,.49)),V(1.7,2.9,.68),V(2.3,.5,1.3),V(3.2,.22,1.15)],.046,hoseMat,apparatus,'inlet');
  tube([waterOut.clone().add(V(-.02,.45,0)),V(-.6,5.9,-.2),V(.25,4.3,-.8),V(.6,.3,-1.1),V(2,.2,-1.4)],.046,hoseMat,apparatus,'outlet');
  tube([outletPoint,V(1.9,2.97,0),V(2.13,2.8,0),V(2.13,1.88,0)],.095,glass,apparatus,'receiver');
  // The receiving flask is open to the atmosphere: the outlet sits above its neck.
  lathe([[0,0],[.67,0],[.72,.08],[.7,.16],[.29,1.1],[.21,1.18],[.21,1.63]],glass,V(2.13,.35,0),apparatus,'receiver');
  ring(V(2.13,1.98,0),.21,.027);
  const receiverLiquid=mesh(new THREE.CylinderGeometry(.5,.64,.27,48),new THREE.MeshPhysicalMaterial({color:0xd5a65a,roughness:.12,transparent:true,opacity:.78,clearcoat:1}),V(2.13,.5,0),apparatus,'receiver');
  for(let i=1;i<5;i++)cylinder(V(2.42,.57+i*.16,.48),V(2.57,.57+i*.16,.48),.009,glassEdge);
  // Molecules intentionally retain both colours at the top: enrichment, not perfect sorting.
  const particleGeometry=new THREE.SphereGeometry(.045,12,8),vapours=[];
  for(let i=0;i<45;i++){
    const type=i%5===0?'b':'a';const m=mesh(particleGeometry,type==='a'?orange:blue,V(0,0,0),apparatus);m.castShadow=false;
    m.scale.setScalar(1.5);vapours.push({mesh:m,type,seed:i/45,angle:i*2.4});
  }
  const reflux=[];for(let i=0;i<13;i++){const m=mesh(new THREE.SphereGeometry(.035,10,8),i%3===0?orange:blue,V(0,0,0));m.castShadow=false;reflux.push({mesh:m,seed:i/13});}
  const drops=[];for(let i=0;i<7;i++){const m=mesh(new THREE.SphereGeometry(.055,12,8),orange,V(0,0,0));m.scale.y=1.3;drops.push({mesh:m,seed:i/7});}
  const waterDots=[];for(let i=0;i<14;i++){const m=mesh(new THREE.SphereGeometry(.026,8,6),blue,V(0,0,0));waterDots.push({mesh:m,seed:i/14});}
  const bubbles=[];for(let i=0;i<14;i++){const m=mesh(new THREE.SphereGeometry(.035,10,8),i%2?orange:blue,V(-2,1.2,0));m.castShadow=false;bubbles.push({mesh:m,seed:i/14});}
  // Column close-up: an open glass cutaway with packing, opposing flows and physical arrows.
  const columnShell=mesh(new THREE.CylinderGeometry(.68,.68,4.5,56,1,true,Math.PI*.2,Math.PI*1.5),glass,V(0,3.25,0),closeup,'column');
  for(let y=1.1;y<5.6;y+=.45)ring(V(0,y,0),.69,.026,glassEdge,closeup);
  for(let i=0;i<85;i++){const a=i*2.4;mesh(new THREE.SphereGeometry(.115,12,8),beadMat,V(Math.cos(a)*.44,1.2+(i/85)*4.1,Math.sin(a)*.44),closeup,'column');}
  const closeParticles=[];for(let i=0;i<40;i++){const m=mesh(new THREE.SphereGeometry(.075,12,8),i%5===0?blue:orange,V(0,0,0),closeup);m.castShadow=false;closeParticles.push({mesh:m,seed:i/40,type:i%5===0?'b':'a'});}
  const closeReflux=[];for(let i=0;i<18;i++){const m=mesh(new THREE.SphereGeometry(.06,12,8),i%3===0?orange:blue,V(0,0,0),closeup);closeReflux.push({mesh:m,seed:i/18});}
  arrow(V(-1.15,2.1,.1),V(-1.15,4.7,.1),orange,closeup);arrow(V(1.15,4.6,.1),V(1.15,2,.1),blue,closeup);
  mesh(new THREE.CylinderGeometry(.72,.72,.18,48),dark,V(0,.99,0),closeup);mesh(new THREE.CylinderGeometry(.72,.72,.12,48),dark,V(0,5.53,0),closeup);
  // A separate industrial-scale model makes the laboratory principle tangible.
  const towerMaterial=new THREE.MeshPhysicalMaterial({color:0xb2c3ad,metalness:.45,roughness:.25,transparent:true,opacity:.32,side:THREE.DoubleSide,depthWrite:false});
  cylinder(V(-.5,.45,0),V(-.5,6.1,0),.72,towerMaterial,refinery);
  mesh(new THREE.SphereGeometry(.72,40,20,0,Math.PI*2,0,Math.PI/2),steel,V(-.5,6.1,0),refinery);
  cylinder(V(-.5,.2,0),V(-.5,.55,0),.85,dark,refinery);
  const productTrays=[],productPipes=[];
  PRODUCTS.forEach((p,i)=>{
    const mat=new THREE.MeshStandardMaterial({color:p.color,roughness:.4,metalness:.25,transparent:true,opacity:.8});
    const tray=mesh(new THREE.CylinderGeometry(.69,.69,.1,40),mat,V(-.5,p.y,0),refinery,'product-'+i);productTrays.push(tray);
    ring(V(-.5,p.y+.13,0),.74,.025,steel,refinery);
    const z=(i-1.5)*.65;const pipe=tube([V(.15,p.y,0),V(1.2+i*.17,p.y,z),V(1.65+i*.17,1.15,z),V(2.4+i*.12,1.15,z)],.065,mat,refinery,'product-'+i);productPipes.push(pipe);
    cylinder(V(2.65+i*.18,.3,z),V(2.65+i*.18,1.3,z),.31,steel,refinery,'product-'+i);
    mesh(new THREE.SphereGeometry(.31,24,16,0,Math.PI*2,0,Math.PI/2),steel,V(2.65+i*.18,1.3,z),refinery,'product-'+i);
    ring(V(2.65+i*.18,.47,z),.32,.035,mat,refinery);
  });
  for(let y=.7;y<6;y+=.34){cylinder(V(-1.1,y,-.62),V(-.75,y,-.78),.018,steel,refinery);}
  cylinder(V(-1.1,.5,-.62),V(-1.1,6.1,-.62),.025,steel,refinery);cylinder(V(-.75,.5,-.78),V(-.75,6.1,-.78),.025,steel,refinery);
  mesh(new THREE.BoxGeometry(1.15,1.2,1),new THREE.MeshStandardMaterial({color:0x6f7d67,metalness:.3,roughness:.5}),V(-2.55,.85,0),refinery);
  mesh(new THREE.BoxGeometry(.65,.4,.02),new THREE.MeshStandardMaterial({color:0xcc7d41,emissive:0xb94c16,emissiveIntensity:.5}),V(-2.55,.8,.51),refinery);
  cylinder(V(-2.65,1.4,-.2),V(-2.65,3.15,-.2),.19,dark,refinery);
  tube([V(-2,1.15,0),V(-1.6,1.15,0),V(-1.35,1.5,0),V(-1.2,1.5,0)],.11,steel,refinery);
  const routeDots=[];for(let i=0;i<16;i++){const dot=mesh(new THREE.SphereGeometry(.09,12,10),orange.clone(),V(0,0,0),refinery);routeDots.push({mesh:dot,seed:i/16});}
  const productRoutes=PRODUCTS.map((p,i)=>{const z=(i-1.5)*.65;return new THREE.CatmullRomCurve3([V(-.5,.8,0),V(-.5,p.y,0),V(.15,p.y,0),V(1.2+i*.17,p.y,z),V(1.65+i*.17,1.15,z),V(2.4+i*.12,1.15,z)]);});
  const condenserArrows=new THREE.Group();apparatus.add(condenserArrows);
  arrow(V(-.7,5.6,.4),V(1,4.25,.4),orange,condenserArrows);
  arrow(V(1.1,3.3,.4),V(-.65,4.65,.4),blue,condenserArrows);
  const halo=ring(V(-2,.95,0),.95,.035,orange,apparatus);
  const heatArrows=new THREE.Group();apparatus.add(heatArrows);for(let i=0;i<3;i++)arrow(V(-2.5+i*.5,.9,.6),V(-2.5+i*.5,1.3,.6),orange,heatArrows);
  const refineryParticles=[];for(let i=0;i<30;i++){const m=mesh(new THREE.SphereGeometry(.055,10,8),i%2?orange:blue,V(0,0,0),refinery);refineryParticles.push({mesh:m,seed:i/30});}
  const baseLabels=[
    {id:'flask',name:'Distillation flask',pos:V(-2.65,1.75,.1),dx:-63,dy:0},
    {id:'column',name:'Fractionating column',pos:V(-2.25,4.15,0),dx:-94,dy:0},
    {id:'thermometer',name:'Thermometer',pos:V(-2,6.65,0),dx:70,dy:-13,right:true},
    {id:'condenser',name:'Condenser',pos:V(.3,4.55,0),dx:105,dy:-10,right:true},
    {id:'receiver',name:'Receiving flask',pos:V(2.65,1.35,0),dx:81,dy:4,right:true},
    {id:'heater',name:'Heating mantle',pos:V(-2,.4,.6),dx:0,dy:38,below:true},
    {id:'inlet',name:'Water in · lower end',pos:waterIn.clone().add(V(0,0,.49)),dx:94,dy:28,right:true,extra:true},
    {id:'outlet',name:'Water out · upper end',pos:waterOut.clone().add(V(0,.45,0)),dx:80,dy:-35,right:true,extra:true}
  ];
  const closeLabels=[
    {id:'column',name:'Cooler · enriched vapour',pos:V(0,5.6,0),dx:0,dy:-27,below:true},
    {id:'column',name:'Vapour rises',pos:V(-1.15,3.55,.1),dx:-75,dy:0},
    {id:'column',name:'Liquid returns',pos:V(1.15,3.3,.1),dx:75,dy:0,right:true},
    {id:'column',name:'Glass beads',pos:V(.35,4.2,0),dx:100,dy:-5,right:true},
    {id:'column',name:'Hotter · mixed vapour',pos:V(0,.9,0),dx:0,dy:45,below:true}
  ];
  const worldLabels=[
    {id:'world-tower',name:'Fractionating tower',pos:V(-.6,6.4,0),dx:0,dy:-30,below:true},
    {id:'world-heater',name:'Heated crude oil',pos:V(-2.5,1,.3),dx:-65,dy:15},
    ...PRODUCTS.map((p,i)=>({id:'product-'+i,name:p.name,pos:V(.1,p.y,.1),dx:95+i*6,dy:-7,right:true}))
  ];
  const labelsContainer=document.getElementById('scene-labels');
  function makeLabels(){
    labelsContainer.replaceChildren();labelElements.length=0;
    const list=mode==='world'?worldLabels:focused?closeLabels:baseLabels;
    list.forEach(item=>{const b=document.createElement('button');b.className='part-label'+(item.right?' right':'')+(item.below?' below':'');b.innerHTML='<span class="part-dot"></span>'+item.name;b.setAttribute('aria-label','Inspect '+item.name);b.addEventListener('click',()=>onSelect(item.id));labelsContainer.append(b);labelElements.push({...item,element:b});});
    updateLabelStyles();
  }
  function updateLabelStyles(){for(const l of labelElements)l.element.classList.toggle('selected',l.id===selected||(mode==='world'&&l.id==='product-'+product));}
  function projectLabels(){
    const mobile=width<550,small=width<450;
    for(const l of labelElements){
      const hide=l.extra&&selected!=='condenser'&&selected!=='inlet'&&selected!=='outlet';
      l.element.style.display=showLabels&&!hide?'flex':'none';if(!showLabels||hide)continue;
      const p=l.pos.clone().project(camera);const scale=small?.55:mobile?.72:1;
      const x=(p.x*.5+.5)*width+l.dx*scale,y=(-p.y*.5+.5)*height+l.dy*scale;
      const half=l.element.offsetWidth/2+5;
      l.element.style.left=Math.max(half,Math.min(width-half,x))+'px';l.element.style.top=Math.max(18,Math.min(height-60,y))+'px';
      l.element.style.visibility=p.z<1&&p.z>-1?'visible':'hidden';
    }
  }
  function resetCamera(){
    camera.position.set(focused?6:7,focused?5.4:5.7,focused?18:19);controls.target.set(focused?0:-.1,focused?3.1:3.2,0);camera.zoom=1;
    const h=focused?7.2:8.2;camera.top=h/2;camera.bottom=-h/2;camera.left=-h/2*(width/height);camera.right=h/2*(width/height);
    // Portrait stages need more vertical room so the apparatus still fits in width.
    if(width/height<1.1&&!focused){const span=9.5/(width/height);camera.top=span/2;camera.bottom=-span/2;camera.left=-4.75;camera.right=4.75;}
    camera.updateProjectionMatrix();controls.update();
  }
  const observer=new ResizeObserver(()=>{width=container.clientWidth;height=container.clientHeight;renderer.setSize(width,height);resetCamera();});observer.observe(container);
  let pointerStart;
  canvas.addEventListener('pointerdown',e=>{pointerStart={x:e.clientX,y:e.clientY};});
  canvas.addEventListener('pointerup',e=>{
    if(!pointerStart||Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)>7)return;
    const bounds=canvas.getBoundingClientRect(),mouse=new THREE.Vector2((e.clientX-bounds.left)/bounds.width*2-1,-(e.clientY-bounds.top)/bounds.height*2+1);
    const ray=new THREE.Raycaster();ray.setFromCamera(mouse,camera);
    const eligible=clickable.filter(m=>{let p=m;while(p){if(!p.visible)return false;p=p.parent;}return true;});
    const hits=ray.intersectObjects(eligible);if(hits.length)onSelect(hits[0].object.userData.part);
  });
  function animate(t){
    const step=mode==='explore'?0:state.step,time=state.elapsed;
    condenserArrows.visible=step===3;
    halo.visible=mode==='process'&&!focused&&spotlight!=='all';halo.position.copy(spotlight==='receiver'?V(2.13,.38,0):spotlight==='condenser'?V(.2,4.2,0):V(-2,.95,0));halo.scale.setScalar(1+Math.sin(time*2)*.055);
    intro=Math.min(1,intro+.025);apparatus.scale.setScalar(reduced?1:.85+.15*(1-Math.pow(1-intro,3)));
    apparatus.position.y=reduced?0:(1-intro)*.6;
    heatArrows.visible=step===1;heatArrows.position.y=Math.sin(time*2)*.08;
    const heat=step>0?1:0;heaterGlow.material.emissiveIntensity=heat*.9;heatLight.intensity=heat*2;
    bubbles.forEach(({mesh:m,seed:s})=>{m.visible=step>=1;const q=(time*.35+s)%1;m.position.set(-2+Math.sin(s*57)*.5,1.0+q*.85,Math.cos(s*37)*.35);m.scale.setScalar(1.2+q*1.2);});
    vapours.forEach(({mesh:m,type,seed:s,angle})=>{
      const p=(time*.13+s)%1;
      if(step<1){m.visible=false;return;}
      if(step===1){m.visible=true;m.position.set(-2+Math.sin(angle+p*3)*.2,1.5+p*1.25,Math.cos(angle+p*3)*.18);}
      else if(step===2||step===4){m.visible=true;const max=type==='b'&&s>.3?3.8:5.8;m.position.set(-2+Math.sin(angle+p*4)*.12,2.4+p*(max-2.4),Math.cos(angle+p*4)*.12);}
      else {m.visible=true;const p0=V(-2,5.69,0),p1=V(-1.3,5.5,0);if(p<.2)m.position.lerpVectors(p0,p1,p/.2);else m.position.lerpVectors(inletPoint,outletPoint,(p-.2)/.8);m.position.z+=Math.sin(angle)*.035;}
    });
    reflux.forEach(({mesh:m,seed:s})=>{m.visible=step>=2;const q=(time*.2+s)%1;m.position.set(-2+Math.sin(s*51)*.205,5.2-q*2.4,Math.cos(s*51)*.205);m.scale.set(1,1.4,1);});
    drops.forEach(({mesh:m,seed:s})=>{m.visible=step>=3;const q=(time*.5+s)%1;m.position.set(2.13,1.9-q*1.25,0);});
    waterDots.forEach(({mesh:m,seed:s})=>{m.visible=step>=3||selected==='condenser'||selected==='inlet'||selected==='outlet';const q=(time*.2+s)%1;m.position.lerpVectors(outletPoint,inletPoint,q);m.position.z=.18*Math.sin(s*60);m.position.y+=.15;});
    const fill=step<3?0:step===3?.12:Math.min(1,.15+state.elapsed/12);
    receiverLiquid.visible=fill>0;receiverLiquid.scale.y=.1+fill*2;receiverLiquid.position.y=.39+(.27*receiverLiquid.scale.y)/2;
    receiverLiquid.scale.x=receiverLiquid.scale.z=1-fill*.15;
    const leftLevel=step===4?Math.max(.75,1-state.elapsed*.012):1;flaskLiquid.scale.y=leftLevel;surface.position.y=1.55-(1-leftLevel)*.3;
    closeParticles.forEach(({mesh:m,seed:s,type})=>{const q=(t*.18+s)%1;const max=type==='b'&&s>.3?3.9:5.3;m.position.set(Math.sin(s*57+q*3)*.32,1.25+q*(max-1.25),Math.cos(s*33+q*3)*.3);});
    closeReflux.forEach(({mesh:m,seed:s})=>{const q=(t*.13+s)%1;m.position.set(Math.sin(s*47)*.55,5.2-q*3.9,Math.cos(s*47)*.55);m.scale.y=1.6;});
    routeDots.forEach(({mesh:m,seed})=>{const p=PRODUCTS[product],q=(t*.12+seed)%1;m.position.copy(productRoutes[product].getPoint(q));m.material.color.set(p.color);m.material.emissive.set(p.color);m.material.emissiveIntensity=.3;});
    refineryParticles.forEach(({mesh:m,seed:s})=>{const q=(t*.1+s)%1;m.position.set(-.5+Math.sin(s*55+q*8)*.47,.7+q*5.2,Math.cos(s*55+q*8)*.47);});
  }
  makeLabels();
  return {
    setMode(value){intro=0;mode=value;focused=false;apparatus.visible=value!=='world';refinery.visible=value==='world';closeup.visible=false;makeLabels();resetCamera();},
    setState(value){state=value;},
    select(id){selected=id;updateLabelStyles();},
    setProduct(i){product=i;productTrays.forEach((m,j)=>{m.material.opacity=i===j?1:.4;});productPipes.forEach((m,j)=>{m.material.opacity=i===j?1:.3;});updateLabelStyles();},
    focus(value){focused=value;apparatus.visible=!value;closeup.visible=value;refinery.visible=false;makeLabels();resetCamera();},
    spotlight(id){spotlight=id;},
    zoomPart(id){const positions={flask:V(-2,1.7,0),heater:V(-2,1.4,0),condenser:V(.2,4.3,0),receiver:V(2.1,1.4,0)};const target=positions[id]||V(-2,4,0);controls.target.copy(target);camera.position.copy(target).add(V(6,2,18));camera.zoom=1.5;camera.updateProjectionMatrix();controls.update();},
    zoom(factor){camera.zoom=THREE.MathUtils.clamp(camera.zoom*factor,.72,2.2);camera.updateProjectionMatrix();},
    labels(value){showLabels=value;},
    rotate(value){controls.autoRotate=value;},
    reset:resetCamera,
    render(now,illustrationTime){if(now-lastFrame<28)return;lastFrame=now;animate(illustrationTime);controls.update();projectLabels();renderer.render(scene,camera);},
    dispose(){observer.disconnect();controls.dispose();renderer.dispose();env.dispose();}
  };
}
