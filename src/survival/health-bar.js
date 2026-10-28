import * as THREE from 'three';
// One overlay per bar. Procedural marks stay clipped to the existing width even at high HP.
export function healthTicks(width,height,z){
 const uniforms={healthSegments:{value:1},healthHalfWidth:{value:.02/width}};
 const material=new THREE.SpriteMaterial({color:'#163c25',transparent:true,depthWrite:false});
 material.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,uniforms);
  shader.vertexShader='varying vec2 healthUv;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\nhealthUv=uv;');
  shader.fragmentShader='varying vec2 healthUv;\nuniform float healthSegments;\nuniform float healthHalfWidth;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <alphatest_fragment>',`#include <alphatest_fragment>
   float cell=healthUv.x*healthSegments;
   float nearest=floor(cell+0.5);
   float spacing=max(fwidth(cell),0.00001);
   float halfLine=min(healthHalfWidth*healthSegments,0.14);
   float coverage=1.0-smoothstep(halfLine-spacing*0.5,halfLine+spacing*0.5,abs(cell-nearest));
   float interior=step(1.0,nearest)*(1.0-step(healthSegments-0.0001,nearest));
   diffuseColor.a*=coverage*interior*0.88*min(1.0,1.0/max(spacing,1.0));
  `);
 };
 material.customProgramCacheKey=()=> 'health-100-ticks-v1';
 const sprite=new THREE.Sprite(material);sprite.scale.set(width,height,1);sprite.position.z=z;sprite.userData.healthTicks=true;
 return{hpTicks:sprite,hpTickUniforms:uniforms};
}
export function updateHealthBar(object,current,max,dt){
 const data=object.userData,safeMax=Number.isFinite(max)&&max>0?max:1,target=Math.max(0,Math.min(1,current/safeMax));
 if(data.hpRatio===null)data.hpRatio=target;else data.hpRatio+=(target-data.hpRatio)*(1-Math.exp(-14*dt));if(Math.abs(data.hpRatio-target)<.001)data.hpRatio=target;
 data.hp.scale.x=data.hpWidth*data.hpRatio;
 data.hpTickUniforms.healthSegments.value=safeMax/100;data.hpTicks.visible=current>0;
}
