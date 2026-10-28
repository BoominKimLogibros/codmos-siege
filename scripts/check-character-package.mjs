import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

// File-format checks only. Visual fit and gameplay registration need a browser review.
const folder=process.argv[2];
if(!folder||!/^[a-zA-Z0-9_-]+$/.test(folder)){
 console.error('Usage: npm run check:character -- <sprite-folder>');
 process.exit(1);
}
const root=fileURLToPath(new URL('../public/survival/character-sprites/',import.meta.url));
const motions={front:['idle','move','attack','defend','failure','success'],back:['idle','move','attack','defend'],side_left:['idle','move','attack','defend','run'],side_right:['idle','move','attack','defend','run']};
const errors=[];let count=0;
for(const [direction,names]of Object.entries(motions))for(const motion of names){
 const label=`${folder}/${direction}/${motion}`;
 try{
  const base=path.join(root,label),data=JSON.parse(await readFile(base+'.json','utf8')),png=await readFile(base+'.png');
  assert(png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'invalid PNG signature');
  assert.equal(png.toString('ascii',12,16),'IHDR','missing PNG IHDR');
  const width=png.readUInt32BE(16),height=png.readUInt32BE(20),meta=data.meta;
  assert(meta,'missing meta');assert.equal(meta.image,motion+'.png','meta.image');
  assert.equal(meta.size?.w,width,'meta.size.w');assert.equal(meta.size?.h,height,'meta.size.h');
  assert.equal(meta.direction,direction,'meta.direction');assert.equal(meta.animation,motion,'meta.animation');
  assert.equal(meta.fps,24,'expected 24fps export');assert.equal(Number(meta.scale),.4,'expected source scale 0.4');
  assert(Number.isFinite(meta.anchor?.x)&&Number.isFinite(meta.anchor?.y),'missing finite root anchor');
  assert(data.frames&&typeof data.frames==='object'&&!Array.isArray(data.frames),'expected hash-frame object');
  const frames=Object.values(data.frames);assert(frames.length>0,'no frames');assert.equal(meta.frameCount,frames.length,'meta.frameCount');
  let duration=0;const size=frames[0].frame;
  for(const [index,f]of frames.entries()){
   const r=f.frame;assert(r,'missing frame rect '+index);
   assert([r.x,r.y,r.w,r.h].every(Number.isInteger),'non-integer rect '+index);
   assert(r.x>=0&&r.y>=0&&r.w>0&&r.h>0&&r.x+r.w<=width&&r.y+r.h<=height,'frame outside sheet '+index);
   assert.equal(r.w,size.w,'varying frame width');assert.equal(r.h,size.h,'varying frame height');
   assert(!f.rotated&&!f.trimmed,'runtime expects unrotated, untrimmed frames');
   assert(Number.isFinite(f.duration)&&f.duration>0,'invalid frame duration '+index);duration+=f.duration;
  }
  assert(Number.isFinite(meta.durationMs)&&meta.durationMs>0,'invalid meta.durationMs');
  assert(Math.abs(duration-meta.durationMs)<=1,`duration sum ${duration} != ${meta.durationMs}`);
  assert.equal(meta.loop,!['attack','defend','failure','success'].includes(motion),'loop setting');
  if(motion==='attack')assert.equal(meta.durationMs,850,'attack gesture expects 850ms');
  if(motion==='defend')assert.equal(meta.durationMs,1200,'defend gesture expects 1200ms');
  count++;
 }catch(error){errors.push(`${label}: ${error.message}`);}
}
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`PASS ${folder}: ${count} PNG/JSON pairs; dimensions, metadata, frame bounds, durations, anchors and loop settings`);
