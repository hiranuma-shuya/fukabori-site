import * as THREE from './vendor/three.module.min.js';

// A field of light, with depth and perspective. DOM cards keep every action
// usable even when WebGL is unavailable.
const canvas = document.getElementById('universe');
const hero = document.getElementById('hero');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reducedMotion.matches;
let renderer;
try {
  renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:'low-power'});
} catch { canvas.hidden = true; }

if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.setClearColor(0x000000,0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45,1,.1,100);
  camera.position.z = 13;
  const group = new THREE.Group();
  scene.add(group);
  const pointCount = innerWidth < 700 ? 4200 : 11000;
  const positions = new Float32Array(pointCount * 3);
  const colors = new Float32Array(pointCount * 3);
  const copper = new THREE.Color('#ba8451');
  const silver = new THREE.Color('#b1bfcb');
  let seed = 713;
  const rand = () => {seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646;};
  for (let i=0; i<pointCount; i++) {
    const lane = Math.floor(rand() * 30);
    const angle = rand() * Math.PI * 2;
    const radius = 2.2 + lane * .059 + rand() * .016;
    positions[i*3] = Math.cos(angle) * radius;
    positions[i*3+1] = Math.sin(angle) * radius;
    positions[i*3+2] = Math.sin(angle * 3 + lane * .1) * .13 + (rand()-.5) * .065;
    const col = (i % 7 === 0 ? silver : copper).clone().multiplyScalar(.45 + rand() * .65);
    colors.set([col.r,col.g,col.b],i*3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
  const material = new THREE.PointsMaterial({size:.014,vertexColors:true,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending});
  const field = new THREE.Points(geometry,material);
  group.add(field);
  field.rotation.x = .45;
  field.rotation.y = -.3;
  field.rotation.z = -.35;

  const dustPos = new Float32Array(180*3);
  for(let i=0;i<180;i++) dustPos.set([(rand()-.5)*20,(rand()-.5)*14,(rand()-.5)*8],i*3);
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position',new THREE.BufferAttribute(dustPos,3));
  const dustMaterial = new THREE.PointsMaterial({color:0xc1aa8b,size:.013,transparent:true,opacity:.4,depthWrite:false});
  const dust = new THREE.Points(dustGeometry,dustMaterial);
  scene.add(dust);

  // The orbital cards are product assets on actual 3D planes.
  const textureLoader = new THREE.TextureLoader();
  const satellites = [];
  const satelliteConfigs = [
    ['friends_v1',-1.8,2.9,-2.8,-.6,.35],
    ['self_v1',3.2,1.9,-3.5,.55,-.22],
    ['parents_v1',1.4,-2.8,-2.5,-.2,.2]
  ];
  satelliteConfigs.forEach(([id,x,y,z,ry,rz]) => {
    textureLoader.load(`img/deck/${id}.webp`, texture => {
      texture.colorSpace = THREE.SRGBColorSpace;
      const card = new THREE.Mesh(new THREE.PlaneGeometry(.72,1.08),new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity:.42,side:THREE.DoubleSide}));
      card.position.set(x,y,z);
      card.rotation.set(.1,ry,rz);
      card.userData.baseY = y;
      group.add(card);
      satellites.push(card);
      renderOnce();
    },undefined,()=>{});
  });
  let targetX=0,targetY=0,scroll=0,visible=true,frame=0,last=0,elapsed=0;
  const resize = () => {
    const width=hero.clientWidth,height=hero.clientHeight;
    renderer.setSize(width,height,false);
    camera.aspect=width/height;
    camera.updateProjectionMatrix();
    const mobile=width<700;
    group.position.set(mobile ? .05 : 3.1,mobile ? -2.8 : .15,0);
    group.scale.setScalar(mobile ? .74 : 1);
    renderOnce();
  };
  function renderOnce() {renderer.render(scene,camera);}
  function tick(time) {
    frame=0;
    if(paused || !visible || document.hidden) return;
    frame=requestAnimationFrame(tick);
    if(time-last<33) return;
    const delta=Math.min((time-last)/1000,.05); last=time; elapsed+=delta;
    field.rotation.z = -.35 + elapsed * .027 + scroll * .18;
    field.rotation.y += (targetX*.13-.3-field.rotation.y)*.035;
    field.rotation.x += (targetY*.1+.45-field.rotation.x)*.035;
    dust.rotation.y = elapsed * .008;
    satellites.forEach((card,i) => {card.position.y=card.userData.baseY+Math.sin(elapsed*.6+i)*.1;card.rotation.y+=delta*.04;});
    camera.position.z=13-scroll*.9;
    renderOnce();
  }
  function resume() {if(!frame && !paused && visible && !document.hidden){last=performance.now();frame=requestAnimationFrame(tick);}}
  new ResizeObserver(resize).observe(hero);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)resume();else {cancelAnimationFrame(frame);frame=0;}},{threshold:0}).observe(hero);
  hero.addEventListener('pointermove',event=>{if(paused)return;const b=hero.getBoundingClientRect();targetX=(event.clientX-b.left)/b.width-.5;targetY=(event.clientY-b.top)/b.height-.5;},{passive:true});
  window.addEventListener('scroll',()=>{scroll=Math.min(1,scrollY/hero.clientHeight);},{passive:true});
  window.addEventListener('fukabori:motion',event=>{paused=event.detail.paused;if(paused){cancelAnimationFrame(frame);frame=0;renderOnce();}else resume();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else resume();});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(frame);frame=0;canvas.hidden=true;});
  resize();
  resume();
}
