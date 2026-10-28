import {HEROES} from './heroes.js';
import {KITS} from './kits.js';
import {MINION_STATS} from './minion-stats.js';
export const RECAP_WINDOW=10;
export function sourceSnapshot(source={}){
 source=source||{};
 const hero=HEROES.find(h=>h.id===source.heroId),structure={tower:'전방 포탑',guard:'기지 포탑',nexus:'넥서스',inhibitor:'억제기'};
 return{id:source.id??'unknown',kind:source.kind||'unknown',heroId:source.heroId,ownerId:source.ownerId,type:source.type,team:source.team,level:source.level,x:source.x,z:source.z,name:source.name|| (hero?hero.name+(source.kind==='clone'?' 분신':''):MINION_STATS[source.type]?.name||structure[source.type]||'알 수 없는 공격자'),stats:{armorPen:source.stats?.armorPen||0,magicPen:source.stats?.magicPen||0}};
}
export function abilitySnapshot(source,options={}){
 const key=options.skillKey||(options.dot&&source?.heroId==='bora'?'p':options.basic?'aa':options.skill?'skill':source?.kind==='structure'?'tower':'aa');
 const name=options.abilityName||(key==='p'?KITS[source?.heroId]?.passive.name:KITS[source?.heroId]?.[key]?.name)||(key==='tower'?'포탑 공격':key==='skill'?'스킬 공격':'기본 공격');
 return{key,name:name+(options.dot&&!name.includes('지속 피해')?' · 지속 피해':''),rank:options.skillRank||0,dot:!!options.dot};
}
export function recordDamage(target,time,source,ability,type,amount,absorbed=0){
 if(target.kind!=='champion'||amount<=0&&absorbed<=0)return null;
 const event={time,source:sourceSnapshot(source),ability,type,amount:Math.max(0,amount),absorbed:Math.max(0,absorbed)};
 target.damageLog=(target.damageLog||[]).filter(e=>e.time>=time-RECAP_WINDOW);target.damageLog.push(event);if(target.damageLog.length>1500)target.damageLog.shift();return event;
}
export function makeDeathRecap(unit,time){
 const events=(unit.damageLog||[]).filter(e=>e.time>=time-RECAP_WINDOW),types={physical:0,magic:0,true:0},groups=new Map();let total=0,absorbed=0;
 for(const e of events){
  total+=e.amount;absorbed+=e.absorbed;types[e.type]+=e.amount;
  const s=e.source,sourceKey=s.kind==='minion'?`${s.team}:minion:${s.type}`:s.kind==='clone'?`${s.team}:clone:${s.ownerId||s.heroId}`:`${s.kind}:${s.id}`;
  if(!groups.has(sourceKey))groups.set(sourceKey,{key:sourceKey,source:{...s},sourceIds:[],amount:0,absorbed:0,types:{physical:0,magic:0,true:0},abilities:[]});const group=groups.get(sourceKey);if(!group.sourceIds.includes(s.id))group.sourceIds.push(s.id);group.amount+=e.amount;group.absorbed+=e.absorbed;group.types[e.type]+=e.amount;
  let skill=group.abilities.find(a=>a.key===e.ability.key&&a.name===e.ability.name&&a.type===e.type);if(!skill){skill={...e.ability,type:e.type,amount:0,absorbed:0,hits:0};group.abilities.push(skill);}skill.amount+=e.amount;skill.absorbed+=e.absorbed;if(!e.ability.dot)skill.hits++;
 }
 const final=[...events].reverse().find(e=>e.amount>0),sources=[...groups.values()].sort((a,b)=>b.amount-a.amount);for(const s of sources)s.abilities.sort((a,b)=>b.amount-a.amount);
 return{at:time,window:RECAP_WINDOW,duration:events.length?time-events[0].time:0,total,absorbed,types,sources,killer:final?{source:{...final.source},ability:{...final.ability},type:final.type,amount:final.amount}:null};
}
