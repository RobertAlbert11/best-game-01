// Simulation step for Photon Drift: player movement, dashing, firing,
// waves of foes, collisions, combos, particles and score.

import { WORLD, PLAYER } from './state.js';
import { stepEffects } from './effects.js';

export function freshRun(prev) {
  return {
    time: 0, score: 0, combo: 0, comboTimer: 0, wave: 1, waveTimer: 0,
    lives: 3, invuln: 1.2,
    player: { x: WORLD.w / 2, y: WORLD.h / 2, vx: 0, vy: 0, aim: -Math.PI / 2 },
    dash: { active: false, t: 0, cd: 0, dir: { x: 1, y: 0 } },
    bullets: [], shards: [], foes: [], pops: [], floats: [],
    shake: 0, flash: 0, fireCd: 0, spawnCd: 0.8, pickup: null, hitStop: 0,
    best: prev.best,
  };
}

export function stepGame(s, dt, canvas, audio) {
  if (s.hitStop > 0) { s.hitStop -= dt; return s; }
  if (s.scene !== 'play') { stepAmbient(s, dt); stepEffects(s, dt); return s; }

  s.time += dt;
  stepPlayer(s, dt);
  stepFiring(s, dt, audio);
  stepWaves(s, dt, audio);
  stepBodies(s, dt, audio);
  stepEffects(s, dt);
  if (s.lives <= 0) endRun(s, audio);
  return s;
}

function stepAmbient(s, dt) {
  // Title/gameover screens keep drifting particles alive.
  for (const p of s.pops) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
  s.pops = s.pops.filter((p) => p.life > 0);
  s.shake = Math.max(0, s.shake - dt * 4);
  s.flash = Math.max(0, s.flash - dt * 3);
  if (s.scene === 'title' && Math.random() < 0.3) {
    s.pops.push({ x: Math.random() * WORLD.w, y: WORLD.h + 10, vx: 0, vy: -60 - Math.random() * 80, life: 4, r: 2, hue: 180 + Math.random() * 140 });
  }
}

function stepPlayer(s, dt) {
  const p = s.player;
  p.aim = Math.atan2(s.mouse.y - p.y, s.mouse.x - p.x);
  let ix = (s.keys.has('right') ? 1 : 0) - (s.keys.has('left') ? 1 : 0);
  let iy = (s.keys.has('down') ? 1 : 0) - (s.keys.has('up') ? 1 : 0);
  const len = Math.hypot(ix, iy) || 1;
  ix /= len; iy /= len;

  const d = s.dash;
  d.cd = Math.max(0, d.cd - dt);
  if (s.keys.has('dash') && !d.active && d.cd <= 0) {
    d.active = true; d.t = PLAYER.dashTime; d.cd = PLAYER.dashCooldown;
    d.dir = ix || iy ? { x: ix, y: iy } : { x: Math.cos(p.aim), y: Math.sin(p.aim) };
    s.keys.delete('dash');
    audio.blip(220, 0.12, 'sawtooth', 0.05);
    for (let i = 0; i < 12; i++) spark(s, p.x, p.y, 170, 6);
  }
  if (d.active) {
    d.t -= dt;
    p.vx = d.dir.x * PLAYER.dashSpeed; p.vy = d.dir.y * PLAYER.dashSpeed;
    if (d.t <= 0) d.active = false;
    if (Math.random() < 0.7) spark(s, p.x, p.y, 190, 3);
  } else {
    p.vx = ix * PLAYER.speed; p.vy = iy * PLAYER.speed;
  }
  p.x = Math.max(PLAYER.r, Math.min(WORLD.w - PLAYER.r, p.x + p.vx * dt));
  p.y = Math.max(PLAYER.r, Math.min(WORLD.h - PLAYER.r, p.y + p.vy * dt));
  s.invuln = Math.max(0, s.invuln - dt);
  s.comboTimer = Math.max(0, s.comboTimer - dt);
  if (s.comboTimer <= 0) s.combo = 0;
}

function stepFiring(s, dt, audio) {
  s.fireCd -= dt;
  const firing = s.mouse.down || s.keys.has('fire');
  if (firing && s.fireCd <= 0) {
    s.fireCd = PLAYER.fireRate;
    const a = s.player.aim;
    s.bullets.push({ x: s.player.x + Math.cos(a) * 18, y: s.player.y + Math.sin(a) * 18, vx: Math.cos(a) * 760, vy: Math.sin(a) * 760, life: 1.4 });
    audio.blip(880 + Math.random() * 60, 0.05, 'square', 0.03);
    s.shake = Math.min(s.shake + 1.2, 8);
  }
}

function stepWaves(s, dt, audio) {
  s.waveTimer += dt;
  if (s.waveTimer > 12) { s.waveTimer = 0; s.wave++; audio.chord([440, 550, 660]); addFloat(s, WORLD.w / 2, 140, 'WAVE ' + s.wave, '#ffd166'); }
  s.spawnCd -= dt;
  if (s.spawnCd <= 0) {
    s.spawnCd = Math.max(0.28, 1.1 - s.wave * 0.07);
    spawnFoe(s);
    if (s.wave >= 3 && Math.random() < 0.25) spawnFoe(s, 'weaver');
    if (!s.pickup && Math.random() < 0.012) spawnPickup(s);
  }
}

