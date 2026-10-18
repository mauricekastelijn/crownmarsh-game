# Crownmarch balance model — v1.2

Standard campaign benchmark: 576 deterministic runs; 12 stages × four controllers × 12 seeds, fixed 1/30-second simulation steps. Baseline pinned to v1.1 commit `c7a0be1d6c1e08356ae7c20591cff9d775745a05`. These are synthetic controller success rates, **not measured human win rates**.

## What changed

- Keep 8.8-unit/s marching, rapid 7–20-projectile volleys and big enemies with health bars.
- Separate visual density from danger: each level has explicit troop health, elite health/frequency/cap, damage, warning duration, wave interval and boss reinforcement budgets.
- First recruitment arrives earlier; the first two choices always offer +10 troops. Later +/× choices follow their own sequence rather than changing unpredictably with wave count.
- Limit concurrent elites to one early, two in the middle and three late. Cavalry is introduced in small groups rather than immediately replacing most of a wave.
- Generated enemy attacks allow 1.4–1.65 seconds of warning on Standard. Simultaneous enemy hits share a half-second damage budget, before shields/armor. Gate penalties remain explicit and are not capped.
- A fixed hero contribution reduces the damage → lost troops → lost firepower → more damage spiral. Large armies still deal more damage.
- Standard is the default. Relaxed lowers health/damage and gives more reaction time; Veteran raises pressure. Chosen difficulty is fixed at battle start; daily challenges always use Standard. No hidden performance adaptation.

## Reproducible controllers

| Controller | Decisions | Steering errors | Ability use |
|---|---|---|---|
| Passive control | No steering | None | None |
| Learner | Every 0.65 s | 25% chance to lose attention to an approaching gate per decision; aim noise ±0.325 units | At most one check every 2.8 s; Volley and Shield only |
| Regular | Every 0.36 s | 10% gate attention lapse per decision; aim noise ±0.14 units | One ability check every 0.8 s; Volley, Shield and Dawn Strike |
| Expert | Every 0.18 s | No gate lapses; aim noise ±0.04 units | One ability check every 0.28 s, all abilities |

Controllers score safe lanes against visible warnings and nearby enemies. Their consistency exceeds many human players; passing this benchmark does not replace phone playtesting. The learner has deliberately limited ability use; the passive control should lose outside the introductory realm.

## Results

| Stage | Learner v1.1 | Learner v1.2 | Regular v1.2 | Passive v1.2 | Regular median survivors |
|---|---:|---:|---:|---:|---:|
| 1 | 50% | 100% | 100% | 100% | 42 |
| 2 | 33% | 100% | 100% | 100% | 58 |
| 3 | 8% | 100% | 100% | 0% | 73 |
| 4 | 0% | 100% | 100% | 0% | 51 |
| 5 | 0% | 100% | 100% | 0% | 50 |
| 6 | 0% | 92% | 100% | 0% | 56 |
| 7 | 0% | 75% | 100% | 0% | 61 |
| 8 | 0% | 83% | 100% | 0% | 52 |
| 9 | 0% | 100% | 100% | 0% | 88 |
| 10 | 0% | 92% | 100% | 0% | 78 |
| 11 | 0% | 75% | 100% | 0% | 71 |
| 12 | 0% | 67% | 100% | 0% | 77 |

## Encounter budgets

| Stage | Wave interval (s) | Troops/wave | Troop HP scale | Elite HP scale | Elite cadence/cap | Damage scale | Burst cap per 0.5 s | Warning (s) |
|---|---:|---:|---:|---:|---|---:|---:|---:|
| 1 | 2.1 | 9 | 0.88 | 0.564 | every 3 waves / 1 alive | 0.718 | 3.35 | 1.65 |
| 2 | 2.1 | 9 | 0.88 | 0.588 | every 3 waves / 1 alive | 0.729 | 3.55 | 1.65 |
| 3 | 2.05 | 9 | 0.995 | 0.689 | every 3 waves / 1 alive | 0.813 | 3.95 | 1.6 |
| 4 | 2.05 | 10 | 1.008 | 0.716 | every 3 waves / 1 alive | 0.825 | 4.05 | 1.6 |
| 5 | 2 | 10 | 1.034 | 0.755 | every 2 waves / 2 alive | 0.86 | 4.25 | 1.55 |
| 6 | 2 | 10 | 1.047 | 0.782 | every 2 waves / 2 alive | 0.872 | 4.35 | 1.55 |
| 7 | 1.95 | 11 | 1.06 | 0.822 | every 2 waves / 2 alive | 0.908 | 4.45 | 1.5 |
| 8 | 1.95 | 11 | 1.073 | 0.848 | every 2 waves / 2 alive | 0.92 | 4.55 | 1.5 |
| 9 | 1.9 | 11 | 1.086 | 0.888 | every 2 waves / 2 alive | 0.956 | 4.65 | 1.45 |
| 10 | 1.9 | 12 | 1.099 | 0.914 | every 2 waves / 2 alive | 0.968 | 4.75 | 1.45 |
| 11 | 1.85 | 12 | 1.112 | 0.954 | every 2 waves / 3 alive | 1.004 | 4.85 | 1.4 |
| 12 | 1.85 | 12 | 1.124 | 0.98 | every 2 waves / 3 alive | 1.016 | 4.95 | 1.4 |

## Progression assumptions

All stages use Rowan. Start with no upgrades; after each chapter buy one building upgrade in this order: barracks → forge → fortress → academy → barracks → forge → treasury → fortress → academy → barracks → forge. These purchases are affordable using only initial gold plus guaranteed victory bonuses, ignoring all kill, treasure and Treasury income. The final test loadout has Barracks 3, Forge 3, Fortress 2, Academy 2 and Treasury 1; no four-level jump is assumed. Experience is conservatively modeled at 70 per cleared chapter.

## Run and tune

Run `npm run balance` to regenerate this report and `scripts/balance/current.json`. Run `npm run balance:check` for the same deterministic checks without rewriting files. GitHub Actions runs this check before deploying.

Edit `dist/balance.js` to tune one threat dimension at a time. Keep the seeds, controller profiles and loadout fixed for before/after comparisons. Inspect deaths, survivors, losses and live-opponent peaks as well as success rate. Current regression envelopes: learner ≥75% in stages 1–6 and ≥50% later; regular ≥90%; passive ≤25% from stage 3 onward; no adjacent learner drop greater than 35 percentage points. Review results on actual phones before tightening the envelopes.

The full raw baseline and current runs are stored alongside the harness for auditability. Settings do not upload gameplay telemetry.
