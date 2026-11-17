// Screen-reader status updates for Photon Drift.

export function updateHudStatus(el, s) {
  if (s.scene === 'play') {
    el.textContent = `Score ${s.score}, wave ${s.wave}, ${s.lives} lives, combo ${s.combo}.`;
  } else if (s.scene === 'title') {
    el.textContent = 'Photon Drift title screen. Click to start.';
  } else {
    el.textContent = `Game over. Score ${s.score}. Click or press Enter to restart.`;
  }
}
