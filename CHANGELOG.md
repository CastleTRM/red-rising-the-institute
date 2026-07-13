# Changelog

All notable changes to The Institute. Newest first.

## Unreleased

### Added
- **Allies fight alongside you.** Allies, blood-oaths and vassals with a host in a land bordering a battle now join your side, fight in their own colours, take their own losses and march home after.
- **Battle depth.** Distinct flank and rear attacks (rear strikes bite harder and break morale faster) and formation facing (a standing line turns its front to the nearest threat, so flanks must be earned by maneuver).
- **AI seeks high ground.** AI infantry and archers occupy a nearby rise while closing, so the elevation combat bonus is actually used. Gated so they never retreat uphill or stall on open ground.
- **Continuous deployment.** Repository connected to Netlify; every push to `main` deploys, pull requests get preview URLs.
- **Headless smoke test** (`test/smoke.mjs`) and CI workflow.
- **Documentation set** under `docs/`: systems audit + Total War scorecard, The Academy sequel design, and the 3D unit models roadmap.

### Changed
- **Movement-triggered battles (Total War rules).** Battles fire the moment an army moves onto an enemy, not at End Turn. A victorious army keeps its remaining movement and can press on; a beaten one is thrown back to where it came from and locked for the turn. Queued marches now hold at an enemy frontier instead of springing a surprise End-Turn battle.
- **Art split out of the HTML.** `index.html` dropped from 3.5 MB to ~460 KB; twenty-seven heavy art files now load at runtime from `/assets`. Big improvement to first load, especially on mobile.

### Fixed
- Turn engine no longer hangs on the AI turn (a scoped-variable reference error in the sortie planner).
- Battle map meets the mountain horizon seamlessly; battlefields sit on the same cliff-plinth as the campaign map.

## Earlier

The pre-repository history (Olympus reframe, hybrid army rendering, the full mechanics audit and critical-bug fixes, the eight battle-map integration, rally for routed units and honest march ETAs) predates version control and is summarised in `docs/THE_INSTITUTE_AUDIT.html`.
