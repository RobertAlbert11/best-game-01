// Photon Drift — original neon arcade survival shooter.
// Aims with the mouse, fires photons, dashes through the swarm,
// chains combos, survives escalating waves. All art and sound generated in code.

import { createState } from './state.js';
import { attachInput } from './input.js';
import { stepGame } from './update.js';
import { drawGame } from './render.js';
import { AudioBus } from './audio.js';
import { stepEffects } from './effects.js';
import { updateHudStatus } from './ui.js';
import { WORLD } from './state.js';

const canvas = document.getElementById('game');
canvas.width = WORLD.w;
canvas.height = WORLD.h;
const statusEl = document.getElementById('status');
const ctx = canvas.getContext('2d');

const audio = new AudioBus();
let state = createState(canvas);
attachInput(canvas, state, audio);

// Screen-reader status line, refreshed a few times a second.
setInterval(() => updateHudStatus(statusEl, state), 250);

let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  state = stepGame(state, dt, canvas, audio);
  drawGame(ctx, state, canvas);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
