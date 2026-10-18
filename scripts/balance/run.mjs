import {readFile,writeFile} from 'node:fs/promises';
import {simulate,summarize,PROFILES,UPGRADE_ORDER} from './simulate.mjs';
import {LEVEL_BALANCE} from '../../dist/balance.js';
const checking=process.argv.includes('--check'),seeds=12;
const baseline=JSON.parse(await readFile(new URL('./baseline-v1.1.json',import.meta.url),'utf8'));
const runs=[];
for(let stage=0;stage<12;stage++)for(const profile of Object.keys(PROFILES))for(let seed=1;seed<=seeds;seed++)runs.push(simulate({stage,profile,seed}));
const summary=(data,stage,profile)=>summarize(data.filter(r=>r.stage===stage&&r.profile===profile));
const stages=LEVEL_BALANCE.map((budget,i)=>({stage:i+1,budget,profiles:Object.fromEntries(Object.keys(PROFILES).map(p=>[p,summary(runs,i+1,p)])),before:Object.fromEntries(Object.keys(PROFILES).map(p=>[p,summary(baseline.runs,i+1,p)]))}));
const failures=[];
for(const s of stages){const minLearner=s.stage<=6?75:50;if(s.profiles.learner.winRate<minLearner)failures.push(`Stage ${s.stage}: learner below ${minLearner}%`);if(s.profiles.regular.winRate<90)failures.push(`Stage ${s.stage}: regular below 90%`);if(s.stage>=3&&s.profiles.idle.winRate>25)failures.push(`Stage ${s.stage}: passive control too successful`);if(s.profiles.regular.peak>60)failures.push(`Stage ${s.stage}: live opponent budget exceeded`);if(s.stage>1&&stages[s.stage-2].profiles.learner.winRate-s.profiles.learner.winRate>35)failures.push(`Stage ${s.stage}: learner difficulty cliff`);}
console.table(stages.map(s=>({stage:s.stage,'learner v1.1':s.before.learner.winRate+'%','learner now':s.profiles.learner.winRate+'%','regular now':s.profiles.regular.winRate+'%','passive now':s.profiles.idle.winRate+'%',survivors:s.profiles.regular.medianArmy})));
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
if(!checking){
 const lines=['# Crownmarch balance model — v1.2','',`Standard campaign benchmark: ${runs.length} deterministic runs; 12 stages × four controllers × ${seeds} seeds, fixed 1/30-second simulation steps. Baseline pinned to v1.1 commit \`${baseline.commit}\`. These are synthetic controller success rates, **not measured human win rates**.`,'',
 '## What changed','',
 '- Keep 8.8-unit/s marching, rapid 7–20-projectile volleys and big enemies with health bars.',
 '- Separate visual density from danger: each level has explicit troop health, elite health/frequency/cap, damage, warning duration, wave interval and boss reinforcement budgets.',
 '- First recruitment arrives earlier; the first two choices always offer +10 troops. Later +/× choices follow their own sequence rather than changing unpredictably with wave count.',
 '- Limit concurrent elites to one early, two in the middle and three late. Cavalry is introduced in small groups rather than immediately replacing most of a wave.',
 '- Generated enemy attacks allow 1.4–1.65 seconds of warning on Standard. Simultaneous enemy hits share a half-second damage budget, before shields/armor. Gate penalties remain explicit and are not capped.',
 '- A fixed hero contribution reduces the damage → lost troops → lost firepower → more damage spiral. Large armies still deal more damage.',
 '- Standard is the default. Relaxed lowers health/damage and gives more reaction time; Veteran raises pressure. Chosen difficulty is fixed at battle start; daily challenges always use Standard. No hidden performance adaptation.',
 '', '## Reproducible controllers','',
 '| Controller | Decisions | Steering errors | Ability use |','|---|---|---|---|',
 '| Passive control | No steering | None | None |',
 '| Learner | Every 0.65 s | 25% chance to lose attention to an approaching gate per decision; aim noise ±0.325 units | At most one check every 2.8 s; Volley and Shield only |',
 '| Regular | Every 0.36 s | 10% gate attention lapse per decision; aim noise ±0.14 units | One ability check every 0.8 s; Volley, Shield and Dawn Strike |',
 '| Expert | Every 0.18 s | No gate lapses; aim noise ±0.04 units | One ability check every 0.28 s, all abilities |',
 '', 'Controllers score safe lanes against visible warnings and nearby enemies. Their consistency exceeds many human players; passing this benchmark does not replace phone playtesting. The learner has deliberately limited ability use; the passive control should lose outside the introductory realm.',
 '', '## Results','', '| Stage | Learner v1.1 | Learner v1.2 | Regular v1.2 | Passive v1.2 | Regular median survivors |','|---|---:|---:|---:|---:|---:|',
 ...stages.map(s=>`| ${s.stage} | ${s.before.learner.winRate}% | ${s.profiles.learner.winRate}% | ${s.profiles.regular.winRate}% | ${s.profiles.idle.winRate}% | ${s.profiles.regular.medianArmy} |`),
 '', '## Encounter budgets','', '| Stage | Wave interval (s) | Troops/wave | Troop HP scale | Elite HP scale | Elite cadence/cap | Damage scale | Burst cap per 0.5 s | Warning (s) |','|---|---:|---:|---:|---:|---|---:|---:|---:|',
 ...stages.map(s=>{const b=s.budget;return `| ${s.stage} | ${b.waveInterval} | ${b.troops} | ${b.troopHp} | ${b.eliteHp} | every ${b.eliteEvery} waves / ${b.eliteCap} alive | ${b.incoming} | ${b.burstCap} | ${b.warning} |`;}),
 '', '## Progression assumptions','',
 'All stages use Rowan. Start with no upgrades; after each chapter buy one building upgrade in this order: '+UPGRADE_ORDER.join(' → ')+'. These purchases are affordable using only initial gold plus guaranteed victory bonuses, ignoring all kill, treasure and Treasury income. The final test loadout has Barracks 3, Forge 3, Fortress 2, Academy 2 and Treasury 1; no four-level jump is assumed. Experience is conservatively modeled at 70 per cleared chapter.',
 '', '## Run and tune','',
 'Run `npm run balance` to regenerate this report and `scripts/balance/current.json`. Run `npm run balance:check` for the same deterministic checks without rewriting files. GitHub Actions runs this check before deploying.',
 '', 'Edit `dist/balance.js` to tune one threat dimension at a time. Keep the seeds, controller profiles and loadout fixed for before/after comparisons. Inspect deaths, survivors, losses and live-opponent peaks as well as success rate. Current regression envelopes: learner ≥75% in stages 1–6 and ≥50% later; regular ≥90%; passive ≤25% from stage 3 onward; no adjacent learner drop greater than 35 percentage points. Review results on actual phones before tightening the envelopes.',
 '', 'The full raw baseline and current runs are stored alongside the harness for auditability. Settings do not upload gameplay telemetry.', ''];
 await writeFile('BALANCE.md',lines.join('\n'));
 await writeFile('scripts/balance/current.json',JSON.stringify({version:'1.2',seeds,step:1/30,stages,runs}));
}
console.log(`${runs.length} simulations; ${failures.length?failures.length+' balance regressions':'all balance envelopes pass'}.`);
