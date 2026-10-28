import * as THREE from 'three';
import {SpritePlayer} from './sprite-player.js';
import {normalizeCastEffect} from './cast-effects.js';
export class TowerCollapse {
 async load(){const base='/survival/effects/tower-collapse/edfc3d0a63a0/',response=await fetch(base+'sprite.json');if(!response.ok)throw Error(base+'sprite.json');const data=await response.json(),textures=await Promise.all(data.pages.map(p=>new THREE.TextureLoader().loadAsync(base+p.name)));for(const t of textures){t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearFilter;t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;}this.clip=normalizeCastEffect(data,textures);this.clip.worldScale=8/data.frameWidth;this.clip.meta={animation:'tower-collapse'};}
 make(){const animation=new SpritePlayer();animation.setClip('tower-collapse',this.clip);const root=animation.root;root.userData={animation,dispose:()=>animation.dispose()};return root;}
 update(root,effect){const animation=root.userData.animation;animation.clock=Math.max(0,effect.duration-effect.life);animation.update(0,{loop:false,flip:false});root.position.z=effect.z-2.4;}
}
