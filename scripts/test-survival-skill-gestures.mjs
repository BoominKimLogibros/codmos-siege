import assert from 'node:assert/strict';
import {Survival,HEROES} from '../src/survival/engine.js';
import {KEYS} from '../src/survival/kits.js';
import {skillGesture} from '../src/survival/skill-cast.js';
import {unitSkill} from '../src/survival/skill-levels.js';
const close=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} != ${b}`);
function setup(hero='naruto'){const g=new Survival(()=>.5);g.start(hero);g.structures=[];g.effects=[];g.waveClock=999;const p=g.player,t=g.bot;p.skillRanks={q:1,w:1,e:1,r:1};p.x=p.z=0;p.attackCd=999;p.shield=200;p.stats.hpRegen5=p.stats.manaRegen5=0;t.x=3;t.z=0;t.hp=t.maxHp=10000;t.stun=999;t.attackCd=999;return{g,p,t};}
let count=0;
for(const hero of HEROES)for(const key of KEYS){
 const {g,p,t}=setup(hero.id),spec=unitSkill(p,key),gesture=skillGesture(spec),mana=p.mana;
 let releases=0;const execute=g.executeSkill;g.executeSkill=function(...args){releases++;return execute.apply(this,args);};
 assert(g.cast(key,p,t));assert(p.pendingCast);assert.equal(p.castGesture.motion,gesture.motion);close(p.mana,mana-spec.manaCost);assert.equal(g.lastCast.phase,'windup');assert.equal(g.shots.length+g.zones.length+g.effects.length,0);assert.equal(g.units.length,2);assert(!g.cast(key));assert(!g.canCast(KEYS.find(k=>k!==key)));close(p.mana,mana-spec.manaCost);
 while(p.pendingCast.remaining>.05+1e-8){g.update(.05,{x:0,z:1,dash:true});assert.equal(releases,0);close(p.x,0);close(p.z,0);assert.equal(p.attacks,0);assert(p.castGesture.elapsed<gesture.windup);}
 g.update(.05);assert.equal(releases,1,hero.id+key);assert(!p.pendingCast);assert.equal(g.lastCast.phase,'released');assert(g.time>=gesture.windup-1e-8);for(let i=0;i<5;i++)g.update(.05);assert.equal(releases,1);count++;
}
for(const reason of ['death','stun','silence']){
 const {g,p}=setup();assert(g.cast('r',p,{x:3,z:0}));if(reason==='death')g.hit(p,1e9,g.bot);else p[reason]=1;g.update(.05);assert(!p.pendingCast);assert(!p.castGesture);assert(!g.effects.some(e=>e.kind==='burst'));if(reason==='death'){p.respawn=.01;g.update(.05);assert(p.hp>0&&!p.pendingCast);}
}
{
 const {g,p}=setup();g.cast('w');const remaining=p.pendingCast.remaining,elapsed=p.castGesture.elapsed;g.pause();for(let i=0;i<20;i++)g.update(.05);close(p.pendingCast.remaining,remaining);close(p.castGesture.elapsed,elapsed);assert.equal(g.units.length,2);g.pause();for(let i=0;i<8;i++)g.update(.05);assert.equal(g.units.filter(u=>u.kind==='clone').length,1);
}
for(const reason of ['dead','range','hidden']){
 const {g,p,t}=setup('nova');assert(g.cast('q',p,t));if(reason==='dead')t.hp=0;else if(reason==='range')t.x=50;else{t.x=-48;t.z=7.5;}for(let i=0;i<7;i++)g.update(.05);assert(!p.pendingCast);assert.equal(g.shots.length,0,reason+' target fizzles');
}
{
 const {g,p,t}=setup();g.cast('r',p,t);const fixed={...p.pendingCast.point};t.x=12;for(let i=0;i<7;i++)g.update(.05);assert.equal(t.hp,t.maxHp,'enemy can move out of a committed ground cast');close(g.lastCast.point.x,fixed.x);while(p.castGesture&&p.castGesture.elapsed+.05<p.castGesture.duration-1e-8){g.update(.05,{x:0,z:-1});close(p.z,0);}g.update(.05,{x:0,z:-1});assert(p.z<0);assert(!p.castGesture,'movement resumes only after the full gesture');
}
{
 const {g,p,t}=setup('jet');g.cast('w');g.hit(p,1,t,{basic:true});assert(p.pendingCast&&p.hitFlash>0);for(let i=0;i<8;i++)g.update(.05);assert(p.buffs.speed>0,'ordinary damage does not interrupt buff anticipation');
}
console.log(`PASS ${count} delayed skills, attack/defend anticipation, one release, no movement/basic attacks/queue during windup, pause, CC/death cancellation, target revalidation, dodgeable committed area and recovery movement`);
