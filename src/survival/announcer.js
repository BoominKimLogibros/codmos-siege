// Match announcements, kill feed and synthesized cues, all derived by diffing game state between frames.
const STRUCTURE_NAMES={tower:'포탑',guard:'포탑',inhibitor:'억제기'};
const STREAKS=['','','연속 처치!','트리플 킬!','전장 지배!','막을 수 없음!'];
export class Sfx {
 constructor(context){this.context=context;}
 tone(notes,{type='triangle',gain=.06,step=.07,length=.16}={}){
  const audio=this.context();if(!audio)return;const now=audio.currentTime;
  notes.forEach((frequency,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=now+i*step;o.type=type;o.frequency.setValueAtTime(frequency,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+length);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+length+.02);});
 }
 hit(critical){const audio=this.context();if(!audio||audio.currentTime-(this.lastHit||0)<.06)return;this.lastHit=audio.currentTime;this.tone(critical?[520,780]:[330],{type:'square',gain:critical?.035:.02,step:.03,length:.06});}
 hurt(){const audio=this.context();if(!audio||audio.currentTime-(this.lastHurt||0)<.25)return;this.lastHurt=audio.currentTime;this.tone([180,120],{type:'sawtooth',gain:.03,step:.04,length:.1});}
 good(){this.tone([523,659,784,1047],{gain:.07});}
 bad(){this.tone([392,311,233],{type:'sawtooth',gain:.045,step:.1,length:.22});}
 boom(){this.tone([110,82,55],{type:'sawtooth',gain:.08,step:.06,length:.35});}
 level(){this.tone([440,554,659,880],{type:'sine',gain:.06,step:.05});}
}
export class Announcer {
 constructor({banner,feed,portrait,name,sfx}){this.banner=banner;this.feed=feed;this.portrait=portrait;this.name=name;this.sfx=sfx;this.queue=[];this.showing=0;}
 reset(game){
  this.queue=[];this.showing=0;this.banner.hidden=true;this.feed.innerHTML='';
  this.score={...game.score};this.wave=game.wave;this.level=game.player.level;this.streak=0;this.alive=game.player.hp>0;
  this.down=new Set(game.structures.filter(s=>s.hp<=0).map(s=>s.id));
  this.say('전투 시작!','minions',`미니언이 곧 출발합니다`);
 }
 say(title,tone,detail=''){this.queue.push({title,tone,detail});}
 kill(killer,victim,mine){
  const row=document.createElement('div');row.className='feed-row '+(mine?'ally':'enemy');
  row.innerHTML=`${this.portrait(killer)}<span>⚔</span>${this.portrait(victim)}`;
  this.feed.prepend(row);while(this.feed.children.length>4)this.feed.lastChild.remove();setTimeout(()=>row.classList.add('fade'),5200);setTimeout(()=>row.remove(),6000);
 }
 update(game,dt){
  if(!game.player)return;const p=game.player,mine=p.team,enemy=game.bot;
  for(const team of ['blue','red'])while(game.score[team]>this.score[team]){
   this.score[team]++;const ours=team===mine,first=game.firstBlood===team&&game.score.blue+game.score.red===1,victim=ours?enemy:p,by=victim.killedBy,byPlayer=by?.id===p.id;
   // Streaks count only the player's own kills; towers and minions still score for the team.
   if(ours){if(byPlayer)this.streak++;this.say(first?'선취점!':byPlayer&&STREAKS[Math.min(this.streak,5)]||'적 챔피언 처치!','good',first?'첫 번째 처치를 기록했습니다':`${this.name(enemy)}을(를) 쓰러뜨렸습니다`);this.sfx.good();}
   else{this.streak=0;this.say(first?'적의 선취점':'처치당했습니다','bad','기지에서 부활합니다');this.sfx.bad();}
   this.kill(by?.kind==='champion'?(byPlayer?p:enemy):{team,icon:by?.kind==='structure'?'🗼':'👾'},victim,ours);
  }
  for(const s of game.structures){
   const dead=s.hp<=0;if(dead===this.down.has(s.id))continue;
   if(dead){this.down.add(s.id);if(!STRUCTURE_NAMES[s.type])continue;const ours=s.team!==mine;this.say(ours?`적 ${STRUCTURE_NAMES[s.type]} 파괴!`:`아군 ${STRUCTURE_NAMES[s.type]}이 파괴되었습니다`,ours?'good':'bad');this.sfx.boom();}
   else{this.down.delete(s.id);if(s.type==='inhibitor')this.say(s.team===mine?'아군 억제기 재생':'적 억제기 재생','minions');}
  }
  if(game.wave>this.wave){if(this.wave===0)this.say('미니언 생성','minions','미니언이 전장으로 출발했습니다');this.wave=game.wave;}
  if(p.level>this.level){this.level=p.level;this.sfx.level();}
  this.showing-=dt;
  if(this.showing<=0){
   const next=this.queue.shift();
   if(next){this.banner.className='announce '+next.tone;this.banner.innerHTML=`<b>${next.title}</b>${next.detail?`<small>${next.detail}</small>`:''}`;this.banner.hidden=false;void this.banner.offsetWidth;this.banner.classList.add('show');this.showing=1.9;}
   else if(!this.banner.hidden&&this.showing<-.35)this.banner.hidden=true;
   else if(this.banner.classList.contains('show'))this.banner.classList.remove('show');
  }
 }
}
