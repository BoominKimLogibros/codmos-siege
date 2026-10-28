// Shared layout drives tile art, collision, navigation and brush vision.
export const MAP={id:'siege',name:'청백 공성전',width:240,height:40,minX:-120,maxX:120,minZ:-20,maxZ:20};
export const TILE_SIZE=4;
export const PONDS=[];
for(const x of [-56,0,56])for(const z of [-16,16])PONDS.push({x,z,w:16,h:8});
export const BRUSHES=[];
for(const x of [-78,-48,-18,18,48,78])for(const z of [-7.5,7.5])BRUSHES.push({id:`brush-${x}-${z}`,x,z,w:9,h:4});
export const OBSTACLES=[];
for(const x of [-88,-66,-32,-10,10,32,66,88])for(const z of [-11.5,11.5])OBSTACLES.push({id:`rock-${x}-${z}`,kind:'rock',x,z,r:1.65,art:(Math.abs(x)+Number(z>0))%3});
for(const x of [-116,-108,-100,-80,-72,-40,-32,-24,24,32,40,72,80,100,108,116])for(const z of [-18,18])if(!PONDS.some(p=>Math.abs(p.x-x)<p.w/2+2))OBSTACLES.push({id:`tree-${x}-${z}`,kind:'tree',x,z,r:1.05,art:Math.abs(x)%3});
export function inRect(x,z,rect,pad=0){return Math.abs(x-rect.x)<rect.w/2+pad&&Math.abs(z-rect.z)<rect.h/2+pad;}
export function brushAt(x,z){return BRUSHES.find(b=>inRect(x,z,b))||null;}
export const TILES=[];
for(let row=0;row<10;row++)for(let col=0;col<60;col++){
 const x=MAP.minX+(col+.5)*TILE_SIZE,z=MAP.minZ+(row+.5)*TILE_SIZE;
 const pond=PONDS.find(p=>inRect(x,z,p));
 const kind=pond?'water':Math.abs(x)>94&&Math.abs(z)<12?'base':Math.abs(z)<4?'lane':'grass';
 TILES.push({x,z,col,row,kind,pond});
}
// Scenery extends beyond movement bounds so camera padding never exposes a cut edge.
export const SCENERY={minX:-144,maxX:144,minZ:-44,maxZ:44,width:288,height:88};
export const SHOPS=[{id:'shop-blue',kind:'shop',team:'blue',x:-111,z:9,r:2.25,accessRadius:5},{id:'shop-white',kind:'shop',team:'white',x:111,z:9,r:2.25,accessRadius:5}];
