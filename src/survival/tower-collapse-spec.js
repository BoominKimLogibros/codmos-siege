export const TOWER_COLLAPSE_DURATION=15/30;
export function towerCollapseSpec(structure){return{kind:'tower-collapse',structureId:structure.id,team:structure.team,x:structure.x,z:structure.z,life:TOWER_COLLAPSE_DURATION,duration:TOWER_COLLAPSE_DURATION};}
