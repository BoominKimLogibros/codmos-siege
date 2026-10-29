import * as THREE from 'three';
// Readable combat feedback: glowing bolts, melee swing arcs, impact sparks, floating damage and the player's target marker.
const textures=new Map();
function cached(key,draw,width=128,height=width){
 if(textures.has(key))return textures.get(key);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;draw(canvas.getContext('2d'),width,height);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;textures.set(key,texture);return texture;
}
function sprite(texture,width,height=width){const material=new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false}),s=new THREE.Sprite(material);s.scale.set(width,height,1);s.userData.dispose=()=>material.dispose();return s;}
export const HEALTH_COLORS={self:'#7ee85a',ally:'#4aa8ff',enemy:'#ff4b4b'};
export function healthColor(unit,player){return unit===player?HEALTH_COLORS.self:unit.team===player?.team?HEALTH_COLORS.ally:HEALTH_COLORS.enemy;}

export function boltObject(shot,color){
 const texture=cached('bolt'+color,(c,w,h)=>{
  const glow=c.createRadialGradient(w*.72,h/2,0,w*.72,h/2,h/2);glow.addColorStop(0,'#ffffff');glow.addColorStop(.35,color);glow.addColorStop(1,color+'00');
  const trail=c.createLinearGradient(0,0,w*.75,0);trail.addColorStop(0,color+'00');trail.addColorStop(1,color+'cc');
  c.fillStyle=trail;c.beginPath();c.moveTo(0,h/2);c.lineTo(w*.72,h*.22);c.lineTo(w*.72,h*.78);c.closePath();c.fill();
  c.fillStyle=glow;c.beginPath();c.arc(w*.72,h/2,h/2,0,Math.PI*2);c.fill();
 },128,48);
 const size=shot.tower?2.8:shot.sourceSnapshot?.kind==='champion'?2.4:1.6,s=sprite(texture,size,size*.38);s.center.set(.72,.5);return s;
}
export function updateBolt(object,shot){object.material.rotation=-Math.atan2(shot.vz,shot.vx);object.position.z=shot.z-(shot.tower?2.2:1.3);}

export function slashObject(effect,color){
 const key='slash'+color+!!effect.critical,texture=cached(key,(c,w,h)=>{
  const g=c.createLinearGradient(0,h,w,0);g.addColorStop(0,color+'00');g.addColorStop(.55,color);g.addColorStop(1,'#ffffff');
  c.fillStyle=g;c.beginPath();c.arc(w*.28,h/2,w*.62,-1.05,1.05);c.arc(w*.12,h/2,w*.6,.95,-.95,true);c.closePath();c.fill();
  if(effect.critical){c.strokeStyle='#fff6c2';c.lineWidth=4;c.beginPath();c.arc(w*.28,h/2,w*.62,-1,1);c.stroke();}
 });
 const s=sprite(texture,effect.radius*2);s.material.rotation=-Math.atan2(effect.dirZ,effect.dirX);return s;
}
export function updateSlash(object,effect){const f=1-effect.life/effect.duration,size=effect.radius*2*(.75+f*.5);object.scale.set(size,size,1);object.material.opacity=Math.min(1,(1-f)*1.6);object.position.z=effect.z-.9;}

export function sparkObject(effect,color){
 const texture=cached('spark'+color,(c,w,h)=>{
  c.translate(w/2,h/2);const g=c.createRadialGradient(0,0,0,0,0,w/2);g.addColorStop(0,'#ffffff');g.addColorStop(.3,color);g.addColorStop(1,color+'00');c.fillStyle=g;
  c.beginPath();for(let i=0;i<16;i++){const r=i%2?w*.16:w*.5,a=i/16*Math.PI*2;c.lineTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();c.fill();
 });
 const s=sprite(texture,1);s.material.rotation=effect.id%7;return s;
}
export function updateSpark(object,effect,structure){const f=1-effect.life/effect.duration,size=(structure?2.6:1.5)*(.6+f*.7);object.scale.set(size,size,1);object.material.opacity=1-f;object.position.z=effect.z-(structure?2:1.1);}

const DAMAGE_COLORS={physical:'#ffb35c',magic:'#c792ff',true:'#ffffff'};
export function damageObject(effect){
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=96;const c=canvas.getContext('2d'),big=effect.critical;
 c.textAlign='center';c.textBaseline='middle';c.font=`900 ${big?64:46}px system-ui, sans-serif`;c.lineJoin='round';c.lineWidth=big?10:8;c.strokeStyle='#1a0f0a';
 const text=(effect.incoming?'-':'')+effect.amount+(big?'!':'');c.strokeText(text,128,50);c.fillStyle=effect.incoming?'#ff5a5a':big?'#ffd84a':DAMAGE_COLORS[effect.damageType]||'#ffffff';c.fillText(text,128,50);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const material=new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false}),s=new THREE.Sprite(material);s.userData.dispose=()=>{material.dispose();texture.dispose();};
 s.userData.drift=((effect.id*37)%11-5)*.12;return s;
}
export function updateDamage(object,effect){
 const f=1-effect.life/effect.duration,pop=f<.12?1+(.12-f)*4:1,size=(effect.critical?4.4:3.3)*pop;
 object.scale.set(size,size*.375,1);object.position.x=effect.x+object.userData.drift*(1+f*3);object.position.z=effect.z-effect.lift-f*1.6;object.material.opacity=f<.7?1:(1-f)/.3;
}

export function targetMarker(){
 const texture=cached('target',(c,w,h)=>{c.strokeStyle='#ff4b4b';c.lineWidth=7;c.beginPath();c.arc(w/2,h/2,w*.4,0,Math.PI*2);c.stroke();c.fillStyle='#ff4b4b';for(let i=0;i<4;i++){c.save();c.translate(w/2,h/2);c.rotate(i*Math.PI/2);c.beginPath();c.moveTo(w*.3,0);c.lineTo(w*.48,-w*.07);c.lineTo(w*.48,w*.07);c.closePath();c.fill();c.restore();}});
 const s=sprite(texture,2.4,1.1);s.visible=false;s.renderOrder=-80;return s;
}
export function rangeRing(){const texture=cached('range',(c,w,h)=>{c.strokeStyle='#ffffff';c.lineWidth=3;c.setLineDash([10,8]);c.beginPath();c.arc(w/2,h/2,w*.47,0,Math.PI*2);c.stroke();},256);const s=sprite(texture,1);s.visible=false;s.renderOrder=-85;return s;}
