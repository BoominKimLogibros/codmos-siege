import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {Shopkeeper,BLUE_MERCHANT_MOTIONS} from '../src/survival/shopkeeper.js';
const keeper=new Shopkeeper(),oldFetch=globalThis.fetch,oldLoad=THREE.TextureLoader.prototype.loadAsync;
globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(await readFile('public'+url,'utf8'))});
THREE.TextureLoader.prototype.loadAsync=async function(url){const png=await readFile('public'+url);return new THREE.Texture({width:png.readUInt32BE(16),height:png.readUInt32BE(20)});};
try{await keeper.load();}finally{globalThis.fetch=oldFetch;THREE.TextureLoader.prototype.loadAsync=oldLoad;}
for(const folder of Object.values(BLUE_MERCHANT_MOTIONS)){const base=`public/survival/shopkeeper/blue/${folder}/`,data=JSON.parse(await readFile(base+'sprite.json','utf8'));for(const page of data.pages)assert.equal(createHash('sha256').update(await readFile(base+page.name)).digest('hex'),page.sha256);}
const a=keeper.make('blue'),shop={team:'blue',x:0,z:0,accessRadius:5},player={team:'blue',x:20,z:0,hp:100,meso:300,inventory:[]},context={shop,player,playing:true,open:false,canTrade:false,selected:'short-sword',owned:false};
const tick=(n=1)=>{for(let i=0;i<n;i++)keeper.update(a,.05,1,context);},motion=()=>a.merchant.motion;
const root=a.root.position.z;tick();assert.equal(motion(),'idle');player.x=3;context.canTrade=true;tick();assert.equal(motion(),'hello');tick(30);assert.equal(motion(),'idle');context.open=true;tick();assert.equal(motion(),'input');
player.meso=10;context.selected='tome';tick();assert.equal(motion(),'failure');tick(30);assert.equal(motion(),'input');tick(5);assert.equal(motion(),'input','invalid selection does not restart the reaction every frame');player.meso=500;player.inventory=['boots'];context.selected='boots';tick();assert.equal(motion(),'error');
keeper.react('blue',{ok:true,action:'buy',itemId:'short-sword'});tick();assert.equal(motion(),'calculate');tick(25);assert.equal(motion(),'input');keeper.react('blue',{ok:true,action:'sell',itemId:'boots'});tick();assert.equal(motion(),'calculate');const time=a.clock;keeper.update(a,0,1,{...context,playing:false});assert.equal(a.clock,time);
for(const [id,juice]of [['health-potion','juice_strawberry'],['mana-potion','juice_grapes']]){keeper.react('blue',{ok:true,action:'buy',itemId:id});tick();assert.equal(motion(),'calculate');tick(25);assert.equal(motion(),juice);keeper.update(a,3.1,1,context);assert(a.frameIndex>=88,'second atlas page is actually used');assert.equal(a.baseTexture,a.clip.textures[1]);assert.equal(a.flipX,false);assert.equal(a.root.position.z,root,'Spine root does not jump between motion/scale changes');keeper.update(a,1.1,1,context);assert.equal(motion(),'input');}
keeper.react('blue',{ok:false,reason:'funds'});tick();assert.equal(motion(),'failure');keeper.react('blue',{ok:false,reason:'slots'});tick();assert.equal(motion(),'error');tick(30);player.team='red';context.open=false;tick();assert.equal(motion(),'hate');player.x=20;tick();assert.equal(motion(),'idle');
const white=keeper.make('red');keeper.react('red',{ok:true,action:'buy',itemId:'health-potion'});keeper.update(white,.15,1,context);assert.equal(white.key,'shopkeeper/red/idle');assert.equal(white.clip.frames.length,13);const fresh=keeper.make('blue');keeper.update(fresh,.05,1,context);assert.equal(fresh.merchant.motion,'idle','new match ignores earlier transaction events');a.dispose();white.dispose();fresh.dispose();
console.log('PASS blue-only NPC, native hashes/multipage clips, approach greeting, browsing, buy/sell calculation, potion mixing, unavailable/failed trade reactions, enemy refusal, pause, stable roots, no stale replay and white idle preserved');
