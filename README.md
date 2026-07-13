# The Institute

A Total War-style strategy game set in the world of Pierce Brown's **Red Rising**. Twelve Gold houses fight for a terraformed valley on Mars: muster squads, march them across a 3D campaign map, and settle the outcome in real-time 3D battles. Take every standard, bind the valley into a bloc, out-trade your rivals, win the Proctors' favour, or storm Olympus itself.

**Play it:** https://red-rising-the-institute.netlify.app

> A non-commercial fan project. Red Rising and its world belong to Pierce Brown. See `NOTICE.md`.

## What it is

A single self-contained HTML file. No build step to play, no server, no accounts. Open it and the whole game runs in the browser on Three.js.

## Features

- **3D campaign map** with roads, pathfinding, zones of control and fog of war with memory.
- **Total War-style movement:** march an army into an enemy and the battle fires there and then; win with movement to spare and press on, lose and get thrown back.
- **Real-time 3D battles** on heightmapped terrain: morale and routing, charges, bracing, anti-cavalry pikes, high ground, flank and rear attacks, formation facing, active commands (Brace, War Cry, Volley).
- **Deep diplomacy:** fourteen actions, hidden personalities, trust and memory, coalitions, oaths, vassals, marriage, hostages, tribute and an intel market. Allies with a host next door join your battles.
- **Five victory paths:** military conquest, hegemony bloc, prestige, economic dominance, Proctor favour.
- **A narrative meta-campaign** ("The Passage"), a character creator, a chronicle, weather, events and a coaching tutorial.

## Repository layout

```
index.html            The game. One file, art loaded from /assets.
assets/                External art (battle terrains, textures, horizons) + manifest.
docs/                  Design and engineering documents (audit, roadmaps).
test/smoke.mjs         Headless smoke test: parses the game, checks asset links.
.github/workflows/     Continuous integration.
CHANGELOG.md           What changed, per release.
```

## Develop

The game is one file, so "development" is editing `index.html` and refreshing. To serve it locally with the assets:

```bash
npx serve .            # or: python3 -m http.server
```

### Smoke test

Runs in CI on every push and pull request, and you can run it yourself:

```bash
node test/smoke.mjs
```

It extracts the game script and syntax-checks it, then confirms every `assets/...` reference in `index.html` resolves to a real file. Green means the build will at least load.

## Deploying

`main` is deployed automatically to Netlify. Push to `main` and the live site updates. Pull requests get their own preview URL, so a change is playtested before it ships.

## Roadmap

See `docs/`:

- `THE_INSTITUTE_AUDIT.html` — full systems audit and Total War scorecard.
- `THE_ACADEMY.html` — design map for the sequel (void / fleet warfare).
- `UNIT_MODELS_ROADMAP.html` — path from billboards to animated 3D units.

## Credits

Built by Rhys Morris / CastleTRM. World, names and story by Pierce Brown. British English throughout.
