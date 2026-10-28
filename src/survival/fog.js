import * as THREE from 'three';
import {MAP,SCENERY} from './map-layout.js';
import {visionSources,sightPolygon} from './vision.js';
export class TeamFog {
 constructor(scene){
  this.canvas=document.createElement('canvas');this.canvas.width=SCENERY.width*4;this.canvas.height=SCENERY.height*4;this.minimapCanvas=document.createElement('canvas');this.minimapCanvas.width=MAP.width*4;this.minimapCanvas.height=MAP.height*4;this.ctx=this.canvas.getContext('2d');this.clock=Infinity;
  this.texture=new THREE.CanvasTexture(this.canvas);this.texture.colorSpace=THREE.SRGBColorSpace;this.texture.generateMipmaps=false;
  const geometry=new THREE.PlaneGeometry(SCENERY.width,SCENERY.height);geometry.rotateX(-Math.PI/2);
  this.mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({map:this.texture,transparent:true,depthWrite:false,depthTest:false}));this.mesh.position.y=.1;this.mesh.renderOrder=10000;this.mesh.visible=false;scene.add(this.mesh);
 }
 update(game,dt,active){
  this.mesh.visible=active;if(!active){this.clock=Infinity;return;}this.clock+=dt;if(this.clock<.08&&this.team===game.player.team)return;this.clock=0;this.team=game.player.team;
  const c=this.ctx,s=this.canvas.width/SCENERY.width,X=x=>(x-SCENERY.minX)*s,Z=z=>(z-SCENERY.minZ)*s;
  c.clearRect(0,0,this.canvas.width,this.canvas.height);c.globalCompositeOperation='source-over';c.fillStyle='rgba(10,23,21,.68)';c.fillRect(0,0,this.canvas.width,this.canvas.height);
  c.globalCompositeOperation='destination-out';c.fillStyle='#fff';c.lineJoin='round';
  for(const source of visionSources(game,this.team)){
   const polygon=sightPolygon(source);c.beginPath();for(let i=0;i<polygon.length;i++){const p=polygon[i];i?c.lineTo(X(p.x),Z(p.z)):c.moveTo(X(p.x),Z(p.z));}c.closePath();c.fill();
   c.strokeStyle='rgba(255,255,255,.2)';c.lineWidth=s*.3;c.stroke();
  }
  c.globalCompositeOperation='source-over';const mini=this.minimapCanvas,mc=mini.getContext('2d');mc.clearRect(0,0,mini.width,mini.height);mc.drawImage(this.canvas,(MAP.minX-SCENERY.minX)*s,(MAP.minZ-SCENERY.minZ)*s,MAP.width*s,MAP.height*s,0,0,mini.width,mini.height);this.texture.needsUpdate=true;
 }
}
