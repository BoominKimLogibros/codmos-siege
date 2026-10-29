import assert from 'node:assert/strict';
import {Survival,HEROES} from '../src/survival/engine.js';
import {ITEMS,STARTING_MESO,purchaseQuote,statsWithItems,saleValue} from '../src/survival/items.js';
import {SHOPS} from '../src/survival/map-layout.js';
import {canWalk} from '../src/survival/terrain.js';
const close=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} != ${b}`);
function setup(team='blue',id='naruto'){const g=new Survival(()=>.5);g.start(id,team);g.waveClock=999;g.bot.stun=999;const shop=SHOPS.find(s=>s.team===team);g.player.x=shop.x;g.player.z=shop.z+2.3;return g;}
assert.equal(ITEMS.length,24);for(const item of ITEMS)assert(item.cost>0&&(!item.components||item.cost>=item.components.reduce((sum,id)=>sum+ITEMS.find(i=>i.id===id).cost,0)));
for(const team of ['blue','red']){
 const g=setup(team),p=g.player;assert.equal(p.meso,STARTING_MESO);assert(g.shopStatus().canTrade);assert(canWalk(p.x,p.z,.35,g.structures));assert(g.buyItem('short-sword').ok);assert.equal(p.inventory[0],'short-sword');assert.equal(p.meso,STARTING_MESO-120);close(p.damage,HEROES[0].damage+6);
 p.x=0;const money=p.meso,inventory=[...p.inventory];assert(!g.buyItem('tome').ok);assert(!g.sellItem(0).ok);assert.equal(p.meso,money);assert.deepEqual(p.inventory,inventory);
 const enemy=SHOPS.find(s=>s.team!==team);p.x=enemy.x;p.z=enemy.z+2;assert(!g.shopStatus().canTrade);p.hp=0;p.x=SHOPS.find(s=>s.team===team).x;assert(!g.buyItem('bead').ok);
}
for(const hero of HEROES)for(const item of ITEMS){
 const g=setup('blue',hero.id),p=g.player;p.meso=5000;const before=p.meso;assert(g.buyItem(item.id).ok);assert.equal(p.meso,before-item.cost);const expected=statsWithItems(hero,1,[item.id]);for(const key of Object.keys(expected))close(p.stats[key],expected[key]);close(p.damage,expected.attackDamage);close(p.speed,expected.moveSpeed/50);
 g.gainXp(p.team,p.required);const grown=statsWithItems(hero,2,[item.id]);for(const key of Object.keys(grown))close(p.stats[key],grown[key]);assert.deepEqual(p.inventory,[item.id]);
 g.hit(p,1e9,g.bot);p.respawn=.01;g.update(.05);assert(p.hp>0);assert.deepEqual(p.inventory,[item.id]);close(p.stats.attackDamage,grown.attackDamage);
}
{const g=setup(),p=g.player;p.meso=0;assert.equal(g.buyItem('tome').reason,'funds');assert.deepEqual(p.inventory,[]);assert.equal(p.meso,0);assert.equal(g.buyItem('unknown').reason,'item');g.pause();assert.equal(g.buyItem('ruby').reason,'state');}
{const g=setup(),p=g.player;p.meso=10000;for(const id of ['short-sword','dagger','tome','ruby','cloth','bead'])assert(g.buyItem(id).ok);assert.equal(p.inventory.length,6);assert.equal(g.buyItem('sapphire').reason,'slots');const before=p.meso,q=purchaseQuote(p,'stormblade');assert.equal(q.price,180);assert.equal(q.consumed.length,2);assert(g.buyItem('stormblade').ok);assert.equal(p.inventory.filter(Boolean).length,5);assert.equal(p.meso,before-180);assert(!p.inventory.includes('short-sword'));assert(!p.inventory.includes('dagger'));assert.equal(g.buyItem('stormblade').reason,'unique');}
{const g=setup(),p=g.player;p.meso=2000;g.buyItem('boots');assert.equal(g.buyItem('boots').reason,'unique');g.buyItem('dagger');const q=purchaseQuote(p,'swiftboots');assert.equal(q.price,80);assert(g.buyItem('swiftboots').ok);assert.deepEqual(p.inventory,['swiftboots']);assert.equal(g.buyItem('boots').reason,'unique');close(p.stats.moveSpeed,395);}
{const g=setup(),p=g.player;p.meso=5000;g.buyItem('ruby');const hp=p.maxHp;assert.equal(hp,500);p.hp=10;const money=p.meso;assert(g.sellItem(0).ok);assert.equal(p.maxHp,400);assert(p.hp>0&&p.hp<=p.maxHp);assert.equal(p.meso,money+saleValue('ruby'));assert.equal(p.inventory.length,0);assert(!g.sellItem(-1).ok);assert(!g.sellItem(0).ok);}
{const g=setup(),p=g.player;p.meso=5000;const base=p.stats.attackSpeed;g.buyItem('dagger');close(p.stats.attackSpeed,base*1.15);g.bot.x=p.x+4;g.bot.z=p.z;g.basic(p,g.bot);close(p.attackCd,1/p.stats.attackSpeed);}
{const g=setup(),p=g.player;p.meso=5000;for(const id of ['short-sword','dagger','short-sword'])assert(g.buyItem(id).ok);const q=purchaseQuote(p,'kingsbane');assert.equal(q.price,1140-360);assert.equal(q.consumed.length,3);const before=p.meso;assert(g.buyItem('kingsbane').ok);assert.deepEqual(p.inventory,['kingsbane']);assert.equal(p.meso,before-780);assert.equal(g.buyItem('kingsbane').reason,'unique');}
console.log('PASS 24 items × 11 heroes: real stat application, XP/respawn persistence, both-team local trade gates, no failed-spend, 6 slots/full-inventory upgrades, component discounts, 3-tier nested discounts, boot/unique limits, resale/vitals and attack interval');
