import * as THREE from 'three';
import {SpritePlayer} from './sprite-player.js';
import {CAST_EFFECT_PATHS} from './cast-effect-spec.js';
export function normalizeCastEffect(data,textures){
 const frames=Array.from({length:data.frameCount},(_,i)=>{let page=0;for(let p=1;p<data.pages.length;p++)if(data.pages[p].startFrame<=i)page=p;const local=i-data.pages[page].startFrame;return{rect:{x:local%data.pages[page].columns*data.frameWidth,y:Math.floor(local/data.pages[page].columns)*data.frameHeight,w:data.frameWidth,h:data.frameHeight},duration:1000/data.fps,page};});
 return{texture:textures[0],textures,frames,anchor:data.bounds.origin,worldScale:.018,loop:false,meta:{animation:'cast',direction:data.skin}};
}
export class CastEffects {
 constructor(){this.clips=new Map();}
 async load(){await Promise.all(Object.entries(CAST_EFFECT_PATHS).map(async([direction,folder])=>{const base=`/survival/effects/cast/${folder}/`,response=await fetch(base+'sprite.json');if(!response.ok)throw Error(base+'sprite.json');const data=await response.json(),textures=await Promise.all(data.pages.map(p=>new THREE.TextureLoader().loadAsync(base+p.name)));for(const t of textures){t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearFilter;t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;}this.clips.set(direction,normalizeCastEffect(data,textures));}));}
 make(effect){
  const animation=new SpritePlayer(),accent=new THREE.Color(effect.color);
  // Recolor the supplied pink core in the shader; retain the white outline and original alpha.
  animation.material.onBeforeCompile=shader=>{shader.uniforms.castAccent={value:accent};shader.fragmentShader='uniform vec3 castAccent;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n float castMax=max(diffuseColor.r,max(diffuseColor.g,diffuseColor.b));\n float castMin=min(diffuseColor.r,min(diffuseColor.g,diffuseColor.b));\n diffuseColor.rgb=mix(vec3(castMax),castAccent,clamp((castMax-castMin)*2.0,0.0,1.0));');};
  animation.material.customProgramCacheKey=()=> 'codmos-cast-accent-v1';
  animation.setClip('cast/'+effect.direction,this.clips.get(effect.direction));
  const root=animation.root;root.userData={animation,color:effect.color,sourceId:effect.sourceId,dispose:()=>animation.dispose()};return root;
 }
 update(root,effect){const animation=root.userData.animation;animation.clock=Math.max(0,effect.duration-effect.life);animation.update(0,{loop:false,flip:false});root.position.z=effect.z-1.6;}
}
