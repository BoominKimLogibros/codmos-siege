import {MAX_LEVEL} from './progression-constants.js';
// Custom roster balance, using MOBA stat names. 50 displayed distance units = 1 map unit.
const profiles={
 naruto:[8,280,8,12,30,30,55,2.8],int:[7,340,12,24,28,34,52,2.4],kim:[10,260,7,0,44,38,72,2.8],nova:[6,360,11,30,24,32,50,2.5],lucy:[5.5,250,8,0,23,28,45,3.5],jet:[6,260,8,8,26,30,48,3.8],bora:[6.5,380,13,34,23,35,48,2.4],dokkaebi:[11,250,7,0,46,40,78,2.6],gumiho:[6,350,11,28,25,32,48,2.8],'young-forty':[12,270,8,0,40,38,68,2.7],danso:[7,320,10,20,28,31,52,3.1]
};
export const STAT_LABELS={maxHp:'최대 체력',hpRegen5:'체력 재생 / 5초',maxMana:'최대 마나',manaRegen5:'마나 재생 / 5초',attackDamage:'공격력',attackSpeed:'공격속도 / 초',abilityPower:'주문력',armor:'방어력',magicResist:'마법저항력',moveSpeed:'이동속도',attackRange:'공격 사거리',critChance:'치명타 확률',critDamage:'치명타 피해',abilityHaste:'스킬 가속',armorPen:'물리 관통력',magicPen:'마법 관통력',lifeSteal:'생명력 흡수',omnivamp:'모든 피해 흡혈',tenacity:'강인함',healShieldPower:'회복·보호막 효과'};
export const PERCENT_STATS=new Set(['critChance','critDamage','lifeSteal','omnivamp','tenacity','healShieldPower']);
export function statsAt(hero,level=1){
 const [hpRegen5,mana,mp5,ap,armor,mr,hpGrowth,asGrowth]=profiles[hero.id],n=Math.max(0,Math.min(MAX_LEVEL,level)-1);
 return{maxHp:hero.hp*4+n*hpGrowth,hpRegen5:hpRegen5+n*.65,maxMana:mana+n*24,manaRegen5:mp5+n*.5,attackDamage:hero.damage+n*2.5,attackSpeed:Math.min(2.5,(1/(hero.cooldown+.25))*(1+n*asGrowth/100)),abilityPower:ap+n*(ap?2.5:0),armor:armor+n*2.4,magicResist:mr+n*1.3,moveSpeed:hero.speed*50,attackRange:(hero.attack==='knight'?3.1:10)*50,critChance:0,critDamage:1.75,abilityHaste:0,armorPen:0,magicPen:0,lifeSteal:0,omnivamp:0,tenacity:0,healShieldPower:0};
}
export function currentStats(unit){
 const s={...unit.stats,maxHp:unit.maxHp,attackDamage:unit.damage,moveSpeed:unit.speed*50,attackRange:unit.range*50};
 s.attackSpeed=Math.min(2.5,(s.attackSpeed||1)*(unit.buffs?.haste>0?unit.hastePower||1.8:1));
 if(unit.buffs?.speed>0)s.moveSpeed*=unit.speedPower||1.5;if(unit.slow>0)s.moveSpeed*=.5;if(unit.dashing)s.moveSpeed*=1.85;
 if(unit.heroId==='int')s.hpRegen5+=12.5;
 if(unit.heroId==='young-forty'&&unit.hp<unit.maxHp*.4)s.hpRegen5+=45;
 return s;
}
export function mitigate(amount,target,source,type='physical'){
 if(type==='true')return amount;
 const key=type==='magic'?'magicResist':'armor',pen=type==='magic'?'magicPen':'armorPen';
 const base=target.stats?.[key]||0,resistance=base>=0?Math.max(0,base-(source?.stats?.[pen]||0)):base;
 return amount*(resistance>=0?100/(100+resistance):2-100/(100-resistance));
}
export function skillPower(unit,spec){return spec.damage+(unit.stats?.abilityPower||0)*(spec.apRatio||0)+Math.max(0,unit.damage-(unit.baseAttackDamage||unit.damage))*(spec.adRatio||0);}
export function formatStat(key,value){return PERCENT_STATS.has(key)?Math.round(value*100)+'%':Number(value.toFixed(key==='attackSpeed'?2:1)).toString();}
