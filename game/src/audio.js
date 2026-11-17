// WebAudio sound bus for Photon Drift. All tones are synthesised — no files.

export class AudioBus {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  resume() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  tone(freq, dur, type, gain, when = 0, slide = 0) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  blip(freq, dur, type, gain) { this.tone(freq, dur, type, gain); }

  chord(freqs, gain = 0.06) {
    freqs.forEach((f, i) => this.tone(f, 0.35, 'triangle', gain, i * 0.06));
  }
}
