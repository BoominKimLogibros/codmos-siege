import * as THREE from 'three';
const spearTextures=new Map();
export function cavalryProjectile(color){
 let texture=spearTextures.get(color);
 if(!texture){
  const canvas=document.createElement('canvas');canvas.width=192;canvas.height=48;const c=canvas.getContext('2d');
  const trail=c.createLinearGradient(0,24,145,24);trail.addColorStop(0,'#ffffff00');trail.addColorStop(1,color);c.fillStyle=trail;c.beginPath();c.moveTo(0,24);c.lineTo(137,17);c.lineTo(137,31);c.closePath();c.fill();
  c.lineCap='round';c.strokeStyle='#243841';c.lineWidth=9;c.beginPath();c.moveTo(45,24);c.lineTo(146,24);c.stroke();c.strokeStyle=color;c.lineWidth=5;c.stroke();
  c.fillStyle='#fff2bf';c.strokeStyle='#30434b';c.lineWidth=2;c.beginPath();c.moveTo(184,24);c.lineTo(140,11);c.lineTo(148,24);c.lineTo(140,37);c.closePath();c.fill();c.stroke();
  c.strokeStyle='#ffffff';c.lineWidth=2;c.beginPath();c.moveTo(153,24);c.lineTo(179,24);c.stroke();
  texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;spearTextures.set(color,texture);
 }
 const material=new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false}),sprite=new THREE.Sprite(material);sprite.scale.set(2.1,.525,1);sprite.center.set(.65,.5);sprite.userData.dispose=()=>material.dispose();return sprite;
}
export function updateCavalryProjectile(sprite,shot){sprite.material.rotation=-Math.atan2(shot.vz,shot.vx);sprite.position.z=shot.z-1.8;}
