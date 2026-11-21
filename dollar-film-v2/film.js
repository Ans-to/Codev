// The 3d-animator starter adapted to a 30-second finance explainer.
// Every pose, camera sample, light jitter and caption is a pure function of time.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { feature } from 'topojson-client';
import { geoPath, geoEquirectangular } from 'd3-geo';
import { W,H,clamp,lerp,seg,smooth,easeOut,easeInOut,backOut,spring,halton,hash } from './lib.js';
import { setStyle } from './styles.js';
export const total=30;
const SHUTTER=.5/30, V=(x,y,z)=>new THREE.Vector3(x,y,z);
const stage=document.getElementById('stage');
const renderer=new THREE.WebGLRenderer({canvas:stage,antialias:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
renderer.setPixelRatio(1);renderer.setSize(W,H,false);renderer.toneMapping=THREE.NoToneMapping;renderer.outputColorSpace=THREE.LinearSRGBColorSpace;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
const rt=new THREE.WebGLRenderTarget(W,H,{type:THREE.HalfFloatType,samples:4});
const accum=new THREE.WebGLRenderTarget(W,H,{type:THREE.HalfFloatType,depthBuffer:false});
const scene=new THREE.Scene();scene.background=new THREE.Color(0x071019);
const mat=(color,roughness=.65,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
function add(geo,material,x,y,z,parent=scene){let o=new THREE.Mesh(geo,material);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
const box=(w,h,d,r=.008)=>new RoundedBoxGeometry(w,h,d,2,r);
const ink=mat(0x13222b,.82), gold=mat(0xc59b50,.32,.7), bright=mat(0xe4bd6c,.29,.75), paper=mat(0xdfd0a7,.95), walnut=mat(0x463027,.84);
add(box(2.6,.06,1.18,.012),walnut,0,-.035,0); // desk at y=0
add(new THREE.PlaneGeometry(8,4),mat(0x1d292f,.98),0,1.25,-.9);
add(new THREE.PlaneGeometry(8,6),mat(0x0f151b,.95),0,-.82,0).rotation.x=-Math.PI/2;
// globe: precise world-atlas coastlines, but an intentionally decorative palette.
const atlas=await (await fetch('./node_modules/world-atlas/countries-110m.json')).json();
const world=document.createElement('canvas');world.width=2048;world.height=1024;const wg=world.getContext('2d');
wg.fillStyle='#214b59';wg.fillRect(0,0,world.width,world.height);
const projection=geoEquirectangular().scale(world.width/(2*Math.PI)).translate([world.width/2,world.height/2]);
const geo=geoPath(projection,wg);wg.fillStyle='#c0c9a2';wg.strokeStyle='rgba(25,65,69,.55)';wg.lineWidth=1.3;
for(const country of feature(atlas,atlas.objects.countries).features){wg.beginPath();geo(country);wg.fill();wg.stroke()}
wg.strokeStyle='rgba(191,220,209,.16)';wg.lineWidth=1;
for(let x=0;x<=2048;x+=171){wg.beginPath();wg.moveTo(x,0);wg.lineTo(x,1024);wg.stroke()}
for(let y=0;y<=1024;y+=171){wg.beginPath();wg.moveTo(0,y);wg.lineTo(2048,y);wg.stroke()}
const worldTex=new THREE.CanvasTexture(world);worldTex.colorSpace=THREE.SRGBColorSpace;worldTex.anisotropy=8;
const globe=new THREE.Group();globe.position.set(-.40,0,-.07);globe.name='globe';scene.add(globe);
add(new THREE.CylinderGeometry(.13,.16,.026,40),ink,0,.013,0,globe);
add(new THREE.CylinderGeometry(.028,.04,.07,24),gold,0,.058,0,globe);
const earth=add(new THREE.SphereGeometry(.215,64,48),new THREE.MeshStandardMaterial({map:worldTex,roughness:.47,metalness:.1}),0,.29,0,globe);
const meridian=add(new THREE.TorusGeometry(.233,.004,10,80),bright,0,.29,0,globe);meridian.rotation.set(.1,.35,.25);
// Warm desk lamp with visible bulb and practical cone.
function rod(a,b,r,material,parent){const d=b.clone().sub(a),m=add(new THREE.CylinderGeometry(r,r,d.length(),12),material,0,0,0,parent);m.position.copy(a).lerp(b,.5);m.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());return m}
const lamp=new THREE.Group();lamp.position.set(-.92,0,-.28);scene.add(lamp);
add(new THREE.CylinderGeometry(.085,.095,.025,32),ink,0,.012,0,lamp);
rod(V(0,.025,0),V(.08,.42,0),.008,ink,lamp);rod(V(.08,.42,0),V(.27,.57,.03),.008,ink,lamp);
const shade=add(new THREE.ConeGeometry(.09,.13,32,1,true),new THREE.MeshStandardMaterial({color:0x192a2c,metalness:.4,roughness:.4,side:THREE.DoubleSide}),.27,.55,.03,lamp);shade.rotation.z=-.2;
const bulb=add(new THREE.SphereGeometry(.025,16,12),new THREE.MeshBasicMaterial({color:new THREE.Color(4,2.5,1.25)}),0,-.048,0,shade);
// A large physical screen is the central graphic surface, not a floating title overlay.
const monitor=new THREE.Group();monitor.position.set(.42,0,-.27);monitor.name='monitor';scene.add(monitor);
add(box(.79,.49,.065,.018),ink,0,.37,0,monitor);
add(new THREE.CylinderGeometry(.025,.045,.12,24),ink,0,.1,-.005,monitor);
add(box(.26,.025,.18,.009),ink,0,.012,-.005,monitor);
const screenCanvas=document.createElement('canvas');screenCanvas.width=1024;screenCanvas.height=610;const sc=screenCanvas.getContext('2d');
const screenTex=new THREE.CanvasTexture(screenCanvas);screenTex.colorSpace=THREE.SRGBColorSpace;screenTex.anisotropy=8;
const screen=add(new THREE.PlaneGeometry(.73,.425),new THREE.MeshBasicMaterial({map:screenTex,color:new THREE.Color(1.22,1.22,1.22)}),0,.37,.034,monitor);screen.castShadow=false;
const titles=[['THE DOLLAR','WHY THE WORLD USES IT'],['1944','BRETTON WOODS'],['GLOBAL TRADE','A COMMON LANGUAGE'],['RESERVES','DEEP, LIQUID MARKETS'],['NETWORK EFFECT','MORE USE  →  MORE USE'],['THE BIG PICTURE','DOMINANT, NOT GUARANTEED']];
const cuts=[0,3.65,8.6,13.55,18.84,23.5,30];
function shotAt(t){for(let i=5;i>=0;i--)if(t>=cuts[i])return i;return 0}
function drawScreen(t){let shot=shotAt(t),local=t-cuts[shot];sc.fillStyle='#0b2028';sc.fillRect(0,0,1024,610);
sc.fillStyle='#c89d58';sc.fillRect(60,65,64,5);sc.font='bold 25px Arial';sc.letterSpacing='3px';sc.fillText('THE GLOBAL MONEY STORY',145,72);sc.letterSpacing='0px';
sc.fillStyle='#f0e8d6';sc.font='bold 81px Arial';sc.fillText(titles[shot][0],60,218);sc.fillStyle='#cfa969';sc.font='bold 34px Arial';sc.fillText(titles[shot][1],62,275);
sc.strokeStyle='rgba(201,168,105,.35)';sc.lineWidth=2;sc.beginPath();sc.moveTo(60,312);sc.lineTo(956,312);sc.stroke();
if(shot===3){sc.strokeStyle='rgba(205,172,107,.65)';sc.lineWidth=5;sc.beginPath();let points=[[610,462],[675,434],[735,445],[800,396],[860,410],[930,360]];for(let i=0;i<points.length;i++){let [x,y]=points[i];i?sc.lineTo(x,y):sc.moveTo(x,y)}sc.stroke();for(let [x,y] of points){sc.beginPath();sc.arc(x,y,5,0,Math.PI*2);sc.fillStyle='#edd194';sc.fill();}}
sc.font='27px Arial';sc.fillStyle='#a8bec0';let copy=[['HISTORY  •  TRADE  •  TRUST'],['A DOLLAR-CENTERED SYSTEM'],['OFTEN PRICED IN DOLLARS'],['A HOME FOR CENTRAL BANK RESERVES'],['THE POWER OF SHARED USE'],['A ROLE THAT CAN CHANGE']][shot];sc.fillText(copy,62,373);
sc.fillStyle='#7b9a9b';sc.font='21px Arial';sc.fillText('WORLD CURRENCY  /  '+String(shot+1).padStart(2,'0'),62,520);sc.fillStyle='rgba(186,210,203,.12)';sc.fillRect(62,550,900,3);sc.fillStyle='#d3b16e';sc.fillRect(62,550,900*clamp(t/30),3);screenTex.needsUpdate=true;}
// Coin with embossed face; base supports it as a physical object.
const coin=new THREE.Group();coin.position.set(-.02,.119,.22);coin.name='coin';scene.add(coin);
const disk=add(new THREE.CylinderGeometry(.115,.115,.018,64),gold,0,0,0,coin);disk.rotation.x=Math.PI/2;
const trim=add(new THREE.TorusGeometry(.101,.003,8,64),bright,0,0,.010,coin);
const sig=document.createElement('canvas');sig.width=256;sig.height=256;const sg=sig.getContext('2d');sg.fillStyle='#f8dea1';sg.textAlign='center';sg.textBaseline='middle';sg.font='bold 190px Georgia';sg.fillText('$',128,139);
const sigTex=new THREE.CanvasTexture(sig);sigTex.colorSpace=THREE.SRGBColorSpace;
const glyph=add(new THREE.PlaneGeometry(.17,.17),new THREE.MeshBasicMaterial({map:sigTex,transparent:true}),0,0,.011,coin);glyph.castShadow=false;
// Removable props: paper agreement and gold bar, then a treasury stack.
const agreement=new THREE.Group();agreement.position.set(.14,0,.25);scene.add(agreement);
add(box(.32,.008,.22,.002),paper,0,.006,0,agreement);
const pg=document.createElement('canvas');pg.width=512;pg.height=352;const pgc=pg.getContext('2d');pgc.fillStyle='#d8c89e';pgc.fillRect(0,0,512,352);pgc.strokeStyle='#8b7044';pgc.lineWidth=4;pgc.strokeRect(20,20,472,312);pgc.fillStyle='#443b2b';pgc.font='bold 35px Georgia';pgc.fillText('BRETTON WOODS',40,80);pgc.font='25px Georgia';pgc.fillText('AGREEMENT  •  1944',40,120);pgc.fillStyle='#8b795a';for(let y=160;y<290;y+=26)pgc.fillRect(40,y,340-(y%3)*30,4);
const pgt=new THREE.CanvasTexture(pg);pgt.colorSpace=THREE.SRGBColorSpace;let page=add(new THREE.PlaneGeometry(.3,.205),new THREE.MeshBasicMaterial({map:pgt}),0,.010,0,agreement);page.rotation.x=-Math.PI/2;page.castShadow=false;
const bar=add(box(.11,.035,.055,.008),bright,.08,.028,.035,agreement);bar.rotation.y=-.25;
const stack=new THREE.Group();stack.position.set(.08,0,.29);scene.add(stack);for(let i=0;i<4;i++){const sheet=add(box(.30,.008,.19,.002),paper,0,.005+i*.01,0,stack);sheet.rotation.y=(i-1.5)*.04}
// Route lights and banking markers. All additions animate independently and deterministically.
const markers=[];for(let i=0;i<3;i++){const mesh=add(new THREE.SphereGeometry(.015,16,12),new THREE.MeshBasicMaterial({color:new THREE.Color(2.2,1.55,.55)}),0,0,0,globe);markers.push(mesh)}
// Trade arcs are revealed separately, in sync with their own chimes.
const routes=[];for(let i=0;i<3;i++){const a=i*2.05,b=a+.95;const start=V(Math.cos(a)*.16,.29+Math.sin(a)*.11,.15),end=V(Math.cos(b)*.16,.29+Math.sin(b)*.11,.15);const mid=start.clone().add(end).multiplyScalar(.5);mid.z+=.09;const pts=new THREE.QuadraticBezierCurve3(start,mid,end).getPoints(48);const geo=new THREE.BufferGeometry().setFromPoints(pts);const line=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xf5cc77}));globe.add(line);routes.push(line)}
const links=[];for(let i=0;i<3;i++){let x=-.06+i*.12;let curve=new THREE.QuadraticBezierCurve3(V(x,.018,.38),V(x*.5,.026,.29),V(-.02,.022,.23));let line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(32)),new THREE.LineBasicMaterial({color:0xe3bd72}));scene.add(line);links.push(line)}
const nodes=[];for(let i=0;i<3;i++){const g=new THREE.Group();g.position.set(-.06+i*.12,.018,.38);scene.add(g);add(new THREE.CylinderGeometry(.035,.035,.014,28),gold,0,0,0,g);add(new THREE.CylinderGeometry(.025,.025,.002,28),bright,0,.009,0,g);nodes.push(g)}
// Shadow-casting slats paint light shapes on the rear wall.
const SUN_POS=V(-3.2,2.3,1.4),SUN_AT=V(0,.25,-.6);const blinds=new THREE.Group();blinds.position.copy(SUN_AT).lerp(SUN_POS,.48);blinds.lookAt(SUN_AT);scene.add(blinds);
for(let i=0;i<13;i++){let slat=add(box(2,.045,.01,.002),mat(0xffffff),0,(i-6)*.1,0,blinds);slat.castShadow=true;}
const DUST=240,dustPos=new Float32Array(DUST*3),dustGeo=new THREE.BufferGeometry();dustGeo.setAttribute('position',new THREE.BufferAttribute(dustPos,3));const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:new THREE.Color(1.5,1.1,.7),size:.003,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(dust);
const sun=new THREE.DirectionalLight(0xffc384,3.6);sun.target.position.copy(SUN_AT);scene.add(sun,sun.target);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-2,right:2,top:2,bottom:-2,near:.5,far:9});sun.shadow.bias=-.0004;
const sky=new THREE.DirectionalLight(0x9db8ff,.8);sky.target.position.set(0,.2,0);scene.add(sky,sky.target);sky.castShadow=true;sky.shadow.mapSize.set(512,512);Object.assign(sky.shadow.camera,{left:-2,right:2,top:2,bottom:-2,near:.5,far:10});sky.shadow.bias=-.0006;
const lampLight=new THREE.SpotLight(0xffb36b,9,3,.8,.7,2);scene.add(lampLight,lampLight.target);lampLight.castShadow=true;lampLight.shadow.mapSize.set(512,512);lampLight.shadow.bias=-.0005;scene.add(new THREE.AmbientLight(0x53606a,.15));
const camera=new THREE.PerspectiveCamera(38,W/H,.02,30);
const rail=new THREE.CubicBezierCurve3(V(.36,.84,2.5),V(.29,.78,2.33),V(.11,.70,2.13),V(.16,.67,2.03));
const LOOK_A=V(.04,.25,-.06),LOOK_B=V(.03,.27,-.09),SCREEN_CENTER=V(.24,.30,-.1);
const eye=V(0,0,0),look=V(0,0,0),right=V(0,0,0),up=V(0,0,0);
function shoot(t,k,n){let p=easeInOut(seg(t,.3,29.5));rail.getPoint(p,eye);look.copy(LOOK_A).lerp(LOOK_B,p);camera.position.copy(eye);camera.up.set(0,1,0);camera.lookAt(look);camera.updateMatrixWorld();camera.updateProjectionMatrix();if(n===1)return;
const F=eye.distanceTo(SCREEN_CENTER),lens=lerp(.008,.004,p),a=Math.sqrt(halton(k+1,2))*lens,b=halton(k+1,3)*Math.PI*2,lx=Math.cos(b)*a,ly=Math.sin(b)*a;right.setFromMatrixColumn(camera.matrixWorld,0);up.setFromMatrixColumn(camera.matrixWorld,1);camera.position.addScaledVector(right,lx).addScaledVector(up,ly);camera.updateMatrixWorld();const e=camera.projectionMatrix.elements;e[8]+=-e[0]*lx/F+2*(halton(k+1,5)-.5)/W;e[9]+=-e[5]*ly/F+2*(halton(k+1,7)-.5)/H;camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();}
function jitterLights(k,n){let s=n>1?.15:0;sun.position.set(SUN_POS.x+(halton(k+1,11)-.5)*s,SUN_POS.y+(halton(k+1,13)-.5)*s,SUN_POS.z+(halton(k+1,17)-.5)*s);let h1=n>1?halton(k+1,19):.5,h2=n>1?halton(k+1,23):.3,phi=h2*Math.PI*2,c=Math.sqrt(h1),r=Math.sqrt(1-h1);sky.position.set(Math.cos(phi)*r*4,c*4+.3,Math.sin(phi)*r*4+1);bulb.getWorldPosition(lampLight.position);lampLight.target.position.set(-.10,0,.08);}
function pop(t,start){return Math.max(.001,backOut(seg(t,start,start+.3)))}
function pose(t){earth.rotation.y=.3+t*.07;let k=pop(t,0);coin.scale.set(k, k, k);coin.position.y=.119+Math.max(0,1-seg(t,0,.3))*.14;coin.rotation.z=.08*spring(t,.3,5,7);
agreement.visible=t>=3.65&&t<8.6;if(agreement.visible)agreement.scale.setScalar(pop(t,3.65));stack.visible=t>=13.55&&t<18.84;if(stack.visible)stack.scale.setScalar(pop(t,13.55));
markers.forEach((m,i)=>{let at=8.9+i*.45;m.visible=t>=at&&t<13.55;let a=i*2.05+.95;m.position.set(Math.cos(a)*.16,.29+Math.sin(a)*.11,.15);m.scale.setScalar(pop(t,at));routes[i].visible=m.visible;routes[i].geometry.setDrawRange(0,Math.round(49*easeOut(seg(t,at,at+.4))));});nodes.forEach((n,i)=>{let at=19.2+i*.45;n.visible=t>=at&&t<23.5;n.scale.setScalar(pop(t,at));links[i].visible=n.visible;links[i].geometry.setDrawRange(0,Math.round(33*easeOut(seg(t,at,at+.4))));});
for(let i=0;i<DUST;i++){let a=hash(i)*6.28,s=.15+.2*hash(i+99);dustPos[i*3]=-.9+1.8*hash(i+1)+.03*Math.sin(t*s+a);let dir=hash(i+5)<.33?-1:1;dustPos[i*3+1]=.04+1.1*hash(i+2)+((dir*t*.024*(.5+hash(i+3)))%.4);dustPos[i*3+2]=-.85+1.2*hash(i+4)+.03*Math.cos(t*s*.8+a);}dustGeo.attributes.position.needsUpdate=true;}
const captions=await (await fetch('./captions.json')).json();
const capCanvas=Object.assign(document.createElement('canvas'),{width:W,height:H}),cg=capCanvas.getContext('2d');const capTex=new THREE.CanvasTexture(capCanvas);capTex.colorSpace=THREE.SRGBColorSpace;
function drawCaption(t){cg.clearRect(0,0,W,H);let item=captions.find((x,i)=>t>=x.start-.033&&t<(captions[i+1] ? captions[i+1].start-.033 : x.end)&&t<x.end);if(!item){capTex.needsUpdate=true;return}
cg.font='bold 58px Arial';cg.textBaseline='middle';const text=item.words.map(w=>w.text.toUpperCase()).join(' '),width=cg.measureText(text).width;let x=(W-width)/2;cg.fillStyle='rgba(3,12,17,.72)';cg.beginPath();cg.roundRect(x-35,850,width+70,92,14);cg.fill();for(const w of item.words){let word=w.text.toUpperCase();cg.fillStyle=t>=w.start-.033?'#f7e9cb':'#91a5a3';cg.fillText(word,x,896);x+=cg.measureText(word+' ').width;}capTex.needsUpdate=true;}
// ---------- post: add the sub-frames, bloom, then ONE grade (lens fringe, ACES, vignette, sRGB, grain, captions) ----------
const vert = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const addPass = new FullScreenQuad(new THREE.ShaderMaterial({ uniforms: { tex: { value: null }, w: { value: 1 } }, vertexShader: vert,
  fragmentShader: 'uniform sampler2D tex; uniform float w; varying vec2 vUv; void main() { gl_FragColor = vec4(texture2D(tex, vUv).rgb * w, 1.0); }',
  blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendEquation: THREE.AddEquation, depthTest: false, depthWrite: false, transparent: true }));
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.2, 0.4, 0.9);
const grade = new FullScreenQuad(new THREE.ShaderMaterial({ uniforms: { tex: { value: accum.texture }, cap: { value: capTex }, seed: { value: 0 }, exposure: { value: 1 }, graphic: { value: 0 } }, vertexShader: vert,
  fragmentShader: `uniform sampler2D tex, cap; uniform float seed, exposure, graphic; varying vec2 vUv;
    float h(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233)) + seed) * 43758.5453); }
    vec3 aces(vec3 x) { return clamp(x * (2.51 * x + 0.03) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
    vec3 srgb(vec3 c) { return mix(c * 12.92, 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
    void main() {
      vec2 d = vUv - 0.5; float ca = dot(d, d) * 0.008;
      vec3 c = vec3(texture2D(tex, vUv + d * ca).r, texture2D(tex, vUv).g, texture2D(tex, vUv - d * ca).b) * exposure;
      c = mix(aces(c), c / max(1.0, max(c.r, max(c.g, c.b))), graphic);   // graphic looks (shadow, blueprint, thermal, synth): exact colours
      c *= mix(1.0, 0.6, smoothstep(0.35, 0.95, length(d * vec2(1.0, 0.8)) * 1.45));
      c = srgb(c);
      c += (h(vUv * 1000.0) - 0.5) * 0.03 * (1.0 - 0.55 * dot(c, vec3(0.33)));
      vec4 k = texture2D(cap, vUv); c = c * (1.0 - k.a) + k.rgb;
      gl_FragColor = vec4(c, 1.0); }`, depthTest: false, depthWrite: false }));


const MIX={globe:'lit',coin:'lit',monitor:'lit'};
setStyle(new URLSearchParams(location.search).get('style')||'lit',{scene,key:sun,fill:sky,bloom,renderer,grade:grade.material.uniforms,neonAt:V(.52,.5,-.88),mix:MIX});
export function renderAt(t,n=1){drawScreen(t);drawCaption(t);renderer.setRenderTarget(accum);renderer.setClearColor(0x000000,1);renderer.clear();for(let k=0;k<n;k++){const ts=n===1?t:t+((k+.5)/n-.5)*SHUTTER;pose(ts);shoot(ts,k,n);jitterLights(k,n);renderer.setRenderTarget(rt);renderer.render(scene,camera);addPass.material.uniforms.tex.value=rt.texture;addPass.material.uniforms.w.value=1/n;renderer.setRenderTarget(accum);renderer.autoClear=false;addPass.render(renderer);renderer.autoClear=true;}bloom.render(renderer,accum,accum,0,false);grade.material.uniforms.seed.value=(t*30)%97;grade.material.uniforms.exposure.value=.95*(1-smooth(seg(t,29.7,30)));renderer.setRenderTarget(null);grade.render(renderer);}
window.renderAt=renderAt;window.total=total;
