import {PASSIVES} from './passives.js';
const skill=(name,kind,cooldown,damage,extra={})=>({name,kind,cooldown,damage,...extra});
export const KITS={
 gdragon:{passive:{name:'앵콜 템포',desc:'기본 공격 5회 적중마다 마나·공격속도 강화'},q:skill('골든 비트','fan',5,36,{count:3}),w:skill('스웨그 실드','buff',12,0,{shield:90,duration:4,speed:1.3}),e:skill('무대 전환','blink',9,45,{distance:8}),r:skill('크라운 피날레','barrage',29,52,{count:5,radius:4.5})},
 karina:{passive:{name:'네온 리듬',desc:'세 번째 스킬 시전마다 네온 보호막'},q:skill('프리즘 펄스','beam',5,65,{range:17,width:1.2}),w:skill('스포트라이트','buff',12,0,{duration:3,shield:85,speed:1.25}),e:skill('싱크 스텝','dash',8,50,{distance:7}),r:skill('슈퍼노바 스테이지','zone',28,42,{radius:5.5,duration:4,slow:2})},
 naruto:{passive:{name:'그림자 연계',desc:'기본 공격 3회마다 추가 타격'},q:skill('나선환','rasengan',4,70,{distance:3.6,width:1.1,dashDuration:.18}),w:skill('그림자 분신','summon',13,18,{count:1,duration:7}),e:skill('순신술','dash',8,45,{distance:9}),r:skill('대옥 나선환','area',25,190,{radius:7,stun:1.2})},
 int:{passive:{name:'자가 충전',desc:'전투 중에도 체력과 보호막 재생'},q:skill('펄스 광선','beam',5,55,{range:18}),w:skill('복구 프로토콜','heal',12,0,{heal:100,allies:true}),e:skill('자기장','pull',10,45,{radius:6}),r:skill('오버클록','buff',28,0,{duration:8,haste:2.3,shield:160})},
 kim:{passive:{name:'최고 지휘',desc:'주변 아군 미니언 공격력 30% 증가'},q:skill('포격 명령','area',6,80,{radius:4}),w:skill('돌격 지령','rally',12,0,{duration:7,speed:1.7}),e:skill('철벽 진형','shield',11,0,{shield:120,allies:true}),r:skill('총공세','barrage',30,55,{count:5,radius:5})},
 nova:{passive:{name:'별의 낙인',desc:'같은 대상 3회 공격 시 별빛 폭발'},q:skill('유성 탄환','shot',4,65,{mark:true}),w:skill('궤도 장벽','orbit',12,20,{duration:6,radius:4}),e:skill('별자리 도약','blink',9,35,{distance:10}),r:skill('초신성','area',27,160,{radius:9,slow:3})},
 lucy:{passive:{name:'정밀 조준',desc:'기본 공격 4회마다 치명타와 둔화'},q:skill('관통 화살','pierce',4,60,{range:20}),w:skill('별사탕 덫','trap',10,65,{duration:12,stun:1.4}),e:skill('백스텝','retreat',8,45,{distance:7}),r:skill('핑크 레인','zone',26,32,{radius:6,duration:5,slow:2})},
 jet:{passive:{name:'가속 축전',desc:'이동으로 충전한 다음 공격이 강화'},q:skill('바람 칼날','fan',4,38,{count:3}),w:skill('질주','buff',11,0,{duration:5,speed:1.9}),e:skill('공중 돌진','dash',7,60,{distance:12}),r:skill('태풍','zone',28,42,{radius:6,duration:4,pull:true})},
 bora:{passive:{name:'맹독 주문',desc:'공격 시 중첩되는 지속 독 피해'},q:skill('독 구슬','shot',5,50,{poison:5}),w:skill('저주 지대','zone',11,17,{radius:5,duration:7,slow:2}),e:skill('영혼 교환','drain',10,70,{range:10}),r:skill('역병 확산','plague',29,95,{radius:9,poison:8})},
 dokkaebi:{passive:{name:'도깨비 강타',desc:'기본 공격 4회마다 기절'},q:skill('방망이 내려치기','cone',5,90,{radius:5}),w:skill('금강불괴','reflect',13,0,{shield:150,duration:5}),e:skill('도깨비 걸음','dash',9,55,{distance:8,stun:.7}),r:skill('천둥 방망이','area',30,170,{radius:7,stun:2})},
 gumiho:{passive:{name:'혼의 포식',desc:'챔피언에게 준 피해 18% 회복'},q:skill('돌아오는 여우불','return',5,48,{range:15}),w:skill('여우불 셋','homing',9,36,{count:3}),e:skill('홀리는 눈빛','charm',12,30,{stun:1.6}),r:skill('구미 난무','multidash',27,70,{count:3,distance:6})},
 'young-forty':{passive:{name:'노련한 생존',desc:'아군 근처에서 피해 감소, 저체력 재생'},q:skill('어깨 치기','cone',5,72,{radius:4,slow:2}),w:skill('한숨 돌리기','regen',13,0,{heal:160,duration:5}),e:skill('능숙한 회피','evade',10,0,{distance:8,duration:1.8}),r:skill('베테랑의 저력','buff',30,0,{duration:8,haste:1.8,shield:200,speed:1.25})},
 sasuke:{passive:{name:'사륜안',desc:'스킬 사용 후 다음 기본 공격이 치명타'},q:skill('화둔 호화구','area',5,75,{radius:3.5}),w:skill('치도리','dash',9,85,{distance:8,stun:.6}),e:skill('사륜안 간파','evade',11,0,{distance:6,duration:1.2}),r:skill('기린','area',26,200,{radius:6,stun:1})},
 gaara:{passive:{name:'모래 방패',desc:'피격 시 자동으로 모래 보호막 생성'},q:skill('사박구','pierce',6,70,{range:15,stun:1}),w:skill('모래 갑옷','reflect',13,0,{shield:140,duration:5}),e:skill('모래 순신','blink',9,40,{distance:9}),r:skill('사막 장송','zone',28,45,{radius:6,duration:4,slow:2})},
 sakura:{passive:{name:'백호의 인',desc:'체력이 낮아지면 한 번 크게 회복'},q:skill('괴력 강타','cone',5,90,{radius:5,stun:.8}),w:skill('의료 닌술','heal',12,0,{heal:110,allies:true}),e:skill('순신 돌진','dash',8,50,{distance:8}),r:skill('백호 해방','buff',30,0,{duration:8,haste:1.6,shield:180,speed:1.2})},
 danso:{passive:{name:'공명',desc:'스킬 적중 시 공명 중첩, 3중첩 추가 피해'},q:skill('단소 직격','pierce',4,65,{range:16}),w:skill('불협화음','silence',11,42,{radius:5,duration:2}),e:skill('장단 바꾸기','rhythm',9,30,{distance:7,slow:2}),r:skill('최후의 연주','beam',26,210,{range:24,width:3})}
};
export const KEYS=['q','w','e','r'];
export function skillDescription(s){const labels={rasengan:'방향키 방향 근접 돌진 · 분신과 동시 시전',summon:'분신 소환',heal:'아군 회복',buff:'자기 강화',shield:'보호막',rally:'미니언 돌격',reflect:'피해 반사',regen:'지속 회복',evade:'회피',trap:'기절 덫',silence:'침묵',charm:'매혹',drain:'흡혈',plague:'독 확산',return:'왕복 투사체',homing:'유도탄',multidash:'연속 돌진',rhythm:'이동·둔화',pull:'끌어오기',orbit:'회전 공격',zone:'지속 범위',barrage:'연속 포격',beam:'직선 관통',pierce:'관통탄',fan:'부채꼴 발사',area:'범위 공격',dash:'돌진',blink:'순간 이동',retreat:'후퇴 사격',cone:'전방 공격',shot:'투사체'};return `${labels[s.kind]||s.kind}${s.kind==='summon'?' · 분신 '+s.count+'명':s.damage?' · '+s.damage+(s.apRatio?' +'+Math.round(s.apRatio*100)+'% AP':'')+(s.adRatio?' +'+Math.round(s.adRatio*100)+'% 추가AD':'')+(s.damageType==='physical'?' 물리':' 마법')+' 피해':s.heal?' · '+s.heal+' 회복':s.shield?' · '+s.shield+' 보호막':s.speed?' · 이동 '+Math.round((s.speed-1)*100)+'% 강화':''}${s.duration?' · '+s.duration+'초 지속':''} · ${s.cooldown}초 · 마나 ${s.manaCost||0}`;}

