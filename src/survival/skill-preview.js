// Screen-space game UI, drawn above fog while using the same world geometry as casting.
export class SkillPreview {
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');}
 draw(preview,camera,width,height){
  const canvas=this.canvas;if(!preview){canvas.hidden=true;return;}const ratio=Math.min(devicePixelRatio,2);if(canvas.width!==Math.round(width*ratio)||canvas.height!==Math.round(height*ratio)){canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);}
  const c=this.ctx;c.setTransform(ratio,0,0,ratio,0,0);c.clearRect(0,0,width,height);canvas.hidden=!preview;if(!preview)return;
  const scale=height/(camera.top*2),X=x=>width/2+(x-camera.position.x)*scale,Z=z=>height/2+(z-camera.position.z)*scale,origin={x:X(preview.origin.x),y:Z(preview.origin.z)},point={x:X(preview.point.x),y:Z(preview.point.z)},color=preview.blocked?'#f4cc8c':'#98f4e5';
  c.lineJoin=c.lineCap='round';c.strokeStyle=color;c.lineWidth=1.5;c.fillStyle='rgba(81,218,208,.14)';
  const circle=(x,y,r,fill=false)=>{c.beginPath();c.arc(x,y,Math.max(0,r),0,Math.PI*2);if(fill)c.fill();c.stroke();};
  c.save();c.globalAlpha=.3;c.setLineDash([4,7]);circle(origin.x,origin.y,preview.range*scale);c.restore();
  if(preview.shape==='circle')circle(point.x,point.y,preview.radius*scale,true);
  if(preview.shape==='line'||preview.shape==='dash'){
   const end=preview.end||preview.point,ex=X(end.x),ey=Z(end.z),length=Math.hypot(ex-origin.x,ey-origin.y),angle=Math.atan2(ey-origin.y,ex-origin.x),w=preview.width*scale;
   c.save();c.translate(origin.x,origin.y);c.rotate(angle);c.beginPath();c.roundRect(0,-w/2,length,w,Math.min(w/2,6));c.fill();c.stroke();c.setLineDash([6,5]);c.beginPath();c.moveTo(0,0);c.lineTo(length,0);c.stroke();c.setLineDash([]);c.beginPath();c.moveTo(length-9,-5);c.lineTo(length,0);c.lineTo(length-9,5);c.stroke();c.restore();
  }
  if(preview.shape==='cone'||preview.shape==='fan'){
   const r=preview.radius*scale,a=preview.angle,h=preview.halfAngle;c.beginPath();c.moveTo(origin.x,origin.y);c.arc(origin.x,origin.y,r,a-h,a+h);c.closePath();c.fill();c.stroke();
   if(preview.shape==='fan')for(const angle of [a-h,a,a+h]){c.beginPath();c.moveTo(origin.x,origin.y);c.lineTo(origin.x+Math.cos(angle)*r,origin.y+Math.sin(angle)*r);c.stroke();}
  }
  if(preview.shape==='blink'||preview.shape==='dash'){
   const ex=X(preview.end.x),ey=Z(preview.end.z);if(preview.shape==='blink'){c.save();c.setLineDash([5,5]);c.beginPath();c.moveTo(origin.x,origin.y);c.lineTo(ex,ey);c.stroke();c.restore();}
   circle(ex,ey,Math.max(.65,preview.radius)*scale,true);
   if(preview.blocked){c.save();c.strokeStyle='#f49a8a';c.setLineDash([3,5]);c.beginPath();c.moveTo(ex,ey);c.lineTo(point.x,point.y);c.stroke();c.setLineDash([]);c.beginPath();c.moveTo(point.x-5,point.y-5);c.lineTo(point.x+5,point.y+5);c.moveTo(point.x-5,point.y+5);c.lineTo(point.x+5,point.y-5);c.stroke();c.restore();}
  }
  // The reticle is attached to the actual destination for movement skills.
  const center=['blink','dash','line'].includes(preview.shape)?{x:X(preview.end.x),y:Z(preview.end.z)}:point;
  c.strokeStyle='#e9fff7';c.lineWidth=1.5;circle(center.x,center.y,5);for(const sign of [-1,1]){c.beginPath();c.moveTo(center.x+sign*9,center.y);c.lineTo(center.x+sign*15,center.y);c.moveTo(center.x,center.y+sign*9);c.lineTo(center.x,center.y+sign*15);c.stroke();}
  const label=`↑ ↓ ← →   ·   ${preview.key.toUpperCase()} ↑   ·   Esc ×`;c.font='500 11px system-ui';c.textAlign='center';const tw=c.measureText(label).width;c.fillStyle='#0e281fe8';c.beginPath();c.roundRect(width/2-tw/2-13,77,tw+26,28,8);c.fill();c.fillStyle='#caf5df';c.fillText(label,width/2,95);
 }
}
