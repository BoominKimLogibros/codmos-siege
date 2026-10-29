import * as THREE from 'three';
import {paintGround} from './map-paint.js';
import {footprint} from './footprints.js';
import {MAP,SCENERY,OBSTACLES,BRUSHES,PONDS} from './map-layout.js';
const ROOT='/survival/map/';
const images=new Map(),textures=new Map();
const names={lane:'planet__path_beige',base:'planet__path_bluegray',grass:'multi_objects__ground_olive_003',brush:'multi_objects__grass_cluster_080',smallGrass:'multi_objects__grass_single_078',doubleGrass:'multi_objects__grass_double_079',tree:'multi_objects__broadleaf_tree_complete',palm:'multi_objects__palm_tree_03_complete',lily:'multi_objects__lily_pads_082'};
const rocks=['multi_objects__rock_cluster_86_086','multi_objects__rock_cluster_87_087','multi_objects__rock_cluster_94_094'];
const waters={tl:'multi_objects__water_green_corner_top_left_006',t:'multi_objects__water_green_edge_top_007',tr:'multi_objects__water_green_corner_top_right_008',l:'multi_objects__water_green_edge_left_012',c:'multi_objects__water_green_center_013',r:'multi_objects__water_green_edge_right_014',bl:'multi_objects__water_green_corner_bottom_left_018',b:'multi_objects__water_green_edge_bottom_019',br:'multi_objects__water_green_corner_bottom_right_020'};
export async function loadFieldAssets(){
 const loader=new THREE.TextureLoader();await Promise.all([...new Set([...Object.values(names),...rocks,...Object.values(waters),...['blue','red'].flatMap(t=>['tower','inhibitor','nexus'].map(k=>`${t}-${k}`))])].map(async name=>{
  const texture=await loader.loadAsync(ROOT+name+'.png');texture.colorSpace=THREE.SRGBColorSpace;texture.minFilter=THREE.LinearFilter;texture.generateMipmaps=false;textures.set(name,texture);images.set(name,texture.image);
 }));
}
export function createField(scene){
 const canvas=document.createElement('canvas');canvas.width=SCENERY.width*20;canvas.height=SCENERY.height*20;const {ctx,unit,px,pz}=(()=>{const p=paintGround(canvas,images,SCENERY);return{ctx:p.ctx,unit:p.unit,px:p.X,pz:p.Z};})();
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const geometry=new THREE.PlaneGeometry(SCENERY.width,SCENERY.height);geometry.rotateX(-Math.PI/2);const ground=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({map:texture}));ground.position.y=-.2;ground.renderOrder=-1000;scene.add(ground);
 const decorations=[];
 function sprite(name,x,z,width,height=width,anchor=.14,opacity=1){
  const material=new THREE.SpriteMaterial({map:textures.get(name),transparent:true,depthWrite:false,opacity,alphaTest:.02}),obj=new THREE.Sprite(material);obj.center.set(.5,anchor);obj.scale.set(width,height,1);obj.position.set(x,0,z);obj.renderOrder=100+z;scene.add(obj);decorations.push(obj);return obj;
 }
 const trees=[];
 for(const o of OBSTACLES){
  const f=footprint(o);ctx.fillStyle=o.kind==='rock'?'#354936':'#3d5033';ctx.strokeStyle=o.kind==='rock'?'#acac80':'#7a8750';ctx.lineWidth=.12*unit;ctx.beginPath();ctx.ellipse(px(o.x),pz(o.z+f.z),f.rx*unit,f.rz*unit,0,0,Math.PI*2);ctx.fill();ctx.stroke();
  if(o.kind==='rock'){const rock=sprite(rocks[o.art],o.x,o.z,4.4,3.6,.12);rock.material.color.set('#d0d0b8');for(const dx of [-1.1,1.2])sprite(names.smallGrass,o.x+dx,o.z+.3,.9,.9,.15,.9);}
  else{const tree=sprite(o.art===0?names.palm:names.tree,o.x,o.z,4.8,9.6,.04);trees.push(tree);}
 }
 // Background forest: staggered trunks and overlapping crowns conceal the rectangular bounds.
 let seed=7183;const random=()=>{seed=seed*16807%2147483647;return seed/2147483647;};
 function woodlandTree(x,z,distant=false){
  const width=(distant?5.8:4.6)+random()*1.8,tree=sprite(random()<.22?names.palm:names.tree,x,z,width,width*2,.04);
  tree.material.color.set(distant?'#9cae94':'#c6d0b4');trees.push(tree);
 }
 for(const sign of [-1,1]){
  for(const row of [0,1,2])for(let x=-140;x<144;x+=5.2){
   const z=sign*(23+row*5+random()*2.8);woodlandTree(x+(random()-.5)*3,z,row>0);
   if(row===0&&random()>.3)sprite(names.brush,x+random()*2,sign*(21.5+random()*1.4),2.5+random(),2.6,.18,.95);
  }
 }
 for(const sign of [-1,1])for(const row of [0,1])for(let z=-22;z<=24;z+=4.8){
  woodlandTree(sign*(124+row*5+random()*2.5),z+(random()-.5)*2,row>0);
  if(row===0)sprite(names.brush,sign*(121.3+random()),z,2.8,2.8,.18,.95);
 }
 const brushSprites=[];
 for(const b of BRUSHES){
  // Match the visible leafy ground patch to the exact walkable brush rectangle.

  for(const row of [0,1.4])for(let i=0;i<5;i++){
   const s=sprite(i%2?names.doubleGrass:names.brush,b.x+(i-2)*1.7,b.z+row,2.7,2.7,.2,.96);s.userData.brush=b;brushSprites.push(s);
  }
 }
 for(const p of PONDS)sprite(names.lily,p.x+2,p.z+1,2.4,2.4,.5);
 // Small grass tufts are decoration; the taller dense patches alone grant cover.
 for(let x=-112;x<=112;x+=12)for(const z of [-5,5])if(!BRUSHES.some(b=>Math.abs(b.x-x)<6))sprite(names.smallGrass,x,z,1.4,1.4,.15,.8);
 texture.needsUpdate=true;
 const minimapCanvas=document.createElement('canvas');minimapCanvas.width=MAP.width*20;minimapCanvas.height=MAP.height*20;minimapCanvas.getContext('2d').drawImage(canvas,(MAP.minX-SCENERY.minX)*20,(MAP.minZ-SCENERY.minZ)*20,MAP.width*20,MAP.height*20,0,0,minimapCanvas.width,minimapCanvas.height);
 return{canvas:minimapCanvas,decorations,update(player,visibleUnits=player?[player]:[]){for(const tree of trees)tree.material.opacity=visibleUnits.some(u=>Math.abs(u.x-tree.position.x)<2.4&&u.z>tree.position.z-5&&u.z<tree.position.z+.4)?.35:1;for(const s of brushSprites){const b=s.userData.brush;s.material.opacity=player&&Math.abs(player.x-b.x)<b.w/2&&Math.abs(player.z-b.z)<b.h/2?.48:.96;}}};
}
export function structureTexture(type,team){return textures.get(`${team}-${type==='guard'?'tower':type}`);}

const footprintTextures=new Map();
export function structureFootprintTexture(type,team){
 const key=type+team;if(footprintTextures.has(key))return footprintTextures.get(key);
 const c=document.createElement('canvas');c.width=512;c.height=160;const x=c.getContext('2d');
 x.fillStyle='#455246';x.beginPath();x.ellipse(256,80,252,76,0,0,Math.PI*2);x.fill();
 x.strokeStyle='#c4bd97';x.lineWidth=9;x.stroke();x.strokeStyle=team==='blue'?'#6b9b9e':'#b97a74';x.lineWidth=3;x.beginPath();x.ellipse(256,79,236,63,0,0,Math.PI*2);x.stroke();
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;footprintTextures.set(key,texture);return texture;
}
