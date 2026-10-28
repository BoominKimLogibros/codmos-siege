// Combat ranges use r. Movement uses only the visible contact with the floor.
export function footprint(o){
 if(o.kind==='structure')return o.type==='nexus'?{rx:4.15,rz:.78,z:.05}:o.type==='inhibitor'?{rx:2.1,rz:.48,z:.02}:{rx:2.05,rz:.48,z:.02};
 if(o.kind==='shop')return{rx:2.25,rz:.55,z:.05};
 if(o.kind==='tree')return{rx:.38,rz:.26,z:.12};
 if(o.kind==='rock')return{rx:o.r,rz:.72,z:-.28};
 return{rx:o.r,rz:o.r,z:0};
}
export function overlapsFootprint(x,z,r,o){const f=footprint(o);return ((x-o.x)/(f.rx+r))**2+((z-o.z-f.z)/(f.rz+r))**2<1;}
export function movementRadius(body){return body.collisionRadius??body.r??.5;}
