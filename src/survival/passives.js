export const PASSIVES={
 naruto:{icon:'✦',color:'#ffc875',shape:'spiral',count:3,desc:'기본 공격 3회마다 공격력 80%의 추가 피해. 주황색 나선 표식이 터집니다.'},
 int:{icon:'⬡',color:'#8cebd2',shape:'hex',count:60,desc:'매초 체력 2.5와 보호막 5 충전. 보호막은 최대 60까지 유지됩니다.'},
 kim:{icon:'⚑',color:'#d7d18b',shape:'banner',count:4,desc:'14 거리 안의 아군 미니언 공격력 30% 증가. 지휘권 안의 미니언에 황금 표식이 생깁니다.'},
 nova:{icon:'✧',color:'#9fc9ff',shape:'star',count:3,desc:'같은 대상에 기본 공격·Q를 3회 적중하면 65 + 주문력 25%의 마법 폭발.'},
 lucy:{icon:'⌖',color:'#ff9ccb',shape:'crosshair',count:4,desc:'4번째 기본 공격은 200% 치명타와 2초 둔화. 분홍 조준선이 섬광을 만듭니다.'},
 jet:{icon:'➤',color:'#8fe5eb',shape:'wind',count:5,desc:'이동한 거리로 가속 충전. 완충 후 기본 공격이 220% 피해를 주며 충전을 소모합니다.'},
 bora:{icon:'♧',color:'#c7a0ff',shape:'poison',count:5,desc:'기본 공격에 최대 5중첩 맹독. 매초 6 + 중첩당 3 + 주문력 8%의 마법 피해.'},
 dokkaebi:{icon:'⚒',color:'#efb178',shape:'thunder',count:4,desc:'4번째 기본 공격에 0.9초 기절. 황금 번개 문양으로 강타를 표시합니다.'},
 gumiho:{icon:'♥',color:'#f0a5dc',shape:'soul',count:100,desc:'챔피언에게 실제로 준 피해의 18%만큼 체력을 회복. 여우 혼불이 되돌아옵니다.'},
 'young-forty':{icon:'◇',color:'#dfcba0',shape:'guard',count:100,desc:'8 거리 안 아군이 있으면 받는 피해 30% 감소. 체력 40% 미만일 때 매초 체력 9 추가 재생.'},
 danso:{icon:'♪',color:'#e3d2aa',shape:'music',count:3,desc:'같은 적에게 스킬 3회 적중 시 45 + 주문력 35%의 추가 마법 피해. 세 음표가 공명합니다.'}
};
export function passiveState(unit,units=[]){
 const p=PASSIVES[unit.heroId];let value=0,max=p.count,active=false;
 const marks=Math.max(0,...Object.entries(unit.marks||{}).filter(([id])=>units.some(u=>String(u.id)===id&&u.hp>0)).map(([,value])=>value));
 switch(unit.heroId){
  case 'naruto':value=(unit.attacks||0)%3;break;case 'lucy':case 'dokkaebi':value=(unit.attacks||0)%4;break;
  case 'nova':case 'danso':value=marks;break;case 'jet':value=unit.charge||0;break;
  case 'int':value=Math.min(60,unit.shield||0);break;
  case 'kim':value=units.filter(u=>u.kind==='minion'&&u.team===unit.team&&u.hp>0&&Math.hypot(u.x-unit.x,u.z-unit.z)<14).length;max=Math.max(4,value);active=value>0;break;
  case 'bora':value=Math.max(0,...units.filter(u=>u.poisonSourceId===unit.id&&u.poison>0&&u.hp>0).map(u=>u.poisonStacks||0));active=value>0;break;
  case 'gumiho':value=unit.passiveHeal||0;active=(unit.passiveFlash||0)>0;break;
  case 'young-forty':value=unit.hp/unit.maxHp*100;active=unit.hp<unit.maxHp*.4||units.some(u=>u!==unit&&u.team===unit.team&&u.hp>0&&Math.hypot(u.x-unit.x,u.z-unit.z)<8);break;
 }
 if(['naruto','lucy','dokkaebi','nova','danso'].includes(unit.heroId))active=value===max-1;
 if(unit.heroId==='jet')active=value>=max;
 return{...p,value,max,ratio:unit.heroId==='gumiho'?Math.min(1,(unit.passiveFlash||0)/.7):Math.max(0,Math.min(1,value/max)),active:unit.hp>0&&(active||(unit.passiveFlash||0)>0)};
}
