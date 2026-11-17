# Photon Drift

Original neon arcade survival shooter built for the make.fun **best-game-01** bounty.

- **Aim & fire** with the mouse (hold left button), move with **WASD / arrows**
- **SHIFT / right-click** to dash — dashing phases you through foes
- Chain kills for combo multipliers, grab cyan **CORES** for +250 points and an extra life
- Waves escalate every 12 seconds; 3 lives, score, best score, game over + restart

Fully offline: plain static files under `game/`, canvas 2D rendering, all art and
sound generated in code (WebAudio synthesis). No libraries, no network requests.

## Run

Serve the game folder with any static server:

```
node serve.ts        # http://localhost:8080
```

## Build the entry

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Layout

- `game/` — the game (index.html + ES modules in `game/src/`)
- `screenshots/` — real browser captures (start, play, end)
- `main.ts` — Node 22 entrypoint that writes `/output` + `dossier.json`
- `vendor/makefun-game.ts` — kit's dossier library, unchanged
