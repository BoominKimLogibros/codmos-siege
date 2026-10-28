import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {Survival,HEROES} from '../src/survival/engine.js';
import {CharacterCast,SPRITE_FOLDERS} from '../src/survival/characters.js';
import {normalizeCharacter} from '../src/survival/sprite-player.js';
const close=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} != ${b}`),cast=new CharacterCast();
function setup(id){const g=new Survival(()=>.5);g.start(id);g.structures=[];g.effects=[];g.waveClock=999;const p=g.player,t=g.bot;p.x=p.z=0;t.x=2;t.z=0;t.hp=t.maxHp=10000;t.stun=999;t.attackCd=999;return{g,p,t};}
let cases=0;
for(const hero of HEROES){
 for(const direction of ['front','back','side_left','side_right'])for(const motion of ['idle','move','attack','defend']){const data=JSON.parse(await readFile(`public/survival/character-sprites/${SPRITE_FOLDERS[hero.id]}/${direction}/${motion}.json`,'utf8'));cast.clips.set(`${hero.id}/${direction}/${motion}`,normalizeCharacter(data,new THREE.Texture({width:data.meta.size.w,height:data.meta.size.h})));}
 for(const [x,z,direction]of [[1,0,'side_right'],[-1,0,'side_left'],[0,1,'front'],[0,-1,'back']])for(const speed of [.5,1,2.5]){
  const {g,p,t}=setup(hero.id);p.stats.attackSpeed=speed;t.x=x*2;t.z=z*2;p.moving=false;const visual=cast.make(hero);g.basic(p,t);assert(p.basicGesture);close(p.attackCd,1/speed);close(p.basicGesture.duration,.85/speed);cast.updateUnit(visual,p,0,'playing');assert.equal(visual.key,`${hero.id}/${direction}/attack`);assert.equal(visual.frameIndex,0);assert.equal(visual.flipX,false);
  p.basicGesture.elapsed=p.basicGesture.duration*.4;cast.updateUnit(visual,p,0,'playing');const expectedFrame=visual.frameIndex;assert(expectedFrame>=7&&expectedFrame<=9);p.hitFlash=.2;cast.updateUnit(visual,p,0,'playing');assert.equal(visual.material.color.getHexString(),'ff6978');assert(visual.key.endsWith('/attack'));
  const oldId=p.basicGesture.id;g.basic(p,t);assert(p.basicGesture.id>oldId);cast.updateUnit(visual,p,0,'playing');assert.equal(visual.frameIndex,0,'consecutive attack restarts even with same clip');visual.dispose();cases++;
 }
}
{
 const {g,p}=setup('naruto');p.stats.attackSpeed=2;g.update(.05);assert(p.basicGesture);const z=p.z,elapsed=p.basicGesture.elapsed;g.pause();g.update(.05);close(p.basicGesture.elapsed,elapsed);g.pause();for(let i=0;i<8;i++){g.update(.05,{x:0,z:1,dash:true});close(p.z,z);assert(!p.moving&&!p.dashing);}g.update(.05,{x:0,z:1,dash:true});assert(p.z>z);assert(p.dashing);assert(!p.basicGesture);
}
{
 const {g,p,t}=setup('naruto');g.basic(p,t);p.skillRanks.w=1;assert(g.cast('w'));assert(!p.basicGesture);const attacks=p.attacks;g.basic(p,t);assert.equal(p.attacks,attacks,'no basic attack during skill anticipation');const visual=cast.make(HEROES[0]);cast.updateUnit(visual,p,0,'playing');assert(visual.key.endsWith('/defend'));visual.dispose();g.hit(p,1e9,t);assert(!p.basicGesture);assert(!p.pendingCast);
}
{
 const {g,p,t}=setup('int');p.stats.attackSpeed=1;p.buffs.haste=10;p.hastePower=2;g.basic(p,t);close(p.basicGesture.duration,.425);g.update(.05);p.stun=1;g.update(.05);assert(!p.basicGesture);
}
console.log(`PASS ${cases} hero/direction/speed attack gestures, original clip timing, repeat restart, tint, movement lock/resume, pause/end, skill priority, haste and death/CC cleanup`);
