import {HEROES} from './heroes.js';
export const CAST_EFFECT_DURATION=13/30;
export const CAST_EFFECT_PATHS={front:'5b232b2c6f07',back:'04ff8d454a42',side_left:'10bfa5b1f175',side_right:'704dddf873e4'};
export function castEffectSpec(unit,dir){
 const direction=Math.abs(dir.x)>=Math.abs(dir.z)?dir.x<0?'side_left':'side_right':dir.z<0?'back':'front';
 return{kind:'cast',sourceId:unit.id,heroId:unit.heroId,team:unit.team,x:unit.x,z:unit.z,color:HEROES.find(h=>h.id===unit.heroId).color,direction,life:CAST_EFFECT_DURATION,duration:CAST_EFFECT_DURATION};
}
