import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {durationFrame,facingDirection,normalizeCharacter,normalizeGoblin,SpritePlayer} from '../src/survival/sprite-player.js';
import {SPRITE_FOLDERS} from '../src/survival/characters.js';
import {Survival} from '../src/survival/engine.js';
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const dummy=(w,h)=>{const t=new THREE.Texture({width:w,height:h});return t;};
let clips=0;
for(const folder of Object.values(SPRITE_FOLDERS))for(const direction of ['front','back','side_left','side_right'])for(const motion of ['idle','move','attack','defend','HP_Down',...(direction==='front'?['failure','success']:[]),...(direction.startsWith('side_')?['run']:[])]){
 const path=`public/survival/character-sprites/${folder}/${direction}/${motion}`,data=await json(path+'.json'),bytes=await readFile(path+'.png'),frames=Object.values(data.frames),w=bytes.readUInt32BE(16),h=bytes.readUInt32BE(20);assert.equal(data.meta.frameCount,frames.length);assert.equal(data.meta.size.w,w);assert.equal(data.meta.size.h,h);
 for(const f of frames){assert(f.duration>0);assert(f.frame.x>=0&&f.frame.y>=0&&f.frame.x+f.frame.w<=w&&f.frame.y+f.frame.h<=h);assert(!f.rotated);}
 const clip=normalizeCharacter(data,dummy(w,h));assert.equal(durationFrame(clip.frames,0),0);assert.equal(durationFrame(clip.frames,999,false),frames.length-1);const player=new SpritePlayer();player.setClip(direction,clip);player.update(.1,{flip:false,tint:true});assert.equal(player.material.color.getHexString(),'ff6978');assert.equal(player.hitUniform.value,.7);assert(player.sprite.scale.x>0);assert.equal(player.sprite.center.x,data.meta.anchor.x/frames[0].frame.w);player.update(0,{tint:false});assert.equal(player.material.color.getHexString(),'ffffff');player.dispose();clips++;
}
assert.equal(clips,264);assert.equal(facingDirection(0,-1),'back');assert.equal(facingDirection(0,1),'front');assert.equal(facingDirection(-1,0),'side_left');assert.equal(facingDirection(1,0),'side_right');assert.equal(facingDirection(0,0,'back'),'back');
const goblin=await json('public/survival/goblin/idle.json'),textures=goblin.pages.map(p=>dummy(p.columns*goblin.frameWidth,p.rows*goblin.frameHeight)),clip=normalizeGoblin(goblin,textures),player=new SpritePlayer();player.setClip('walk',clip);player.update(.1,{flip:true});assert(player.currentTexture.repeat.x<0);assert.equal(player.sprite.center.x,1-clip.anchor.x/clip.frames[0].rect.w);const width=player.sprite.scale.x;for(let i=0;i<10;i++){player.update(.05,{flip:!!(i%2)});assert.equal(player.sprite.scale.x,width);}player.dispose();
const g=new Survival();g.start();g.update(.05,{x:0,z:-1});assert.equal(g.player.faceX,0);assert.equal(g.player.faceZ,-1);g.hit(g.player,10,g.bot);assert.equal(g.player.hitFlash,.24);assert(g.player.hurtAnim>0);for(let i=0;i<6;i++)g.update(.05);assert.equal(g.player.hitFlash,0);const m=g.units.find(u=>u.kind==='minion');g.hit(m,1e6,g.bot);assert(g.corpses.some(c=>c.hp===0));for(let i=0;i<20;i++)g.update(.05);assert(!g.corpses.length);
console.log('PASS 264 packed clips/PNG bounds/timing, 4 facings, original root anchors, baked character directions, goblin UV flipping without mirrored HUD, tint isolation/recovery and death lifetime');
