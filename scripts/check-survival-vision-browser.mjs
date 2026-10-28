import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,channel:'chrome'}),errors=[];
try{
 const page=await browser.newPage({viewport:{width:1600,height:900}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5197/survival.html');await page.waitForFunction(()=>window.survival?.snapshot.castReady);await page.click('#start');await page.waitForFunction(()=>survival.snapshot.state==='playing');
 async function arrange(mode){await page.evaluate(async mode=>{
  const text=await(await fetch('/src/survival/main.js')).text(),url=text.match(/from ["']([^"']*survival\/engine\.js[^"']*)["']/)[1],{Survival}=await import(url),original=Survival.prototype.update;
  Survival.prototype.update=function(...args){Survival.prototype.update=original;this.units=[this.player,this.bot];this.waveClock=100;this.shots=[];this.effects=[];this.zones=[];this.destination=null;
   Object.assign(this.player,{x:0,z:0,attackCd:100,stun:100,revealed:0});Object.assign(this.bot,{x:21,z:0,attackCd:100,stun:100,revealed:0});
   const scout={id:10000,kind:'minion',type:'melee',team:this.player.team,x:12,z:0,hp:100,maxHp:100,r:.4,collisionRadius:.28,speed:0,stun:100,attackCd:100,buffs:{},faceX:1,faceZ:0};
   if(mode==='shared')this.units.push(scout);
   if(mode.startsWith('tree')){this.player.x=-100;this.player.z=-14;this.bot.x=-100;this.bot.z=-19;if(mode==='tree-shared'){scout.x=-98;scout.z=-19;this.units.push(scout);}}
   original.apply(this,args);
  };
 },mode);await page.waitForTimeout(200);}
 async function visible(){return page.evaluate(()=>{const s=survival.snapshot,u=s.units.find(u=>u.team!==s.team);return{unit:u.visible,sprite:s.spriteStates.find(v=>v.id===u.id).visible,fog:s.vision.fogVisible};});}
 await arrange('hidden');assert.deepEqual(await visible(),{unit:false,sprite:false,fog:true});await page.screenshot({path:'output/survival/team-vision-hidden.png'});
 await arrange('shared');assert.deepEqual(await visible(),{unit:true,sprite:true,fog:true});await page.screenshot({path:'output/survival/team-vision-shared.png'});
 await arrange('hidden');assert.equal((await visible()).unit,false);
 await arrange('tree-hidden');assert.equal((await visible()).sprite,false);await page.screenshot({path:'output/survival/team-vision-tree-hidden.png'});
 await arrange('tree-shared');assert.equal((await visible()).sprite,true);await page.screenshot({path:'output/survival/team-vision-tree-revealed.png'});
 const frames=await page.evaluate(()=>new Promise(resolve=>{let count=0,start=performance.now();function step(){count++;if(performance.now()-start>500)resolve(count);else requestAnimationFrame(step);}requestAnimationFrame(step);}));assert(frames>10,'fog remains responsive');assert.deepEqual(errors,[]);
 console.log('PASS live fog layer, enemies hidden outside team vision, scout reveal/lost vision, tree occlusion/shared far-side scout reveal, responsive rendering and no page errors');
}finally{await browser.close();}
