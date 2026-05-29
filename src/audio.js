class SoundEffects {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playClick() {
    try {
      this.init();
      const now = this.ctx.currentTime;

      // Stone grinding sub-sound (low frequency friction noise)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(80, now);
      osc1.frequency.exponentialRampToValueAtTime(30, now + 0.35);

      // Filter to make it sound muffled and stony
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, now);
      filter.frequency.exponentialRampToValueAtTime(60, now + 0.35);

      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      // High metal click
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1200, now);
      osc2.frequency.exponentialRampToValueAtTime(600, now + 0.08);

      gain2.gain.setValueAtTime(0.15, now);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      // Connections
      osc1.connect(filter);
      filter.connect(gain1);
      gain1.connect(this.ctx.destination);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.4);
      osc2.start(now);
      osc2.stop(now + 0.1);
    } catch (e) {
      console.warn("Audio context failed to play", e);
    }
  }

  playReset() {
    try {
      this.init();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(220, now + 0.3);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.warn("Audio context failed to play", e);
    }
  }

  playVictory() {
    try {
      this.init();
      const now = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C major arpeggio
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const delay = idx * 0.12;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);
        
        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(0.15, now + delay + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 1.3);
      });

      // Add a warm background pad/hum
      const pad = this.ctx.createOscillator();
      const padGain = this.ctx.createGain();
      pad.type = 'triangle';
      pad.frequency.setValueAtTime(130.81, now); // Low C
      padGain.gain.setValueAtTime(0, now);
      padGain.gain.linearRampToValueAtTime(0.2, now + 0.5);
      padGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

      pad.connect(padGain);
      padGain.connect(this.ctx.destination);

      pad.start(now);
      pad.stop(now + 2.0);
    } catch (e) {
      console.warn("Audio context failed to play", e);
    }
  }
}

export const sounds = new SoundEffects();
