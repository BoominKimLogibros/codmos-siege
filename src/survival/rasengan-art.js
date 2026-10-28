import * as THREE from 'three';
let orbTexture;
export function rasenganObject(){
 if(!orbTexture){const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const c=canvas.getContext('2d'),glow=c.createRadialGradient(64,64,3,64,64,62);glow.addColorStop(0,'#ffffff');glow.addColorStop(.23,'#dafcff');glow.addColorStop(.5,'#53d8ff');glow.addColorStop(.76,'#1589f0aa');glow.addColorStop(1,'#148bea00');c.fillStyle=glow;c.fillRect(0,0,128,128);c.strokeStyle='#e1fdff';c.lineWidth=3;for(let i=0;i<4;i++){c.beginPath();c.ellipse(64,64,18+i*8,40-i*4,i*Math.PI/4,.1,Math.PI*1.7);c.stroke();}orbTexture=new THREE.CanvasTexture(canvas);orbTexture.colorSpace=THREE.SRGBColorSpace;}
 const material=new THREE.SpriteMaterial({map:orbTexture,transparent:true,depthWrite:false}),sprite=new THREE.Sprite(material);sprite.scale.set(1.3,1.3,1);sprite.userData.dispose=()=>material.dispose();return sprite;
}
export function updateRasengan(sprite,effect){const age=effect.duration-effect.life;sprite.position.x=effect.x+effect.dir.x*1.1;sprite.position.z=effect.z+effect.dir.z*1.1-1.6;sprite.material.rotation=age*28;sprite.material.opacity=Math.min(1,effect.life/.07);}
