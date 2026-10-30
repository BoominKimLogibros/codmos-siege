import * as THREE from 'three';
import {PASSIVES} from './passives.js';
const materials=new Map();
export function passiveMaterial(id){
 if(materials.has(id))return materials.get(id);
 const p=PASSIVES[id],canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d');c.translate(128,128);c.strokeStyle=p.color;c.fillStyle=p.color;c.lineWidth=9;c.lineCap='round';c.lineJoin='round';c.shadowColor=p.color;c.shadowBlur=9;
 const line=points=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
 const circle=(r,x=0,y=0)=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();};
 const polygon=(n,r,rotation=0)=>{const points=Array.from({length:n+1},(_,i)=>[Math.cos(i*Math.PI*2/n+rotation)*r,Math.sin(i*Math.PI*2/n+rotation)*r]);line(points);};
 switch(p.shape){
  case 'spiral':{const points=[];for(let i=0;i<=110;i++){const a=i/110*Math.PI*5,r=8+i*.7;points.push([Math.cos(a)*r,Math.sin(a)*r]);}line(points);break;}
  case 'hex':polygon(6,86);polygon(6,55);line([[-25,0],[25,0]]);line([[0,-25],[0,25]]);break;
  case 'banner':line([[-42,85],[-42,-86],[65,-65],[10,-20],[-42,-30]]);line([[-70,85],[0,85]]);break;
  case 'star':{const points=Array.from({length:11},(_,i)=>{const a=i*Math.PI/5-Math.PI/2,r=i%2?37:90;return[Math.cos(a)*r,Math.sin(a)*r];});line(points);circle(10);break;}
  case 'crosshair':circle(60);for(let i=0;i<4;i++){c.rotate(Math.PI/2);line([[0,36],[0,96]]);}circle(8);break;
  case 'wind':for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(-90,i*45);c.bezierCurveTo(-15,i*45,35,i*45+40,85,i*45-10);c.stroke();}line([[58,-85],[90,-57],[50,-30]]);break;
  case 'poison':for(const [x,y]of [[-48,25],[48,25],[0,-42]]){c.beginPath();c.moveTo(x,y-40);c.bezierCurveTo(x-60,y+22,x+35,y+62,x+27,y+13);c.closePath();c.stroke();}break;
  case 'thunder':line([[15,-98],[-62,8],[0,8],[-15,97],[69,-22],[12,-22],[15,-98]]);break;
  case 'soul':for(const x of [-52,0,52]){c.beginPath();c.moveTo(x,-78+Math.abs(x)*.7);c.bezierCurveTo(x-65,5,x-25,80,x+7,64);c.bezierCurveTo(x+47,35,x+22,-5,x,-78+Math.abs(x)*.7);c.stroke();}break;
  case 'guard':line([[0,-88],[74,-55],[60,35],[0,94],[-60,35],[-74,-55],[0,-88]]);line([[-30,0],[-5,28],[40,-28]]);break;
  case 'sharingan':circle(84);circle(46);for(let i=0;i<3;i++){const a=i*Math.PI*2/3-Math.PI/2,x=Math.cos(a)*46,y=Math.sin(a)*46;c.beginPath();c.arc(x,y,13,0,Math.PI*2);c.fill();c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+Math.cos(a+1.4)*30,y+Math.sin(a+1.4)*30,x+Math.cos(a+2.2)*24,y+Math.sin(a+2.2)*24);c.stroke();}c.beginPath();c.arc(0,0,14,0,Math.PI*2);c.fill();break;
  case 'sand':for(const [r,a] of [[86,0],[60,.6],[34,1.2]]){c.beginPath();c.arc(0,0,r,a,a+Math.PI*1.5);c.stroke();}for(const [x,y] of [[70,40],[-62,52],[-30,-78],[50,-62]]){c.beginPath();c.arc(x,y,6,0,Math.PI*2);c.fill();}break;
  case 'byakugo':polygon(4,70,Math.PI/4);polygon(4,36,Math.PI/4);line([[0,-92],[0,92]]);line([[-92,0],[92,0]]);break;
  case 'music':for(const [x,y]of [[-58,25],[0,-10],[58,-45]]){c.beginPath();c.ellipse(x,y+45,18,12,-.3,0,Math.PI*2);c.fill();line([[x+16,y+40],[x+16,y-38],[x+44,y-22]]);}break;
 }
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const material=new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false});materials.set(id,material);return material;
}
