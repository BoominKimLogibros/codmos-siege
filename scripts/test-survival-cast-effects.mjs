import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {Survival,HEROES} from '../src/survival/engine.js';
import {KEYS} from '../src/survival/kits.js';
import {CastEffects,normalizeCastEffect} from '../src/survival/cast-effects.js';
import {CAST_EFFECT_PATHS,CAST_EFFECT_DURATION} from '../src/survival/cast-effect-spec.js';
const close=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} != ${b}`);
const visuals=new CastEffects();
for(const [direction,folder]of Object.entries(CAST_EFFECT_PATHS)){
 const dir=`public/survival/effects/cast/${folder}/`,data=JSON.parse(await readFile(dir+'sprite.json','utf8')),textures=[];
 for(const page of data.pages){const bytes=await readFile(dir+page.name);assert.equal(createHash('sha256').update(bytes).digest('hex'),page.sha256);textures.push(new THREE.Texture({width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)}));}
 const clip=normalizeCastEffect(data,textures);assert.equal(clip.frames.length,13);close(clip.frames.reduce((s,f)=>s+f.duration,0)/1000,CAST_EFFECT_DURATION);assert.equal(clip.loop,false);assert.deepEqual(clip.anchor,data.bounds.origin);for(const f of clip.frames){const image=textures[f.page].image;assert(f.rect.x>=0&&f.rect.x+f.rect.w<=image.width&&f.rect.y+f.rect.h<=image.height);}visuals.clips.set(direction,clip);
}
let total=0;
for(const hero of HEROES)for(const key of KEYS){
 const g=new Survival(()=>.5);g.start(hero.id);g.waveClock=999;g.structures=[];g.effects=[];const p=g.player,t=g.bot;p.x=p.z=0;p.attackCd=999;p.skillRanks={q:1,w:1,e:1,r:1};t.x=3;t.z=0;t.hp=t.maxHp=10000;t.stun=999;t.attackCd=999;
 assert(g.cast(key,p,t));assert(!g.effects.some(e=>e.kind==='cast'));g.advanceCast(p,p.pendingCast.remaining-.01);assert(!g.effects.some(e=>e.kind==='cast'));g.advanceCast(p,.01);const effects=g.effects.filter(e=>e.kind==='cast');assert.equal(effects.length,1,hero.id+key);const effect=effects[0];assert.equal(effect.heroId,hero.id);assert.equal(effect.sourceId,p.id);assert.equal(effect.color,hero.color);close(effect.x,p.x);close(effect.z,p.z);close(effect.duration,CAST_EFFECT_DURATION);
 const object=visuals.make(effect),player=object.userData.animation;const shader={uniforms:{},fragmentShader:THREE.ShaderLib.sprite.fragmentShader};player.material.onBeforeCompile(shader);assert.equal(shader.uniforms.castAccent.value.getHexString(),hero.color.slice(1));assert(shader.fragmentShader.includes('float castMin'),'recolor must be inserted in the real SpriteMaterial shader');effect.life-=.11;visuals.update(object,effect);assert.equal(player.frameIndex,3);assert.equal(player.flipX,false);close(object.position.z,effect.z-1.6);assert.equal(player.sprite.center.x,player.clip.anchor.x/player.clip.frames[0].rect.w);
 p.x+=2;p.z+=1;g.update(.05);close(effect.x,p.x);close(effect.z,p.z);const life=effect.life;g.pause();g.update(.05);close(effect.life,life);g.pause();for(let i=0;i<12;i++)g.update(.05);assert(!g.effects.some(e=>e.id===effect.id),'one-shot expires');object.userData.dispose();total++;
}
{
 const g=new Survival();g.start();g.waveClock=999;g.player.skillRanks.r=1;g.cast('r');g.hit(g.player,1e9,g.bot);for(let i=0;i<10;i++)g.update(.05);assert(!g.effects.some(e=>e.kind==='cast'),'canceled skill has no cast flash');
}
console.log(`PASS ${total} skill effects: release-only, own caster including dash/blink, 11 hero accents, original 4-direction assets/alpha/anchors, sprite timing, shader tint isolation, follow movement, pause and one-shot expiry`);
