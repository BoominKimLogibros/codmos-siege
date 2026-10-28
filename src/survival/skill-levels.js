import {KITS,KEYS} from './kits.js';
import {MAX_LEVEL,SKILL_MAX_RANKS,ULTIMATE_LEVELS} from './progression-constants.js';
export {MAX_LEVEL,SKILL_MAX_RANKS,ULTIMATE_LEVELS};
const rounded=n=>Math.round(n*100)/100;
export function skillAtRank(heroId,key,rank=1){
 const base=KITS[heroId]?.[key];if(!base||!KEYS.includes(key))return null;
 rank=Math.max(0,Math.min(SKILL_MAX_RANKS[key],rank));const n=Math.max(0,rank-1),ultimate=key==='r',result={...base,rank,maxRank:SKILL_MAX_RANKS[key]};
 if(heroId==='naruto'&&key==='w')result.count=1+n;
 result.damage=Math.round(base.damage*(1+(ultimate?.5:.28)*n));
 result.cooldown=rounded(base.cooldown*(1-(ultimate?.15:.1)*n));
 result.manaCost=base.manaCost+n*(ultimate?10:3);
 for(const field of ['heal','shield'])if(base[field])result[field]=Math.round(base[field]*(1+(ultimate?.5:.3)*n));
 if(base.duration)result.duration=rounded(base.duration+n*(ultimate?1:.5));
 if(base.speed)result.speed=rounded(base.speed+n*.06);
 if(base.haste)result.haste=rounded(base.haste+n*.15);
 if(base.stun)result.stun=rounded(base.stun+n*(ultimate?.2:.1));
 if(base.slow)result.slow=rounded(base.slow+n*.25);
 if(base.poison){result.poison=rounded(base.poison+n*.5);result.poisonDamage=rounded((base.kind==='plague'?18:9)*(1+.2*n));}
 return result;
}
export function unitSkill(unit,key){return unit?skillAtRank(unit.heroId,key,unit.skillRanks?.[key]||0):null;}
export function upgradeInfo(unit,key){
 const maxRank=SKILL_MAX_RANKS[key],rank=unit?.skillRanks?.[key]||0,nextRank=rank+1,requiredLevel=key==='r'?(ULTIMATE_LEVELS[rank]||MAX_LEVEL+1):nextRank*2-1;
 const reason=!maxRank?'key':rank>=maxRank?'max':unit?.level<requiredLevel?'level':!(unit?.skillPoints>0)?'points':null;
 return{allowed:!reason,reason,rank,nextRank,maxRank,requiredLevel};
}
export function upgradeDescription(unit,key){
 const info=upgradeInfo(unit,key),current=unitSkill(unit,key),next=skillAtRank(unit.heroId,key,info.nextRank);
 if(info.reason==='max')return `${key.toUpperCase()} · 최대 단계`;
 if(info.reason==='level')return `${key.toUpperCase()} · Lv.${info.requiredLevel}부터 강화 가능`;
 if(info.reason==='points')return `${key.toUpperCase()} · 스킬 포인트 필요`;
 const changes=[];for(const [field,label]of [['count',current.kind==='summon'?'분신 수':'공격 횟수'],['damage','피해'],['heal','회복'],['shield','보호막'],['duration','지속'],['speed','이속 배율'],['stun','기절']])if(next[field]&&(!info.rank||next[field]!==current[field]))changes.push(`${label} ${info.rank?current[field]+' → ':''}${next[field]}`);
 changes.push(`쿨다운 ${info.rank?current.cooldown+' → ':''}${next.cooldown}초`);
 return `${key.toUpperCase()} ${info.rank?'강화':'배우기'} ${info.rank} → ${info.nextRank} · ${changes.join(' · ')}`;
}
