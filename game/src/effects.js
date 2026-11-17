// Effects: particles, floating texts and screen shake decay.

export function stepEffects(s, dt) {
  for (const p of s.pops) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.96; p.vy *= 0.96; p.life -= dt; }
  s.pops = s.pops.filter((p) => p.life > 0);
  for (const f of s.floats) { f.y -= 46 * dt; f.life -= dt; }
  s.floats = s.floats.filter((f) => f.life > 0);
  s.shake = Math.max(0, s.shake - dt * 26);
  s.flash = Math.max(0, s.flash - dt * 2.2);
}
