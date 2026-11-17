// best-game-01 — Block Dodger
//
// This script packages the entry for the make.fun grader. The game itself is
// everything under game/ — static HTML + ES modules, no dependencies, runs
// offline in a desktop browser (block-dodging paddle, coins, lives, levels).
//
// What this does:
//   1. resolves the output directory (MAKEFUN_OUTPUT_DIR locally, /output in
//      the grader's container)
//   2. copies game/ and screenshots/ into it
//   3. writes dossier.json via the vendored makefun helper, enforcing the
//      scorer's published caps along the way
//
// Try it:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Play it: node serve.ts  →  http://localhost:8080

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// Where the grader collects its files. Locally we just point it at ./out.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outputDir, { recursive: true });

// Ship the playable game and its screenshots. screenshots/ may not exist yet
// (empty template), so only copy it when present.
cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
const shotsDir = join(repoRoot, 'screenshots');
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
}

// Limits straight from the scorer's reference/gate.json. Only text_max_bytes
// actually shapes dossier.json's size — the rest mirror checks the grader
// would run anyway, so an entry that trips one of them fails early here
// rather than at submission: at most 4 screenshots, each ≤ 256 KiB; game/
// ≤ 993 files, ≤ 48 MiB total, no path longer than 1000 bytes.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
