export const DOUBLE_TAP_MS=250;
export const DASH_SPEED_MULTIPLIER=1.85;
const arrows=new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight']);
// An actual release + second press is required; OS key-repeat never activates a dash.
export class DashInput {
 constructor(){this.reset();}
 clearTap(){this.lastKey=null;this.lastTime=-Infinity;}
 reset(){this.clearTap();this.activeKey=null;this.held=new Set();}
 down(code,time,repeat=false){if(code==='KeyS'){this.reset();return false;}if(!arrows.has(code)||repeat||this.held.has(code))return false;this.held.add(code);if(this.activeKey)return true;if(this.lastKey===code&&time-this.lastTime>=0&&time-this.lastTime<=DOUBLE_TAP_MS){this.activeKey=code;this.lastKey=null;this.lastTime=-Infinity;return true;}this.lastKey=code;this.lastTime=time;return false;}
 up(code){this.held.delete(code);if(!this.held.size)this.activeKey=null;}
 get active(){return !!this.activeKey&&this.held.size>0;}
}
