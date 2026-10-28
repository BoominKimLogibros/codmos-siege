import assert from 'node:assert/strict';
import {Survival} from '../src/survival/engine.js';
import {clearSight,sightPolygon,sightRange} from '../src/survival/vision.js';
import {OBSTACLES,BRUSHES} from '../src/survival/map-layout.js';
for(const team of ['blue','white']){
 const g=new Survival();g.start('naruto',team);g.structures=[];g.waveClock=100;g.player.x=0;g.player.z=0;g.bot.x=30;g.bot.z=0;
 assert(!g.isVisible(g.bot,team),'outside all allied sight');assert.equal(g.nearest(g.player,100,false),undefined);
 g.bot.revealed=1;assert(!g.isVisible(g.bot,team),'attacks must not grant global sight');g.bot.revealed=0;
 g.player.x=16;assert(g.isVisible(g.bot,team),'moving into range reveals');g.player.x=0;
 const minion={id:1000,kind:'minion',type:'melee',team,x:25,z:0,hp:10,r:.4};g.units.push(minion);assert(g.isVisible(g.bot,team),'shared minion sight');minion.x=0;assert(!g.isVisible(g.bot,team),'moving scout away hides');minion.x=25;minion.hp=0;assert(!g.isVisible(g.bot,team),'dead scout grants no vision');
 const tower={id:1001,kind:'structure',type:'tower',team,x:25,z:0,hp:10,r:1.8};g.structures.push(tower);assert(g.isVisible(g.bot,team),'allied building sight');tower.hp=0;assert(!g.isVisible(g.bot,team),'destroyed building no vision');
 g.bot.x=30;g.bot.kind='structure';g.bot.type='tower';assert(!g.isVisible(g.bot,team),'enemy structures also require sight');g.bot.kind='champion';
 const tree=OBSTACLES.find(o=>o.kind==='tree'&&o.x===-100&&o.z===-18);
 g.player.x=tree.x;g.player.z=tree.z+4;g.bot.x=tree.x;g.bot.z=tree.z-1;
 assert(!clearSight(g.player,g.bot));assert(!g.isVisible(g.bot,team),'tree casts shadow');g.bot.revealed=1;assert(!g.isVisible(g.bot,team),'attack reveal does not see through tree');g.bot.revealed=0;
 minion.hp=10;minion.x=tree.x+2;minion.z=tree.z-1;assert(g.isVisible(g.bot,team),'scout on far side shares sight');minion.hp=0;
 g.player.x=tree.x+4;g.player.z=tree.z-1;assert(g.isVisible(g.bot,team),'walking around tree restores sight');
 const rock=OBSTACLES.find(o=>o.kind==='rock');assert(!clearSight({x:rock.x,z:rock.z+3},{x:rock.x,z:rock.z-3}));
 const b=BRUSHES[3];g.player.x=b.x;g.player.z=0;g.bot.x=b.x;g.bot.z=b.z;assert(!g.isVisible(g.bot,team),'brush still conceals');g.player.z=b.z;g.player.x=b.x-2;assert(g.isVisible(g.bot,team),'same-brush sight');
 const polygon=sightPolygon(g.player);assert(polygon.length>=80);assert(polygon.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.z)&&Math.hypot(p.x-g.player.x,p.z-g.player.z)<=sightRange(g.player)+1e-8));
}
// Losing vision cancels an existing homing basic attack without hitting in fog.
const g=new Survival();g.start('nova');g.structures=[];g.waveClock=100;g.player.x=g.player.z=0;g.bot.x=8;g.bot.z=0;g.basic(g.player,g.bot);assert(g.shots.length);g.bot.x=40;g.bot.stun=100;g.player.attackCd=100;const hp=g.bot.hp;g.update(.05);assert.equal(g.shots.length,0);assert.equal(g.bot.hp,hp);
console.log('PASS both-team sight range, moving/dead scouts, building sight, tree/rock occlusion, no global attack reveal, retained brush concealment, bounded fog polygons and lock cancellation');
