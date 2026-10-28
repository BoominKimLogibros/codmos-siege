import assert from 'node:assert/strict';
import {Survival} from '../src/survival/engine.js';
import {DashInput} from '../src/survival/dash-input.js';
import {SkillAim} from '../src/survival/skill-aim.js';
const close=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} != ${b}`);
function setup(){const g=new Survival(()=>.5);g.start();g.structures=[];g.effects=[];g.waveClock=999;const p=g.player,t=g.bot;p.x=p.z=0;p.stats.hpRegen5=0;p.skillRanks={q:1,w:1,e:1,r:1};t.x=3;t.z=0;t.hp=t.maxHp=10000;t.stun=999;t.attackCd=999;return{g,p,t};}
for(const dash of [false,true]){
 const {g,p,t}=setup();for(let i=0;i<8;i++)g.update(.05,{x:0,z:1,dash});assert.equal(p.attacks,0);assert.equal(g.shots.length,0);assert(p.z>0);g.basic(p,t);assert.equal(p.attacks,0,'moving character cannot manually trigger a basic either');
}
for(const speed of [.5,1,2.5]){
 const {g,p}=setup();p.stats.attackSpeed=speed;g.update(.05);assert(p.basicGesture);const duration=p.basicGesture.duration,attacks=p.attacks;while(p.basicGesture.elapsed+.05<duration-1e-8){g.update(.05,{x:0,z:1,dash:true});close(p.z,0);assert(!p.moving&&!p.dashing);}g.update(.05,{x:0,z:1,dash:true});assert(p.z>0);assert(p.dashing);assert.equal(p.attacks,attacks);assert(!g.gestureLocked());
}
for(const key of ['w','r']){
 const {g,p}=setup();g.update(.05,{x:0,z:1,dash:true});assert(p.dashing);const at={x:p.x,z:p.z};assert(g.cast(key,p,{x:5,z:0}));assert(!p.moving&&!p.dashing);let released=false;for(let i=0;i<30&&g.gestureLocked();i++){g.update(.05,{x:0,z:1,dash:true});if(g.gestureLocked()){close(p.x,at.x);close(p.z,at.z);assert(!p.dashing&&!p.moving);assert.equal(p.attacks,0);}if(!p.pendingCast)released=true;}assert(released);assert(p.z>at.z);assert(p.dashing);assert.equal(p.attacks,0);
}
{
 const {g,p}=setup();p.attackCd=999;g.update(.05,{x:0,z:1,dash:true});const start={x:p.x,z:p.z};g.cast('e',p,{x:8,z:p.z});for(let i=0;i<7;i++)g.update(.05,{x:0,z:1,dash:true});assert(p.x>start.x+7,'the dash skill itself still moves the character');close(p.z,start.z);assert(g.gestureLocked());for(let i=0;i<11;i++)g.update(.05,{x:0,z:1,dash:true});assert(p.z>start.z);assert(p.dashing);
}
{
 const dash=new DashInput();dash.down('ArrowRight',0);dash.up('ArrowRight');dash.down('ArrowRight',100);assert(dash.active);dash.clearTap();assert(dash.active);dash.down('ArrowUp',150);dash.up('ArrowRight');assert(dash.active,'direction change during aiming retains existing dash');dash.up('ArrowUp');assert(!dash.active);
 const {g,p}=setup(),aim=new SkillAim(g);g.update(.05,{x:1,z:0,dash:true});assert(aim.press('r'));assert(!p.moving&&!p.dashing);const pos={x:p.x,z:p.z};g.update(.05,{x:1,z:0,dash:true,aiming:true});close(p.x,pos.x);close(p.z,pos.z);assert(aim.release('r'));assert(g.gestureLocked());
}
console.log('PASS no walking/dash basic attacks, full attack/skill gesture movement lock at all AS, immediate cast stop, held-direction dash resume, intrinsic dash skills, aim stop and preserved dash input lifecycle');