// Explicit damage types, scaling and resource costs for every skill.
for(const [id,kit]of Object.entries(KITS)){
 kit.passive={...kit.passive,...PASSIVES[id]};
 const physical=['kim','lucy','jet','dokkaebi','young-forty','danso','sakura'].includes(id);
 for(const key of KEYS){const s=kit[key];s.damageType=physical?'physical':'magic';s.apRatio=s.damage?(physical?.25:.65):0;s.adRatio=s.damage?(physical?.9:.2):0;s.manaCost={q:25,w:40,e:30,r:80}[key];}
}

// Every skill declares its input contract and preview geometry.
const input=(targeting,shape,castRange,extra={})=>({targeting,shape,castRange,...extra});
const INPUTS={
 gdragon:{q:input('aim','fan',17),w:input('self','self',0),e:input('aim','blink',8),r:input('aim','circle',15)},
 karina:{q:input('aim','line',17),w:input('self','self',0),e:input('aim','dash',7),r:input('aim','circle',14)},
 naruto:{q:input('direction','dash',3.6),w:input('self','self',0),e:input('aim','dash',9),r:input('aim','circle',14)},
 int:{q:input('aim','line',18),w:input('aim','circle',10,{radius:6}),e:input('aim','circle',10),r:input('self','self',0)},
 kim:{q:input('aim','circle',16),w:input('self','self',0),e:input('aim','circle',10,{radius:6}),r:input('aim','circle',16)},
 nova:{q:input('target','target',16,{targetStructures:true}),w:input('self','self',0),e:input('aim','blink',10),r:input('aim','circle',14)},
 lucy:{q:input('aim','line',20),w:input('aim','circle',16,{radius:2}),e:input('aim','dash',7),r:input('aim','circle',16)},
 jet:{q:input('aim','fan',18),w:input('self','self',0),e:input('aim','dash',12),r:input('aim','circle',14)},
 bora:{q:input('target','target',16,{targetStructures:true}),w:input('aim','circle',14),e:input('target','target',10),r:input('aim','circle',14)},
 dokkaebi:{q:input('aim','cone',5),w:input('self','self',0),e:input('aim','dash',8),r:input('aim','circle',12)},
 gumiho:{q:input('aim','line',15),w:input('target','target',13),e:input('aim','line',18),r:input('target','target',15)},
 'young-forty':{q:input('aim','cone',4),w:input('self','self',0),e:input('aim','dash',8),r:input('self','self',0)},
 danso:{q:input('aim','line',16),w:input('aim','circle',10),e:input('aim','dash',7),r:input('aim','line',24)},
 sasuke:{q:input('aim','circle',12),w:input('aim','dash',8),e:input('aim','dash',6),r:input('aim','circle',14)},
 gaara:{q:input('aim','line',15),w:input('self','self',0),e:input('aim','blink',9),r:input('aim','circle',14)},
 sakura:{q:input('aim','cone',5),w:input('aim','circle',10,{radius:6}),e:input('aim','dash',8),r:input('self','self',0)}
};
for(const [id,kit]of Object.entries(KITS))for(const key of KEYS)Object.assign(kit[key],INPUTS[id][key]);
export function inputDescription(spec){return spec.targeting==='direction'?'방향키 방향 · 준비 후 근접 돌진':spec.targeting==='target'?'타겟팅 · 준비 후 시전':spec.targeting==='self'?'준비 후 사용':'누르기: 조준 · 방향키: 이동 · 놓기: 시전 · Esc: 취소';}
