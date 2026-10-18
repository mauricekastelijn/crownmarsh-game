# Crownmarch — Rise of the Warband

**[Play Crownmarch](https://mauricekastelijn.github.io/crownmarsh-game/)** · [Repository](https://github.com/mauricekastelijn/crownmarsh-game)

An original colorful medieval fantasy army game for mobile browsers and desktop. Lead a marching warband, choose recruitment or treasure routes, bring down six sovereigns, and rebuild Havenhold. No ads, purchases, energy or waiting timers.

## Controls

- **Mobile:** drag horizontally anywhere on the battlefield to steer. Troops advance and shoot automatically. Tap the four large ability buttons; tap pause to stop the simulation.
- **Desktop:** mouse drag, **A/D** or **←/→** to steer. **1** volley, **2** shield wall, **3** charge, **4** dawn strike. **P / Escape** pauses/resumes.
- Walk through a gate to apply its displayed operation. Green gates grow the army; red gates subtract. Shoot wooden recruitment targets or weapon crates; their drops travel to your army. Treasure awards gold when crossed.
- Stay clear of red attack markings. A boss's glowing golden weak point takes extra damage when your army lines up with it. Use abilities together, then save a shield for a strike you cannot avoid.

## Campaign and progression

Twelve stages across the Green Frontier, Ruined Kingdom, Haunted Forest, Frozen Pass, Volcanic Fortress and Imperial Stronghold. New chapters introduce shield resistance, ambushes, flyers, ice lanes, cavalry and siege bombardment. Troops have articulated procedural rigs, recognizable bows, swords, shields, horses, helmets and banners. Enemies approach in lines, wedges and staggered formations. Arrows, reward drops, debris, impacts and marked attacks remain visible.

Six three-phase bosses: **Brambleback**, **The Hollow Regent**, **Morrowwing**, **Skarn the Pale**, **Cindermaw** and **Emperor Veyr**. Each has its own attacks, armor or weak-point timing and a distinctive procedural assembly (club, royal shield and blade, wings, frost crystals, dragon snout/tail, imperial crown).

Havenhold has five instant, ten-level upgrades:

| Building | Benefit per level |
|---|---|
| Barracks | +3 starting troops; +1 recruitment bonus |
| Forge | +12% damage; +4% attack speed |
| Academy | −6% ability cooldown (40% floor); +10% ability damage |
| Treasury | +15% earned gold |
| Fortress | −6% incoming damage (40% floor) |

Four heroes: **Rowan** starts with five extra troops and has a stronger charge; **Lyra** recharges volleys 30% faster; **Sol** doubles Dawn Strike damage; **Astrid** resists 25% damage and fields cavalry. Unlock Lyra after stage 3, Sol after stage 6 and Astrid after stage 9. Hero experience adds 2.5% base weapon strength per level, capped at 25%.

Gold and hero experience are earned even on defeat. Battle settlement is applied once. Campaign unlocks, upgrades, hero selection, graphics/audio/motion settings and best scores are saved to this origin's local storage. Private browsing or clearing browser data may remove saves. The main-branch redirect and Actions deployment both use `/dist/`, retaining the same storage origin.

**Endless:** continuously march through realms with harder bosses and carry your army forward. **Boss rush:** all six bosses, recovering 15 troops between wins. **Daily:** fixed UTC date seed, normalized Rowan and zero kingdom upgrades for fair repeatable runs; local best score. No server, online rankings or accounts.

## Mobile and compatibility

Portrait and landscape layouts, safe-area padding, large touch controls, no scrolling during play, visibility-change auto-pause, and concise battle onboarding. Original synthesized soundtrack and effects begin only after a user gesture. Settings include sound, reduced camera motion and adaptive/high/battery-saver quality.

Three.js is bundled locally; there are no CDN or font dependencies. Articulated troops and scenery use instanced geometry/material batches. Effects have bounded live counts and a reusable object pool. Adaptive graphics reduce resolution, shadows and visible troop instances on slower devices. A full **Canvas compatibility renderer** automatically starts when WebGL cannot initialize; Settings can select it manually. WebGL context loss pauses the game and offers the recovered compatibility view. Add `?compat=1` to `/dist/` to force compatibility mode.

The Canvas renderer preserves the campaign and simulation but simplifies 3D visuals. Browser automation cannot establish thermal stability or frame rate on physical phones: test on your target device. No physical iOS or Android hardware has been tested in this environment.

## Local development

Requires Node.js 22+ for checks/tests/build. No npm installation needed.

```sh
npm run check
npm test
npm run build
# Serve the repository root with any static HTTP server, for example:
python3 -m http.server 8080
# Open http://localhost:8080/ (redirects to /dist/)
```

`dist/engine.js` is the pure deterministic simulation; `visuals.js` is the instanced Three.js renderer; `software.js` is the Canvas fallback; `game.js` owns UI/input/audio and persistence. Tests cover arithmetic gates, lane selection, recruitment, damage, hazards, obstacles, rewards, upgrades, saving, all 12 stage completions, boss armor/phases/patterns, heroes, boss rush, endless and daily determinism.

## GitHub Pages deployment

`.github/workflows/deploy.yml` validates all modules, runs tests, builds `_site/`, uploads the Pages artifact and deploys on a push to `main`. Pull requests validate/build without publishing.

In **Settings → Pages → Build and deployment**, choose **GitHub Actions**. The workflow also supports manual dispatch. GitHub repository administration permission is required to enable Pages; the connected app needs Contents and Workflows write permission to upload source/workflows.

If Pages is already set to **Deploy from a branch → main → /(root)**, the checked-in root `index.html` redirects directly to the checked-in game in `dist/`. It never opens the README as the game page. Keep `.nojekyll` at the root. The same relative paths work beneath the repository subdirectory.

## Assets and licenses

See [CREDITS.md](CREDITS.md) and [LICENSE](LICENSE). Three.js **0.186.1**, MIT, is reused from Dreadmarch's bundled dependency, with its upstream license retained in `dist/vendor/THREE-LICENSE.txt`. The separate engine/render/fallback structure and static deployment approach were informed by Dreadmarch. No Dreadmarch character models or third-party game assets were copied.

All Crownmarch soldier rigs, monsters, scenery, castle, weapons, interface, icon, particle effects, music and sound effects are procedurally authored for this game. Original work is released under MIT. Top Lords is a gameplay reference only; its branding, characters, assets and audio are not included.

## Verification status

21 automated behavior and scene tests pass, including a seeded steering/ability simulation that completes every stage with no purchased upgrades. Syntax validation and release build pass. The published GitHub Pages game was opened in Chrome and its root redirect, compatibility battle, ability cooldown, pause, kingdom purchase, affordability and persistence across reload were verified. The responsive harness at `dist/verify.html` was used to inspect 390×844 portrait and 844×390 landscape layouts: neither had horizontal overflow, and ability targets measured 82.75×76 and 75.75×57 CSS pixels respectively. This cloud browser explicitly disables WebGL, so actual 3D rasterization, visual quality on GPU hardware and physical-phone performance remain unverified. Scene tests assemble every realm/boss and check finite transforms, bounded instancing and effect pooling without a GPU. The managed local preview service also could not start because its container could not mount `/proc`. Passing simulation and scene tests does not imply measured mobile performance. Both the validation/deployment workflow and branch-based Pages build passed.
