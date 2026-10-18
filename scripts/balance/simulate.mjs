import {Battle,freshSave,seeded,LARGE_ENEMIES,ENEMY_TYPES,upgrade,upgradeCost} from '../../dist/engine.js';
export const PROFILES={
 idle:{reaction:1,miss:1,noise:0,abilities:false},
 learner:{reaction:.65,miss:.25,noise:.65,abilities:'simple'},
 regular:{reaction:.36,miss:.10,noise:.28,abilities:'normal'},
 expert:{reaction:.18,miss:0,noise:.08,abilities:'expert'}
};
export const UPGRADE_ORDER=['barracks','forge','fortress','academy','barracks','forge','treasury','fortress','academy','barracks','forge'];
export function loadout(stage,kind='expected'){
 const save=freshSave();if(kind==='base')return save;
 // One affordable combat upgrade per chapter, allocated in a useful but non-optimal order.
 const order=UPGRADE_ORDER;
 for(const key of order.slice(0,stage))save.upgrades[key]++;
 save.heroXP=stage*70;return save;
}
export function simulate({stage=0,profile='regular',seed=1,kind='expected',save:provided,tuning=null,BattleType=Battle,limit=110}={}){
 const p=PROFILES[profile],random=seeded(seed*517+stage*991),save=provided??loadout(stage,kind);let losses=0,recruited=0,largestHit=0,peak=0,pressure=0,eliteKills=0,abilityUses=0;
 const b=new BattleType({stage,save,tuning,seed:seed*713+stage*331,event:(type,data)=>{if(type==='hurt'){losses+=data.amount;largestHit=Math.max(largestHit,data.amount);}if(type==='recruit')recruited+=data.amount;if(type==='destroy'&&LARGE_ENEMIES.has(data.type))eliteKills++;if(type==='ability')abilityUses++;}});
 let nextDecision=0,nextAbility=.8+random(),ignoreGate=0;
 const dt=1/30;
 while(b.status==='playing'&&b.time<limit){
  if(b.time>=nextDecision){nextDecision=b.time+p.reaction;
   if(profile!=='idle'){
    const upcoming=b.entities.filter(e=>e.type==='gate'&&e.z>-34&&e.z<1&&!['−','÷'].includes(e.op)).sort((a,c)=>c.z-a.z)[0];
    if(upcoming&&ignoreGate!==upcoming.id&&random()<p.miss)ignoreGate=upcoming.id;
    const desired=upcoming&&ignoreGate!==upcoming.id?upcoming.x:b.boss?b.boss.weakX:0;
    // Human reaction window; late decisions and imperfect aim are intentional.
    const threats=b.hazards.filter(h=>!h.triggered&&h.delay<p.reaction+.55);
    const options=[-6,-4,-2,0,2,4,6,desired];
    let best=desired,bestCost=Infinity;
    for(const x of options){const hits=threats.filter(h=>Math.abs(x-h.x)<h.width/2+.8).reduce((a,h)=>a+h.damage,0);const contact=b.entities.filter(e=>ENEMY_TYPES.has(e.type)&&e.z>-.5&&Math.abs(e.x-x)<2.4).reduce((a,e)=>a+(LARGE_ENEMIES.has(e.type)?6:1),0);const cost=hits*7+contact*3+Math.abs(x-desired)*.75+Math.abs(x-b.x)*.13;if(cost<bestCost){bestCost=cost;best=x;}}
    b.targetX=best+(random()-.5)*p.noise;
   }
  }
  if(p.abilities&&b.time>=nextAbility){nextAbility=b.time+(p.abilities==='simple'?2.8:p.abilities==='expert'?.28:.8);
   const danger=b.hazards.some(h=>!h.triggered&&h.delay<.8&&Math.abs(h.x-b.x)<h.width/2+.7);
   const enemies=b.entities.filter(e=>ENEMY_TYPES.has(e.type));const large=enemies.some(e=>LARGE_ENEMIES.has(e.type)&&e.z>-25);
   if(danger&&b.shield<=0&&b.abilities.shield<=0)b.ability('shield');
   else if(enemies.length>=(p.abilities==='simple'?10:7)&&b.abilities.volley<=0)b.ability('volley');
   else if(p.abilities!=='simple'&&(large||b.boss)&&b.abilities.magic<=0)b.ability('magic');
   else if(p.abilities==='expert'&&enemies.some(e=>e.z>-15)&&b.abilities.charge<=0)b.ability('charge');
  }
  b.step(dt);peak=Math.max(peak,b.entities.filter(e=>ENEMY_TYPES.has(e.type)).length);pressure+=b.hazards.filter(h=>!h.triggered).length*dt;
 }
 return {stage:stage+1,profile,seed,kind,win:b.status==='victory',status:b.status,time:+b.time.toFixed(1),army:b.army,kills:b.kills,losses,recruited,largestHit,peak,eliteKills,abilityUses,pressure:+pressure.toFixed(1),gold:b.settle()?.gold??0};
}
export function summarize(runs){const sorted=runs.map(r=>r.army).sort((a,b)=>a-b);return {runs:runs.length,wins:runs.filter(r=>r.win).length,winRate:Math.round(runs.filter(r=>r.win).length/runs.length*100),medianArmy:sorted[Math.floor(sorted.length/2)],avgLosses:+(runs.reduce((a,r)=>a+r.losses,0)/runs.length).toFixed(1),avgTime:+(runs.reduce((a,r)=>a+r.time,0)/runs.length).toFixed(1),peak:Math.max(...runs.map(r=>r.peak)),largestHit:Math.max(...runs.map(r=>r.largestHit))};}
