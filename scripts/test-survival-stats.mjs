// Casting/stat fixtures start with learned rank-1 spells; allocation rules have separate progression tests.
import assert from 'node:assert/strict';
import {Survival,HEROES} from '../src/survival/engine.js';
import {statsAt,currentStats,STAT_LABELS,mitigate} from '../src/survival/stats.js';
import {PASSIVES,passiveState} from '../src/survival/passives.js';
const releaseCast=(g,u=g.player)=>{if(u.pendingCast)g.advanceCast(u,u.pendingCast.remaining);};
const close=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} != ${b}`);
const setup=id=>{const g=new Survival(()=>.5);g.start(id);g.player.skillRanks={q:1,w:1,e:1,r:1};g.structures=[];g.waveClock=999;g.player.x=g.player.z=0;g.bot.x=2;g.bot.z=0;g.bot.hp=g.bot.maxHp=10000;g.bot.stun=999;g.bot.attackCd=999;return g;};
for(const h of HEROES){
 const base=statsAt(h),grown=statsAt(h,2);for(const key of Object.keys(STAT_LABELS))assert(Number.isFinite(base[key])&&base[key]>=0,h.id+key);
 assert(grown.maxHp>base.maxHp&&grown.attackDamage>base.attackDamage&&grown.attackSpeed>base.attackSpeed&&grown.armor>base.armor&&grown.magicResist>base.magicResist);
 const g=setup(h.id),p=g.player;g.units=[p];p.attackCd=999;p.hp-=100;p.mana-=100;const hp=p.hp,mana=p.mana;for(let i=0;i<100;i++)g.update(.05);
 close(p.hp-hp,base.hpRegen5+(h.id==='int'?12.5:0));close(p.mana-mana,base.manaRegen5);
 const prev=p.maxHp;g.gainXp(p.team,p.required);assert.equal(p.level,2);assert(p.maxHp>prev);close(p.damage,grown.attackDamage);close(p.stats.attackSpeed,grown.attackSpeed);
 assert(PASSIVES[h.id].shape&&PASSIVES[h.id].desc);assert(Number.isFinite(passiveState(p,g.units).ratio));
}
{const g=setup('naruto'),p=g.player,t=g.bot;t.stats.armor=100;t.stats.magicResist=0;let hp=t.hp;close(g.hit(t,100,p,{damageType:'physical'}),50);close(hp-t.hp,50);hp=t.hp;close(g.hit(t,100,p,{damageType:'magic'}),100);close(hp-t.hp,100);t.stats.magicResist=100;close(g.hit(t,100,p,{damageType:'magic'}),50);close(g.hit(t,100,p,{damageType:'true'}),100);p.stats.armorPen=50;close(g.hit(t,100,p),100/1.5);t.shield=100;hp=t.hp;close(g.hit(t,100,p),0);close(t.hp,hp);close(t.shield,100-100/1.5);}
{const g=setup('naruto'),p=g.player,t=g.bot;p.hp-=100;p.xp=0;p.required=1e9;p.stats.lifeSteal=.2;t.hp=10;const hp=p.hp;close(g.hit(t,1000,p,{basic:true,damageType:'true'}),10);close(p.hp-hp,2);assert.equal(g.rewards.length,1);g.hit(t,1000,p);assert.equal(g.rewards.length,1);}
{const g=setup('bora'),p=g.player;assert(g.cast('q'));releaseCast(g);const damage=g.shots.at(-1).damage,mana=p.mana;p.cooldowns.q=0;p.stats.abilityPower+=100;assert(g.cast('q'));releaseCast(g);close(g.shots.at(-1).damage-damage,65);assert(p.mana<mana);p.cooldowns.q=0;p.mana=0;assert(!g.cast('q'));close(p.cooldowns.q,0);}
{const g=setup('nova'),p=g.player;p.stats.abilityHaste=100;assert(g.cast('q'));close(p.cooldowns.q,2);releaseCast(g);p.stats.attackSpeed=2;g.basic(p,g.bot);close(p.attackCd,.5);p.buffs.haste=3;p.hastePower=2;g.basic(p,g.bot);close(currentStats(p).attackSpeed,2.5);close(p.attackCd,.4);p.stats.critChance=1;p.stats.critDamage=1.75;p.attacks=0;g.basic(p,g.bot);close(g.shots.at(-1).damage,p.damage*1.75);}
// Every passive emits its own identity and is driven by a distinct mechanic.
for(const h of HEROES){
 const g=setup(h.id),p=g.player,t=g.bot;p.attackCd=999;
 switch(h.id){
  case 'naruto':for(let i=0;i<3;i++)g.basic(p,t);break;
  case 'int':g.update(.05);break;
  case 'kim':{g.waveSpawn();const m=g.units.find(u=>u.team===p.team&&u.kind==='minion');m.x=1;m.z=0;g.basic(m,t);break;}
  case 'nova':for(let i=0;i<3;i++)g.hit(t,1,p,{basic:true});break;
  case 'lucy':case 'dokkaebi':for(let i=0;i<4;i++)g.basic(p,t);break;
  case 'jet':p.charge=5;g.basic(p,t);assert.equal(p.charge,0);break;
  case 'bora':g.basic(p,t);assert(g.shots.at(-1).options.poisonDmg>9);break;
  case 'gumiho':p.hp-=50;g.hit(t,30,p);assert(p.passiveHeal>0);break;
  case 'young-forty':p.hp=p.maxHp*.3;g.update(.05);break;
  case 'danso':for(let i=0;i<3;i++)g.hit(t,1,p,{skill:true});break;
 }
 assert(p.passiveEvents>0,h.id+' passive event');assert(g.effects.some(e=>e.kind==='passive'&&e.heroId===h.id));
}
assert.equal(new Set(Object.values(PASSIVES).map(p=>p.shape)).size,HEROES.length);
assert.equal(mitigate(100,{stats:{armor:0}},{stats:{armorPen:999}}),100);
console.log('PASS 11 rosters × 20 stats, level growth, exact 5s HP/mana regeneration, physical/magic/true damage, penetration/shields, actual-damage lifesteal, AP scaling, mana gating, haste/AS/crit and 11 unique passive mechanics/events');

{const g=setup('int'),p=g.player;g.units=[p];g.update(.05);close(p.shield,.25);assert(g.cast('r'));releaseCast(g);const shield=p.shield;g.update(.05);assert(p.shield>160&&p.shield<shield,'passive must preserve the larger ultimate shield');}
{const g=setup('bora');g.basic(g.player,g.bot);assert.equal(g.bot.poisonStacks||0,0,'firing alone must not stack poison');g.update(.05);assert.equal(g.bot.poisonStacks,1,'landed attack adds one stack');}
console.log('PASS passive shield preserves ultimate shield; poison stacks only on landed attacks');
