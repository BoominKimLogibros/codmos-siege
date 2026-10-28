import {OBSTACLES,brushAt} from './map-layout.js';
// Vision blockers are separate from movement: foliage casts a shadow, but only
// the trunk is solid. Water and buildings do not cut vision.
export const VISION_BLOCKERS=OBSTACLES.map(o=>({x:o.x,z:o.z+(o.kind==='rock'?-.28:.12),rx:o.kind==='tree'?1.15:o.r,rz:o.kind==='tree'?.65:.72}));
export const SIGHT_RANGES={champion:16,minion:11,clone:9,tower:16,guard:16,inhibitor:12,nexus:18};
export function sightRange(observer){return SIGHT_RANGES[observer.type]??SIGHT_RANGES[observer.kind]??0;}
export function visionSources(game,team){return [...game.units,...game.structures].filter(u=>u.team===team&&u.hp>0&&sightRange(u)>0);}
// Return the entry distance along a normalized ray, or Infinity for a clear ray.
export function rayBlockDistance(source,dx,dz,limit){
 let nearest=limit;
 for(const b of VISION_BLOCKERS){
  const ox=(source.x-b.x)/b.rx,oz=(source.z-b.z)/b.rz,c=ox*ox+oz*oz-1;
  if(c<=.001)continue; // Observers under foliage can still look outward.
  const vx=dx/b.rx,vz=dz/b.rz,a=vx*vx+vz*vz,half=ox*vx+oz*vz,d=half*half-a*c;
  if(d<0)continue;const hit=(-half-Math.sqrt(d))/a;if(hit>.03&&hit<nearest)nearest=hit;
 }
 return nearest;
}
export function clearSight(source,target){const dx=target.x-source.x,dz=target.z-source.z,d=Math.hypot(dx,dz);return d<.05||rayBlockDistance(source,dx/d,dz/d,d)>=d-.04;}
export function hasTeamVision(game,team,target,{concealBrush=false}={}){
 const brush=concealBrush&&!(target.revealed>0)?brushAt(target.x,target.z):null;
 for(const observer of visionSources(game,team)){
  if(Math.hypot(target.x-observer.x,target.z-observer.z)>sightRange(observer))continue;
  if(brush&&brushAt(observer.x,observer.z)?.id!==brush.id)continue;
  if(clearSight(observer,target))return true;
 }
 return false;
}
// Extra rays around silhouette corners keep the fog shadow stable while moving.
export function sightPolygon(source){
 const range=sightRange(source),angles=[];
 for(let i=0;i<80;i++)angles.push(i*Math.PI*2/80);
 for(const b of VISION_BLOCKERS)if(Math.hypot(source.x-b.x,source.z-b.z)<range+2){
  for(const [x,z]of [[b.x-b.rx,b.z-b.rz],[b.x+b.rx,b.z-b.rz],[b.x-b.rx,b.z+b.rz],[b.x+b.rx,b.z+b.rz]]){const a=Math.atan2(z-source.z,x-source.x);angles.push(a-.003,a,a+.003);}
 }
 return angles.map(a=>(a+Math.PI*2)%(Math.PI*2)).sort((a,b)=>a-b).map(a=>{const dx=Math.cos(a),dz=Math.sin(a),d=rayBlockDistance(source,dx,dz,range);return{x:source.x+dx*d,z:source.z+dz*d};});
}
