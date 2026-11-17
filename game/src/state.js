// Game state factory and constants for Photon Drift.

export const WORLD = { w: 1280, h: 720 };
export const PLAYER = { r: 14, speed: 340, dashSpeed: 1100, dashTime: 0.13, dashCooldown: 1.1, fireRate: 0.13 };

export function createState(canvas) {
  return {
    scene: 'title',            // title | play | gameover
    time: 0,
    score: 0,
    best: 0,
    combo: 0,
    comboTimer: 0,
    wave: 1,
    waveTimer: 0,
    lives: 3,
    invuln: 0,
    player: { x: WORLD.w / 2, y: WORLD.h / 2, vx: 0, vy: 0, aim: -Math.PI / 2 },
    dash: { active: false, t: 0, cd: 0, dir: { x: 1, y: 0 } },
    keys: new Set(),
    mouse: { x: WORLD.w / 2, y: WORLD.h / 2, down: false },
    bullets: [],               // player photons
    shards: [],                // enemy bullets
    foes: [],                  // enemies
    pops: [],                  // particle bursts
    floats: [],                // floating score texts
    shake: 0,
    flash: 0,
    fireCd: 0,
    spawnCd: 1,
    pickup: null,              // a rare core worth big points
    hitStop: 0,
  };
}
