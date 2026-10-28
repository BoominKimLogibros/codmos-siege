// Match the anticipation poses in the supplied 24 fps attack/defend clips.
const SUPPORT_KINDS=new Set(['heal','shield','buff','reflect','regen','rally','summon','evade']);
export function skillGesture(spec){const defend=SUPPORT_KINDS.has(spec.kind);return{motion:defend?'defend':'attack',windup:defend?.4:.32,duration:defend?1.2:.85};}
