import assert from 'node:assert/strict';
import {Survival} from '../src/survival/engine.js';
import {CharacterCast} from '../src/survival/characters.js';
import {DASH_SPEED_MULTIPLIER} from '../src/survival/dash-input.js';

// Repeated incoming basic hits must preserve both displacement and locomotion.
for(const dash of [false,true])for(const [x,z] of [[1,0],[-1,0],[0,1],[0,-1]]){
 const game=new Survival();game.start();const u=game.player;
 game.units=[u];game.structures=[];game.waveClock=100;u.x=u.z=0;
 const cast=new CharacterCast(),renderer={direction:'front',setClip(key){this.key=key;},update(dt,options){this.options=options;}};
 for(let i=0;i<10;i++){
  game.hit(u,1,{team:'white'},{slow:2,stun:.9});
  game.update(.05,{x,z,dash});cast.updateUnit(renderer,u,.05,'playing');
  assert.equal(u.slow,0);assert.equal(u.stun,0);assert.equal(u.moving,true);
  assert.equal(u.dashing,dash);assert.equal(renderer.options.tint,true);
  assert(renderer.key.endsWith(dash&&x?'/run':'/move'),renderer.key);
 }
 const expected=u.speed*.5*(dash?DASH_SPEED_MULTIPLIER:1);
 assert(Math.abs(Math.hypot(u.x,u.z)-expected)<1e-8);
 // Stopping keeps the idle pose, and intentional skill CC remains intact.
 game.update(.05,{x:0,z:0});cast.updateUnit(renderer,u,.05,'playing');
 assert(renderer.key.endsWith('/idle'));assert(renderer.options.tint);
 game.hit(u,1,{team:'white'},{skill:true,stun:1});
 const before={x:u.x,z:u.z};game.update(.05,{x,z,dash});
 assert.equal(u.x,before.x);assert.equal(u.z,before.z);
}
console.log('PASS repeated hits preserve walking/dash speed and all four movement animations, tint feedback, stationary idle pose and skill CC');
