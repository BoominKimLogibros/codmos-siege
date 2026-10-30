import {chromium} from '@playwright/test';
import {mkdir,readdir,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {SKILL_ICON_SOURCES,ITEM_ICON_SOURCES,VFX_PARTICLES,VFX_SHEETS} from '../src/survival/asset-manifest.js';
// Copies the free icon and VFX packs listed in asset-manifest.js into public/survival at game-ready sizes.
// Usage: node scripts/import-free-assets.mjs --painterly <dir> --rpg <dir> --vfx <brackeys_vfx_bundle dir> [--only skills,items,vfx]
const args=Object.fromEntries(process.argv.slice(2).join(' ').split('--').filter(Boolean).map(s=>s.trim().split(/\s+/)));
const only=new Set((args.only||'skills,items,vfx').split(','));
async function files(dir){const out=new Map();for(const entry of await readdir(dir,{withFileTypes:true,recursive:true}))if(entry.isFile()&&entry.name.endsWith('.png')&&!entry.parentPath.includes('__MACOSX'))out.set(entry.name.replace(/\.png$/,''),join(entry.parentPath,entry.name));return out;}
const out=resolve('public/survival');
const browser=await chromium.launch({headless:true,channel:'chrome',args:['--allow-file-access-from-files']});
try{
 const page=await browser.newPage();await page.goto('file:///');
 // Draws a source image (or a grid of its cells) into a canvas and returns PNG bytes.
 const render=(file,job)=>page.evaluate(async({file,job})=>{
  const image=new Image();image.src='file://'+file;await image.decode();const canvas=document.createElement('canvas'),c=canvas.getContext('2d');c.imageSmoothingQuality='high';
  if(job.sheet){const {cols,rows,from,to,size}=job.sheet,count=to-from+1,outCols=Math.ceil(Math.sqrt(count)),fw=image.width/cols,fh=image.height/rows,scale=size/Math.max(fw,fh);canvas.width=outCols*size;canvas.height=Math.ceil(count/outCols)*size;
   for(let i=0;i<count;i++){const n=from+i,w=fw*scale,h=fh*scale;c.drawImage(image,n%cols*fw,Math.floor(n/cols)*fh,fw,fh,i%outCols*size+(size-w)/2,Math.floor(i/outCols)*size+(size-h)/2,w,h);}}
  else{canvas.width=canvas.height=job.size||image.width;if(!job.size)c.imageSmoothingEnabled=false;c.drawImage(image,0,0,canvas.width,canvas.height);}
  return canvas.toDataURL('image/png');},{file,job});
 const save=async(path,url)=>{await mkdir(join(out,path,'..'),{recursive:true});await writeFile(join(out,path),Buffer.from(url.split(',')[1],'base64'));console.log('wrote',path);};
 if(only.has('skills')){const source=await files(args.painterly);for(const [hero,keys]of Object.entries(SKILL_ICON_SOURCES))for(const [key,name]of Object.entries(keys)){const file=source.get(name);if(!file)throw Error('missing painterly icon '+name);await save(`icons/skills/${hero}-${key}.png`,await render(file,{size:128}));}}
 if(only.has('items')){const source=await files(args.rpg);for(const [icon,name]of Object.entries(ITEM_ICON_SOURCES)){const file=source.get(name);if(!file)throw Error('missing item icon '+name);await save(`icons/items/${icon}.png`,await render(file,{}));}}
 if(only.has('vfx')){const source=await files(args.vfx);for(const name of VFX_PARTICLES){const file=source.get(name+'_a');if(!file)throw Error('missing particle '+name);await save(`vfx/${name}.png`,await render(file,{size:256}));}
  for(const [name,sheet]of Object.entries(VFX_SHEETS)){const file=source.get(sheet.file);if(!file)throw Error('missing sheet '+sheet.file);await save(`vfx/${name}.png`,await render(file,{sheet}));}}
}finally{await browser.close();}
