import assert from 'node:assert/strict';
import {Survival,HEROES} from '../src/survival/engine.js';
import {KEYS,KITS} from '../src/survival/kits.js';
import {MAX_LEVEL,SKILL_MAX_RANKS,upgradeInfo,unitSkill,skillAtRank} from '../src/survival/skill-levels.js';
import {statsAt,skillPower} from '../src/survival/stats.js';
const releaseCast=(g,u=g.player)=>{if(u.pendingCast)g.advanceCast(u,u.pendingCast.remaining);};
const close=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} != ${b}`);
function levelTo(g,level){while(g.player.level<level)g.gainXp(g.player.team,g.player.required);}
for(const hero of HEROES){
 const g=new Survival();g.start(hero.id);const p=g.player;
 assert.equal(p.level,1);assert.equal(p.skillPoints,1);assert.deepEqual(p.skillRanks,{q:0,w:0,e:0,r:0});for(const key of KEYS){assert(!g.canCast(key));assert(!g.cast(key));}assert.equal(p.mana,p.maxMana);
 assert(g.upgradeSkill('q'));assert.equal(p.skillPoints,0);assert.equal(p.skillRanks.q,1);assert(!g.upgradeSkill('w'));assert(!g.upgradeSkill('r'));assert.equal(p.skillRanks.r,0);
 levelTo(g,2);assert.equal(p.skillPoints,1);assert.equal(upgradeInfo(p,'q').requiredLevel,3);assert(!g.upgradeSkill('q'));assert(g.upgradeSkill('w'));
 levelTo(g,3);assert(g.upgradeSkill('q'));assert.equal(p.skillRanks.q,2);
 levelTo(g,5);assert(!g.upgradeSkill('r'));levelTo(g,6);assert(g.upgradeSkill('r'));assert.equal(p.skillRanks.r,1);
 levelTo(g,10);assert(!g.upgradeSkill('r'));levelTo(g,11);assert(g.upgradeSkill('r'));levelTo(g,15);assert(!g.upgradeSkill('r'));levelTo(g,16);assert(g.upgradeSkill('r'));
 levelTo(g,18);assert.equal(p.level,MAX_LEVEL);assert.equal(p.xp,0);assert.equal(p.required,0);assert.equal(Object.values(p.skillRanks).reduce((a,b)=>a+b,0)+p.skillPoints,18);
 for(const key of KEYS)while(p.skillRanks[key]<SKILL_MAX_RANKS[key])assert(g.upgradeSkill(key));assert.equal(p.skillPoints,0);assert.deepEqual(p.skillRanks,{q:5,w:5,e:5,r:3});for(const key of KEYS)assert(!g.upgradeSkill(key));
 const stats={...p.stats},ranks={...p.skillRanks};g.gainXp(p.team,1e12);assert.equal(p.level,18);assert.equal(p.skillPoints,0);assert.equal(p.xp,0);assert.deepEqual(p.stats,stats);
 for(const key of KEYS){const first=skillAtRank(hero.id,key,1),max=unitSkill(p,key);assert(max.cooldown<first.cooldown&&max.manaCost>=first.manaCost);if(first.damage)assert(skillPower(p,max)>skillPower(p,first));else assert(['heal','shield','duration','speed','haste'].some(field=>max[field]>first[field]),hero.id+key+' stronger utility');}
 g.hit(p,1e9,g.bot);p.respawn=.01;g.update(.05);assert(p.hp>0);assert.deepEqual(p.skillRanks,ranks);assert.equal(p.skillPoints,0);
 g.start(hero.id);assert.equal(g.player.level,1);assert.equal(g.player.skillPoints,1);assert.deepEqual(g.player.skillRanks,{q:0,w:0,e:0,r:0});
 const bot=g.bot;assert.equal(bot.skillRanks.q,1);for(let i=0;i<30;i++)g.gainXp(bot.team,100000);assert.equal(bot.level,18);assert.equal(bot.skillPoints,0);assert.deepEqual(bot.skillRanks,{q:5,w:5,e:5,r:3});
}
{const g=new Survival();g.start('nova');const p=g.player;g.waveClock=999;p.x=p.z=0;g.bot.x=4;g.bot.z=0;g.bot.stun=999;g.bot.hp=g.bot.maxHp=10000;g.upgradeSkill('q');assert(g.cast('q'));releaseCast(g);const oldCd=p.cooldowns.q;levelTo(g,3);const mana=p.mana;assert(g.upgradeSkill('q'));close(p.cooldowns.q,oldCd);close(p.mana,mana);p.cooldowns.q=0;assert(g.cast('q'));releaseCast(g);assert.equal(g.lastCast.rank,2);close(p.cooldowns.q,unitSkill(p,'q').cooldown);assert(g.shots.at(-1).damage>g.shots[0].damage);}
{const g=new Survival();g.start();g.hit(g.player,1e9,g.bot);g.gainXp(g.player.team,g.player.required);assert.equal(g.player.hp,0);const points=g.player.skillPoints;assert(g.upgradeSkill('w'));assert.equal(g.player.hp,0);assert.equal(g.player.skillPoints,points-1);}
for(const h of HEROES)assert.deepEqual(statsAt(h,999),statsAt(h,18));
{const g=new Survival();g.start('int');levelTo(g,18);const p=g.player;g.upgradeSkill('w');p.hp=1;g.cast('w',p,p);releaseCast(g);const first=p.hp;p.cooldowns.w=0;for(let i=0;i<4;i++)g.upgradeSkill('w');p.hp=1;g.cast('w',p,p);releaseCast(g);assert(p.hp>first);}
console.log('PASS 11 heroes × 18 levels: point budgets, locked unlearned skills, QWE 1/3/5/7/9 and R 6/11/16 gates, 5/5/5/3 caps, rank damage/utility/cooldowns, no cooldown/mana reset, death persistence, fresh-match reset, AI allocation and absolute level/stat/XP cap');
