// Free art used by the HUD and combat effects. scripts/import-free-assets.mjs reads these tables to copy and resize the source packs into public/survival.
// Skill icons: Painterly Spell Icons by J. W. Bjerk (eleazzaar), CC-BY 3.0. Names are "<pack file>" without .png; -1/-2/-3 is the glow strength.
export const SKILL_ICON_SOURCES={
 naruto:{p:'link-blue-2',q:'air-burst-sky-2',w:'enchant-orange-2',e:'haste-sky-2',r:'explosion-sky-3'},
 int:{p:'shielding-spirit-1',q:'beam-sky-2',w:'heal-sky-2',e:'link-royal-2',r:'lighting-royal-3'},
 kim:{p:'runes-orange-1',q:'explosion-orange-2',w:'haste-fire-2',e:'protect-orange-2',r:'fire-arrows-3'},
 nova:{p:'light-royal-1',q:'fireball-sky-2',w:'protect-royal-2',e:'light-sky-2',r:'explosion-royal-3'},
 lucy:{p:'evil-eye-red-1',q:'needles-sky-2',w:'runes-magenta-2',e:'wind-magenta-2',r:'fog-magenta-3'},
 jet:{p:'haste-royal-1',q:'slice-sky-2',w:'wind-sky-2',e:'wind-grasp-air-2',r:'wind-blue-3'},
 bora:{p:'horror-acid-1',q:'fireball-acid-2',w:'fog-acid-2',e:'rip-acid-2',r:'vines-acid-3'},
 dokkaebi:{p:'rock-orange-1',q:'rock-plain-2',w:'shielding-fire-2',e:'wind-red-2',r:'lightning-orange-3'},
 gumiho:{p:'rip-magenta-1',q:'fireball-eerie-2',w:'fireball-red-2',e:'evil-eye-eerie-2',r:'slice-spirit-3'},
 'young-forty':{p:'protect-jade-1',q:'rock-sky-2',w:'heal-jade-2',e:'wind-grasp-acid-2',r:'enchant-red-3'},
 danso:{p:'link-eerie-1',q:'needles-royal-2',w:'horror-eerie-2',e:'runes-blue-2',r:'beam-magenta-3'}
};
// Vivid per-hero tint for skill VFX (cast rune, skill projectiles and hits, auras), matched to each hero's icon palette. Heroes without an entry use their HEROES color.
export const SKILL_VFX_COLORS={naruto:'#59c8ff',int:'#5fe3ff',kim:'#ff9a3c',nova:'#8f7bff',lucy:'#ff5fb0',jet:'#5df0e0',bora:'#7dff4f',dokkaebi:'#ff6a3c',gumiho:'#ff4fd8','young-forty':'#6dff9a',danso:'#b06bff'};
// Item icons: 496 Pixel Art Icons for Medieval/Fantasy RPG by Henrique Lazarini (7Soul1), CC0. Keyed by ITEMS[].icon.
export const ITEM_ICON_SOURCES={
 sword:'W_Sword001',ruby:'I_Ruby',armor:'A_Armor04',amulet:'Ac_Necklace03',book:'W_Book01',dagger:'W_Dagger002',boots:'A_Shoes01',seed:'I_Clover',sapphire:'I_Sapphire',
 stormblade:'W_Sword015',staff:'W_Staff03',aegis:'A_Armour02',fang:'I_Fang',orb:'I_Opal',swiftboots:'A_Shoes05',band:'Ac_Ring02',cloak:'A_Clothing02',
 kingsbane:'W_Gold_Sword',crown:'C_Hat02',bulwark:'A_Armour03',scythe:'W_Axe012',heart:'I_Leaf','health-potion':'P_Red01','mana-potion':'P_Blue01'
};
// Combat effects: Brackeys VFX Bundle (Kenney, Picster, Thomas Iché, CodeManu), CC0. Particles are white alpha masks tinted at runtime.
export const VFX_PARTICLES=['slash_02','circle_02','circle_03','magic_02','magic_03','light_01','twirl_01','star_06','star_09','spotlight_05','trace_06','spark_07','smoke_03','smoke_10','muzzle_04','scorch_02','flare_01','light_02'];
// Sprite sheets are repacked without empty cells: source grid, first/last used frame and output cell size.
export const VFX_SHEETS={
 impact:{file:'impact_white_6x4',cols:6,rows:4,from:0,to:13,size:128},
 bighit:{file:'big_hit_6x5',cols:6,rows:5,from:1,to:11,size:160},
 explosion:{file:'explosion_6x5',cols:6,rows:5,from:1,to:26,size:192}
};
export const SKILL_ICON_PATH=(heroId,key)=>`/survival/icons/skills/${heroId}-${key}.png`;
export const ITEM_ICON_PATH=icon=>`/survival/icons/items/${icon}.png`;
export const VFX_PATH=name=>`/survival/vfx/${name}.png`;
