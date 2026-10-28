import {MAP,PONDS,BRUSHES} from './map-layout.js';
// Continuous ground first, then small inset stones. No raised box-shaped floor tiles.
export function paintGround(canvas,images,bounds=MAP){
 const c=canvas.getContext('2d'),u=canvas.width/bounds.width,X=x=>(x-bounds.minX)*u,Z=z=>(z-bounds.minZ)*u;
 c.lineCap='round';c.lineJoin='round';
 const rect=(x,z,w,h,color)=>{c.fillStyle=color;c.fillRect(X(x),Z(z),w*u,h*u);};
 const ellipse=(x,z,rx,rz,color,stroke)=>{c.beginPath();c.ellipse(X(x),Z(z),rx*u,rz*u,0,0,Math.PI*2);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=.1*u;c.stroke();}};
 rect(bounds.minX,bounds.minZ,bounds.width,bounds.height,'#354e35');
 // A mottled woodland floor blends gradually across the playable edge.
 for(let row=Math.floor(bounds.minZ/2);row<bounds.maxZ/2;row++)for(let col=Math.floor(bounds.minX/2);col<bounds.maxX/2;col++){
  const x=col*2,z=row*2,hash=((col*13+row*31)%7+7)%7;
  const wave=Math.sin(x*.17)*1.3+Math.cos(x*.09+z*.16)*.9;
  const forest=Math.max(0,Math.min(1,Math.max((Math.abs(z+1)-12+wave)/15,(Math.abs(x+1)-113-wave)/15)));
  const mix=(a,b)=>Math.round(a+(b-a)*forest);
  const n=hash-3;rect(x,z,2,2,`rgb(${mix(99+n,48+n)},${mix(124+n,75+n)},${mix(76+n,47+n)})`);
  for(let k=0;k<3;k++){c.fillStyle=k%2?'#91a66535':'#243e2b35';c.fillRect(X(x+.2+((hash+k*.47)%1.5)),Z(z+.2+((hash*.3+k*.4)%1.5)),.08*u,.13*u);}
 }
 // Worn side trails and curved approaches to brush connect the lane to the gardens.
 for(const sign of [-1,1]){
  c.beginPath();c.moveTo(X(-96),Z(sign*9.5));for(let x=-94;x<=96;x+=2)c.lineTo(X(x),Z(sign*(9.5+Math.sin(x*.08)*.45)));c.strokeStyle='#8d91644a';c.lineWidth=1.6*u;c.stroke();
  for(const x of [-78,-48,-18,18,48,78]){c.beginPath();c.moveTo(X(x),Z(sign*3));c.bezierCurveTo(X(x-2),Z(sign*5),X(x+2),Z(sign*7),X(x),Z(sign*10));c.strokeStyle='#9a9b6b45';c.lineWidth=2*u;c.stroke();}
 }
 // A single flagstone road with circular tower courts and symmetrical base plazas.
 c.beginPath();c.rect(X(-108),Z(-4.2),216*u,8.4*u);
 for(const x of [-83,-62,-36,0,36,62,83]){c.moveTo(X(x+5.2),Z(0));c.ellipse(X(x),Z(0),5.2*u,5.2*u,0,0,Math.PI*2);}
 for(const x of [-108,108]){c.moveTo(X(x+13),Z(0));c.ellipse(X(x),Z(0),13*u,12.3*u,0,0,Math.PI*2);}
 c.save();c.fillStyle='#98967c';c.shadowColor='#293f2c';c.shadowBlur=.4*u;c.fill();c.shadowBlur=0;c.clip();
 rect(-120,-20,240,40,'#98967c');
 for(let row=0;row<24;row++)for(let col=0;col<145;col++){
  const w=1.8,h=1.8,x=-126+col*w+(row%2)*w/2,z=-21+row*h,hash=(col*17+row*29)%7;
  c.fillStyle=['#b2af94','#b7b398','#adae91','#b4b296','#b9b69b','#aeae92','#b5b497'][hash];
  c.beginPath();c.roundRect(X(x)+1,Z(z)+1,w*u-2,h*u-2,.1*u);c.fill();
  c.strokeStyle='#d9d3b13d';c.lineWidth=1;c.beginPath();c.moveTo(X(x+.15),Z(z+.1));c.lineTo(X(x+w-.15),Z(z+.1));c.stroke();
 }
 // Insets give the road a direction and the bases a team identity, without UI labels.
 for(const z of [-3.9,3.9]){rect(-108,z,216,.12,'#d4cb9c');rect(-108,z+.17,216,.1,'#777e60');}
 for(const x of [-108,108]){
  ellipse(x,0,10.6,10.6,'#778d8b30',x<0?'#82aeb4':'#c2bfa7');ellipse(x,0,8.7,8.7,'#86958c18','#ded5ad66');
  c.strokeStyle=x<0?'#618c9680':'#ede3c280';c.lineWidth=.12*u;
  for(let i=0;i<12;i++){const a=i*Math.PI/6;c.beginPath();c.moveTo(X(x+Math.cos(a)*8.7),Z(Math.sin(a)*8.7));c.lineTo(X(x+Math.cos(a)*10.6),Z(Math.sin(a)*10.6));c.stroke();}
 }
 for(const x of [-83,-62,-36,36,62,83])ellipse(x,0,4.5,4.5,'#a8aa8b22','#e0d3a966');
 c.translate(X(0),Z(0));c.rotate(Math.PI/4);c.strokeStyle='#e8dfb5';c.lineWidth=.12*u;c.strokeRect(-1.5*u,-1.5*u,3*u,3*u);c.strokeRect(-.9*u,-.9*u,1.8*u,1.8*u);c.restore();
 // Water has a distinct dark retaining lip: the open grassy bank stays walkable.
 const waterNames=['multi_objects__water_green_corner_top_left_006','multi_objects__water_green_edge_top_007','multi_objects__water_green_corner_top_right_008','multi_objects__water_green_corner_bottom_left_018','multi_objects__water_green_edge_bottom_019','multi_objects__water_green_corner_bottom_right_020'];
 for(const p of PONDS){
  c.fillStyle='#303f36';c.beginPath();c.roundRect(X(p.x-p.w/2)-.18*u,Z(p.z-p.h/2)-.18*u,(p.w+.36)*u,(p.h+.36)*u,.7*u);c.fill();
  for(let row=0;row<2;row++)for(let col=0;col<4;col++){const key=row*3+(col===0?0:col===3?2:1);c.drawImage(images.get(waterNames[key]),X(p.x-p.w/2+col*4),Z(p.z-p.h/2+row*4),4*u,4*u);}
  c.strokeStyle='#b1b18a';c.lineWidth=.12*u;c.beginPath();c.roundRect(X(p.x-p.w/2)+.2*u,Z(p.z-p.h/2)+.2*u,(p.w-.4)*u,(p.h-.4)*u,.5*u);c.stroke();
 }
 for(const b of BRUSHES){c.fillStyle='#2f542f';c.beginPath();c.roundRect(X(b.x-b.w/2),Z(b.z-b.h/2),b.w*u,b.h*u,.8*u);c.fill();c.strokeStyle='#7f975b';c.lineWidth=.12*u;c.stroke();}
 return{ctx:c,unit:u,X,Z,ellipse};
}
