// Rendering for Photon Drift: neon glow aesthetic, particles, trails, HUD,
// title screen and game-over screen. Canvas 2D, no assets.

import { WORLD, PLAYER } from './state.js';

export function drawGame(ctx, s, canvas) {
  const scale = Math.min(canvas.width / WORLD.w, canvas.height / WORLD.h);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#05060d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate((canvas.width - WORLD.w * scale) / 2, (canvas.height - WORLD.h * scale) / 2);
  ctx.scale(scale, scale);
  if (s.shake > 0) ctx.translate((Math.random() - 0.5) * s.shake, (Math.random() - 0.5) * s.shake);

  drawBackdrop(ctx, s);

  ctx.globalCompositeOperation = 'lighter';

  // Particles.
  for (const p of s.pops) {
    ctx.fillStyle = `hsla(${p.hue}, 100%, 65%, ${Math.min(1, p.life * 2)})`;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
  }

  if (s.scene === 'play' || s.scene === 'gameover') {
    drawBodies(ctx, s);
  }

  ctx.globalCompositeOperation = 'source-over';
  drawFloats(ctx, s);

  if (s.scene === 'title') drawTitle(ctx, s);
  if (s.scene === 'play') drawHud(ctx, s);
  if (s.scene === 'gameover') drawGameOver(ctx, s);

  ctx.restore();

  if (s.flash > 0) {
    ctx.fillStyle = `rgba(180,220,255,${s.flash * 0.25})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function drawBackdrop(ctx, s) {
  ctx.fillStyle = '#05060d';
  ctx.fillRect(0, 0, WORLD.w, WORLD.h);
  // Neon grid.
  ctx.strokeStyle = 'rgba(60,90,160,0.18)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= WORLD.w; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, WORLD.h); ctx.stroke(); }
  for (let y = 0; y <= WORLD.h; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD.w, y); ctx.stroke(); }
  // Wave pulse ring.
  const pulse = (s.waveTimer / 12) * WORLD.w;
  ctx.strokeStyle = `rgba(120,180,255,${0.08 * (1 - pulse / WORLD.w)})`;
  ctx.lineWidth = 30;
  ctx.beginPath(); ctx.arc(WORLD.w / 2, WORLD.h / 2, pulse, 0, 7); ctx.stroke();
  // Frame.
  ctx.strokeStyle = 'rgba(90,140,255,0.35)';
  ctx.lineWidth = 3;
  ctx.strokeRect(6, 6, WORLD.w - 12, WORLD.h - 12);
}

function drawBodies(ctx, s) {
  // Photons.
  ctx.lineCap = 'round';
  for (const b of s.bullets) {
    ctx.strokeStyle = 'rgba(140,220,255,0.95)';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(b.x - b.vx * 0.012, b.y - b.vy * 0.012); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
  // Foes.
  for (const f of s.foes) {
    const hue = f.kind === 'weaver' ? 300 : 0;
    ctx.fillStyle = `hsla(${hue}, 95%, 60%, 0.9)`;
    ctx.shadowColor = `hsl(${hue}, 95%, 60%)`;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    if (f.kind === 'weaver') {
      for (let i = 0; i < 3; i++) {
        const a = s.time * 3 + f.phase + i * (Math.PI * 2 / 3);
        const px = f.x + Math.cos(a) * f.r, py = f.y + Math.sin(a) * f.r;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
    } else {
      const a = s.time * 2 + f.phase;
      for (let i = 0; i < 4; i++) {
        const ang = a + i * (Math.PI / 2);
        const px = f.x + Math.cos(ang) * f.r, py = f.y + Math.sin(ang) * f.r;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
    }
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  // Core pickup.
  if (s.pickup) {
    const t = s.pickup.t, blink = t < 2 && Math.floor(t * 6) % 2 === 0;
    if (!blink) {
      ctx.fillStyle = '#7dffef';
      ctx.shadowColor = '#7dffef'; ctx.shadowBlur = 22;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = s.time * 2 + i * Math.PI / 3;
        const px = s.pickup.x + Math.cos(a) * 14, py = s.pickup.y + Math.sin(a) * 14;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
  // Player.
  if (s.scene === 'play') {
    const p = s.player;
    const blinkHurt = s.invuln > 0 && Math.floor(s.invuln * 10) % 2 === 0;
    if (!blinkHurt) {
      // Trail.
      ctx.strokeStyle = 'rgba(120,200,255,0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p.x - p.vx * 0.05, p.y - p.vy * 0.05);
      ctx.lineTo(p.x, p.y); ctx.stroke();
      // Ship.
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.aim);
      ctx.fillStyle = '#cfeaff';
      ctx.shadowColor = '#66d9ff'; ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.moveTo(20, 0); ctx.lineTo(-12, 11); ctx.lineTo(-6, 0); ctx.lineTo(-12, -11);
      ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
      // Aim line.
      ctx.strokeStyle = 'rgba(120,200,255,0.22)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + Math.cos(p.aim) * 90, p.y + Math.sin(p.aim) * 90); ctx.stroke();
    }
  }
}

function drawFloats(ctx, s) {
  ctx.textAlign = 'center';
  for (const f of s.floats) {
    ctx.globalAlpha = Math.min(1, f.life * 1.6);
    ctx.fillStyle = f.color;
    ctx.font = 'bold 20px monospace';
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;
}

function glowText(ctx, text, x, y, size, color, align = 'center') {
  ctx.textAlign = align;
  ctx.font = `bold ${size}px monospace`;
  ctx.shadowColor = color; ctx.shadowBlur = 24;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.shadowBlur = 0;
}

function drawTitle(ctx, s) {
  ctx.fillStyle = 'rgba(5,6,13,0.55)';
  ctx.fillRect(0, 0, WORLD.w, WORLD.h);
  glowText(ctx, 'PHOTON DRIFT', WORLD.w / 2, 220, 84, '#8be9ff');
  glowText(ctx, 'SURVIVE THE SWARM', WORLD.w / 2, 290, 26, '#ffd166');
  ctx.fillStyle = 'rgba(200,225,255,0.85)';
  ctx.textAlign = 'center';
  ctx.font = '20px monospace';
  ctx.fillText('MOUSE aim + fire   ·   WASD move   ·   SHIFT dash', WORLD.w / 2, 400);
  ctx.fillText('Chain kills for combo score  ·  Grab cyan CORES for +250 and a life', WORLD.w / 2, 436);
  const a = 0.6 + 0.4 * Math.sin((s.pulse = (s.pulse || 0) + 0.03));
  ctx.globalAlpha = a;
  glowText(ctx, 'CLICK TO START', WORLD.w / 2, 540, 34, '#7dffef');
  ctx.globalAlpha = 1;
}

function drawHud(ctx, s) {
  ctx.textAlign = 'left';
  ctx.font = 'bold 26px monospace';
  ctx.shadowColor = '#8be9ff'; ctx.shadowBlur = 12;
  ctx.fillStyle = '#cfeaff';
  ctx.fillText(`SCORE ${s.score}`, 30, 48);
  ctx.fillStyle = '#ffd166';
  ctx.fillText(`WAVE ${s.wave}`, 30, 84);
  ctx.shadowBlur = 0;
  // Lives.
  for (let i = 0; i < s.lives; i++) {
    ctx.fillStyle = '#ff5c7a';
    ctx.shadowColor = '#ff5c7a'; ctx.shadowBlur = 10;
    ctx.beginPath();
    const x = WORLD.w - 40 - i * 34;
    ctx.moveTo(x - 10, 28); ctx.lineTo(x + 10, 28); ctx.lineTo(x, 46);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
  }
  // Combo meter.
  if (s.combo > 1) {
    ctx.textAlign = 'center';
    ctx.font = 'bold 34px monospace';
    ctx.fillStyle = s.combo >= 5 ? '#ffd166' : '#9df1ff';
    ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 16;
    ctx.fillText(`x${s.combo} COMBO`, WORLD.w / 2, 60);
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(WORLD.w / 2 - 90, 70, 180, 6);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(WORLD.w / 2 - 90, 70, 180 * (s.comboTimer / 2.4), 6);
  }
  // Dash cooldown.
  const d = s.dash;
  ctx.fillStyle = d.cd > 0 ? 'rgba(140,180,255,0.25)' : '#7dffef';
  ctx.fillRect(30, WORLD.h - 26, 140 * (1 - d.cd / PLAYER.dashCooldown), 8);
  ctx.textAlign = 'left';
  ctx.font = '14px monospace';
  ctx.fillStyle = 'rgba(200,225,255,0.7)';
  ctx.fillText('DASH', 30, WORLD.h - 34);
}

function drawGameOver(ctx, s) {
  ctx.fillStyle = 'rgba(5,6,13,0.65)';
  ctx.fillRect(0, 0, WORLD.w, WORLD.h);
  glowText(ctx, 'SIGNAL LOST', WORLD.w / 2, 250, 72, '#ff5c7a');
  glowText(ctx, `SCORE ${s.score}`, WORLD.w / 2, 350, 44, '#cfeaff');
  glowText(ctx, `BEST ${s.best}`, WORLD.w / 2, 410, 30, '#ffd166');
  glowText(ctx, `WAVES SURVIVED ${s.wave}`, WORLD.w / 2, 455, 22, '#9df1ff');
  glowText(ctx, 'CLICK OR PRESS ENTER TO RESTART', WORLD.w / 2, 560, 26, '#7dffef');
}
