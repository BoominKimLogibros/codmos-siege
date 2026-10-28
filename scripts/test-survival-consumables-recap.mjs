import assert from 'node:assert/strict';
import {Survival} from '../src/survival/engine.js';
import {SHOPS} from '../src/survival/map-layout.js';
const close=(a,b)=>assert(Math.abs(a-b)<1e-6,`${a} != ${b}`);
function setup(){const g=new Survival(()=>.5);g.start();g.waveClock=999;g.bot.stun=999;g.player.x=-50;g.player.z=10;g.player.stats.hpRegen5=0;g.player.stats.manaRegen5=0;return g;}
{
 const g=setup(),p=g.player;p.inventory=['short-sword','health-potion','mana-potion',null,null,'health-potion'];
 assert(!g.useItem(0));assert(!g.useItem(1));p.hp=100;p.mana=0;assert(g.useItem(1));assert.equal(p.inventory[1],null);assert.equal(p.inventory[5],'health-potion');assert(!g.useItem(5));assert(g.useItem(2));assert(!g.useItem(6));
 for(let i=0;i<100;i++)g.update(.05);close(p.hp,220);close(p.mana,100);assert.deepEqual(p.consumables,{});assert.equal(p.inventory[5],'health-potion');
 g.pause();assert(!g.useItem(5));g.pause();p.hp=p.maxHp-1;assert(g.useItem(5));g.update(.05);assert.equal(p.hp,p.maxHp);g.hit(p,1e9,g.bot,{damageType:'true'});assert.deepEqual(p.consumables,{});assert(!g.useItem(1));
}
{
 const g=setup(),p=g.player,shop=SHOPS.find(s=>s.team===p.team);p.x=shop.x;p.z=shop.z+2;p.meso=5000;p.inventory=['short-sword',null,'dagger','ruby'];assert(g.buyItem('health-potion').ok);assert.equal(p.inventory[1],'health-potion');assert(g.sellItem(0).ok);assert.equal(p.inventory[2],'dagger');assert(g.buyItem('stormblade').ok);assert.equal(p.inventory[0],'stormblade');assert.equal(p.inventory[1],'health-potion');assert.equal(p.inventory[2],null);assert.equal(p.inventory[3],'ruby');
}
{
 const g=setup(),p=g.player,b=g.bot;p.stats.armor=100;p.stats.magicResist=0;p.hp=300;p.shield=50;
 g.time=1;g.hit(p,100,b,{basic:true});assert.equal(p.hp,300);assert.equal(p.shield,0);
 g.time=2;g.hit(p,100,b,{basic:true});assert.equal(p.hp,250);
 g.time=3;g.hit(p,70,b,{skill:true,skillKey:'q',abilityName:'테스트 스킬',skillRank:2});
 g.time=4;g.hit(p,1000,b,{damageType:'true',skillKey:'r',abilityName:'마지막 공격'});
 const r=p.deathRecap;close(r.total,300);close(r.absorbed,50);assert.deepEqual(r.types,{physical:50,magic:70,true:180});assert.equal(r.killer.ability.key,'r');assert.equal(r.sources[0].abilities.find(a=>a.key==='q').rank,2);
 p.respawn=.01;g.update(.05);assert(p.hp>0);assert.deepEqual(p.damageLog,[]);assert.equal(p.deathRecap,r);
 p.invulnerable=0;g.time=20;g.hit(p,1e9,b,{damageType:'true'});assert.equal(p.deathRecap.sources[0].abilities.length,1);assert.equal(p.deathRecap.absorbed,0);
}
{
 const g=setup(),p=g.player,b=g.bot;b.heroId='nova';b.marks[p.id]=2;p.stats.armor=0;p.stats.magicResist=0;p.hp=20;g.hit(p,5,b,{basic:true});close(p.deathRecap.types.physical,5);close(p.deathRecap.types.magic,15);assert.equal(p.deathRecap.killer.ability.key,'p');
}
console.log('PASS consumable duration, invalid use, stable slots, trade/upgrade holes, death cleanup and actual HP/shield/type/skill/passive recap');
