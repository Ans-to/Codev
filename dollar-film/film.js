// Adapted from the 3d-animator starter. Every pose is a pure function of time.
import * as THREE from 'three';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { W, H, seg, smooth, easeOut, halton, hash } from './lib.js';
export const total = 30;
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const stage=document.querySelector('#stage');
const renderer=new THREE.WebGLRenderer({canvas:stage,antialias:true,preserveDrawingBuffer:true});
renderer.setSize(W,H,false); renderer.setPixelRatio(1); renderer.toneMapping=THREE.NoToneMapping; renderer.outputColorSpace=THREE.LinearSRGBColorSpace;
const rt=new THREE.WebGLRenderTarget(W,H,{type:THREE.HalfFloatType});
const accum=new THREE.WebGLRenderTarget(W,H,{type:THREE.HalfFloatType,depthBuffer:false});
const scene=new THREE.Scene(); scene.background=new THREE.Color('#07131e');
scene.add(new THREE.HemisphereLight(0x9ac4d9,0x14202b,1.3));
const light=new THREE.DirectionalLight(0xffd795,3.0); light.position.set(-3,4,5);scene.add(light);
const fill=new THREE.DirectionalLight(0x427e9e,1.5);fill.position.set(3,-1,-2);scene.add(fill);
const gold=new THREE.MeshStandardMaterial({color:0xc89d4f,metalness:.72,roughness:.3});
const goldLight=new THREE.MeshStandardMaterial({color:0xf7d382,metalness:.55,roughness:.3});
const group=new THREE.Group();group.position.set(1.5,0,0);scene.add(group);
// Globe texture: hand-drawn, deliberately stylised geographical shapes.
const map=document.createElement('canvas');map.width=1024;map.height=512;const m=map.getContext('2d');
m.fillStyle='#183e50';m.fillRect(0,0,1024,512);
m.strokeStyle='rgba(130,195,200,.19)';m.lineWidth=1;
for(let x=0;x<=1024;x+=64){m.beginPath();m.moveTo(x,0);m.lineTo(x,512);m.stroke()}
for(let y=0;y<=512;y+=64){m.beginPath();m.moveTo(0,y);m.lineTo(1024,y);m.stroke()}
m.fillStyle='#82a99f';
const polys=[[[75,90],[145,52],[210,65],[245,98],[225,125],[248,147],[220,165],[205,194],[174,191],[154,170],[131,166],[117,145],[87,139]],[[206,184],[233,187],[255,214],[266,248],[256,278],[239,308],[225,353],[211,333],[200,297],[184,262],[188,230]],[[442,97],[471,84],[486,96],[510,93],[522,110],[547,116],[540,130],[508,139],[497,155],[474,145],[451,151],[430,134]],[[471,154],[507,150],[540,166],[559,199],[546,227],[530,245],[520,280],[495,309],[481,278],[469,250],[455,215],[460,180]],[[523,96],[567,79],[615,76],[658,66],[707,84],[754,80],[803,96],[834,117],[884,129],[878,151],[844,161],[813,148],[783,171],[752,171],[724,154],[697,179],[673,173],[649,155],[620,159],[602,143],[573,151],[549,132]],[[783,288],[811,272],[849,279],[877,299],[867,327],[833,338],[802,329]],[[312,45],[338,35],[353,50],[346,83],[320,105],[302,90]]];
for(const p of polys){m.beginPath();p.forEach(([x,y],i)=>i?m.lineTo(x,y):m.moveTo(x,y));m.closePath();m.fill()}
const tex=new THREE.CanvasTexture(map);tex.colorSpace=THREE.SRGBColorSpace;
const earth=new THREE.Mesh(new THREE.SphereGeometry(1.18,48,32),new THREE.MeshStandardMaterial({map:tex,roughness:.8,metalness:.08}));group.add(earth);
const halo=new THREE.Mesh(new THREE.SphereGeometry(1.225,48,32),new THREE.MeshBasicMaterial({color:0x55b6c5,transparent:true,opacity:.06,side:THREE.BackSide}));group.add(halo);
// Orbital routes are actual 3D curves surrounding the globe.
const orbits=[];
for(let i=0;i<3;i++){let curve=new THREE.EllipseCurve(0,0,1.45+i*.11,1.45+i*.11,0,Math.PI*2);let pts=curve.getPoints(120).map(p=>V(p.x,p.y,0));const orbit=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0xd5b36e,transparent:true,opacity:.38}));orbit.rotation.set(.55+i*.43,.3+i*.46,.2+i*.3);group.add(orbit);orbits.push(orbit)}
const coin=new THREE.Group(); group.add(coin);
const disk=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,.1,64),gold);disk.rotation.x=Math.PI/2;coin.add(disk);
const ring=new THREE.Mesh(new THREE.TorusGeometry(.48,.012,8,64),goldLight);ring.position.z=.056;coin.add(ring);
const coinCanvas=document.createElement('canvas');coinCanvas.width=256;coinCanvas.height=256;let cc=coinCanvas.getContext('2d');cc.fillStyle='#fce4a0';cc.textAlign='center';cc.textBaseline='middle';cc.font='bold 180px Georgia';cc.fillText('$',128,137);const coinTex=new THREE.CanvasTexture(coinCanvas);coinTex.colorSpace=THREE.SRGBColorSpace;
const symbol=new THREE.Mesh(new THREE.PlaneGeometry(.78,.78),new THREE.MeshBasicMaterial({map:coinTex,transparent:true}));symbol.position.z=.059;coin.add(symbol);
const bars=[];for(let i=0;i<5;i++){const mesh=new THREE.Mesh(new THREE.BoxGeometry(.18,1,.18),i%2?gold:goldLight);group.add(mesh);bars.push(mesh)}
const particles=[];for(let i=0;i<40;i++){let p=new THREE.Mesh(new THREE.SphereGeometry(.012,6,6),new THREE.MeshBasicMaterial({color:i%3?0xd9bc7a:0x8dc6cd}));scene.add(p);particles.push(p)}
const camera=new THREE.PerspectiveCamera(38,W/H,.1,50);
const rail=new THREE.CubicBezierCurve3(V(0,.2,7.4),V(.18,.3,7.25),V(-.16,.15,7),V(0,.15,6.9));
const cards=[
 ['THE GLOBAL MONEY STORY','WHY THE DOLLAR','RUNS THE WORLD',"It’s not just about America."],
 ['01 / THE ORIGIN','1944','A NEW SYSTEM','Bretton Woods tied currencies to the dollar.\nThe dollar was linked to gold.'],
 ['02 / GLOBAL TRADE','A COMMON','LANGUAGE','Oil and global trade are often priced\nand settled in dollars.'],
 ['03 / RESERVES','A PLACE TO','PARK WEALTH','Deep U.S. Treasury markets give central\nbanks a place to hold reserves.'],
 ['04 / NETWORK EFFECT','MORE USE','BRINGS MORE USE','Banks and businesses choose dollars\nbecause so many others use them.'],
 ['THE BIG PICTURE','DOMINANT,','NOT THE ONLY ONE','The dollar leads today — but its\nrole in the world can change.']
];
const overlay=document.createElement('canvas');overlay.width=W;overlay.height=H;const c=overlay.getContext('2d');const capTex=new THREE.CanvasTexture(overlay);capTex.colorSpace=THREE.SRGBColorSpace;
function drawText(t){
 c.clearRect(0,0,W,H);let i=Math.min(5,Math.floor(t/5));let local=t-i*5;let alpha=smooth(seg(local,0,.35))* (i===5?1:1-smooth(seg(local,4.6,5)));c.globalAlpha=alpha;
 c.fillStyle='#d6ad65';c.fillRect(55,62,32,3);c.font='bold 13px Arial';c.letterSpacing='2px';c.fillText(cards[i][0],98,68);c.letterSpacing='0px';
 c.fillStyle='#f4f1e7';c.font='bold 40px Arial';c.fillText(cards[i][1],55,166);c.fillText(cards[i][2],55,219);
 c.fillStyle='#d9e1df';c.font='19px Arial';cards[i][3].split('\n').forEach((line,j)=>c.fillText(line,57,275+j*30));
 c.fillStyle='rgba(216,231,225,.48)';c.font='bold 11px Arial';c.fillText('THE DOLLAR  /  EXPLAINED',56,493);c.fillText(String(i+1).padStart(2,'0')+'  /  06',410,493);
 c.globalAlpha=1;c.fillStyle='rgba(240,230,199,.12)';c.fillRect(55,510,400,2);c.fillStyle='#d6ad65';c.fillRect(55,510,400*Math.min(1,t/30),2);capTex.needsUpdate=true;
}
const vert='varying vec2 vUv; void main(){vUv=uv; gl_Position=vec4(position.xy,0.,1.);}';
const addPass=new FullScreenQuad(new THREE.ShaderMaterial({uniforms:{tex:{value:null},w:{value:1}},vertexShader:vert,fragmentShader:'uniform sampler2D tex; uniform float w; varying vec2 vUv; void main(){gl_FragColor=vec4(texture2D(tex,vUv).rgb*w,1.);}',blending:THREE.CustomBlending,blendSrc:THREE.OneFactor,blendDst:THREE.OneFactor,blendEquation:THREE.AddEquation,transparent:true,depthTest:false,depthWrite:false}));
const grade=new FullScreenQuad(new THREE.ShaderMaterial({uniforms:{tex:{value:accum.texture},cap:{value:capTex},seed:{value:0}},vertexShader:vert,fragmentShader:`uniform sampler2D tex,cap;uniform float seed;varying vec2 vUv;
vec3 aces(vec3 x){return clamp(x*(2.51*x+.03)/(x*(2.43*x+.59)+.14),0.,1.);} vec3 srgb(vec3 c){return mix(c*12.92,1.055*pow(max(c,vec3(0.)),vec3(1./2.4))-.055,step(.0031308,c));}
void main(){vec2 d=vUv-.5;vec3 col=texture2D(tex,vUv).rgb;col=srgb(aces(col));col*=1.-.27*smoothstep(.25,.8,length(d));float h=fract(sin(dot(vUv*960.,vec2(12.9898,78.233))+seed)*43758.5453);col+=(h-.5)*.012;vec4 a=texture2D(cap,vUv);col=col*(1.-a.a)+a.rgb;gl_FragColor=vec4(col,1.);}`,depthTest:false,depthWrite:false}));
function pose(t,k,n){
 earth.rotation.y=t*.055+.2;halo.rotation.y=earth.rotation.y;
 const pop=easeOut(seg(t,0,.6));coin.scale.setScalar(.001+.999*pop);coin.position.set(-.8,-.55,1.15);coin.rotation.y=.18*Math.sin(t*.7);
 for(let i=0;i<3;i++)orbits[i].rotation.z=.2+i*.3+t*(i%2?-.035:.025);
 let barFade=smooth(seg(t,15,15.7))*(1-smooth(seg(t,19.2,20)));
 bars.forEach((b,i)=>{let h=(.34+i*.17)*barFade;b.scale.y=Math.max(.001,h);b.position.set(-1.28+i*.27,-1.25+h/2,1.45);b.visible=barFade>.001;});
 particles.forEach((p,i)=>{p.position.set(-3+hash(i)*6,-1.9+hash(i+100)*3.8,-2+hash(i+200)*2);p.position.y+=.08*Math.sin(t*.35+i)});
 rail.getPoint(smooth(seg(t,0,30)),camera.position);camera.lookAt(0,0,0);camera.updateProjectionMatrix();
 if(n>1){camera.projectionMatrix.elements[8]+=(halton(k+1,2)-.5)*2/W;camera.projectionMatrix.elements[9]+=(halton(k+1,3)-.5)*2/H;}
}
export function renderAt(t,n=1){drawText(t);renderer.setRenderTarget(accum);renderer.setClearColor(0x000000,1);renderer.clear();for(let k=0;k<n;k++){let ts=t+((k+.5)/n-.5)*(.5/24);pose(ts,k,n);renderer.setRenderTarget(rt);renderer.render(scene,camera);addPass.material.uniforms.tex.value=rt.texture;addPass.material.uniforms.w.value=1/n;renderer.setRenderTarget(accum);renderer.autoClear=false;addPass.render(renderer);renderer.autoClear=true;}grade.material.uniforms.seed.value=t*24;renderer.setRenderTarget(null);grade.render(renderer)}
window.renderAt=renderAt;window.total=total;
