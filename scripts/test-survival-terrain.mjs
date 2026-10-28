import {footprint,movementRadius} from '../src/survival/footprints.js';
import assert from 'node:assert/strict';
import {canWalk,moveOnMap,navigationDirection,MAP,OBSTACLES,PONDS,BRUSHES,brushAt} from '../src/survival/terrain.js';
import {Survival} from '../src/survival/engine.js';
for(const o of OBSTACLES)assert(!canWalk(o.x,o.z));
for(const p of PONDS)assert(!canWalk(p.x,p.z));
for(const b of BRUSHES){assert(canWalk(b.x,b.z));assert.equal(brushAt(b.x,b.z)?.id,b.id);}
// Swept movement and dash cannot jump through an obstacle; sliding still works.
const rock=OBSTACLES.find(o=>o.kind==='rock'),body={x:rock.x-5,z:rock.z,r:.65};moveOnMap(body,12,0);assert(body.x<rock.x-rock.r);assert(canWalk(body.x,body.z,body.r));const z=body.z;moveOnMap(body,1,1);assert(body.z>z);assert(canWalk(body.x,body.z,body.r));
for(const obstacle of [rock,PONDS[0]]){
 const unit={x:obstacle.x-12,z:obstacle.z,r:.65},goal={x:obstacle.x+12,z:obstacle.z};
 for(let i=0;i<1000&&Math.hypot(unit.x-goal.x,unit.z-goal.z)>.7;i++){
  const dir=navigationDirection(unit,goal),length=Math.hypot(dir.x,dir.z)||1;moveOnMap(unit,dir.x/length*.2,dir.z/length*.2);assert(canWalk(unit.x,unit.z,unit.r));
 }
 assert(Math.hypot(unit.x-goal.x,unit.z-goal.z)<.8,'AI must route around rock/pond');
}
const g=new Survival();g.start();g.waveClock=100;const b=BRUSHES[0];g.player.x=b.x;g.player.z=b.z;g.bot.x=b.x;g.bot.z=0;g.bot.revealed=0;
assert(g.isVisible(g.player,g.player.team));assert(!g.isVisible(g.player,g.bot.team));assert(!g.nearest(g.bot,15,false));
g.bot.x=b.x;g.bot.z=b.z+1;assert(g.isVisible(g.player,g.bot.team),'same brush grants vision');g.bot.z=0;
g.basic(g.player,g.bot);assert(g.isVisible(g.player,g.bot.team),'attacking briefly reveals the attacker');g.player.revealed=0;g.player.z=0;assert(g.isVisible(g.player,g.bot.team),'exiting brush restores vision');
const tower=g.structures.find(s=>s.team==='blue'&&s.stage===0),walker={x:tower.x-5,z:0,r:.65};moveOnMap(walker,10,0,.65,g.structures);assert(walker.x<tower.x);tower.hp=0;moveOnMap(walker,5,0,.65,g.structures);assert(walker.x>tower.x,'destroyed structures release collision');
const sim=new Survival();sim.start();for(let i=0;i<1000;i++){sim.update(.05);for(const u of sim.units)if(u.hp>0)assert(canWalk(u.x,u.z,movementRadius(u),sim.structures),`unit ${u.id} inside obstacle ${u.x},${u.z}`);}
console.log('PASS tile/brush footprints, swept dash collision, sliding, rock/pond navigation, team brush vision/attack reveal, destroyed-building collision and 50s legal wave movement');

// Walk immediately in front of the rendered bases, while solid bases/trunks still block.
for(const type of ['tower','guard','inhibitor','nexus']){
 const s={kind:'structure',type,x:0,z:0,hp:1,r:type==='nexus'?3:1.8},f=footprint(s);
 assert(!canWalk(0,f.z,.35,[s]));assert(canWalk(0,f.z+f.rz+.36,.35,[s]),type+' front edge must be passable');
 const walker={x:-f.rx-2,z:f.z+f.rz+.36,r:.65,collisionRadius:.35};moveOnMap(walker,(f.rx+2)*2,0,movementRadius(walker),[s]);assert(walker.x>f.rx,'walk horizontally beneath '+type);
 const charge={x:-f.rx-2,z:f.z,r:.35};moveOnMap(charge,20,0,.35,[s]);assert(charge.x<-f.rx,'solid footprint must stop dash');
}
const tree=OBSTACLES.find(o=>o.kind==='tree'),trunk=footprint(tree);
assert(!canWalk(tree.x,tree.z+trunk.z,.35));assert(canWalk(tree.x,tree.z+1,.35),'space below foliage must be passable');assert(canWalk(tree.x+1.1,tree.z,.35),'canopy sides are not solid');
console.log('PASS visible elliptical plinths, front-of-building traversal, solid swept bases and trunk-only tree collision');
