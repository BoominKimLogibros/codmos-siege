import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {frameAt} from '../src/survival/library.js';
const root=resolve('public'),manifest=JSON.parse(await readFile(resolve(root,'survival/library/manifest.json'),'utf8'));
assert.equal(manifest.items.length,28);
for(const item of manifest.items){const directory=dirname(resolve(root,'.'+item.url));for(const file of item.files){const bytes=await readFile(resolve(directory,file.path));assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);assert.equal(file.sha256,item.id,'single-page original must retain catalog hash');}if(item.sheetUrl){const sheet=JSON.parse(await readFile(resolve(root,'.'+item.sheetUrl),'utf8'));for(let frame=0;frame<sheet.frameCount;frame++){const f=frameAt(sheet,(frame+.01)/sheet.fps);assert.equal(f.frame,frame);const page=sheet.pages[f.pageIndex];assert(f.x+sheet.frameWidth<=page.columns*sheet.frameWidth);assert(f.y+sheet.frameHeight<=page.rows*sheet.frameHeight);assert(page.local);}assert.equal(frameAt(sheet,sheet.frameCount/sheet.fps).frame,0);assert.equal(frameAt(sheet,999,{loop:false}).frame,sheet.frameCount-1);}}
const multi={frameCount:8,fps:10,frameWidth:40,frameHeight:30,pages:[{startFrame:0,columns:2,rows:2},{startFrame:4,columns:2,rows:2}]};assert.deepEqual(frameAt(multi,.4),{frame:4,pageIndex:1,x:0,y:0});assert.deepEqual(frameAt(multi,.7),{frame:7,pageIndex:1,x:40,y:30});
console.log('PASS 28 original hashes, local sprite dependencies, all frame cells, page transitions and one-shot playback');
