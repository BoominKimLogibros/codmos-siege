import * as THREE from 'three';
import {ITEM_ICON_SOURCES,ITEM_ICON_PATH} from './asset-manifest.js';
export const ITEM_COLORS={attack:'#e4ba80',magic:'#bda4ef',defense:'#90c7b2',move:'#8fcde5',sustain:'#b4d68b'};
const art={
 'health-potion':'<path d="M25 7h14v12l11 18v17H14V37l11-18ZM22 7h20M16 39h32M32 43v10M27 48h10"/>',
 'mana-potion':'<path d="M25 7h14v12l11 18v17H14V37l11-18ZM22 7h20M16 39h32m-16 2 6 6-6 7-6-7Z"/>',
 sword:'<path d="M19 45 43 10l10-1-2 10-28 29M12 38l16 15M9 55l8-10M7 55l4 4"/>',
 ruby:'<path d="m32 7 18 18-18 32-18-32Z"/><path d="m14 25 18-7 18 7M32 18v39"/>',
 armor:'<path d="m22 9-14 7 4 16 8-3-2 26h28l-2-26 8 3 4-16-14-7c0 14-20 14-20 0Z"/><path d="M24 33h16M24 41h16"/>',
 amulet:'<path d="M15 9c0 23 34 23 34 0M32 28 45 42 32 57 19 42Z"/><circle cx="32" cy="42" r="5"/>',
 book:'<path d="M10 13h19l3 5 3-5h19v39H35l-3 5-3-5H10Z"/><path d="M32 18v35M17 25h8M17 32h8M39 25h8M39 32h8"/>',
 dagger:'<path d="m17 45 29-32 7-4-4 10-27 31M12 37l17 16M13 54l7-10"/><path d="m9 28 8-12M35 51l10-6"/>',
 boots:'<path d="M20 9h24l-4 28 13 7v11H11V44l9-9Z"/><path d="M20 17h23M21 28h19M13 48h36"/>',
 seed:'<path d="M32 54V27M31 39C9 40 8 14 11 13c23 0 23 18 20 26ZM33 32c0-24 22-24 22-24 3 21-10 28-22 24Z"/><path d="M19 56h26"/>',
 sapphire:'<path d="m32 7 17 16-5 28-12 7-12-7-5-28Z"/><path d="m16 23 16 8 16-8M32 31v27M32 7v24"/>',
 stormblade:'<path d="m13 49 19-33 11-5-4 14-19 28M8 42l17 13M31 40l17-26 8-4-3 12-17 24"/><path d="m4 23 9 2-3 8M45 47l9-1-4 9"/>',
 staff:'<path d="m16 57 24-34M41 6l4 8 9 2-7 6v9l-8-5-8 4 1-9-6-6 9-1Z"/><path d="m11 44 8 5"/>',
 aegis:'<path d="m32 6 22 8-3 24C48 49 32 58 32 58S16 49 13 38L10 14Z"/><path d="m32 16 13 5-2 16-11 11-11-11-2-16ZM32 18v27M22 31h20"/>',
 fang:'<path d="M13 10c35-1 45 15 35 35-4 7-10 10-18 14 2-21-1-30-17-49Z"/><path d="M25 17c11 13 14 24 9 35M49 13l5 6-6 8"/>',
 orb:'<circle cx="32" cy="32" r="18"/><ellipse cx="32" cy="32" rx="30" ry="9" transform="rotate(-32 32 32)"/><path d="m32 17 7 15-7 15-7-15ZM9 12h5M11 9v6M50 52h5M52 49v6"/>',
 swiftboots:'<path d="M24 10h20l-4 26 13 8v11H13V44l11-10Z"/><path d="m25 21 15 4M19 47h27M7 23h12M4 32h13M6 41h10"/>',
 band:'<ellipse cx="32" cy="38" rx="20" ry="12"/><ellipse cx="32" cy="38" rx="12" ry="6"/><path d="m32 8 8 10-8 10-8-10Z"/>',
 cloak:'<path d="M20 8h24l4 10-6 4 10 34H12l10-34-6-4Z"/><path d="M26 22h12M32 22v30M22 44l10 8 10-8"/>',
 kingsbane:'<path d="m10 54 30-34 12-9-4 13-34 30M6 46l12 12M16 48l-6 8"/><path d="M38 6l3 5 6 1-4 4 1 6-6-3-5 3 1-6-4-4 6-1Z"/>',
 crown:'<path d="m8 46 4-28 12 12 8-18 8 18 12-12 4 28Z"/><path d="M8 54h48M32 30v8M20 40h24"/><circle cx="32" cy="10" r="3"/>',
 bulwark:'<path d="M10 22h8v-8h8v8h12v-8h8v8h8v34H10Z"/><path d="M26 56V42a6 6 0 0 1 12 0v14M10 32h44"/>',
 scythe:'<path d="M20 58 42 10"/><path d="M42 10C24 6 10 14 6 28c10-8 22-10 34-6"/><path d="m14 50 10 4"/>',
 heart:'<path d="M32 54C10 40 6 28 10 18c4-9 16-11 22-2 6-9 18-7 22 2 4 10 0 22-22 36Z"/><path d="M32 24v20M24 34h16"/>'
};
export const TIER_COLORS={1:'#8c9aa3',2:'#5aa9e6',3:'#f2c45a'};
export function itemIcon(item){if(ITEM_ICON_SOURCES[item.icon])return `<img class="pixel-art" src="${ITEM_ICON_PATH(item.icon)}" alt="" draggable="false">`;return `<svg viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="${ITEM_COLORS[item.category]}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">${art[item.icon]||art.ruby}</svg>`;}
const shopTextures=new Map();
export function shopTexture(team){
 if(shopTextures.has(team))return shopTextures.get(team);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=320;const c=canvas.getContext('2d'),blue=team==='blue',cloth=blue?'#508ca4':'#b8474b',light=blue?'#86bfce':'#e58a86';
 const poly=(points,color)=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
 const rect=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 c.fillStyle='#192e2944';c.beginPath();c.ellipse(160,290,132,17,0,0,Math.PI*2);c.fill();
 poly([[34,275],[57,256],[270,256],[291,280],[270,301],[51,301]],'#7f8470');poly([[34,275],[160,287],[291,280],[270,301],[51,301]],'#596654');
 rect(60,89,13,180,'#795839');rect(252,89,13,180,'#795839');rect(65,94,194,138,'#493e2a');
 for(let x=76;x<254;x+=25)rect(x,112,18,112,'#635039');
 rect(75,191,178,9,'#ba9562');
 for(const [x,color]of [[96,'#b59cda'],[125,'#7ebdae'],[216,'#c5da8d']]){rect(x,164,15,24,color);rect(x+4,154,7,12,'#d9c29c');c.fillStyle='#edf4cf77';c.fillRect(x+3,166,3,13);}
 poly([[42,87],[76,49],[245,49],[283,87],[272,106],[50,106]],'#684f36');
 for(let i=0;i<7;i++){const x=42+i*34,top=77+i*24;poly([[top,54],[top+24,54],[x+34,91],[x,91]],i%2?light:cloth);c.fillStyle=i%2?light:cloth;c.beginPath();c.moveTo(x,90);c.lineTo(x+34,90);c.lineTo(x+34,109);c.quadraticCurveTo(x+17,123,x,109);c.closePath();c.fill();}
 poly([[51,225],[260,225],[276,243],[41,243]],'#bd9561');rect(47,243,222,39,'#8e693e');rect(52,244,212,7,'#d3ae75');
 for(let x=63;x<260;x+=34){rect(x,255,22,19,'#795938');rect(x+3,256,16,2,'#bd955c');}
 c.fillStyle='#e4bc6a';c.beginPath();c.ellipse(179,212,17,8,0,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(199,216,16,7,0,0,Math.PI*2);c.fill();
 poly([[83,214],[91,183],[145,183],[156,215]],'#98713d');rect(90,212,58,12,'#6d4a2f');rect(115,184,8,39,'#e5c680');
 c.fillStyle='#e1c680';c.beginPath();c.arc(163,59,25,0,Math.PI*2);c.fill();c.strokeStyle='#8a6b3b';c.lineWidth=3;c.stroke();poly([[163,43],[174,59],[163,75],[152,59]],'#9c733b');
 rect(244,141,28,29,'#d5bf81');c.fillStyle='#483e2b';c.font='bold 19px system-ui';c.textAlign='center';c.fillText('B',258,163);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;shopTextures.set(team,texture);return texture;
}
