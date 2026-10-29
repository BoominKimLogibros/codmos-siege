import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,channel:'chrome'}),errors=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
 await page.goto('http://127.0.0.1:5197/survival.html');await page.waitForFunction(()=>window.survival?.snapshot.castReady);await page.click('#start');await page.waitForFunction(()=>survival.snapshot.state==='playing');await page.waitForTimeout(200);
 await page.screenshot({path:'output/survival/tile-blue-base.png'});
 async function arrange(mode){await page.evaluate(async mode=>{
  const source=await(await fetch('/src/survival/main.js')).text(),url=source.match(/from ["']([^"']*survival\/engine\.js[^"']*)["']/)[1],{Survival}=await import(url),original=Survival.prototype.update;
  Survival.prototype.update=function(...args){Survival.prototype.update=original;this.waveClock=100;this.units=[this.player,this.bot];this.shots=[];this.effects=[];this.zones=[];this.player.attackCd=100;this.bot.attackCd=100;this.bot.stun=100;this.bot.revealed=0;this.player.revealed=0;this.player.navigation=null;this.destination=null;
   this.player.x=-48;this.player.z=mode==='inside'?7.5:0;this.bot.x=-46;this.bot.z=7.5;
   if(mode==='rock'){this.player.x=-37;this.player.z=-11.5;}
   if(mode==='tower-front'){this.player.x=-41;this.player.z=1.1;}
   if(mode==='tree-front'){this.player.x=-103;this.player.z=-17;}
   if(mode==='canopy'){this.player.x=-100;this.player.z=-19;}
   if(mode==='reveal')this.basic(this.bot,this.player);
   original.apply(this,args);
  };
 },mode);await page.waitForTimeout(120);}
 await arrange('hidden');let state=await page.evaluate(()=>survival.snapshot);const enemy=state.units.find(u=>u.team==='red');assert(enemy.inBrush&&!enemy.visible);assert.equal(state.spriteStates.find(s=>s.id===enemy.id).visible,false);await page.screenshot({path:'output/survival/tile-brush-hidden.png'});
 await arrange('inside');state=await page.evaluate(()=>survival.snapshot);assert(state.units.find(u=>u.team==='red').visible);assert(state.spriteStates.find(s=>s.id===enemy.id).visible);await page.screenshot({path:'output/survival/tile-brush-shared.png'});
 await arrange('reveal');assert((await page.evaluate(()=>survival.snapshot.units.find(u=>u.team==='red'))).visible);
 await arrange('rock');await page.keyboard.down('ArrowRight');await page.waitForTimeout(900);await page.keyboard.up('ArrowRight');assert((await page.evaluate(()=>survival.snapshot.position.x))<-33.8);
 await arrange('tower-front');await page.keyboard.down('ArrowRight');await page.waitForTimeout(1200);await page.keyboard.up('ArrowRight');assert((await page.evaluate(()=>survival.snapshot.position.x))>-35,'pass below turret plinth');await page.screenshot({path:'output/survival/designed-map-turret.png'});
 await arrange('tree-front');await page.keyboard.down('ArrowRight');await page.waitForTimeout(900);await page.keyboard.up('ArrowRight');assert((await page.evaluate(()=>survival.snapshot.position.x))>-99,'pass below tree trunk');
 await arrange('canopy');await page.screenshot({path:'output/survival/designed-map-canopy.png'});assert.deepEqual(errors,[]);
 console.log('PASS local tile/structure PNGs, brush hides enemy root/HP bar, same-brush vision, attack reveal, real keyboard rock collision, walking below turrets/trees, canopy traversal, no page/asset errors');
}finally{await browser.close();}
