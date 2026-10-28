import assert from 'node:assert/strict';
import {DashInput,DOUBLE_TAP_MS,DASH_SPEED_MULTIPLIER} from '../src/survival/dash-input.js';
import {Survival} from '../src/survival/engine.js';
const input=new DashInput();assert(!input.down('ArrowRight',0));assert(!input.down('ArrowRight',40,true));assert(!input.active);input.up('ArrowRight');assert(input.down('ArrowRight',200));assert(input.active);input.up('ArrowRight');assert(!input.active);
input.reset();input.down('ArrowRight',0);input.up('ArrowRight');assert(!input.down('ArrowRight',DOUBLE_TAP_MS+1));assert(!input.active);
input.reset();input.down('ArrowLeft',0);input.up('ArrowLeft');input.down('ArrowUp',100);input.up('ArrowUp');assert(!input.down('ArrowLeft',150));assert(!input.active);input.up('ArrowLeft');assert(input.down('ArrowLeft',200));input.reset();assert(!input.active);
input.down('ArrowRight',0);input.up('ArrowRight');input.down('ArrowRight',100);
for(const [i,key]of ['ArrowUp','ArrowLeft','ArrowDown','ArrowRight'].entries()){
 const previous=[...input.held][0];input.down(key,150+i*30);input.up(previous);
 assert(input.active,'direction changes must preserve dash');
}
input.up('ArrowRight');assert(!input.active,'releasing every arrow stops dash');
input.down('ArrowLeft',400);input.up('ArrowLeft');input.down('ArrowLeft',500);assert(input.active);
input.down('KeyS',510);assert(!input.active);assert(!input.down('ArrowLeft',530,true));assert(!input.active);
input.up('ArrowLeft');input.down('ArrowUp',550);assert(!input.active,'S resets the double-tap history');
const g=new Survival();g.start();g.player.x=0;g.player.z=0;g.update(.05,{x:1,z:0});const walk=g.player.x;g.player.x=0;g.update(.05,{x:1,z:0,dash:true});assert(g.player.dashing);assert(Math.abs(g.player.x/walk-DASH_SPEED_MULTIPLIER)<1e-8);assert(g.effects.some(e=>e.kind==='dash'));g.player.x=g.player.z=0;g.update(.05,{x:1,z:1,dash:true});assert(Math.abs(Math.hypot(g.player.x,g.player.z)-walk*DASH_SPEED_MULTIPLIER)<1e-8);g.update(.05,{x:0,z:0,dash:true});assert(!g.player.dashing);g.update(.05,{x:1,z:0,dash:true});g.pause();assert(!g.player.dashing);g.pause();g.player.stun=1;const x=g.player.x;g.update(.05,{x:1,z:0,dash:true});assert.equal(g.player.x,x);assert(!g.player.dashing);g.player.stun=0;g.update(.05,{x:1,z:0,dash:true});g.hit(g.player,1e9,g.bot);assert(!g.player.dashing);
console.log('PASS double-tap/release threshold, repeat and mixed-direction rejection, reset, 1.85× speed, diagonal normalization, trail, pause/stun/death cancellation');