function spawnFoe(s, kind = 'chaser') {
  const edge = Math.floor(Math.random() * 4);
  let x, y;
  if (edge === 0) { x = Math.random() * WORLD.w; y = -30; }
  else if (edge === 1) { x = WORLD.w + 30; y = Math.random() * WORLD.h; }
  else if (edge === 2) { x = Math.random() * WORLD.w; y = WORLD.h + 30; }
  else { x = -30; y = Math.random() * WORLD.h; }
  s.foes.push({ kind, x, y, r: kind === 'weaver' ? 11 : 15, hp: 1, hue: kind === 'weaver' ? 300 : 0, phase: Math.random() * 6, born: s.time });
}

function spawnPickup(s) {
  s.pickup = { x: 80 + Math.random() * (WORLD.w - 160), y: 80 + Math.random() * (WORLD.h - 160), t: 8 };
}

function stepBodies(s, dt, audio) {
  // Photons fly and hit foes.
  for (const b of s.bullets) { b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; }
  s.bullets = s.bullets.filter((b) => b.life > 0 && b.x > -20 && b.x < WORLD.w + 20 && b.y > -20 && b.y < WORLD.h + 20);

  for (const f of s.foes) {
    const dx = s.player.x - f.x, dy = s.player.y - f.y, dist = Math.hypot(dx, dy) || 1;
    const sp = f.kind === 'weaver' ? 210 : 95 + s.wave * 8;
    if (f.kind === 'weaver') {
      f.x += (dx / dist) * sp * dt + Math.cos(s.time * 5 + f.phase) * 130 * dt;
      f.y += (dy / dist) * sp * dt + Math.sin(s.time * 5 + f.phase) * 130 * dt;
    } else {
      f.x += (dx / dist) * sp * dt;
      f.y += (dy / dist) * sp * dt;
    }
    // Photon hit.
    for (const b of s.bullets) {
      if (Math.hypot(b.x - f.x, b.y - f.y) < f.r + 5) {
        b.life = 0; f.hp = 0;
        killFoe(s, f, audio);
        break;
      }
    }
    // Touch the player (dashing grants invulnerability).
    if (f.hp > 0 && s.invuln <= 0 && !s.dash.active && Math.hypot(f.x - s.player.x, f.y - s.player.y) < f.r + PLAYER.r) {
      hurtPlayer(s, audio);
      f.hp = 0; killFoe(s, f, audio, true);
    }
  }
  s.foes = s.foes.filter((f) => f.hp > 0);

  for (const sh of s.shards) { sh.x += sh.vx * dt; sh.y += sh.vy * dt; sh.life -= dt; }
  s.shards = s.shards.filter((sh) => sh.life > 0);

  if (s.pickup) {
    s.pickup.t -= dt;
    if (Math.hypot(s.pickup.x - s.player.x, s.pickup.y - s.player.y) < 26 + PLAYER.r) {
      s.score += 250; s.lives = Math.min(5, s.lives + 1);
      addFloat(s, s.pickup.x, s.pickup.y, '+250 CORE', '#7dffef');
      for (let i = 0; i < 24; i++) spark(s, s.pickup.x, s.pickup.y, 170, 8);
      audio.chord([523, 659, 784]);
      s.flash = 0.6;
      s.pickup = null;
    } else if (s.pickup.t <= 0) s.pickup = null;
  }
}

function killFoe(s, f, audio, silentCombo) {
  s.combo = silentCombo ? 0 : s.combo + 1;
  s.comboTimer = 2.4;
  const gain = 10 * Math.max(1, Math.min(10, s.combo));
  s.score += gain;
  addFloat(s, f.x, f.y, '+' + gain, s.combo >= 5 ? '#ffd166' : '#9df1ff');
  for (let i = 0; i < 14; i++) spark(s, f.x, f.y, f.hue, 5);
  s.shake = Math.min(s.shake + 2.5, 14);
  if (s.combo > 0 && s.combo % 10 === 0) { audio.chord([660, 830, 990]); s.flash = 0.4; }
  else audio.blip(300 + s.combo * 25, 0.07, 'triangle', 0.04);
}

function hurtPlayer(s, audio) {
  s.lives -= 1;
  s.invuln = 1.6;
  s.combo = 0;
  s.shake = 18;
  s.flash = 0.9;
  s.hitStop = 0.09;
  audio.blip(110, 0.3, 'sawtooth', 0.09);
  for (let i = 0; i < 26; i++) spark(s, s.player.x, s.player.y, 0, 9);
}

function endRun(s, audio) {
  s.scene = 'gameover';
  s.best = Math.max(s.best, s.score);
  s.shake = 22;
  s.flash = 1;
  audio.chord([196, 233, 155], 0.5);
}

function spark(s, x, y, hue, spread) {
  const a = Math.random() * Math.PI * 2, v = 60 + Math.random() * 260 * (spread / 5);
  s.pops.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.4 + Math.random() * 0.5, r: 1.5 + Math.random() * 2.5, hue: hue + Math.random() * 40 - 20 });
}

function addFloat(s, x, y, text, color) {
  s.floats.push({ x, y, text, color, life: 1 });
}
