import assert from 'node:assert/strict';
import {Survival,HEROES} from '../src/survival/engine.js';
import {unitSkill,skillAtRank} from '../src/survival/skill-levels.js';
import {skillPower} from '../src/survival/stats.js';
import {canWalk} from '../src/survival/terrain.js';
const close=(a,b)=>assert(Math.abs(a-b)<1e-6,`${a} != ${b}`);
function setup(){const g=new Survival(()=>.5);g.start();g.structures=[];g.effects=[];g.waveClock=999;const p=g.player,t=g.bot;p.x=p.z=0;p.attackCd=999;p.stats.hpRegen5=p.stats.manaRegen5=0;p.skillRanks={q:1,w:1,e:1,r:1};p.faceX=1;p.faceZ=0;t.x=20;t.z=0;t.stun=999;t.attackCd=999;t.hp=t.maxHp=10000;t.stats.armor=t.stats.magicResist=t.stats.hpRegen5=0;return{g,p,t};}
function tick(g,n){for(let i=0;i<n;i++)g.update(.05);}
{
 const {g,p,t}=setup();close(p.range,3.1);close(p.stats.attackRange,155);p.attackCd=0;t.x=8;g.update(.05);assert.equal(p.attacks,0);t.x=2;const hp=t.hp;g.update(.05);assert.equal(p.attacks,1);assert(t.hp<hp);assert.equal(g.shots.length,0,'melee basic has no projectile');
}
for(const [x,z]of [[1,0],[-1,0],[0,1],[0,-1],[Math.SQRT1_2,Math.SQRT1_2]]){
 const {g,p}=setup();g.units=[p];p.faceX=x;p.faceZ=z;assert(g.cast('q',p,{x:-x*20,z:-z*20}));assert.equal(g.lastCast.mode,'direction');assert.equal(g.lastCast.targetId,null);tick(g,6);close(p.x,0);close(p.z,0);tick(g,5);close(p.x,x*3.6);close(p.z,z*3.6);assert.equal(g.shots.length,0);assert(g.gestureLocked());
}
{
 const {g,p,t}=setup();t.x=3.8;const hp=t.hp,power=skillPower(p,unitSkill(p,'q'));g.cast('q');tick(g,15);close(hp-t.hp,power);assert.equal(t.damageLog.filter(e=>e.ability.key==='q').length,1,'one hit per actor');
}
for(const pos of [-3,9]){const {g,t}=setup();t.x=pos;g.cast('q');tick(g,12);close(t.hp,t.maxHp);}
for(let rank=1;rank<=5;rank++){
 const {g,p}=setup();p.skillRanks.w=rank;assert.equal(unitSkill(p,'w').count,rank);g.cast('w');g.advanceCast(p,p.pendingCast.remaining);const clones=g.units.filter(u=>u.kind==='clone'&&u.hp>0);assert.equal(clones.length,rank);assert(clones.every(c=>c.ownerId===p.id&&c.range===2.5&&canWalk(c.x,c.z,c.collisionRadius,g.structures)));const actors=[p,...clones],positions=new Map(actors.map(u=>[u.id,{x:u.x,z:u.z}])),mana=p.mana;p.faceX=1;p.faceZ=0;assert(g.cast('q'));assert(clones.every(c=>c.pendingCast?.key==='q'));tick(g,6);for(const u of actors){close(u.x,positions.get(u.id).x);close(u.z,positions.get(u.id).z);}tick(g,1);assert.equal(g.effects.filter(e=>e.kind==='rasengan').length,rank+1);assert(clones.every(c=>c.castGesture?.motion==='attack'));tick(g,4);for(const u of actors){close(u.x-positions.get(u.id).x,3.6);close(u.z,positions.get(u.id).z);}close(p.mana,mana-unitSkill(p,'q').manaCost);assert.equal(g.shots.length,0);
}
{
 const {g,p}=setup();p.skillRanks.w=5;g.cast('w');g.advanceCast(p,p.pendingCast.remaining);const old=g.units.filter(u=>u.kind==='clone').map(u=>u.id);p.cooldowns.w=0;p.mana=p.maxMana;g.cast('w');g.advanceCast(p,p.pendingCast.remaining);assert.equal(g.units.filter(u=>u.kind==='clone'&&u.hp>0).length,5);assert(g.units.filter(u=>old.includes(u.id)).every(u=>u.hp===0));
}
{
 const {g,p,t}=setup();g.cast('w');g.advanceCast(p,p.pendingCast.remaining);const clone=g.units.find(u=>u.kind==='clone');g.waveSpawn();const victim=g.units.find(u=>u.kind==='minion'&&u.team!==p.team);victim.x=3;victim.z=clone.z;victim.hp=1;victim.stun=999;victim.attackCd=999;g.units=[p,t,clone,victim];const meso=p.meso;g.cast('q');tick(g,12);assert.equal(victim.hp,0);assert.equal(p.meso,meso+20);assert.equal(g.rewards[0].recipientId,p.id);
}
for(const reason of ['death','stun']){
 const {g,p,t}=setup();g.cast('w');g.advanceCast(p,p.pendingCast.remaining);const clone=g.units.find(u=>u.kind==='clone');g.cast('q');if(reason==='death')g.hit(p,1e9,t);else p.stun=1;tick(g,8);assert(!clone.pendingCast&&!clone.rasenganDash);assert(!g.effects.some(e=>e.kind==='rasengan'));
}
{
 const {g,p,t}=setup();p.x=-35;p.z=-11.5;t.x=-29.9;t.z=-11.5;assert(canWalk(p.x,p.z,p.collisionRadius,g.structures));g.cast('q');tick(g,12);assert(p.x<-33);assert(canWalk(p.x,p.z,p.collisionRadius,g.structures));close(t.hp,t.maxHp);
}
assert(skillAtRank('naruto','q',5).damage>skillAtRank('naruto','q',1).damage);assert.equal(HEROES.find(h=>h.id==='naruto').attack,'knight');
console.log('PASS melee basic, directional short Q/no ranged bolt, full anticipation and collision-safe timed lunge, single melee hit, W 1–5 clones/replacement, synchronized clone Q, one mana cost, kill credit, cancellation and rank scaling');
