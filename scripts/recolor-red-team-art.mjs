import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
// Red team art from the blue sheets: blue crystals, banners and goblin skin rotate to crimson. Alpha preserved.
const jobs=[...['tower','inhibitor','nexus'].map(k=>({from:`map/blue-${k}.png`,to:`map/red-${k}.png`,mode:'structure'})),{from:'goblin/blue/team-reference.png',to:'goblin/red/team-reference.png',mode:'goblin'}];
const browser=await chromium.launch({headless:true,channel:'chrome'});
try{const page=await browser.newPage();await page.goto(process.env.SURVIVAL_URL||'http://127.0.0.1:5197/survival.html');
 for(const job of jobs){const png=await page.evaluate(async({from,mode})=>{
  function rgb(h,s,v){const c=v*s,x=c*(1-Math.abs(h/60%2-1)),m=v-c;let p=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return p.map(n=>Math.round((n+m)*255));}
  const image=new Image();image.src='/survival/'+from;await image.decode();const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
  for(let i=0;i<pixels.data.length;i+=4){if(!pixels.data[i+3])continue;const r=pixels.data[i]/255,g=pixels.data[i+1]/255,b=pixels.data[i+2]/255,max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,s=max?d/max:0;let h=0;if(d)h=max===r?60*((g-b)/d%6):max===g?60*((b-r)/d+2):60*((r-g)/d+4);if(h<0)h+=360;let color;
   if(mode==='structure'){if(h>=185&&h<=255&&s>.18)color=rgb((h-218+356+360)%360,Math.min(1,s*1.02),max*.94);}
   else if(h>=180&&h<=245&&s>.2)color=rgb(357,.6+.12*(1-max),.24+.72*max);
   if(color){pixels.data[i]=color[0];pixels.data[i+1]=color[1];pixels.data[i+2]=color[2];}}
  ctx.putImageData(pixels,0,0);return canvas.toDataURL('image/png').split(',')[1];},job);
  await writeFile(resolve('public/survival',job.to),Buffer.from(png,'base64'));console.log('Saved',job.to);}
}finally{await browser.close();}
