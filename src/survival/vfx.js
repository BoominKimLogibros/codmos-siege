import * as THREE from 'three';
import {VFX_PARTICLES,VFX_SHEETS,VFX_PATH} from './asset-manifest.js';
// Layered sprite effects built from the CC0 Brackeys VFX textures. Particles are white masks, so each layer is tinted with the team or effect color.
const textures=new Map(),sheetFrames=new Map();
// Never rejects: a missing file only hides the layers that use it (and combat-fx falls back to its drawn versions). Sheets get one texture per frame so spawning an effect never re-uploads the sheet.
export async function loadVfx(){const loader=new THREE.TextureLoader();await Promise.all([...VFX_PARTICLES,...Object.keys(VFX_SHEETS)].map(async name=>{try{const t=await loader.loadAsync(VFX_PATH(name));t.colorSpace=THREE.SRGBColorSpace;const s=VFX_SHEETS[name];if(s){const count=s.to-s.from+1,cols=Math.ceil(Math.sqrt(count)),rows=Math.ceil(count/cols);t.generateMipmaps=false;t.minFilter=THREE.LinearFilter;t.needsUpdate=true;sheetFrames.set(name,Array.from({length:count},(_,i)=>{const f=t.clone();f.repeat.set(1/cols,1/rows);f.offset.set(i%cols/cols,1-(Math.floor(i/cols)+1)/rows);f.needsUpdate=true;return f;}));}textures.set(name,t);}catch(error){console.warn('VFX texture failed',name,error);}}));}
export function vfxTexture(name){return textures.get(name)||null;}
const BLENDS={add:THREE.AdditiveBlending,normal:THREE.NormalBlending};
// Colored layers use normal blending so they keep their hue on the bright lane stones; white highlights stay additive for the glow.
function layer(name,color,{blend=/^#f[0-9a-f]f[0-9a-f]f/i.test(color)?'add':'normal',size=1,sheet=false}={}){
 const frames=sheet?sheetFrames.get(name)||null:null,material=new THREE.SpriteMaterial({map:frames?frames[0]:textures.get(name)||null,color:new THREE.Color(color),transparent:true,depthWrite:false,blending:BLENDS[blend]}),s=new THREE.Sprite(material);s.visible=!!material.map;s.scale.set(size,size,1);s.userData.base=size;s.userData.frames=frames;
 s.userData.dispose=()=>material.dispose();return s;
}
function frame(s,f){const fr=s.userData.frames;if(fr)s.material.map=fr[Math.min(fr.length-1,Math.floor(Math.max(0,f)*fr.length))];}
function group(layers){const g=new THREE.Group();g.add(...layers);g.userData.dispose=()=>layers.forEach(l=>l.userData.dispose());return g;}
const ease=f=>1-(1-f)**3;
// Each recipe returns the layers for one effect kind and an update(f,layers,effect) that animates them over the effect's life (f: 0 → 1).
const RECIPES={
 burst:(e,c)=>({layers:[layer('circle_03',c,{size:e.radius*2}),layer('scorch_02',c,{size:e.radius*2}),layer('star_09','#ffffff',{size:e.radius*1.4})],
  update(f,[ring,core,flash]){ring.scale.setScalar(e.radius*2*(.4+ease(f)*.9));ring.material.opacity=1-f;core.scale.setScalar(e.radius*2*(.7+f*.3));core.material.opacity=(1-f)*.9;core.material.rotation=f;flash.material.opacity=Math.max(0,1-f*3);}}),
 zone:(e,c)=>({layers:[layer('circle_02',c,{size:e.radius*2})],update(f,[ring]){ring.scale.setScalar(e.radius*2*(.85+f*.2));ring.material.opacity=(1-f)*.8;}}),
 heal:(e,c)=>({layers:[layer('light_01',c,{size:e.radius*2}),layer('twirl_01',c,{size:e.radius*1.6}),layer('star_06','#ffffff',{size:1.2})],
  update(f,[glow,twirl,spark]){glow.material.opacity=(1-f)*.7;twirl.material.rotation=-f*4;twirl.material.opacity=1-f;twirl.position.z=-f*.8;spark.position.z=-.6-f*2;spark.material.opacity=1-f;spark.scale.setScalar(1.2*(1-f*.5));}}),
 buff:(e,c)=>({layers:[layer('twirl_01',c,{size:e.radius*1.2}),layer('circle_03',c,{size:e.radius*1.4})],
  update(f,[twirl,ring]){twirl.material.rotation=f*6;twirl.material.opacity=1-f;ring.scale.setScalar(e.radius*1.4*(.6+ease(f)*.6));ring.material.opacity=(1-f)*.8;}}),
 level:(e,c)=>({layers:[layer('muzzle_04','#ffd36a',{blend:'add',size:4}),layer('circle_03','#ffd36a',{blend:'add',size:e.radius*1.6}),layer('star_09','#fff4c8',{blend:'add',size:2.6})],
  update(f,[pillar,ring,star]){pillar.scale.set(2.4,5*(.6+ease(f)*.6),1);pillar.position.z=-2.2;pillar.material.opacity=1-f;ring.scale.setScalar(e.radius*1.6*(.3+ease(f)*.9));ring.material.opacity=1-f;star.position.z=-3.6-f;star.material.opacity=Math.max(0,1-f*1.5);star.material.rotation=f*2;}}),
 learn:(e,c)=>({layers:[layer('star_06',c,{blend:'add',size:1.8}),layer('circle_02',c,{blend:'add',size:1.6})],
  update(f,[star,ring]){star.position.z=-1.6-f;star.material.opacity=1-f;star.material.rotation=f*3;ring.scale.setScalar(1.6*(.5+ease(f)));ring.material.opacity=1-f;}}),
 death:(e,c)=>({layers:[layer('smoke_10','#3b3b44',{blend:'normal',size:e.radius*2}),layer('impact',c,{size:e.radius*2.4,sheet:true})],
  update(f,[smoke,hit]){smoke.scale.setScalar(e.radius*2*(.5+ease(f)*.8));smoke.material.opacity=(1-f)*.8;frame(hit,f*1.6);hit.material.opacity=f<.6?1:0;}}),
 collapse:(e,c)=>({layers:[layer('explosion','#ffffff',{blend:'normal',size:e.radius*2.4,sheet:true}),layer('circle_03','#ffb35c',{blend:'add',size:e.radius*2})],
  update(f,[boom,ring]){frame(boom,f);boom.position.z=-1.5;ring.scale.setScalar(e.radius*2*(.3+ease(f)*1.2));ring.material.opacity=Math.max(0,1-f*1.6);}}),
 dash:(e,c)=>({layers:[layer('smoke_03','#d8ccb0',{blend:'normal',size:e.radius*2})],update(f,[dust]){dust.scale.setScalar(e.radius*2*(.6+f*.6));dust.material.opacity=(1-f)*.55;dust.material.rotation=e.id%6+f;}}),
 silence:(e,c)=>({layers:[layer('magic_03','#c792ff',{size:e.radius*2}),layer('circle_02','#c792ff',{size:e.radius*2})],
  update(f,[rune,ring]){rune.material.rotation=f*2;rune.material.opacity=1-f;ring.scale.setScalar(e.radius*2*(.7+ease(f)*.4));ring.material.opacity=1-f;}}),
 beam:(e,c)=>({layers:[layer('spark_07',c),layer('spark_07','#ffffff')],
  update(f,layers){const len=Math.hypot(e.endX-e.x,e.endZ-e.z),angle=-Math.atan2(e.endZ-e.z,e.endX-e.x);layers.forEach((l,i)=>{l.scale.set(len,e.radius*(i?.5:1.2)*(1-f*.5),1);l.position.set((e.endX-e.x)/2,0,(e.endZ-e.z)/2);l.material.rotation=angle;l.material.opacity=1-f;});}})
};
Object.assign(RECIPES,{
 sigil:(e,c)=>({layers:[layer('magic_02',c,{size:e.radius*2}),layer('light_01',c,{size:e.radius*1.6}),layer('flare_01','#ffffff',{size:e.radius*1.8})],
  update(f,[rune,glow,flare]){rune.scale.setScalar(e.radius*2*(.6+ease(f)*.5));rune.material.rotation=f*2.5;rune.material.opacity=Math.min(1,(1-f)*1.6);glow.material.opacity=(1-f)*.6;flare.material.opacity=Math.max(0,1-f*2.5);flare.material.rotation=-f;}}),
 shield:(e,c)=>({layers:[layer('circle_03',c,{size:e.radius*2}),layer('light_02',c,{size:e.radius*2}),layer('star_06','#ffffff',{size:1.4})],
  update(f,[bubble,glow,star]){bubble.scale.setScalar(e.radius*2*(.75+ease(f)*.3));bubble.material.opacity=f<.7?1:(1-f)/.3;glow.material.opacity=(1-f)*.45;star.position.set(e.radius*.6,0,-e.radius*.7);star.material.opacity=Math.max(0,1-f*2);star.material.rotation=f*3;}}),
 poof:(e,c)=>({layers:[layer('smoke_10','#f4f0ff',{blend:'normal',size:e.radius*2}),layer('star_09',c,{size:e.radius*1.4})],
  update(f,[smoke,star]){smoke.scale.setScalar(e.radius*2*(.6+ease(f)*.6));smoke.material.opacity=(1-f)*.85;star.material.opacity=Math.max(0,1-f*2);}})
});
RECIPES.mana=RECIPES.heal;RECIPES.purchase=RECIPES.learn;
const COLORS={heal:'#7ee85a',mana:'#69c6ff',purchase:'#ffe09b',learn:'#ffe09b'};
export function hasVfx(kind){return !!RECIPES[kind]&&textures.size>0;}
export function vfxObject(effect,teamColor){const recipe=RECIPES[effect.kind](effect,COLORS[effect.kind]||teamColor),g=group(recipe.layers);g.userData.recipe=recipe;recipe.update(0,recipe.layers);return g;}
export function updateVfx(object,effect){const f=1-effect.life/effect.duration;object.userData.recipe.update(Math.min(1,Math.max(0,f)),object.userData.recipe.layers);}
// Persistent skill zones: a slowly turning rune circle with a soft rim.
export function zoneObject(zone,color){const rune=layer('magic_02',color,{size:zone.radius*2}),rim=layer('circle_02',color,{size:zone.radius*2});rune.material.opacity=.45;rim.material.opacity=.6;const g=group([rune,rim]);rune.userData.ground=rim.userData.ground=true;return g;}
export function updateZone(object,zone,time){const [rune,rim]=object.children;rune.material.rotation=time*.8;rim.scale.setScalar(zone.radius*2*(1+Math.sin(time*5)*.03));}
// Flipbook hit sparks and the crescent melee swing, used by combat-fx.js.
export function impactLayer(color,size){return layer('impact',color,{size,sheet:true});}
export function bigHitLayer(size){return layer('bighit','#ffffff',{size,sheet:true});}
export {layer as vfxLayer,frame as vfxFrame};
