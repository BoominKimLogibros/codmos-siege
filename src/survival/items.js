import {statsAt} from './stats.js';
export const INVENTORY_SIZE=6;
export const STARTING_MESO=300;
export const ITEMS=[
 {id:'short-sword',name:'수련의 검',icon:'sword',category:'attack',cost:120,stats:{attackDamage:6}},
 {id:'ruby',name:'생명의 수정',icon:'ruby',category:'defense',cost:120,stats:{maxHp:100}},
 {id:'cloth',name:'강철 흉갑',icon:'armor',category:'defense',cost:120,stats:{armor:15}},
 {id:'amulet',name:'수호 부적',icon:'amulet',category:'defense',cost:140,stats:{magicResist:15}},
 {id:'tome',name:'비전 마도서',icon:'book',category:'magic',cost:150,stats:{abilityPower:20}},
 {id:'dagger',name:'속공 단검',icon:'dagger',category:'attack',cost:120,stats:{attackSpeedPercent:.15}},
 {id:'boots',name:'여행자의 장화',icon:'boots',category:'move',cost:150,group:'boots',stats:{moveSpeed:25}},
 {id:'bead',name:'재생의 씨앗',icon:'seed',category:'sustain',cost:100,stats:{hpRegen5:5}},
 {id:'sapphire',name:'마나 보석',icon:'sapphire',category:'magic',cost:140,stats:{maxMana:100,manaRegen5:3}},
 {id:'stormblade',name:'돌풍의 검',icon:'stormblade',category:'attack',cost:420,unique:true,components:['short-sword','dagger'],stats:{attackDamage:14,attackSpeedPercent:.2,critChance:.15}},
 {id:'archstaff',name:'별빛 지팡이',icon:'staff',category:'magic',cost:450,unique:true,components:['tome','sapphire'],stats:{abilityPower:55,maxMana:100,abilityHaste:15,manaRegen5:6}},
 {id:'aegis',name:'수호자의 갑옷',icon:'aegis',category:'defense',cost:430,unique:true,components:['ruby','cloth'],stats:{maxHp:180,armor:30,magicResist:15}},
 {id:'fang',name:'흡혈 송곳니',icon:'fang',category:'attack',cost:400,unique:true,components:['short-sword'],stats:{attackDamage:12,lifeSteal:.12}},
 {id:'void-orb',name:'공허의 보주',icon:'orb',category:'magic',cost:400,unique:true,components:['tome'],stats:{abilityPower:35,magicPen:12}},
 {id:'swiftboots',name:'질풍 장화',icon:'swiftboots',category:'move',cost:350,group:'boots',unique:true,components:['boots','dagger'],stats:{moveSpeed:45,attackSpeedPercent:.25}}
];
ITEMS.push({id:'health-potion',name:'체력 물약',icon:'health-potion',category:'sustain',cost:50,stats:{},consumable:{resource:'hp',amount:120,duration:5}},{id:'mana-potion',name:'마나 물약',icon:'mana-potion',category:'magic',cost:50,stats:{},consumable:{resource:'mana',amount:100,duration:5}});
export function trimInventory(inventory){while(inventory.length&&!inventory.at(-1))inventory.pop();return inventory;}
export const ITEM_BY_ID=new Map(ITEMS.map(i=>[i.id,i]));
export function purchaseQuote(unit,id){
 const item=ITEM_BY_ID.get(id);if(!item)return{ok:false,reason:'item'};
 const inventory=unit.inventory||[],consumed=[];
 for(const component of item.components||[]){const index=inventory.findIndex((owned,i)=>owned===component&&!consumed.includes(i));if(index>=0)consumed.push(index);}
 const remaining=inventory.map((owned,i)=>consumed.includes(i)?null:owned),price=item.cost-consumed.reduce((sum,i)=>sum+ITEM_BY_ID.get(inventory[i]).cost,0);
 let reason=null;if(item.unique&&remaining.includes(id)||item.group&&remaining.some(owned=>ITEM_BY_ID.get(owned)?.group===item.group))reason='unique';
 else if(remaining.filter(Boolean).length>=INVENTORY_SIZE)reason='slots';else if((unit.meso||0)<price)reason='funds';
 const result=[...remaining],slot=result.findIndex(owned=>!owned);if(slot>=0)result[slot]=id;else result.push(id);
 return{ok:!reason,reason,item,price,consumed,inventory:trimInventory(result)};
}
export function statsWithItems(hero,level,inventory=[]){
 const stats=statsAt(hero,level);let attackSpeedBonus=0;
 for(const id of inventory){const item=ITEM_BY_ID.get(id);if(!item)continue;for(const [key,value]of Object.entries(item.stats)){if(key==='attackSpeedPercent')attackSpeedBonus+=value;else stats[key]+=value;}}
 stats.attackSpeed=Math.min(2.5,stats.attackSpeed*(1+attackSpeedBonus));stats.critChance=Math.min(1,stats.critChance);stats.tenacity=Math.min(.6,stats.tenacity);return stats;
}
export function saleValue(id){return Math.floor((ITEM_BY_ID.get(id)?.cost||0)*.7);}
