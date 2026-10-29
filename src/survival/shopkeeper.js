import * as THREE from 'three';
import {SpritePlayer} from './sprite-player.js';
import {normalizeCastEffect} from './cast-effects.js';
import {purchaseQuote} from './items.js';
export const BLUE_MERCHANT_MOTIONS={idle:'1fcad7864383',hello:'d7477f5290e2',input:'e80c5730f000',calculate:'0345a2b943d9',error:'2ccd8e395bec',failure:'be17678a78c8',hate:'962112ccec9d',juice_strawberry:'5ae32dac0079',juice_grapes:'2c8e68ee702b'};
export class Shopkeeper {
 constructor(){this.clips=new Map();this.events=new Map();this.sequence=0;}
 async load(){
  const definitions=[['red','idle','/survival/shopkeeper/5e923855fb18/'],...Object.entries(BLUE_MERCHANT_MOTIONS).map(([motion,folder])=>['blue',motion,`/survival/shopkeeper/blue/${folder}/`])];
  const loaded=await Promise.all(definitions.map(async([team,motion,base])=>{const response=await fetch(base+'sprite.json');if(!response.ok)throw Error(base+'sprite.json');const data=await response.json(),textures=await Promise.all(data.pages.map(p=>new THREE.TextureLoader().loadAsync(base+p.name)));for(const t of textures){t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearFilter;t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;}const clip=normalizeCastEffect(data,textures);clip.meta={animation:motion,team};clip.duration=data.frameCount/data.fps;return{team,motion,clip,data};}));
  const idle=loaded.find(d=>d.team==='blue'&&d.motion==='idle'),worldUnit=3/idle.data.frameHeight*idle.data.bounds.scale;
  for(const {team,motion,clip,data}of loaded){clip.worldScale=team==='blue'?worldUnit/data.bounds.scale:3/data.frameHeight;clip.loop=true;this.clips.set(`${team}/${motion}`,clip);}
 }
 make(team='red'){
  const animation=new SpritePlayer(),clip=this.clips.get(`${team}/idle`);animation.merchant={team,motion:'idle',loop:true,priority:0,queue:[],near:false,selection:null,seenEvent:this.events.get(team)?.id||0};animation.setClip(`shopkeeper/${team}/idle`,clip);const frame=clip.frames[0].rect;animation.root.position.z=1.2-(frame.h-clip.anchor.y)*clip.worldScale;animation.update(0,{loop:true});return animation;
 }
 react(team,result){this.events.set(team,{id:++this.sequence,...result});}
 play(animation,motion,{loop=false,priority=1,queue=[]}={}){const state=animation.merchant;Object.assign(state,{motion,loop,priority,queue});animation.key=null;animation.setClip(`shopkeeper/${state.team}/${motion}`,this.clips.get(`${state.team}/${motion}`));}
 base(context,state){const {shop,player}=context;if(!player||player.hp<=0)return'idle';if(state.near&&player.team!==shop.team)return'hate';return state.near&&context.open&&context.canTrade?'input':'idle';}
 update(animation,dt,opacity=1,context={}){
  animation.material.opacity=opacity;const state=animation.merchant;
  if(state.team==='blue'&&context.playing){
   const {shop,player}=context,distance=player?Math.hypot(player.x-shop.x,player.z-shop.z):Infinity,near=player?.hp>0&&distance<=shop.accessRadius+(state.near?2:0),entered=near&&!state.near;state.near=near;
   if(entered&&player.team===shop.team&&state.priority<=1)this.play(animation,'hello');
   const event=this.events.get(state.team);
   if(event&&event.id!==state.seenEvent){state.seenEvent=event.id;if(event.ok){const juice=event.action==='buy'?(event.itemId==='health-potion'?'juice_strawberry':event.itemId==='mana-potion'?'juice_grapes':null):null;this.play(animation,'calculate',{priority:3,queue:juice?[juice]:[]});}else this.play(animation,event.reason==='funds'?'failure':'error',{priority:3});}
   const selecting=near&&player.team===shop.team&&context.open&&context.canTrade&&!context.owned,reason=selecting?purchaseQuote(player,context.selected).reason:null,key=selecting?`${context.selected}:${reason||'ok'}`:null;
   if(key!==state.selection){state.selection=key;if(reason&&state.priority<=2)this.play(animation,reason==='funds'?'failure':'error',{priority:2});}
   const base=this.base(context,state);
   if(state.loop&&state.motion!==base)this.play(animation,base,{loop:true,priority:0});
   animation.update(dt,{loop:state.loop,flip:false});
   if(!state.loop&&animation.clock>=animation.clip.duration){const next=state.queue[0],queue=state.queue.slice(1);if(next)this.play(animation,next,{priority:state.priority,queue});else this.play(animation,base,{loop:true,priority:0});animation.update(0,{loop:animation.merchant.loop,flip:false});}
  }else animation.update(dt,{loop:state.loop,flip:false});
 }
}
