const colors={physical:'#e5ad7f',magic:'#ada1ef',true:'#e8e7d6'},labels={physical:'물리',magic:'마법',true:'고정'},number=n=>new Intl.NumberFormat('ko-KR',{maximumFractionDigits:1}).format(n);
const keyLabel=key=>key==='aa'?'A':key==='tower'?'♜':key==='skill'?'✦':key.toUpperCase();
export class DeathRecap {
 constructor({panel,toggle,portrait,onOpen}){this.panel=panel;this.toggle=toggle;this.portrait=portrait;this.onOpen=onOpen;this.opened=false;this.latest=null;this.wasDead=false;toggle.onclick=()=>this.opened?this.close():this.open();}
 open(){if(!this.latest)return;this.opened=true;this.panel.hidden=false;this.onOpen();}
 close(){const was=this.opened;this.opened=false;this.panel.hidden=true;return was;}
 update(unit){
  if(!unit){this.latest=null;this.toggle.hidden=true;this.close();return;}
  if(unit.deathRecap!==this.latest){this.latest=unit.deathRecap;if(this.latest){this.render(this.latest);this.open();}else this.close();}
  this.toggle.hidden=!this.latest;
  if(this.wasDead&&unit.hp>0)this.close();this.wasDead=unit.hp<=0;
  const countdown=this.panel.querySelector('.recap-countdown');if(countdown)countdown.textContent=unit.hp<=0?'부활 '+Math.ceil(unit.respawn)+'초':'최근 사망 기록';
 }
 render(recap){
  const killer=recap.killer,types=Object.entries(recap.types),total=recap.total;
  this.panel.innerHTML=`<header class="recap-header"><div><b>사망 기록</b><span>${killer?killer.source.name+' · '+keyLabel(killer.ability.key)+' '+killer.ability.name:'피해 정보 없음'}</span></div><small class="recap-countdown"></small><button id="recap-close" aria-label="사망 기록 닫기">×</button></header><div class="recap-summary"><div><span>받은 체력 피해</span><strong>${number(total)}</strong></div><p>최근 ${recap.window}초<br>${number(Math.min(recap.window,recap.duration))}초간 받은 피해${recap.absorbed>0?`<br>보호막 흡수 ${number(recap.absorbed)}`:''}</p></div><div class="recap-type-bar">${types.map(([type,amount])=>`<i style="width:${total?amount/total*100:0}%;background:${colors[type]}"></i>`).join('')}</div><div class="recap-types">${types.map(([type,amount])=>`<span><i style="background:${colors[type]}"></i>${labels[type]} <b>${number(amount)}</b></span>`).join('')}</div><div class="recap-sources">${recap.sources.map(group=>{const source=group.source,portrait=this.portrait(source),icon=source.kind==='structure'?'♜':source.type==='cavalry'?'♞':source.kind==='minion'?'⚔':'?';return `<section class="recap-source"><div class="recap-attacker"><span class="recap-avatar">${portrait?`<img src="${portrait}" alt="">`:icon}</span><div><b>${source.name}${group.sourceIds.length>1?' ×'+group.sourceIds.length:''}</b><small>${source.kind==='structure'?'건물':source.kind==='minion'?'미니언':source.kind==='clone'?'분신':'챔피언'}</small></div><strong>${number(group.amount)}</strong></div><div class="recap-abilities">${group.abilities.map(ability=>{const final=killer&&group.sourceIds.includes(killer.source.id)&&ability.key===killer.ability.key&&ability.name===killer.ability.name&&ability.type===killer.type;return `<div class="recap-ability ${final?'final':''}"><kbd>${keyLabel(ability.key)}</kbd><span>${ability.name}${ability.rank?' <small>Lv.'+ability.rank+'</small>':''}${final?'<em>마지막 타격</em>':''}</span><b style="color:${colors[ability.type]}">${number(ability.amount)}</b></div>`;}).join('')}</div></section>`;}).join('')}</div><footer>방어력·저항력 적용 후 실제 체력 피해 · 초과 피해 제외</footer>`;
  this.panel.querySelector('#recap-close').onclick=()=>this.close();
 }
}
