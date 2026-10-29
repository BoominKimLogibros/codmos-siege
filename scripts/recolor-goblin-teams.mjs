import {chromium} from '@playwright/test';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
// Deterministic palette application after team color art direction: retain every frame and alpha pixel.
const family=process.argv[2]||'melee',base=family==='melee'?'goblin':'minions/'+family;const root=resolve('public/survival/'+base),motions=family==='caster'?['idle','attack','stun','die','spawn','explosion']:family==='cavalry'?['idle','attack','stun','die','spawn','attacked']:['idle','attack','stun','die','spawn'];
const clips=await Promise.all(motions.map(async motion=>({motion,data:JSON.parse(await readFile(resolve(root,motion+'.json'),'utf8'))})));
const browser=await chromium.launch({headless:true,channel:'chrome'});
try{const page=await browser.newPage();await page.goto((process.env.SURVIVAL_URL||'http://127.0.0.1:5197/survival.html').replace(/survival\.html$/,'survival/'+base+'/idle.json'));
const results=await page.evaluate(async ({clips,base})=>{
 function rgb(h,s,v){const c=v*s,x=c*(1-Math.abs(h/60%2-1)),m=v-c;let p=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return p.map(n=>Math.round((n+m)*255));}
 const results=[];
 for(const {motion,data}of clips)for(const [index,meta]of data.pages.entries()){
  const image=new Image();image.src='/survival/'+base+'/'+meta.local;await image.decode();
  for(const team of ['blue','red']){const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);let changed=0;const beforeAlpha=new Uint8Array(pixels.data.length/4);
   for(let i=0;i<pixels.data.length;i+=4){const a=pixels.data[i+3];beforeAlpha[i/4]=a;if(!a)continue;const r=pixels.data[i]/255,g=pixels.data[i+1]/255,b=pixels.data[i+2]/255,max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,s=max?d/max:0;let h=0;if(d)h=max===r?60*((g-b)/d%6):max===g?60*((b-r)/d+2):60*((r-g)/d+4);if(h<0)h+=360;let color;
    if(h>=78&&h<=(base==='goblin'?184:235)&&s>.17&&(base==='goblin'?g>r*1.08&&g>b*1.03:Math.max(g,b)>r*1.08))color=team==='blue'?rgb(207,.73+.1*(1-max),.15+.85*max):rgb(357,.6+.12*(1-max),.24+.72*max);
    else if(h>=245&&h<=325&&s>.3)color=team==='blue'?rgb(222,.78,.19+.58*max):rgb(348,.72,.18+.5*max);
    if(color){pixels.data[i]=color[0];pixels.data[i+1]=color[1];pixels.data[i+2]=color[2];changed++;}
   }
   let alphaUnchanged=true;for(let i=0;i<beforeAlpha.length;i++)if(beforeAlpha[i]!==pixels.data[i*4+3])alphaUnchanged=false;ctx.putImageData(pixels,0,0);results.push({team,motion,index,width:canvas.width,height:canvas.height,changedPixels:changed,alphaUnchanged,png:canvas.toDataURL('image/png').split(',')[1]});
  }
 }
 return results;
},{clips,base});
for(const result of results){const directory=resolve(root,result.team);await mkdir(directory,{recursive:true});await writeFile(resolve(directory,`${result.motion}-${result.index}.png`),Buffer.from(result.png,'base64'));}
for(const team of ['blue','red'])for(const {motion,data}of clips){const manifest=structuredClone(data);manifest.team=team;manifest.palette=team==='blue'?'azure-cyan skin / navy cloth':'crimson skin / maroon cloth';await writeFile(resolve(root,team,motion+'.json'),JSON.stringify(manifest,null,2)+'\n');}
const report=results.map(({png,...r})=>r);await writeFile(resolve(root,'TEAM-PALETTES.json'),JSON.stringify({method:'Per-pixel skin and cloth palette substitution; original frame cells, origins, dimensions and alpha preserved.',variants:report},null,2)+'\n');console.log('Saved',results.length,'team sprite sheets; dimensions and alpha preserved:',results.every(r=>r.alphaUnchanged));
}finally{await browser.close();}
