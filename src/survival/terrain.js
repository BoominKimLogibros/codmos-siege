import {overlapsFootprint,movementRadius} from './footprints.js';
import {MAP,OBSTACLES,PONDS,SHOPS,inRect} from './map-layout.js';
export {MAP,BRUSHES,OBSTACLES,PONDS,brushAt} from './map-layout.js';
export function groundHeight(){return 0;}
export function canWalk(x,z,r=.5,structures=[]){
 if(x<=MAP.minX+r||x>=MAP.maxX-r||z<=MAP.minZ+r||z>=MAP.maxZ-r)return false;
 if(PONDS.some(p=>inRect(x,z,{...p,w:p.w-.8,h:p.h-.8},r)))return false;
 return ![...OBSTACLES,...SHOPS,...structures].some(o=>o.hp!==0&&overlapsFootprint(x,z,r,o));
}
// Sweep fast movement and resolve axes separately to slide along blocked edges.
export function moveOnMap(body,dx,dz,r=movementRadius(body),structures=[]){
 const count=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.25));
 for(let i=0;i<count;i++){
  const x=body.x+dx/count,z=body.z+dz/count;
  if(canWalk(x,z,r,structures)){body.x=x;body.z=z;}
  else{if(canWalk(x,body.z,r,structures))body.x=x;if(canWalk(body.x,z,r,structures))body.z=z;}
 }
}
const GRID=2,COLS=120,ROWS=20;
const cell=(x,z)=>({col:Math.max(0,Math.min(COLS-1,Math.floor((x-MAP.minX)/GRID))),row:Math.max(0,Math.min(ROWS-1,Math.floor((z-MAP.minZ)/GRID)))});
const point=(col,row)=>({x:MAP.minX+(col+.5)*GRID,z:MAP.minZ+(row+.5)*GRID});
const id=(col,row)=>row*COLS+col;
export function findPath(body,goal,structures=[]){
 const r=movementRadius(body),start=cell(body.x,body.z),end=cell(goal.x,goal.z),walkable=new Map();
 const openCell=(col,row)=>{if(col<0||row<0||col>=COLS||row>=ROWS)return false;const key=id(col,row);if(!walkable.has(key)){const p=point(col,row);walkable.set(key,canWalk(p.x,p.z,r,structures));}return walkable.get(key);};
 let target=null,best=Infinity;
 for(let radius=0;radius<9&&!target;radius++)for(let row=end.row-radius;row<=end.row+radius;row++)for(let col=end.col-radius;col<=end.col+radius;col++)if(openCell(col,row)){
  const p=point(col,row),score=Math.hypot(p.x-goal.x,p.z-goal.z)+Math.hypot(p.x-body.x,p.z-body.z)*.001;
  if(score<best){best=score;target={col,row};}
 }
 if(!target)return [];
 const startId=id(start.col,start.row),targetId=id(target.col,target.row),frontier=[startId],cost=new Map([[startId,0]]),parent=new Map(),closed=new Set();
 const heuristic=key=>Math.hypot(key%COLS-target.col,Math.floor(key/COLS)-target.row);
 while(frontier.length){
  frontier.sort((a,b)=>(cost.get(a)+heuristic(a))-(cost.get(b)+heuristic(b)));
  const current=frontier.shift();if(current===targetId){const path=[];let key=current;while(key!==startId){path.push(point(key%COLS,Math.floor(key/COLS)));key=parent.get(key);}return path.reverse();}
  if(closed.has(current))continue;closed.add(current);const col=current%COLS,row=Math.floor(current/COLS);
  for(const [dc,dr]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
   const c=col+dc,t=row+dr,key=id(c,t);if(!openCell(c,t)||closed.has(key)||dc&&dr&&(!openCell(col+dc,row)||!openCell(col,row+dr)))continue;
   const next=cost.get(current)+Math.hypot(dc,dr);if(next>=(cost.get(key)??Infinity))continue;cost.set(key,next);parent.set(key,current);frontier.push(key);
  }
 }
 return [];
}
export function navigationDirection(body,goal,structures=[]){
 const dx=goal.x-body.x,dz=goal.z-body.z,len=Math.hypot(dx,dz)||1,r=movementRadius(body);
 if(body.navigation&&Math.hypot(goal.x-body.navigation.goal.x,goal.z-body.navigation.goal.z)>4)body.navigation=null;
 if(!body.navigation&&!canWalk(body.x+dx/len*Math.min(len,2),body.z+dz/len*Math.min(len,2),r,structures))body.navigation={goal:{x:goal.x,z:goal.z},path:findPath(body,goal,structures)};
 if(body.navigation){const path=body.navigation.path;while(path.length&&Math.hypot(path[0].x-body.x,path[0].z-body.z)<.45)path.shift();if(path.length)return{x:path[0].x-body.x,z:path[0].z-body.z};body.navigation=null;}
 return{x:dx,z:dz};
}
