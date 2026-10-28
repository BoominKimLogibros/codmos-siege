// Restore the exact curated assets used by the game, without searching or changing selection.
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
const base='https://codmos-creator-studio.bm33728090.chatgpt.site',root=resolve('public'),manifest=JSON.parse(await readFile(resolve(root,'survival/library/manifest.json'),'utf8'));
for(const item of manifest.items){const directory=dirname(resolve(root,'.'+item.url));await mkdir(directory,{recursive:true});for(const file of item.files){const response=await fetch(`${base}/file/${file.sha256}?download=1`,{headers:{'User-Agent':'CodmosAgent/1.0'}});if(!response.ok)throw Error(`${response.status}: ${item.name}`);const bytes=Buffer.from(await response.arrayBuffer());if(createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw Error(`Hash mismatch: ${item.name}`);await writeFile(resolve(directory,file.path),bytes);}console.log(`Restored ${item.name}`);}
