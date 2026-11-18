import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Schematic molecular coordinates: correct connectivity, not an energy-minimised geometry.
export function moleculeData(kind) {
  if(kind==='benzene') {
    const atoms=Array.from({length:12},(_,i)=>{const a=(i%6)*Math.PI/3,r=i<6?1.4:2.48;return {element:i<6?'C':'H',p:[r*Math.cos(a),r*Math.sin(a),0]};});
    const bonds=Array.from({length:6},(_,i)=>[i,(i+1)%6,1]).concat(Array.from({length:6},(_,i)=>[i,i+6,1]));
    return {atoms,bonds,aromatic:true};
  }
  const atoms=[{element:'C',p:[0,0,0]},{element:'O',p:[0,1.23,0]},{element:'C',p:[-1.3,-.75,0]},{element:'C',p:[1.3,-.75,0]}];
  for(const [index,sign] of [[2,-1],[3,1]]) {
    const [x,y]=atoms[index].p;
    for(const d of [[sign*.91,.32,0],[-sign*.12,-.63,.83],[-sign*.12,-.63,-.83]])atoms.push({element:'H',p:[x+d[0],y+d[1],d[2]]});
  }
  return {atoms,bonds:[[0,1,2],[0,2,1],[0,3,1],[2,4,1],[2,5,1],[2,6,1],[3,7,1],[3,8,1],[3,9,1]]};
}

export function createMoleculeScene(host) {
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0x000000,0);
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
  renderer.domElement.setAttribute('aria-label','Interactive 3D molecular models. Drag to rotate; use view controls to inspect acetone and benzene.');host.prepend(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,100);
  camera.position.set(0,2.5,19);
  scene.add(new THREE.HemisphereLight(0xfff9e9,0x446558,3));
  const key=new THREE.DirectionalLight(0xffffff,4);key.position.set(-5,7,8);scene.add(key);
  const rim=new THREE.DirectionalLight(0xc0e5f0,3);rim.position.set(5,2,-6);scene.add(rim);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableZoom=false;controls.enablePan=false;controls.enableDamping=true;controls.autoRotate=false;
  const root=new THREE.Group();scene.add(root);
  const colors={C:0x344c45,H:0xf5f2e4,O:0xd75b3d};
  const materials=Object.fromEntries(Object.entries(colors).map(([k,color])=>[k,new THREE.MeshStandardMaterial({color,roughness:.22,metalness:.14})]));
  const bondMat=new THREE.MeshStandardMaterial({color:0x99aca2,metalness:.5,roughness:.24});
  const atomGeo=new THREE.SphereGeometry(1,24,16);
  function molecular(kind) {
    const group=new THREE.Group(),data=moleculeData(kind);
    data.atoms.forEach(({element,p})=>{const ball=new THREE.Mesh(atomGeo,materials[element]);ball.position.set(...p);ball.scale.setScalar(element==='H'?.23:element==='O'?.43:.4);group.add(ball);});
    data.bonds.forEach(([a,b,order])=>{
      const start=new THREE.Vector3(...data.atoms[a].p),end=new THREE.Vector3(...data.atoms[b].p),d=end.clone().sub(start);
      for(let j=0;j<order;j++){const stick=new THREE.Mesh(new THREE.CylinderGeometry(.085,.085,d.length(),10),bondMat);stick.position.copy(start).add(end).multiplyScalar(.5);stick.position.x+=(j-(order-1)/2)*.22;stick.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());group.add(stick);}
    });
    if(data.aromatic){const circle=new THREE.Mesh(new THREE.TorusGeometry(.87,.035,8,64),bondMat);group.add(circle);}
    return group;
  }
  const acetone=molecular('acetone'),benzene=molecular('benzene');acetone.position.x=-3.2;benzene.position.x=3.2;root.add(acetone,benzene);
  // Coloured plinths identify molecules; atoms use conventional element colours.
  for(const [x,color] of [[-3.2,0xc78642],[3.2,0x45899d]]){const plinth=new THREE.Mesh(new THREE.CylinderGeometry(2.8,2.9,.09,64),new THREE.MeshStandardMaterial({color,transparent:true,opacity:.18,roughness:.5}));plinth.position.set(x,-2.7,0);root.add(plinth);}
  let playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,visible=false,previous=0,time=0,view='both',space=false;
  const observer=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.position.z=w/h<1.2?27:19;camera.updateProjectionMatrix();});observer.observe(host);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{rootMargin:'100px'}).observe(host);
  function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-previous)/1000,.05);previous=now;if(!visible||document.hidden)return;if(playing)time+=dt;acetone.rotation.y=Math.sin(time*.3)*.42;benzene.rotation.y=-Math.sin(time*.3)*.42;controls.update();renderer.render(scene,camera);}
  requestAnimationFrame(frame);
  return {
    pause(){playing=!playing;return !playing;},
    view(kind){view=kind;acetone.visible=kind!=='benzene';benzene.visible=kind!=='acetone';acetone.position.x=kind==='acetone'?0:-3.2;benzene.position.x=kind==='benzene'?0:3.2;},
    spacefill(value){space=value;root.traverse(o=>{if(o.isMesh&&o.geometry===atomGeo)o.scale.multiplyScalar(value?1.65:1/1.65);});},
    reset(){root.rotation.set(0,0,0);camera.position.set(0,2.5,host.clientWidth/host.clientHeight<1.2?27:19);controls.target.set(0,0,0);controls.update();}
  };
}
