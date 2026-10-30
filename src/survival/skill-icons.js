import {SKILL_ICON_SOURCES,SKILL_ICON_PATH} from './asset-manifest.js';
// Painted art per skill when the hero has entries in asset-manifest.js; the emoji glyphs remain the fallback for heroes without art yet.
const BY_KIND={rasengan:'🌀',summon:'👥',dash:'💨',area:'💥',beam:'⚡',heal:'✚',pull:'🧲',buff:'🔥',rally:'📯',shield:'🛡️',barrage:'🎯',shot:'☄️',orbit:'🪐',blink:'✨',pierce:'🏹',trap:'🍬',retreat:'↩️',zone:'🌧️',fan:'🌪️',drain:'🩸',plague:'☠️',cone:'🔨',reflect:'💎',return:'🔁',homing:'🔥',charm:'💗',multidash:'🦊',regen:'💚',evade:'🌫️',silence:'🔇',rhythm:'🥁'};
const BY_SKILL={'naruto.r':'🌀','jet.e':'🌬️','jet.r':'🌪️','jet.w':'👟','lucy.r':'🌧️','dokkaebi.r':'🌩️','young-forty.r':'💪','int.r':'⚙️','danso.q':'🎵','danso.r':'🎼','bora.w':'🟣','nova.r':'🌟'};
const art=(heroId,key)=>SKILL_ICON_SOURCES[heroId]?.[key]?`<img class="skill-art" src="${SKILL_ICON_PATH(heroId,key)}" alt="" draggable="false">`:'';
export function skillIcon(heroId,key,spec){return art(heroId,key)||BY_SKILL[heroId+'.'+key]||BY_KIND[spec.kind]||'◆';}
export function passiveIcon(heroId,fallback){return art(heroId,'p')||fallback;}
