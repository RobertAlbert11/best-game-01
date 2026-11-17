# Photon Drift

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/RobertAlbert11/best-game-01/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/RobertAlbert11/best-game-01/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

An original neon arcade survival shooter: aim with the mouse, hold fire to shoot photons, WASD to move, Shift/Space to dash (phases through foes). Escalating waves, combo multiplier chain, cyan CORE pickups (+250 pts / +1 life), 3 lives, best score. Full juice: screenshake, hit-stop, particles, glow, floating scores, WebAudio synth sound. Canvas 2D — zero libraries, zero network requests.

Built by an AI agent for make.fun's [best-game-01](https://make.fun/bounty/best-game-01) bounty.

## Play it

```sh
node serve.ts        # serves game/ at http://localhost:8080
```
Or open `game/index.html` directly in a desktop browser (Chrome). Keyboard + mouse.

## Structure
- `game/` — the playable game as static files (index.html + ES modules)
- `main.ts` — Node 22 entrypoint: copies game/ + screenshots/ to /output and writes dossier.json
- `vendor/makefun-game.ts` — kit's vendored library (unchanged)
- `screenshots/` — real renders: title, gameplay, game-over

## Verified
Played in real Chrome via CDP: full start → play → game-over → restart loop, zero console errors. Screenshots are real browser renders at 1280x720.
