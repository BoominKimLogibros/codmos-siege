// One glyph per skill so slots read at a glance; names stay in tooltips and the info panel.
const BY_KIND={rasengan:'🌀',summon:'👥',dash:'💨',area:'💥',beam:'⚡',heal:'✚',pull:'🧲',buff:'🔥',rally:'📯',shield:'🛡️',barrage:'🎯',shot:'☄️',orbit:'🪐',blink:'✨',pierce:'🏹',trap:'🍬',retreat:'↩️',zone:'🌧️',fan:'🌪️',drain:'🩸',plague:'☠️',cone:'🔨',reflect:'💎',return:'🔁',homing:'🔥',charm:'💗',multidash:'🦊',regen:'💚',evade:'🌫️',silence:'🔇',rhythm:'🥁'};
const BY_SKILL={'naruto.r':'🌀','jet.e':'🌬️','jet.r':'🌪️','jet.w':'👟','lucy.r':'🌧️','dokkaebi.r':'🌩️','young-forty.r':'💪','int.r':'⚙️','danso.q':'🎵','danso.r':'🎼','bora.w':'🟣','nova.r':'🌟'};
export function skillIcon(heroId,key,spec){return BY_SKILL[heroId+'.'+key]||BY_KIND[spec.kind]||'◆';}
