// Encounter budgets are explicit and deterministic. Density and firepower stay high;
// health, damage, reaction time and elite overlap are tuned independently.
const rows=[
// interval, troopHP, eliteHP, eliteEvery, eliteCap, damage, burst/0.5s, warning, bossHP, bossAdds
 [2.1,0.88,0.564,3,1,0.718,3.35,1.65,0.73,7], // Stage 1
 [2.1,0.88,0.588,3,1,0.729,3.55,1.65,0.741,7], // Stage 2
 [2.05,0.995,0.689,3,1,0.813,3.95,1.6,0.835,6.8], // Stage 3
 [2.05,1.008,0.716,3,1,0.825,4.05,1.6,0.859,6.8], // Stage 4
 [2,1.034,0.755,2,2,0.86,4.25,1.55,0.884,6.5], // Stage 5
 [2,1.047,0.782,2,2,0.872,4.35,1.55,0.908,6.5], // Stage 6
 [1.95,1.06,0.822,2,2,0.908,4.45,1.5,0.933,6.2], // Stage 7
 [1.95,1.073,0.848,2,2,0.92,4.55,1.5,0.957,6.2], // Stage 8
 [1.9,1.086,0.888,2,2,0.956,4.65,1.45,0.982,6], // Stage 9
 [1.9,1.099,0.914,2,2,0.968,4.75,1.45,1.007,6], // Stage 10
 [1.85,1.112,0.954,2,3,1.004,4.85,1.4,1.031,5.8], // Stage 11
 [1.85,1.124,0.98,2,3,1.016,4.95,1.4,1.056,5.8], // Stage 12
];
export const LEVEL_BALANCE=Object.freeze(rows.map((r,stage)=>Object.freeze({stage,waveInterval:r[0],troopHp:r[1],eliteHp:r[2],eliteEvery:r[3],eliteCap:r[4],incoming:r[5],burstCap:r[6],warning:r[7],bossHp:r[8],bossAdds:r[9],troops:9+Math.floor(stage/3),cavalryCap:stage<8?2:5,speed:8.8,recruitInterval:6,heroFirepower:12,troopFirepower:.65})));
export const DIFFICULTIES=Object.freeze({relaxed:{name:'Relaxed',health:.85,damage:.75,interval:1.10,warning:.2},standard:{name:'Standard',health:1,damage:1,interval:1,warning:0},veteran:{name:'Veteran',health:1.22,damage:1.2,interval:.88,warning:-.1}});
export function balanceFor(stage,difficulty='standard'){const base=LEVEL_BALANCE[Math.max(0,Math.min(11,stage))],d=DIFFICULTIES[difficulty]??DIFFICULTIES.standard;if(difficulty==='standard'||!DIFFICULTIES[difficulty])return base;return {...base,waveInterval:base.waveInterval*d.interval,troopHp:base.troopHp*d.health,eliteHp:base.eliteHp*d.health,bossHp:base.bossHp*d.health,incoming:base.incoming*d.damage,burstCap:base.burstCap*d.damage,warning:base.warning+d.warning};}
