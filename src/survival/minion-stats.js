// LoL-style starting AD / last-hit bounty, adapted to this game's six-unit waves and HP scale.
// Sources and verification date are recorded in docs/MINION-BALANCE.md.
export const MINION_STATS={
 melee:{name:'근접 고블린',hp:115,damage:11,bounty:20,range:2,speed:4,attackInterval:.8,attackDuration:.7,onHitRatio:.02,radius:.45},
 ranged:{name:'원거리 마법 고블린',hp:75,damage:21,bounty:14,range:10,speed:4,attackInterval:1.5,attackDuration:40/30,onHitRatio:.035,radius:.45},
 cavalry:{name:'기마병',hp:210,damage:37.5,bounty:50,range:5.5,speed:4,attackInterval:1,attackDuration:.7,onHitRatio:.05,radius:.7},
 super:{name:'강화 고블린',hp:320,damage:36,bounty:20,range:2,speed:4.3,attackInterval:1.1,attackDuration:.7,onHitRatio:.05,radius:.65}
};
export function minionBounty(type,time=0){const base=MINION_STATS[type]?.bounty||0;return base+(type==='cavalry'?Math.min(30,Math.floor(time/90)):0);}
