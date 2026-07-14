# 3D foot-soldiers — integration guide (for the agent editing current `index.html`)

This PR adds files only; it does **not** touch `index.html`, so it can't regress
main. Your job: wire the module below into the **current** `index.html` on main.

## What this adds
Animated, textured, house-tinted 3D Spartan models for **foot units only**
(pike, blade, conscript, captain, howler, vanguard, champion). Cavalry, archers,
mounted archers and the onager are untouched and keep their current look.
Mobile and any load/runtime error fall back automatically to the existing
billboard/box figures (every path is guarded).

## Files in this PR (add-only; they sit at the branch root of this PR)
- `spartan-lite.glb` — the model: 4 baked clips (`idle`, `march`, `attack`,
  `death`), weapons attached, textures applied, ~1.5 MB.
  **MOVE it to `assets/models/spartan-lite.glb`** during integration (that path
  is what the module loads). It must be committed there or the smoke test/CI will
  flag a missing asset.
- `institute-3d-module.js` — the exact module to paste inline.
- `CREDITS-3d.md` — licence attribution to fold into the root `CREDITS.md`
  (Fab Standard Licence → keep repo private).

## Prerequisites (verify on current main before wiring)
The module reuses the existing ground-battle billboard integration. Confirm these
exist in current `index.html` (they were merged in the billboard/tinting commits):
- Globals: `HOUSES` (each house has `.color`; plus a `HOUSES.neutral`), `B`
  (battle state with `.t`), `B3` (with `B3.unitGrp`), and the `b3H(x,y)` height fn.
- The billboard per-unit record `rec` has `rec.inst` and (optionally) `rec.spr`,
  and each unit `u` has `u.offs[]`, `u.hid`, `u.type`, `u.x`, `u.y`, `u.face`,
  `u.rout`, `u.mv`, `u.lastHit`, `u.u.siege`.
If any of those names have changed on main, adjust the module to match — the
logic is unchanged, only the identifiers.

## Four edits to `index.html`

### 1. Add two loader scripts (right AFTER the existing three.js include)
The game already loads three.js r128. Immediately after that `<script>` line add:
```html
<script src="https://unpkg.com/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
<script src="https://unpkg.com/three@0.128.0/examples/js/utils/SkeletonUtils.js"></script>
```
(Must match the three.js version already in use — r128 / 0.128.0.)

### 2. Paste the module
Paste all of `institute-3d-module.js` inline, inside the main game
`<script>`, just **above** the `b3Frame` / `b3SetupBattle` definitions. It must
share scope with the battle code (it reads `HOUSES`, `B`, `B3`, `b3H`).

### 3. Hook the per-frame animation tick
Find the start of the battle frame function and add the tick as the first thing:
```js
function b3Frame(){if(window.INSTITUTE_3D)INSTITUTE_3D.tick();
 if(!B3.ready)return;
 ...
```

### 4. Hook clearing on battle setup
In `b3SetupBattle` where the battle groups are cleared, append the clear call to
that same line:
```js
b3ClearGroup(B3.decoGrp);b3ClearGroup(B3.wallGrp);b3ClearGroup(B3.unitGrp);if(window.INSTITUTE_3D)INSTITUTE_3D.clearAll();
```

### 5. Hook the render call (in the unit draw loop, per unit)
Right after the billboard code sets `rec.inst.count=show;
rec.inst.instanceMatrix.needsUpdate=true;`, insert the 3D attempt and gate the
existing billboard draw behind its result:
```js
  rec.inst.count=show;
  rec.inst.instanceMatrix.needsUpdate=true;
  var _h3=false;
  if(window.INSTITUTE_3D&&INSTITUTE_3D.enabled&&INSTITUTE_3D.ready&&u.u&&!u.u.siege&&INSTITUTE_3D.isFoot(u.type)){_h3=INSTITUTE_3D.renderUnit(rec,u,show,sinF,cosF);}
  if(!_h3&&window.INSTITUTE_TROOPS&&INSTITUTE_TROOPS.enabled&&u.u&&!u.u.siege){
   // ...existing billboard draw stays here, now guarded by !_h3...
```
The `sinF`/`cosF` are the formation-facing sin/cos already in that loop; pass
whatever the current code calls them.

## Performance cap
At most `PERUNIT` (6) animated models per squad and `FIELD` (36) skinned models
on the field. Squads beyond that fall back to billboards. Raise once smooth.

## Tuning after it renders (browser console, live)
- Size: `INSTITUTE_3D.cfg({scale: 6})`  (try 5–9; default 7)
- Facing: `INSTITUTE_3D.cfg({yaw: 3.14})` (half turn) or `{yaw: 1.57}`
- Crowd: `INSTITUTE_3D.cfg({per: 10, field: 60})`
- Compare on/off: `INSTITUTE_3D.enabled = false`
Bake the values that look right into the module defaults (`SCALE`, `PERUNIT`,
`FIELD`, `YAW`).

## Notes
- House tint recolours the material whose name contains `Armor7` (the cloak) to
  the house colour; the rest of the armour stays as textured. If tinting hits the
  wrong material on the shipped GLB, change the `"Armor7"` string.
- Test on a Netlify PR preview, not `file://` — the browser won't load the `.glb`
  locally.
- One model covers foot units; cavalry, archers and the onager still need their
  own models later.
