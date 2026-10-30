// Casting/stat fixtures start with learned rank-1 spells; allocation rules have separate progression tests.
import assert from 'node:assert/strict';
import {Survival,HEROES} from '../src/survival/engine.js';
import {KITS,KEYS} from '../src/survival/kits.js';
import {SkillAim,skillPreview} from '../src/survival/skill-aim.js';
const releaseCast=(g,u=g.player)=>{if(u.pendingCast)g.advanceCast(u,u.pendingCast.remaining);};
const close=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} != ${b}`);
function setup(id){const g=new Survival(()=>.5);g.start(id);g.player.skillRanks={q:1,w:1,e:1,r:1};g.structures=[];g.waveClock=999;g.player.x=g.player.z=0;g.player.attackCd=999;g.bot.x=8;g.bot.z=0;g.bot.hp=g.bot.maxHp=10000;g.bot.stun=999;g.bot.attackCd=999;g.aim={x:4,z:0};return{g,a:new SkillAim(g),p:g.player,t:g.bot};}
const counts={target:0,self:0,aim:0,direction:0};
for(const hero of HEROES)for(const key of KEYS){
 const spec=KITS[hero.id][key];counts[spec.targeting]++;assert(['target','self','aim','direction'].includes(spec.targeting));
 const {g,a,p,t}=setup(hero.id),mana=p.mana;
 assert(a.press(key,{x:3,z:0}),hero.id+key);
 if(spec.targeting==='aim'){
  assert(a.active&&a.preview);close(p.mana,mana);close(p.cooldowns[key],0);
  const before={x:p.x,z:p.z};g.update(.05,{x:1,z:1,aiming:true});close(p.x,before.x);close(p.z,before.z);assert.equal(p.attacks,0,'no automatic attack while aiming');
  const point={...a.active.point};a.update(.1,{x:1,z:0});assert(a.active.point.x>point.x||Math.hypot(a.active.point.x-p.x,a.active.point.z-p.z)>=spec.castRange-.01);assert(!a.press('q'));assert(!a.release(key==='q'?'w':'q'));assert(a.active);
  const chosen={...a.active.point};assert(a.release(key));assert(!a.active);assert(p.cooldowns[key]>0);assert(p.mana<mana);assert.equal(g.lastCast.mode,'aim');close(g.lastCast.point.x,chosen.x);close(g.lastCast.point.z,chosen.z);
  const cancel=setup(hero.id),c=cancel.a;assert(c.press(key));assert(c.cancel());assert(!c.release(key));close(cancel.p.mana,cancel.p.maxMana);close(cancel.p.cooldowns[key],0);cancel.g.update(.05,{x:1,z:0});assert(cancel.p.x>0,'movement resumes after cancellation');
 }else{
  assert(!a.active);assert(p.cooldowns[key]>0&&p.mana<mana);if(spec.targeting==='target'){assert.equal(g.lastCast.targetId,t.id);const empty=setup(hero.id);empty.g.units=[empty.p];assert(!empty.a.press(key));close(empty.p.mana,empty.p.maxMana);close(empty.p.cooldowns[key],0);}
  assert(!a.release(key));
 }
}
assert.equal(counts.target+counts.self+counts.aim+counts.direction,HEROES.length*4);
for(const reason of ['death','stun','silence','pause','mana']){const {g,a,p}=setup('naruto');a.press('r');if(reason==='death')p.hp=0;if(reason==='stun')p.stun=1;if(reason==='silence')p.silence=1;if(reason==='pause')g.pause();if(reason==='mana')p.mana=0;a.update(.05,{x:0,z:0});assert(!a.active,reason+' cancels aim');assert.equal(p.cooldowns.r,0);}
{const {g,a,p}=setup('nova');g.units=[p];p.x=-48;p.z=0;const enemy=g.bot;enemy.x=-48;enemy.z=7.5;g.units.push(enemy);assert(!a.press('q'),'hidden brush target cannot be locked');enemy.z=0;enemy.x=p.x+17;assert(!a.press('q'),'out of range');enemy.x=p.x+4;enemy.invulnerable=1;assert(!a.press('q'),'invulnerable target');enemy.invulnerable=0;assert(a.press('q'));}
// Lock-on attacks cannot be intercepted by another minion.
{const {g,p,t}=setup('nova');const blocker={id:2000,kind:'minion',type:'melee',team:t.team,x:3,z:0,hp:100,maxHp:100,r:.4,stun:999,attackCd:999,buffs:{}};g.units.push(blocker);assert(g.cast('q',p,t));releaseCast(g);assert.equal(g.shots[0].targetId,t.id);for(let i=0;i<10;i++)g.update(.05);close(blocker.hp,100);assert(t.hp<t.maxHp);}
// Near-coincident dash endpoints must not produce enormous separation velocities.
{const {g,p,t}=setup('naruto');assert(g.cast('e',p,t));releaseCast(g);g.update(.05);assert(Number.isFinite(p.x)&&Number.isFinite(t.x));assert(Math.hypot(p.x-t.x,p.z-t.z)<1);}
// The preview and real movement agree when a rock blocks the desired destination.
{const {g,p}=setup('naruto');p.x=-37;p.z=-11.5;const point={x:-28,z:-11.5},preview=skillPreview(g,'e',point);assert(preview.blocked);assert(g.cast('e',p,point));releaseCast(g);close(p.x,preview.end.x);close(p.z,preview.end.z);}
// Area-based silence and support resolve at the chosen point, not the caster.
{const {g,p,t}=setup('danso');p.x=0;t.x=9;g.cast('w',p,{x:9,z:0});releaseCast(g);assert(t.silence>0);}
{const {g,p}=setup('int');p.hp-=100;const ally={id:3000,kind:'minion',team:p.team,x:9,z:0,hp:1,maxHp:100,r:.4};g.units.push(ally);const hp=p.hp;assert(g.cast('w',p,{x:9,z:0}));releaseCast(g);assert(ally.hp>1);close(p.hp,hp);}
console.log(`PASS ${HEROES.length*4} skill contracts`,counts,'hold/move/release, no early costs/autoattack, cancellation/lifecycle, target eligibility, homing lock, exact dash collisions and selected-area support/CC');

{const {g,a,p,t}=setup('lucy');assert(a.press('e'));assert(a.active.point.x<p.x,'backstep starts away from the enemy');assert(a.release('e'));releaseCast(g);assert(p.x<0);assert(g.shots.some(s=>s.targetId===t.id));}
