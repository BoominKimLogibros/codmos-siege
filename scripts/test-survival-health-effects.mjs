import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {Survival,HEROES} from '../src/survival/engine.js';
import {HealthEffects,HEALTH_EFFECT_PATHS} from '../src/survival/health-effects.js';
import {normalizeCastEffect} from '../src/survival/cast-effects.js';
const close=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} != ${b}`);
function setup(id='naruto'){const g=new Survival(()=>.5);g.start(id);g.waveClock=999;g.structures=[];g.effects=[];const p=g.player,t=g.bot;p.x=p.z=0;p.attackCd=999;p.stats.hpRegen5=p.stats.manaRegen5=0;p.skillRanks={q:1,w:1,e:1,r:1};t.x=3;t.z=0;t.stun=999;t.attackCd=999;return{g,p,t};}
const health=g=>g.effects.filter(e=>e.kind==='health'),release=g=>g.advanceCast(g.player,g.player.pendingCast.remaining);
{
 const {g,p}=setup('int');g.units=[p];p.hp-=100;const ally=g.champion(HEROES[0],p.team,false);ally.x=8;ally.z=0;ally.hp-=100;const own=p.hp,old=ally.hp;g.cast('w',p,ally);assert.equal(health(g).length,0);release(g);assert(ally.hp>old);close(p.hp,own);assert.equal(health(g)[0].targetId,ally.id);assert.equal(health(g)[0].sourceId,p.id);assert.equal(health(g)[0].direction,'up');assert.equal(health(g)[0].reason,'skill');
}
for(const id of ['int','young-forty']){
 const {g,p}=setup(id);p.hp=p.maxHp*.2;const before=p.hp;for(let i=0;i<10;i++)g.update(.05);assert(p.hp>before);assert.equal(health(g).filter(e=>e.targetId===p.id).length,1);const effect=health(g).find(e=>e.targetId===p.id),life=effect.life;g.pause();g.update(.05);close(effect.life,life);g.pause();for(let i=0;i<20;i++)g.update(.05);assert(health(g).filter(e=>e.targetId===p.id).length<=1);assert(health(g).some(e=>e.id!==effect.id),'continued regen can replay after a gap');
}
{
 const {g,p}=setup('young-forty');p.hp=p.maxHp*.7;g.cast('w');release(g);assert.equal(health(g).length,0);g.update(.05);assert(health(g).some(e=>e.reason==='regen'&&e.direction==='up'));
}
{
 const {g,p,t}=setup('gumiho');p.hp-=100;g.hit(t,50,p,{basic:true});assert(health(g).some(e=>e.targetId===p.id&&e.reason==='passive'&&e.direction==='up'));assert(!health(g).some(e=>e.targetId===t.id));
}
{
 const {g,p,t}=setup('bora');p.hp-=100;g.cast('e',p,t);release(g);assert(health(g).some(e=>e.targetId===p.id&&e.reason==='drain'));g.effects=[];g.hit(t,1,p,{poison:3,poisonDmg:10});g.update(.05);assert(health(g).some(e=>e.targetId===t.id&&e.direction==='down'&&e.reason==='debuff'));
}
for(const id of ['naruto','lucy','jet','nova','danso']){
 const {g,p,t}=setup(id);p.range=2;p.attacks=id==='naruto'?2:id==='lucy'?3:0;if(id==='jet')p.charge=5;if(['nova','danso'].includes(id))p.marks[t.id]=2;
 if(id==='danso')g.hit(t,5,p,{skill:true});else g.basic(p,t);assert(health(g).some(e=>e.targetId===t.id&&e.direction==='down'),id+' empowered damage');
}
{
 const {g,p,t}=setup('dokkaebi');g.cast('w');release(g);g.hit(p,50,t,{basic:true});assert(health(g).some(e=>e.targetId===t.id&&e.reason==='reflect'&&e.direction==='down'));assert(!health(g).some(e=>e.targetId===p.id),'shield absorption has no HP effect');
}
{
 const {g,p,t}=setup();g.hit(p,5,t,{basic:true});assert.equal(health(g).length,0);assert(p.hitFlash>0);p.stats.hpRegen5=5;g.update(.05);assert.equal(health(g).length,0,'ordinary regen is quiet');p.hp=p.maxHp;g.restoreHp(p,100);assert.equal(health(g).length,0,'no overheal animation');p.hp=0;g.restoreHp(p,100);assert.equal(p.hp,0);assert.equal(health(g).length,0);p.hp=p.maxHp-1;close(g.restoreHp(p,100),1);close(health(g)[0].amount,1);const effect=health(g)[0];p.x=5;p.z=2;g.update(.05);close(effect.x,p.x);close(effect.z,p.z);
}
{
 const {g,p}=setup();p.inventory=['health-potion'];p.hp-=100;assert(g.useItem(0));g.update(.05);assert(health(g).some(e=>e.reason==='potion'&&e.direction==='up'));
}
const visuals=new HealthEffects();for(const [direction,folder]of Object.entries(HEALTH_EFFECT_PATHS)){
 const base=`public/survival/effects/health/${folder}/`,data=JSON.parse(await readFile(base+'sprite.json','utf8')),textures=[];for(const page of data.pages){const png=await readFile(base+page.name);assert.equal(createHash('sha256').update(png).digest('hex'),page.sha256);textures.push(new THREE.Texture({width:png.readUInt32BE(16),height:png.readUInt32BE(20)}));}const clip=normalizeCastEffect(data,textures);clip.worldScale=.0085;visuals.clips.set(direction,clip);assert.equal(clip.frames.length,21);assert.equal(clip.loop,false);for(const f of clip.frames){const im=textures[f.page].image;assert(f.rect.x+f.rect.w<=im.width&&f.rect.y+f.rect.h<=im.height);}const e={direction,x:5,z:2,height:3.5,duration:.7,life:.5},o=visuals.make(e);visuals.update(o,e);assert(o.userData.animation.frameIndex>=5);close(o.position.z,-1.5);o.userData.dispose();
}
console.log('PASS recipient-specific skill heal, regen/passives/vamp/drain/potions, actual HP changes only, empowered/DOT/reflected damage, no ordinary hit/overheal/shield arrows, throttled one-shot replay, movement/pause and original atlas integrity');
