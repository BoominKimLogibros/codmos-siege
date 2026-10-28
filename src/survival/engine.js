import {towerCollapseSpec} from './tower-collapse-spec.js';
import {castEffectSpec} from './cast-effect-spec.js';
import {skillGesture} from './skill-cast.js';
import {sourceSnapshot,abilitySnapshot,recordDamage,makeDeathRecap,RECAP_WINDOW} from './damage-history.js';
import {MAX_LEVEL,unitSkill,upgradeInfo} from './skill-levels.js';
import {STARTING_MESO,INVENTORY_SIZE,ITEM_BY_ID,purchaseQuote,statsWithItems,saleValue,trimInventory} from './items.js';
import {SHOPS} from './map-layout.js';
import {clampSkillPoint} from './skill-aim.js';
import {statsAt,currentStats,mitigate,skillPower} from './stats.js';
import {clearSight,hasTeamVision} from './vision.js';
import {movementRadius} from './footprints.js';
import {HEROES} from './heroes.js';
import {KITS,KEYS} from './kits.js';
import {MAP,moveOnMap,brushAt,navigationDirection,canWalk} from './terrain.js';
import {DASH_SPEED_MULTIPLIER} from './dash-input.js';
import {MINION_STATS,minionBounty} from './minion-stats.js';
export {HEROES};
export const TEAM_COLORS={blue:'#69c6ff',white:'#f1eee3'};
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const side=t=>t==='blue'?1:-1;
const other=t=>t==='blue'?'white':'blue';
export class Survival {
 constructor(random=Math.random){this.random=random;this.state='select';this.units=[];this.corpses=[];this.rewards=[];this.structures=[];this.shots=[];this.effects=[];this.zones=[];}
 start(heroId='naruto',team='blue'){
  this.state='playing';this.map=MAP.id;this.time=0;this.id=0;this.wave=0;this.waveClock=0;this.kills=0;this.destroyed=0;this.units=[];this.corpses=[];this.rewards=[];this.structures=[];this.shots=[];this.effects=[];this.zones=[];this.order='push';this.rally={x:0,z:0};this.destination=null;this.winner=null;this.lastCast=null;this.hero=HEROES.find(h=>h.id===heroId)||HEROES[0];
  for(const t of ['blue','white']){const d=side(t);for(const [type,x,z,hp,stage]of [['tower',36,0,650,0],['tower',62,0,750,1],['inhibitor',83,0,650,2],['guard',101,-5,650,3],['guard',101,5,650,3],['nexus',110,0,1400,4]])this.structures.push({id:++this.id,kind:'structure',type,team:t,x:-d*x,z,hp,maxHp:hp,stage,r:type==='nexus'?3:1.8,attackCd:0,respawn:0,targetId:null});}
  this.player=this.champion(this.hero,team,true);this.bot=this.champion(HEROES[(HEROES.indexOf(this.hero)+4)%HEROES.length],other(team),false);this.aim={x:this.player.x+side(team)*12,z:0};
 }
 champion(hero,team,player){const stats=statsAt(hero);const u={id:++this.id,kind:'champion',heroId:hero.id,team,player,stats,baseAttackDamage:hero.damage,mana:stats.maxMana,maxMana:stats.maxMana,passiveHeal:0,passiveFlash:0,passiveEvents:0,x:-side(team)*98,z:player?2:-2,hp:hero.hp*4,maxHp:hero.hp*4,damage:hero.damage,range:hero.attack==='knight'?3.1:10,speed:hero.speed,r:.65,collisionRadius:.35,attackCd:0,cooldowns:{q:0,w:0,e:0,r:0},skillRanks:{q:0,w:0,e:0,r:0},skillPoints:1,level:1,xp:0,required:6,attacks:0,charge:0,marks:{},respawn:0,shield:0,buffs:{},stun:0,silence:0,poison:0,slow:0,poisonDmg:0,regen:0,invulnerable:0,moving:false,botThink:0,faceX:side(team),faceZ:0,attackAnim:0,hurtAnim:0,hitFlash:0,attackEvent:0,hitEvent:0,deadAge:0,dashing:false,dashTrail:0,meso:STARTING_MESO,lastHits:0,inventory:[],consumables:{},damageLog:[],deathRecap:null,pendingCast:null,castGesture:null,basicGesture:null,castSequence:0};this.units.push(u);if(!player)this.autoUpgrade(u);return u;}
 pause(){if(this.player)this.player.dashing=false;if(this.state==='playing')this.state='paused';else if(this.state==='paused')this.state='playing';}
 move(body,dx,dz,r=body.r??.5){moveOnMap(body,dx,dz,body.collisionRadius??r,this.structures);}
 isVisible(target,team){return target.team===team||hasTeamVision(this,team,target,{concealBrush:target.kind!=='structure'});}
 pointVisible(point,team){return hasTeamVision(this,team,point);}
 get enemies(){return this.units.filter(u=>u.team!==this.player?.team&&u.hp>0&&this.isVisible(u,this.player.team));}
 get level(){return this.player?.level||1;}
 isOpen(s){if(s.kind!=='structure')return true;if(s.stage===0)return true;if(s.stage===1)return !this.structures.some(a=>a.team===s.team&&a.stage===0&&a.hp>0);if(s.stage===2)return !this.structures.some(a=>a.team===s.team&&a.stage<2&&a.hp>0);if(s.stage===3)return !this.structures.some(a=>a.team===s.team&&a.type==='inhibitor'&&a.hp>0);return !this.structures.some(a=>a.team===s.team&&(a.type==='inhibitor'||a.type==='guard')&&a.hp>0);}
 opponents(u,includeStructures=true){return [...this.units.filter(t=>t.hp>0&&t.team!==u.team),...(includeStructures?this.structures.filter(s=>s.hp>0&&s.team!==u.team&&this.isOpen(s)):[])];}
 nearest(u,range=Infinity,structures=true){return this.opponents(u,structures).filter(t=>this.isVisible(t,u.team)&&dist(u,t)<=range+t.r).sort((a,b)=>dist(u,a)-dist(u,b))[0];}
 effect(x,z,team,kind='hit',radius=1,life=.45){this.effects.push({id:++this.id,x,z,team,kind,radius,life,duration:life});}
 waveSpawn(){this.wave++;for(const team of ['blue','white']){const empowered=this.structures.some(s=>s.team!==team&&s.type==='inhibitor'&&s.hp<=0);const types=['melee','melee','melee','cavalry','ranged','ranged',...(empowered?['super']:[])];for(const [i,type]of types.entries()){const stats=MINION_STATS[type];this.units.push({id:++this.id,kind:'minion',type,team,x:-side(team)*(97+i*.95),z:(i%3-1)*1.6,hp:stats.hp,maxHp:stats.hp,damage:stats.damage,bounty:minionBounty(type,this.time),range:stats.range,speed:stats.speed,r:stats.radius,collisionRadius:type==='cavalry'?.4:.28,attackInterval:stats.attackInterval,attackDuration:stats.attackDuration,hurtDuration:type==='cavalry'?.5:.7,attackCd:.15*i,shield:0,buffs:{},stun:0,slow:0,poison:0,poisonDmg:0,moving:false,faceX:side(team),faceZ:0,attackAnim:0,hurtAnim:0,hitFlash:0,attackEvent:0,hitEvent:0,bornAnim:.7});}}}
 awardMeso(target,source){if(!source||source.team===target.team)return;const recipient=source.kind==='champion'?source:source.ownerId?this.units.find(u=>u.id===source.ownerId&&u.kind==='champion'):null;if(!recipient)return;const amount=target.kind==='minion'?(target.bounty||0):target.kind==='champion'?300:0;if(!amount)return;recipient.meso=(recipient.meso||0)+amount;if(target.kind==='minion')recipient.lastHits=(recipient.lastHits||0)+1;this.rewards.push({id:++this.id,targetId:target.id,type:target.type,targetKind:target.kind,recipientId:recipient.id,team:recipient.team,amount,x:target.x,z:target.z,life:1.4,duration:1.4});}
 healthChangeEffect(unit,amount,source=unit,reason='skill'){
  if(!Number.isFinite(amount)||Math.abs(amount)<1e-9||unit.kind==='structure')return;
  const direction=amount>0?'up':'down',active=this.effects.find(e=>e.kind==='health'&&e.targetId===unit.id&&e.direction===direction&&e.life>0);
  if(active){active.amount+=Math.abs(amount);return active;}
  unit.healthEffectNext??={};if(this.time<(unit.healthEffectNext[direction]||0))return;
  unit.healthEffectNext[direction]=this.time+.85;
  const effect={id:++this.id,kind:'health',direction,targetId:unit.id,sourceId:source?.id,reason,amount:Math.abs(amount),team:unit.team,x:unit.x,z:unit.z,height:unit.type==='cavalry'?4.3:unit.kind==='champion'?3.5:2.7,life:.7,duration:.7};this.effects.push(effect);return effect;
 }
 restoreHp(unit,amount,source=unit,reason='skill'){
  if(unit.hp<=0||!(amount>0))return 0;const actual=Math.max(0,Math.min(unit.maxHp-unit.hp,amount));unit.hp+=actual;this.healthChangeEffect(unit,actual,source,reason);return actual;
 }
 rebuildStats(unit,{grow=false}={}){
  const oldHp=unit.hp,oldMax=unit.maxHp,oldMana=unit.maxMana,hero=HEROES.find(h=>h.id===unit.heroId),next=statsWithItems(hero,unit.level,unit.inventory);
  unit.stats=next;unit.maxHp=next.maxHp;unit.maxMana=next.maxMana;unit.damage=next.attackDamage;unit.speed=next.moveSpeed/50;unit.range=next.attackRange/50;
  unit.hp=oldHp>0?Math.max(1,Math.min(unit.maxHp,oldHp+(grow?35:unit.maxHp-oldMax))):0;unit.mana=Math.max(0,Math.min(unit.maxMana,unit.mana+unit.maxMana-oldMana));
 }
 shopStatus(unit=this.player){const shop=SHOPS.find(s=>s.team===unit?.team),distance=shop&&unit?dist(unit,shop):Infinity;return{shop,distance,canTrade:!!(this.state==='playing'&&unit?.kind==='champion'&&unit.hp>0&&distance<=shop.accessRadius),reason:this.state!=='playing'?'state':unit?.hp<=0?'dead':distance>shop?.accessRadius?'distance':null};}
 buyItem(id,unit=this.player){
  const status=this.shopStatus(unit);if(!status.canTrade)return{ok:false,reason:status.reason};const quote=purchaseQuote(unit,id);if(!quote.ok)return quote;
  unit.meso-=quote.price;unit.inventory=quote.inventory;this.rebuildStats(unit);this.effect(unit.x,unit.z,unit.team,'purchase',1.3,.6);return{ok:true,itemId:id,price:quote.price};
 }
 sellItem(index,unit=this.player){
  const status=this.shopStatus(unit);if(!status.canTrade)return{ok:false,reason:status.reason};if(!Number.isInteger(index)||index<0||index>=unit.inventory.length||!unit.inventory[index])return{ok:false,reason:'item'};
  const id=unit.inventory[index],price=saleValue(id);unit.inventory[index]=null;trimInventory(unit.inventory);unit.meso+=price;this.rebuildStats(unit);return{ok:true,itemId:id,price};
 }
 useItem(index,unit=this.player){
  if(this.state!=='playing'||unit?.kind!=='champion'||unit.hp<=0||!Number.isInteger(index)||index<0||index>=INVENTORY_SIZE)return false;
  const item=ITEM_BY_ID.get(unit.inventory[index]),effect=item?.consumable;if(!effect)return false;
  const resource=effect.resource,max=resource==='hp'?unit.maxHp:unit.maxMana;if(unit[resource]>=max||unit.consumables[resource]?.remaining>0)return false;
  unit.inventory[index]=null;trimInventory(unit.inventory);unit.consumables[resource]={remaining:effect.duration,rate:effect.amount/effect.duration,itemId:item.id};this.effect(unit.x,unit.z,unit.team,resource==='hp'?'heal':'mana',1.2,.6);return true;
 }
 upgradeSkill(key,unit=this.player){
  if(this.state!=='playing'||unit?.kind!=='champion'||!upgradeInfo(unit,key).allowed)return false;
  unit.skillRanks[key]++;unit.skillPoints--;this.effect(unit.x,unit.z,unit.team,'learn',1.2,.45);return true;
 }
 autoUpgrade(unit){const order=['r','q',...(['int','nova','dokkaebi','gumiho','young-forty'].includes(unit.heroId)?['w','e']:['e','w'])];while(unit.skillPoints>0){const key=order.find(k=>upgradeInfo(unit,k).allowed);if(!key||!this.upgradeSkill(key,unit))break;}}
 gainXp(team,amount){
  const hero=this.units.find(u=>u.kind==='champion'&&u.team===team);if(!hero||hero.level>=MAX_LEVEL)return;
  hero.xp+=Math.max(0,amount);while(hero.level<MAX_LEVEL&&hero.xp>=hero.required){hero.xp-=hero.required;hero.level++;hero.skillPoints++;hero.required=hero.level===MAX_LEVEL?0:Math.floor(hero.required*1.18+2);this.rebuildStats(hero,{grow:true});if(!hero.player)this.autoUpgrade(hero);this.effect(hero.x,hero.z,team,'level',3);}
  if(hero.level===MAX_LEVEL)hero.xp=0;
 }
 passiveProc(unit,target=unit){if(!unit||unit.kind!=='champion')return;unit.passiveFlash=.7;unit.passiveEvents=(unit.passiveEvents||0)+1;this.effects.push({id:++this.id,x:target.x,z:target.z,team:unit.team,kind:'passive',heroId:unit.heroId,radius:1.6,life:.7,duration:.7});}
 hit(target,amount,source,options={}){
  if(target.hp<=0||target.invulnerable>0||target.kind==='structure'&&!this.isOpen(target))return 0;
  const type=options.damageType||(options.skill||options.dot?'magic':'physical');
  let bonusMagic=0;
  if(source?.kind==='champion'&&target.kind!=='structure'&&!options.dot){
   if(source.heroId==='nova'&&(options.mark||options.basic)){source.marks[target.id]=(source.marks[target.id]||0)+1;if(source.marks[target.id]>=3){source.marks[target.id]=0;bonusMagic+=65+(source.stats?.abilityPower||0)*.25;this.passiveProc(source,target);}}
   if(source.heroId==='danso'&&options.skill){source.marks[target.id]=(source.marks[target.id]||0)+1;if(source.marks[target.id]>=3){source.marks[target.id]=0;bonusMagic+=45+(source.stats?.abilityPower||0)*.35;this.passiveProc(source,target);}}
  }
  let primary=mitigate(amount,target,source,type),passive=mitigate(bonusMagic,target,source,'magic');
  if(target.heroId==='young-forty'&&this.units.some(u=>u!==target&&u.team===target.team&&u.hp>0&&dist(u,target)<8)){primary*=.7;passive*=.7;if(!(target.passiveFlash>0))this.passiveProc(target);}
  let damage=primary+passive;
  if(target.buffs?.reflect>0&&source?.hp>0&&source.kind!=='structure'){const reflected=Math.min(source.hp-1,mitigate(damage*.22,source,target,'magic'));if(reflected>0){source.hp-=reflected;this.healthChangeEffect(source,-reflected,target,'reflect');recordDamage(source,this.time,target,abilitySnapshot(target,{skillKey:'w',abilityName:'금강불괴 · 반사'}),'magic',reflected);}}
  if(amount>0&&!options.dot&&target.kind!=='structure'){target.hitFlash=.24;target.hurtAnim=target.hurtDuration||.7;target.hitEvent=(target.hitEvent||0)+1;}
  const oldHp=target.hp,shield=target.shield||0,absorbed=Math.min(shield,damage);target.shield=Math.max(0,shield-absorbed);damage-=absorbed;const actualDamage=Math.min(oldHp,damage);target.hp-=damage;
  const primaryAbsorbed=Math.min(shield,primary),primaryHp=Math.min(oldHp,Math.max(0,primary-primaryAbsorbed));
  recordDamage(target,this.time,source,abilitySnapshot(source,options),type,primaryHp,primaryAbsorbed);
  if(passive>0)recordDamage(target,this.time,source,abilitySnapshot(source,{skillKey:'p'}),'magic',Math.max(0,actualDamage-primaryHp),absorbed-primaryAbsorbed);
  if(actualDamage>0&&(options.passiveHealth||options.dot||options.skillKey==='p'||actualDamage>primaryHp))this.healthChangeEffect(target,-actualDamage,source,options.dot?'debuff':'passive');
  // Basic hits keep the controlled character mobile; deliberate skill crowd control remains.
  const movementControl=!target.player||options.skill;
  if(target.kind!=='structure'){if(movementControl&&options.charm)target.charmerId=source?.id;if(movementControl){target.stun=Math.max(target.stun||0,(options.stun||0)*(1-(target.stats?.tenacity||0)));target.slow=Math.max(target.slow||0,(options.slow||0)*(1-(target.stats?.tenacity||0)));}if(options.poison){if(options.stackPoison)target.poisonStacks=Math.min(5,(target.poisonStacks||0)+1);const poisonDamage=options.stackPoison?options.poisonBase+target.poisonStacks*3:options.poisonDmg||9;if(!(target.poison>0)||poisonDamage>=(target.poisonDmg||0)){target.poisonSourceSnapshot=sourceSnapshot(source);target.poisonAttribution={skillKey:options.basic&&source?.heroId==='bora'?'p':options.skillKey,abilityName:options.basic&&source?.heroId==='bora'?KITS.bora.passive.name:options.abilityName,skillRank:options.skillRank};target.poisonTeam=source?.team;target.poisonSourceId=source?.id;}target.poison=Math.max(target.poison||0,options.poison);target.poisonDmg=Math.max(target.poisonDmg||0,poisonDamage);}if(movementControl&&options.pull&&source){const anchor=options.pullPoint||source,d=dist(anchor,target)||1,step=Math.min(2.5,d);this.move(target,(anchor.x-target.x)/d*step,(anchor.z-target.z)/d*step);}}
  if(source?.kind==='champion'&&actualDamage>0&&source.hp>0){
   const vamp=(options.basic?(source.stats?.lifeSteal||0):0)+(source.stats?.omnivamp||0)+(source.heroId==='gumiho'&&target.kind==='champion'?.18:0);
   if(vamp>0){const heal=actualDamage*vamp*(1+(source.stats?.healShieldPower||0));this.restoreHp(source,heal,source,source.heroId==='gumiho'?'passive':'lifesteal');if(source.heroId==='gumiho'&&target.kind==='champion'){source.passiveHeal=(source.passiveHeal||0)+heal;this.passiveProc(source);}}
  }
  if(!options.dot)this.effect(target.x,target.z,source?.team||'blue','hit',target.kind==='structure'?1.8:.8);
  if(target.pendingCast&&(target.stun>0||target.silence>0))this.cancelCast(target);
  if(target.hp<=0){target.hp=0;this.awardMeso(target,source);if(target.kind==='structure'){if(target.type==='inhibitor')target.respawn=70;if(source?.team===this.player.team)this.destroyed++;if(['tower','guard'].includes(target.type))this.effects.push({id:++this.id,...towerCollapseSpec(target)});else this.effect(target.x,target.z,target.team,'collapse',4,1.2);this.gainXp(other(target.team),6);if(target.type==='nexus'&&!this.winner){this.winner=other(target.team);this.player.dashing=false;this.state=this.winner===this.player.team?'victory':'gameover';}}else if(target.kind==='champion'){target.deathRecap=makeDeathRecap(target,this.time);target.basicGesture=null;this.cancelCast(target);target.consumables={};target.respawn=8+Math.floor(target.level*.5);target.deadAge=0;target.dashing=false;target.shield=0;this.effect(target.x,target.z,target.team,'death',2);this.gainXp(other(target.team),5);if(target.team!==this.player.team)this.kills++;}else{this.corpses.push({...target,id:++this.id,life:.8,deathAge:0});this.gainXp(other(target.team),1);if(target.team!==this.player.team)this.kills++;}}
  return actualDamage;
 }
 fire(source,target,damage,extra={}){const dx=target.x-source.x,dz=target.z-source.z,d=Math.hypot(dx,dz)||1;this.shots.push({id:++this.id,x:source.x,z:source.z,vx:dx/d*(extra.speed||24),vz:dz/d*(extra.speed||24),life:extra.life||1.5,damage,team:source.team,sourceId:source.id,sourceSnapshot:sourceSnapshot(source),r:extra.r||.4,hits:new Set(),...extra});}
 basic(u,t){
  if(u.hp<=0||u.pendingCast||u.moving||u.dashing||!this.isVisible(t,u.team))return;u.revealed=1.2;u.attackAnim=u.attackDuration||.7;u.attackEvent=(u.attackEvent||0)+1;if(!u.moving){u.faceX=t.x-u.x;u.faceZ=t.z-u.z;}u.attacks=(u.attacks||0)+1;let damage=u.damage,passiveHealth=false;
  if(u.kind==='minion'){const commander=this.units.find(a=>a.heroId==='kim'&&a.hp>0&&a.team===u.team&&dist(a,u)<14);if(commander){damage*=1.3;passiveHealth=true;if(!(commander.passiveFlash>0))this.passiveProc(commander,u);}if(t.kind==='minion')damage+=t.hp*(MINION_STATS[u.type]?.onHitRatio||0);else damage*=u.type==='cavalry'&&t.kind==='structure'&&['tower','guard'].includes(t.type)?.84:.6;}
  const options={basic:true,damageType:'physical',passiveHealth};let critical=false;
  if(u.heroId==='naruto'&&u.attacks%3===0){damage*=1.8;options.passiveHealth=true;this.passiveProc(u,t);}
  if(u.heroId==='lucy'&&u.attacks%4===0){damage*=2;options.passiveHealth=true;critical=true;options.slow=2;this.passiveProc(u,t);}
  if(!critical&&(u.stats?.critChance||0)>this.random())damage*=u.stats.critDamage;
  if(u.heroId==='jet'&&u.charge>=5){damage*=2.2;options.passiveHealth=true;u.charge=0;this.passiveProc(u,t);}
  if(u.heroId==='bora'){options.poison=4;options.stackPoison=true;options.poisonBase=6+(u.stats?.abilityPower||0)*.08;options.poisonDmg=options.poisonBase+3;if(!(u.passiveFlash>0))this.passiveProc(u,t);}
  if(u.heroId==='dokkaebi'&&u.attacks%4===0){options.stun=.9;this.passiveProc(u,t);}
  if(u.range<=3.2)this.hit(t,damage,u,options);else this.fire(u,t,damage,{targetId:t.id,options,...(u.kind==='minion'&&u.type==='cavalry'?{visual:'cavalry-spear'}:{})});
  u.attackCd=u.kind==='champion'?1/currentStats(u).attackSpeed:u.attackInterval||1.1;
  if(u.heroId){const dx=t.x-u.x,dz=t.z-u.z,d=Math.hypot(dx,dz)||1;u.castGesture=null;u.basicGesture={id:u.attackEvent,elapsed:0,duration:u.attackCd*.85,direction:{x:dx/d,z:dz/d}};u.attackAnim=u.basicGesture.duration;}
 }
 gestureLocked(unit=this.player){return !!(unit?.pendingCast||unit?.castGesture||unit?.basicGesture||unit?.rasenganDash);}
 setOrder(order,point=this.player){if(this.state!=='playing'||!point)return;if(!['push','hold','rally'].includes(order))return;this.order=order;this.rally={x:point.x,z:point.z};if(order==='hold')for(const u of this.units)if(u.team===this.player.team&&u.kind==='minion')u.holdPoint={x:u.x,z:u.z};}
 canCast(key,unit=this.player){const spec=unitSkill(unit,key);return !!(this.state==='playing'&&spec&&KEYS.includes(key)&&spec.rank>0&&!unit.pendingCast&&!unit.rasenganDash&&unit.hp>0&&unit.stun<=0&&unit.silence<=0&&unit.cooldowns[key]<=0&&unit.mana>=spec.manaCost);}
 skillTarget(key,unit=this.player,preferred=null){
  const spec=unitSkill(unit,key),list=this.opponents(unit,!!spec.targetStructures).filter(t=>this.isVisible(t,unit.team)&&!(t.invulnerable>0)&&dist(unit,t)<=spec.castRange+t.r);
  if(preferred?.id!==undefined)return list.find(t=>t.id===preferred.id)||null;
  const hovered=preferred&&list.filter(t=>dist(t,preferred)<t.r+1.2).sort((a,b)=>dist(a,preferred)-dist(b,preferred))[0];
  return hovered||list.sort((a,b)=>(a.kind==='champion'?0:a.kind==='minion'?1:2)-(b.kind==='champion'?0:b.kind==='minion'?1:2)||dist(a,unit)-dist(b,unit))[0]||null;
 }
 cast(key,unit=this.player,aim=this.aim){
  if(!this.canCast(key,unit))return false;
  const spec=unitSkill(unit,key),target=spec.targeting==='target'?this.skillTarget(key,unit,aim):null;if(spec.targeting==='target'&&!target)return false;
  const facingLength=Math.hypot(unit.faceX||0,unit.faceZ||0)||1,fallback={x:unit.x+(unit.faceX||0)/facingLength*(spec.castRange||1),z:unit.z+(unit.faceZ||0)/facingLength*(spec.castRange||1)};
  if(spec.targeting==='direction'){if(!unit.player&&aim&&Number.isFinite(aim.x)){const dx=aim.x-unit.x,dz=aim.z-unit.z,d=Math.hypot(dx,dz)||1;unit.faceX=dx/d;unit.faceZ=dz/d;}const d=Math.hypot(unit.faceX||0,unit.faceZ||0)||1;aim={x:unit.x+(unit.faceX||0)/d*spec.castRange,z:unit.z+(unit.faceZ||0)/d*spec.castRange};}
  aim=target||clampSkillPoint(unit,aim||fallback,spec);if(spec.targeting==='self')aim=fallback;
  const dx=aim.x-unit.x,dz=aim.z-unit.z,len=Math.hypot(dx,dz),dir=len>.01?{x:dx/len,z:dz/len}:{x:Math.hypot(unit.faceX||0,unit.faceZ||0)>0?(unit.faceX||0)/facingLength:side(unit.team),z:(unit.faceZ||0)/facingLength},point=spec.targeting==='self'?{x:unit.x,z:unit.z}:clampSkillPoint(unit,aim,spec);
  const gesture=skillGesture(spec),id=unit.castSequence=(unit.castSequence||0)+1;
  unit.mana-=spec.manaCost;unit.cooldowns[key]=spec.cooldown*100/(100+(unit.stats?.abilityHaste||0));unit.revealed=gesture.windup+1.2;unit.moving=false;unit.dashing=false;unit.faceX=dir.x;unit.faceZ=dir.z;
  unit.basicGesture=null;unit.castGesture={...gesture,id,key,elapsed:0,direction:{...dir}};
  unit.pendingCast={id,key,spec,point:{...point},dir:{...dir},len,targetId:target?.id||null,remaining:gesture.windup};
  if(spec.kind==='rasengan'&&unit.kind==='champion')for(const clone of this.units.filter(u=>u.kind==='clone'&&u.ownerId===unit.id&&u.hp>0&&!(u.stun>0)&&!(u.silence>0))){const cloneId=clone.castSequence=(clone.castSequence||0)+1;clone.stats={armorPen:unit.stats?.armorPen||0,magicPen:unit.stats?.magicPen||0};clone.basicGesture=null;clone.moving=false;clone.dashing=false;clone.faceX=dir.x;clone.faceZ=dir.z;clone.castGesture={...gesture,id:cloneId,key,elapsed:0,direction:{...dir}};clone.pendingCast={id:cloneId,key,spec,point:{x:clone.x+dir.x*spec.distance,z:clone.z+dir.z*spec.distance},dir:{...dir},len:spec.distance,targetId:null,remaining:gesture.windup,linkedOwner:unit.id,damageOverride:skillPower(unit,spec)};}
  this.lastCast={key,heroId:unit.heroId,sourceId:unit.id,targetId:target?.id||null,point:{...point},mode:spec.targeting,rank:spec.rank,phase:'windup',startedAt:this.time,windup:gesture.windup};
  return true;
 }
 cancelCast(unit){for(const clone of this.units)if(clone.pendingCast?.linkedOwner===unit.id){clone.pendingCast=null;clone.castGesture=null;}unit.pendingCast=null;unit.castGesture=null;unit.rasenganDash=null;}
 advanceCast(unit,dt){
  if(unit.castGesture){unit.castGesture.elapsed+=dt;if(unit.castGesture.elapsed>=unit.castGesture.duration)unit.castGesture=null;}
  const cast=unit.pendingCast;if(!cast)return;
  if(unit.hp<=0||unit.stun>0||unit.silence>0||cast.linkedOwner&&!this.units.some(u=>u.id===cast.linkedOwner&&u.hp>0)){this.cancelCast(unit);return;}
  cast.remaining-=dt;if(cast.remaining>1e-8)return;
  unit.pendingCast=null;
  const target=cast.targetId===null?null:[...this.units,...this.structures].find(t=>t.id===cast.targetId&&t.hp>0);
  if(cast.spec.targeting==='target'&&(!target||!this.skillTarget(cast.key,unit,target))){unit.castGesture=null;return;}
  this.executeSkill(unit,cast,target);
 }
 executeSkill(unit,{key,spec,point,dir,len,damageOverride},target){
  if(this.lastCast?.sourceId===unit.id&&this.lastCast.key===key){this.lastCast.phase='released';this.lastCast.releasedAt=this.time;}
  unit.revealed=1.2;unit.attackAnim=.35;unit.attackEvent=(unit.attackEvent||0)+1;
  const damage=damageOverride??skillPower(unit,spec),supportPower=1+(unit.stats?.healShieldPower||0),healing=(spec.heal||0)+(unit.stats?.abilityPower||0)*.35,shielding=((spec.shield||0)+(unit.stats?.abilityPower||0)*.4)*supportPower;
  const enemy=target||this.nearest(unit,13),opts={stun:spec.stun||0,slow:spec.slow||0,poison:spec.poison||0,poisonDmg:(spec.poisonDamage||9)+(unit.stats?.abilityPower||0)*.1,skill:true,skillKey:key,skillRank:spec.rank,abilityName:spec.name,damageType:spec.damageType,pull:spec.pull,pullPoint:point,mark:spec.mark,splash:spec.radius||0};
  const area=(p,r,d=damage,options=opts)=>{for(const t of this.opponents(unit))if(dist(p,t)<r+t.r)this.hit(t,d,t.kind==='structure'?unit:unit,options);this.effect(p.x,p.z,unit.team,'burst',r,.6);};
  const dash=(direction=1,distance=Math.min(len,spec.distance||8))=>{const from={x:unit.x,z:unit.z};this.move(unit,dir.x*distance*direction,dir.z*distance*direction);for(const t of this.opponents(unit))if(pointSegment(t,from,unit)<2)this.hit(t,damage,unit,opts);this.effect(from.x,from.z,unit.team,'dash',2,.35);};
  switch(spec.kind){
   case 'rasengan':unit.rasenganDash={remaining:spec.dashDuration,speed:spec.distance/spec.dashDuration,dir:{...dir},damage,options:opts,hits:new Set(),width:spec.width};this.effects.push({id:++this.id,kind:'rasengan',sourceId:unit.id,team:unit.team,x:unit.x,z:unit.z,dir:{...dir},life:spec.dashDuration+.1,duration:spec.dashDuration+.1});break;
   case 'shot':this.fire(unit,target,damage,{targetId:target.id,life:spec.castRange/24+1,options:opts});break;
   case 'pierce':case 'charm':case 'return':this.fire(unit,{x:unit.x+dir.x*30,z:unit.z+dir.z*30},damage,{life:spec.castRange/24+(spec.kind==='return'?2:0),returnDistance:spec.castRange,r:spec.kind==='charm'?.65:.6,pierce:spec.kind==='pierce'||spec.kind==='return',returning:spec.kind==='return',options:{...opts,stun:spec.kind==='charm'?spec.stun:opts.stun,charm:spec.kind==='charm'}});break;
   case 'fan':for(let i=0;i<spec.count;i++){const a=Math.atan2(dir.z,dir.x)+(i-(spec.count-1)/2)*.28;this.fire(unit,{x:unit.x+Math.cos(a)*20,z:unit.z+Math.sin(a)*20},damage,{life:spec.castRange/24,options:opts});}break;
   case 'beam':for(const t of this.opponents(unit))if(pointSegment(t,unit,{x:unit.x+dir.x*spec.range,z:unit.z+dir.z*spec.range})<(spec.width||1.3)+t.r)this.hit(t,damage,unit,opts);this.effects.push({id:++this.id,x:unit.x,z:unit.z,endX:unit.x+dir.x*spec.range,endZ:unit.z+dir.z*spec.range,team:unit.team,kind:'beam',radius:(spec.width||1.3)*2,life:.4,duration:.4});break;
   case 'area':area(point,spec.radius);break;
   case 'cone':for(const t of this.opponents(unit)){const d=dist(unit,t)||1;if(d<(spec.radius||5)+t.r&&((t.x-unit.x)*dir.x+(t.z-unit.z)*dir.z)/d>.25)this.hit(t,damage,unit,opts);}this.effect(unit.x+dir.x*2,unit.z+dir.z*2,unit.team,'burst',spec.radius,.5);break;
   case 'dash':dash();break;
   case 'retreat':dash();if(enemy&&this.isVisible(enemy,unit.team)&&dist(unit,enemy)<=18+enemy.r)this.fire(unit,enemy,damage,{targetId:enemy.id,options:opts});break;
   case 'blink':this.move(unit,dir.x*Math.min(len,spec.distance),dir.z*Math.min(len,spec.distance));area(unit,3);break;
   case 'evade':dash();unit.invulnerable=spec.duration;break;
   case 'rhythm':dash();area(unit,4);break;
   case 'multidash':for(let i=0;i<spec.count;i++){const victim=target.hp>0&&this.isVisible(target,unit.team)?target:this.skillTarget(key,unit);if(!victim)break;const d=dist(unit,victim)||1,step=Math.max(0,Math.min(spec.distance,d-1.4));this.move(unit,(victim.x-unit.x)/d*step,(victim.z-unit.z)/d*step);area(unit,3,damage);}break;
   case 'heal':for(const ally of this.units)if(ally.team===unit.team&&ally.hp>0&&dist(point,ally)<spec.radius+ally.r)this.restoreHp(ally,healing*supportPower,unit,'skill');this.effect(point.x,point.z,unit.team,'heal',spec.radius,.8);break;
   case 'shield':for(const ally of this.units)if(ally.team===unit.team&&ally.hp>0&&dist(point,ally)<spec.radius+ally.r)ally.shield=(ally.shield||0)+shielding;break;
   case 'buff':if(spec.shield)unit.shield+=shielding;for(const stat of ['speed','haste'])if(spec[stat]){unit.buffs[stat]=spec.duration;unit[stat+'Power']=spec[stat];}this.effect(unit.x,unit.z,unit.team,'buff',3,.8);break;
   case 'reflect':unit.shield+=shielding;unit.buffs.reflect=spec.duration;break;
   case 'regen':unit.regen=healing*supportPower/spec.duration;unit.buffs.regen=spec.duration;break;
   case 'rally':for(const ally of this.units)if(ally.team===unit.team&&ally.kind==='minion'){ally.buffs.speed=spec.duration;ally.speedPower=spec.speed;}break;
   case 'pull':area(point,spec.radius,damage,{...opts,pull:true});break;
   case 'drain':if(target){const dealt=this.hit(target,damage,unit,opts);this.restoreHp(unit,dealt,unit,'drain');}break;
   case 'silence':for(const t of this.opponents(unit,false))if(dist(point,t)<spec.radius+t.r){t.silence=spec.duration;this.hit(t,damage,unit,opts);}this.effect(point.x,point.z,unit.team,'silence',spec.radius,.8);break;
   case 'homing':for(let i=0;i<spec.count;i++)this.fire(unit,target,damage,{targetId:target.id,options:opts});break;
   case 'plague':area(point,spec.radius,damage,{...opts,poisonDmg:spec.poisonDamage+(unit.stats?.abilityPower||0)*.1});break;
   case 'summon':for(const old of this.units)if(old.kind==='clone'&&old.ownerId===unit.id){old.hp=0;old.pendingCast=null;old.castGesture=null;old.rasenganDash=null;}for(let i=0;i<spec.count;i++){const a=-Math.PI/2+i*Math.PI*2/spec.count,clone={id:++this.id,kind:'clone',ownerId:unit.id,heroId:unit.heroId,team:unit.team,x:unit.x,z:unit.z,hp:70,maxHp:70,damage,range:2.5,speed:8,r:.4,collisionRadius:.28,life:spec.duration,attackCd:0,shield:0,buffs:{},stun:0,silence:0,slow:0,faceX:unit.faceX,faceZ:unit.faceZ,moving:false,castSequence:0};this.move(clone,Math.cos(a)*2.2,Math.sin(a)*2.2);this.units.push(clone);}break;
   case 'zone':case 'trap':case 'orbit':case 'barrage':this.zones.push({id:++this.id,x:spec.kind==='orbit'?unit.x:point.x,z:spec.kind==='orbit'?unit.z:point.z,team:unit.team,sourceId:unit.id,sourceSnapshot:sourceSnapshot(unit),kind:spec.kind,radius:spec.radius||2,life:spec.duration||(spec.kind==='barrage'?2.5:12),tick:0,damage,options:opts,remaining:spec.count||0});break;
  }
  for(const clone of this.units)if(clone.ownerId===unit.id&&!canWalk(clone.x,clone.z,movementRadius(clone),this.structures)){clone.x=unit.x;clone.z=unit.z;}
  this.effects.push({id:++this.id,...castEffectSpec(unit,dir)});return true;
 }
 advanceRasengan(unit,dt){
  const dash=unit.rasenganDash;if(!dash)return;if(unit.hp<=0||unit.stun>0){unit.rasenganDash=null;return;}
  const from={x:unit.x+dash.dir.x*.8,z:unit.z+dash.dir.z*.8},step=Math.min(dt,dash.remaining);this.move(unit,dash.dir.x*dash.speed*step,dash.dir.z*dash.speed*step);const to={x:unit.x+dash.dir.x*.8,z:unit.z+dash.dir.z*.8};
  for(const target of this.opponents(unit))if(!dash.hits.has(target.id)&&pointSegment(target,from,to)<dash.width+target.r&&clearSight(unit,target)){dash.hits.add(target.id);this.hit(target,dash.damage,unit,dash.options);}
  dash.remaining-=step;if(dash.remaining<=1e-8)unit.rasenganDash=null;
 }
 update(dt,input={x:0,z:0}){
  if(this.state!=='playing')return;dt=Math.min(dt,.05);this.time+=dt;this.waveClock-=dt;if(this.waveClock<=0){this.waveSpawn();this.waveClock=9;}
  for(const u of this.units){if(u.basicGesture){u.basicGesture.elapsed+=dt;if(u.hp<=0||u.stun>0||u.basicGesture.elapsed>=u.basicGesture.duration)u.basicGesture=null;}u.aiming=!!(u.player&&input.aiming);u.moving=false;u.dashing=false;u.dashTrail=Math.max(0,(u.dashTrail||0)-dt);for(const timer of ['attackAnim','hurtAnim','hitFlash','bornAnim','revealed','passiveFlash'])u[timer]=Math.max(0,(u[timer]||0)-dt);if(u.hp<=0){if(u.kind==='champion'){u.deadAge=(u.deadAge||0)+dt;for(const key of KEYS)u.cooldowns[key]=Math.max(0,u.cooldowns[key]-dt);u.respawn-=dt;if(u.respawn<=0){this.cancelCast(u);u.basicGesture=null;u.damageLog=[];u.hp=u.maxHp;u.mana=u.maxMana;u.charge=0;u.attacks=0;u.marks={};u.passiveFlash=0;u.x=-side(u.team)*104;u.navigation=null;u.z=0;u.stun=0;u.slow=0;u.silence=0;u.poison=0;u.consumables={};u.charmerId=null;u.buffs={};u.hitFlash=0;u.hurtAnim=0;u.deadAge=0;u.invulnerable=2;u.shield=0;}}continue;}
   for(const name of ['stun','slow','silence','invulnerable'])u[name]=Math.max(0,(u[name]||0)-dt);for(const name of Object.keys(u.buffs||{}))u.buffs[name]=Math.max(0,u.buffs[name]-dt);
   if(!(u.heroId==='int'&&u.shield<=60))u.shield=Math.max(0,(u.shield||0)-dt*2);u.attackCd-=dt;if(u.life){u.life-=dt;if(u.life<=0)u.hp=0;}
   if(u.poison>0){const tick=Math.min(dt,u.poison);u.poison-=dt;this.hit(u,u.poisonDmg*tick,this.units.find(source=>source.id===u.poisonSourceId)||u.poisonSourceSnapshot||{team:u.poisonTeam},{...u.poisonAttribution,dot:true,damageType:'magic'});}
   if(u.kind==='champion'&&u.hp>0){u.damageLog=u.damageLog.filter(e=>e.time>=this.time-RECAP_WINDOW);for(const [resource,effect]of Object.entries(u.consumables)){const tick=Math.min(dt,effect.remaining),max=resource==='hp'?u.maxHp:u.maxMana;if(resource==='hp')this.restoreHp(u,effect.rate*tick,u,'potion');else u[resource]=Math.min(max,u[resource]+effect.rate*tick);effect.remaining-=tick;if(effect.remaining<=1e-8)delete u.consumables[resource];}u.hp=Math.min(u.maxHp,u.hp+u.stats.hpRegen5/5*dt);u.mana=Math.min(u.maxMana,u.mana+u.stats.manaRegen5/5*dt);u.deadAge=(u.deadAge||0)+dt;for(const key of KEYS)u.cooldowns[key]=Math.max(0,u.cooldowns[key]-dt);if(Math.abs(u.x+side(u.team)*108)<10)u.hp=Math.min(u.maxHp,u.hp+u.maxHp*.1*dt);if(u.heroId==='int'){this.restoreHp(u,2.5*dt,u,'passive');if(u.shield<60)u.shield=Math.min(60,u.shield+5*dt);if(u.shield<60&&!(u.passiveFlash>0))this.passiveProc(u);}if(u.heroId==='young-forty'&&u.hp<u.maxHp*.4){this.restoreHp(u,9*dt,u,'passive');if(!(u.passiveFlash>0))this.passiveProc(u);}if(u.buffs.regen>0)this.restoreHp(u,u.regen*dt,u,'regen');}
   if(u.hp<=0)continue;if(u.heroId)this.advanceCast(u,dt);this.advanceRasengan(u,dt);if(this.gestureLocked(u))continue;if(u.stun>0){if(u.charmerId){const source=this.units.find(a=>a.id===u.charmerId&&a.hp>0);if(source){const d=dist(source,u)||1;this.move(u,(source.x-u.x)/d*u.speed*.6*dt,(source.z-u.z)/d*u.speed*.6*dt);}}continue;}u.charmerId=null;if(u.poison<=0)u.poisonStacks=0;let vx=0,vz=0;
   if(u.player){vx=u.aiming?0:input.x;vz=u.aiming?0:input.z;if(vx||vz)this.destination=null;else if(!u.aiming&&this.destination){const d=dist(u,this.destination);if(d>.7){vx=(this.destination.x-u.x)/d;vz=(this.destination.z-u.z)/d;}else this.destination=null;}}
   else{const t=this.nearest(u,u.kind==='champion'?17:12),holding=u.kind==='minion'&&u.team===this.player.team&&this.order!=='push',goal=holding?(this.order==='hold'?(u.holdPoint||(u.holdPoint={x:u.x,z:u.z})):this.rally):t||this.structures.filter(s=>s.team!==u.team&&s.hp>0&&this.isOpen(s)).sort((a,b)=>dist(u,a)-dist(u,b))[0];
    if(u.kind==='champion'){u.botThink-=dt;if(u.hp<u.maxHp*.23){vx=-side(u.team);vz=-u.z*.1;}else if(t){if(dist(u,t)>u.range*.83){vx=t.x-u.x;vz=t.z-u.z;}if(u.botThink<=0){for(const key of KEYS)if(u.cooldowns[key]<=0){const s=unitSkill(u,key);if(s.kind==='rasengan'&&dist(u,t)>s.distance+s.width+.8+t.r)continue;const support=['heal','shield'].includes(s.kind),aim=support?this.units.filter(a=>a.hp>0&&a.team===u.team&&dist(u,a)<=s.castRange).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0]||u:t;if(this.cast(key,u,aim))break;}u.botThink=.6;}}else if(goal){vx=goal.x-u.x;vz=goal.z-u.z;}}
    else if(goal&&(!t||dist(u,t)>u.range+t.r)){const d=dist(u,goal);if(!holding||d>3){vx=goal.x-u.x;vz=goal.z-u.z;}}
   }
   if(u.pendingCast)continue;
   if((vx||vz)&&!(u.player&&(input.x||input.z))){const goal=u.player?this.destination:{x:u.x+vx,z:u.z+vz};if(goal){const direction=navigationDirection(u,goal,this.structures);vx=direction.x;vz=direction.z;}}else if(u.player)u.navigation=null;
   const len=Math.hypot(vx,vz);if(len){u.dashing=!!(u.player&&input.dash&&(input.x||input.z));const speed=u.speed*(u.dashing?DASH_SPEED_MULTIPLIER:1)*(u.slow>0?.5:1)*(u.buffs.speed>0?u.speedPower||1.5:1);this.move(u,vx/len*speed*dt,vz/len*speed*dt,u.r);u.moving=true;u.faceX=vx/len;u.faceZ=vz/len;if(u.dashing&&u.dashTrail<=0){this.effect(u.x-vx/len*.9,u.z-vz/len*.9,u.team,'dash',.55,.24);u.dashTrail=.12;}if(u.heroId==='jet')u.charge=Math.min(5,u.charge+dt*speed/u.speed);}
   if(!u.aiming&&!u.moving&&!u.dashing&&u.attackCd<=0){const t=this.nearest(u,u.range);if(t)this.basic(u,t);}
  }
  for(const s of this.structures){if(s.hp<=0){if(s.type==='inhibitor'&&s.respawn>0){s.respawn-=dt;if(s.respawn<=0){s.hp=s.maxHp;this.effect(s.x,s.z,s.team,'heal',3);}}continue;}if(!['tower','guard'].includes(s.type))continue;s.attackCd-=dt;let t=this.units.find(u=>u.id===s.targetId&&u.hp>0&&u.team!==s.team&&this.isVisible(u,s.team)&&dist(s,u)<14);if(!t){const targets=this.units.filter(u=>u.hp>0&&u.team!==s.team&&this.isVisible(u,s.team)&&dist(u,s)<14).sort((a,b)=>(a.kind==='champion'?1:0)-(b.kind==='champion'?1:0)||dist(s,a)-dist(s,b));t=targets[0];s.targetId=t?.id;}if(t&&s.attackCd<=0){this.fire(s,t,t.kind==='champion'?70:t.maxHp*(t.type==='ranged'?.7:t.type==='cavalry'?(s.type==='guard'?.08:s.stage===0?.14:.11):.45),{targetId:t.id,speed:27,tower:true});s.attackCd=.9;}}
  for(const s of this.shots){const source=this.units.find(u=>u.id===s.sourceId)||this.structures.find(u=>u.id===s.sourceId)||s.sourceSnapshot||{team:s.team};if(s.returning&&s.turned&&Number.isFinite(source.x)){const d=dist(s,source)||1;if(d<.7){s.life=0;continue;}const speed=Math.hypot(s.vx,s.vz);s.vx=(source.x-s.x)/d*speed;s.vz=(source.z-s.z)/d*speed;}if(s.targetId){const target=this.units.find(u=>u.id===s.targetId&&u.hp>0)||this.structures.find(u=>u.id===s.targetId&&u.hp>0);if(target&&this.isVisible(target,s.team)){const d=dist(s,target)||1,speed=Math.hypot(s.vx,s.vz);s.vx=(target.x-s.x)/d*speed;s.vz=(target.z-s.z)/d*speed;}else{s.life=0;continue;}}s.x+=s.vx*dt;s.z+=s.vz*dt;s.life-=dt;for(const t of [...this.units,...this.structures])if(t.hp>0&&t.team!==s.team&&(!s.targetId||s.targetId===t.id)&&!s.hits.has(t.id)&&dist(s,t)<t.r+s.r){this.hit(t,s.damage,source,s.options||{});if(s.options?.splash)for(const near of this.opponents(source))if(near!==t&&dist(near,t)<s.options.splash)this.hit(near,s.damage*.5,source,{skill:true,skillKey:s.options.skillKey,skillRank:s.options.skillRank,abilityName:s.options.abilityName,damageType:s.options.damageType});s.hits.add(t.id);if(!s.pierce)s.life=0;break;}if(s.returning&&!s.turned){s.travelled=(s.travelled||0)+Math.hypot(s.vx,s.vz)*dt;if(s.travelled>=s.returnDistance){s.turned=true;s.life=2;s.vx=-s.vx;s.vz=-s.vz;s.hits.clear();}}}
  for(const z of this.zones){z.life-=dt;z.tick-=dt;const source=this.units.find(u=>u.id===z.sourceId)||z.sourceSnapshot||{team:z.team};if(z.kind==='orbit'){z.x=source.x;z.z=source.z;}if(z.tick<=0){const targets=this.opponents(source).filter(t=>dist(z,t)<z.radius+t.r);if(z.kind==='trap'&&!targets.length)continue;for(const t of targets)this.hit(t,z.damage,source,z.options);z.tick=z.kind==='barrage'?.5:.7;if(z.kind==='trap')z.life=0;this.effect(z.x,z.z,z.team,'zone',z.radius,.45);}}
  // Separate dense waves while preserving their horizontal push direction.
  const living=this.units.filter(u=>u.hp>0);for(let i=0;i<living.length;i++)for(let j=i+1;j<living.length;j++){const a=living[i],b=living[j],d=dist(a,b),r=movementRadius(a)+movementRadius(b);if(d<r){const push=(r-d)*.25,nx=d>1e-6?(a.x-b.x)/d:a.id<b.id?-1:1,nz=d>1e-6?(a.z-b.z)/d:0;this.move(a,nx*push,nz*push,a.r);this.move(b,-nx*push,-nz*push,b.r);}}
  for(const c of this.corpses){c.life-=dt;c.deathAge+=dt;c.hitFlash=Math.max(0,(c.hitFlash||0)-dt);}this.corpses=this.corpses.filter(c=>c.life>0);for(const reward of this.rewards)reward.life-=dt;this.rewards=this.rewards.filter(r=>r.life>0);
  this.units=this.units.filter(u=>u.kind==='champion'||u.hp>0);this.shots=this.shots.filter(s=>s.life>0);this.zones=this.zones.filter(z=>z.life>0);for(const e of this.effects){e.life-=dt;if(e.kind==='cast'||e.kind==='health'||e.kind==='rasengan'){const source=this.units.find(u=>u.id===(e.kind==='health'?e.targetId:e.sourceId));if(source){e.x=source.x;e.z=source.z;}if(e.kind==='rasengan'&&(!source||source.hp<=0))e.life=0;}}this.effects=this.effects.filter(e=>e.life>0).slice(-120);
 }
}
function pointSegment(p,a,b){const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/(dx*dx+dz*dz||1)));return Math.hypot(p.x-a.x-t*dx,p.z-a.z-t*dz);}
