// Headless smoke test for The Institute.
// 1. Extracts the game's inline script and syntax-checks it with `node --check`.
// 2. Confirms every asset referenced in index.html resolves to a real file.
// Exits non-zero on any failure, so CI blocks a broken build.

import { readFileSync, writeFileSync, existsSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = process.cwd();
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
let failed = false;
const fail = (m) => { console.error('  x ' + m); failed = true; };
const ok = (m) => console.log('  + ' + m);

// --- 1. syntax check the largest inline <script> (the game engine) ---
const scripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)]
  .filter((m) => !/\bsrc\s*=/.test(m[1])) // skip external <script src=...> tags by their ATTRIBUTES
  .map((m) => m[2]);
const game = scripts.sort((a, b) => b.length - a.length)[0] || '';
if (game.length < 1000) {
  fail('could not find the game script in index.html');
} else {
  const dir = mkdtempSync(join(tmpdir(), 'institute-'));
  const jsPath = join(dir, 'game.js');
  writeFileSync(jsPath, game);
  try {
    execFileSync(process.execPath, ['--check', jsPath], { stdio: 'pipe' });
    ok(`game script parses (${(game.length / 1024).toFixed(0)} KB)`);
  } catch (e) {
    fail('syntax error in game script:\n' + (e.stderr?.toString() || e.message));
  }
}

// --- 2. asset references resolve ---
const refs = [...new Set(
  [...html.matchAll(/assets\/([A-Za-z0-9_./-]+\.(?:webp|png|jpg|json|glb|gltf|ktx2))/g)].map((m) => m[1])
)];
const missing = refs.filter((r) => !existsSync(join(ROOT, 'assets', r)));
if (missing.length) fail('missing assets: ' + missing.join(', '));
else ok(`all ${refs.length} asset references resolve`);

console.log(failed ? '\nSMOKE TEST FAILED' : '\nSMOKE TEST PASSED');
process.exit(failed ? 1 : 0);
