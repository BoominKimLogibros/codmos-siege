import {unitSkill} from './skill-levels.js';
import {MAP,moveOnMap} from './terrain.js';
import {movementRadius} from './footprints.js';
export function clampSkillPoint(unit,point,spec){
 let x=Number.isFinite(point?.x)?point.x:unit.x,z=Number.isFinite(point?.z)?point.z:unit.z;
 x=Math.max(MAP.minX+.05,Math.min(MAP.maxX-.05,x));z=Math.max(MAP.minZ+.05,Math.min(MAP.maxZ-.05,z));
 const dx=x-unit.x,dz=z-unit.z,d=Math.hypot(dx,dz),r=spec.castRange;
 return d>r&&d>0?{x:unit.x+dx/d*r,z:unit.z+dz/d*r}:{x,z};
}
export function skillPreview(game,key,point,unit=game.player){
 const spec=unitSkill(unit,key),aim=clampSkillPoint(unit,point,spec),dx=aim.x-unit.x,dz=aim.z-unit.z,len=Math.hypot(dx,dz),fx=len>.01?dx/len:(unit.faceX||0)/(Math.hypot(unit.faceX||0,unit.faceZ||0)||1),fz=len>.01?dz/len:(unit.faceZ||0)/(Math.hypot(unit.faceX||0,unit.faceZ||0)||1),angle=Math.atan2(fz,fx);
 const preview={key,shape:spec.shape,origin:{x:unit.x,z:unit.z},point:aim,range:spec.castRange,radius:spec.radius||0,angle,width:(spec.width||(['shot','pierce','charm','return'].includes(spec.kind)?spec.kind==='charm'?.65:.6:1.3))*2,valid:true};
 if(spec.shape==='line'){preview.end={x:unit.x+fx*spec.castRange,z:unit.z+fz*spec.castRange};}
 if(spec.shape==='cone'||spec.shape==='fan'){preview.halfAngle=spec.shape==='fan'?(spec.count-1)*.14:Math.acos(.25);preview.radius=spec.castRange;}
 if(spec.shape==='dash'||spec.shape==='blink'){
  const end={x:unit.x,z:unit.z,r:movementRadius(unit)};moveOnMap(end,dx,dz,end.r,game.structures);preview.end={x:end.x,z:end.z};preview.radius=spec.shape==='blink'?3:spec.kind==='rhythm'?4:0;preview.width=spec.shape==='blink'?0:4;preview.blocked=Math.hypot(end.x-aim.x,end.z-aim.z)>.15;
 }
 return preview;
}
export class SkillAim {
 constructor(game){this.game=game;this.active=null;}
 press(key,preferred=null){
  if(this.active||!this.game.canCast(key))return false;
  const p=this.game.player,spec=unitSkill(p,key);
  if(spec.targeting!=='aim')return this.game.cast(key,p,preferred||undefined);
  const target=['heal','shield'].includes(spec.kind)?this.game.units.filter(u=>u.hp>0&&u.team===p.team&&Math.hypot(u.x-p.x,u.z-p.z)<=spec.castRange).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0]:this.game.nearest(p,spec.castRange),f=Math.hypot(p.faceX||0,p.faceZ||0),fx=f?(p.faceX||0)/f:p.team==='blue'?1:-1,fz=f?(p.faceZ||0)/f:0,fallback={x:p.x+fx*Math.min(spec.castRange,6),z:p.z+fz*Math.min(spec.castRange,6)};
  let initial=preferred||target||fallback;
  if(spec.kind==='retreat'&&!preferred){
   const dx=target?target.x-p.x:fx,dz=target?target.z-p.z:fz,d=Math.hypot(dx,dz);
   initial={x:p.x-(d>.01?dx/d:fx)*spec.castRange,z:p.z-(d>.01?dz/d:fz)*spec.castRange};
  }
  this.active={key,point:clampSkillPoint(p,initial,spec)};p.moving=false;p.dashing=false;this.game.destination=null;this.game.aim={...this.active.point};return true;
 }
 update(dt,input){
  if(!this.active)return;
  const {key}=this.active;if(!this.game.canCast(key)){this.cancel();return;}
  const x=input.x||0,z=input.z||0,len=Math.hypot(x,z),point={...this.active.point};
  if(len){point.x+=x/len*14*dt;point.z+=z/len*14*dt;}
  this.setPoint(point);
 }
 setPoint(point){if(!this.active)return;this.active.point=clampSkillPoint(this.game.player,point,unitSkill(this.game.player,this.active.key));this.game.aim={...this.active.point};}
 release(key){if(!this.active||this.active.key!==key)return false;const {point}=this.active;this.active=null;return this.game.cast(key,this.game.player,point);}
 cancel(){const was=!!this.active;this.active=null;return was;}
 get preview(){return this.active?skillPreview(this.game,this.active.key,this.active.point):null;}
}
