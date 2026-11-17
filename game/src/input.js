// Keyboard + mouse input for Photon Drift. WASD/arrows move, mouse aims,
// left button or Space fires, Shift or right button dashes, Enter restarts.

import { WORLD } from './state.js';
import { freshRun } from './update.js';

export function attachInput(canvas, state, audio) {
  canvas.tabIndex = 0;
  const map = {
    w: 'up', arrowup: 'up', s: 'down', arrowdown: 'down',
    a: 'left', arrowleft: 'left', d: 'right', arrowright: 'right',
    ' ': 'fire', shift: 'dash',
  };

  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (map[k]) { state.keys.add(map[k]); e.preventDefault(); }
    if (state.scene !== 'play' && (k === 'enter' || k === ' ')) {
      if (k === 'enter') startGame(state, audio);
    }
  });
  window.addEventListener('keyup', (e) => {
    const k = e.key.toLowerCase();
    if (map[k]) state.keys.delete(map[k]);
  });

  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    state.mouse.x = (e.clientX - r.left) * (WORLD.w / r.width);
    state.mouse.y = (e.clientY - r.top) * (WORLD.h / r.height);
  });
  canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (state.scene === 'title') { startGame(state, audio); return; }
    if (state.scene === 'gameover') { startGame(state, audio); return; }
    if (e.button === 0) state.mouse.down = true;
    if (e.button === 2) state.keys.add('dash');
  });
  window.addEventListener('mouseup', () => { state.mouse.down = false; });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
}

export function startGame(state, audio) {
  Object.assign(state, freshRun(state));
  state.scene = 'play';
  audio.resume();
  audio.blip(660, 0.08, 'square', 0.05);
}
