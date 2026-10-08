import type { Snapshot } from '../runtime/session.ts';

/** Sound is opt-in. Browsers unlock the context from the sound button's user gesture. */
export class GameAudio {
  private context: AudioContext | null = null;
  private last: Snapshot | null = null;
  update(snapshot: Snapshot): void {
    const previous = this.last; this.last = snapshot;
    if (!snapshot.sound) return;
    if (!this.context) {
      try { this.context = new AudioContext(); } catch { return; }
    }
    if (this.context.state === 'suspended') void this.context.resume().catch(() => {});
    if (!previous?.sound) this.tone(440, 0.08);
    else if (snapshot.game.lives < previous.game.lives) this.tone(110, 0.18);
    else if (snapshot.game.phase === 'won' && previous.game.phase !== 'won') this.tone(880, 0.24);
    else if (snapshot.game.captured > previous.game.captured && !snapshot.game.cut) this.tone(660, 0.1);
  }
  close(): void { if (this.context) void this.context.close().catch(() => {}); this.context = null; }
  private tone(frequency: number, duration: number): void {
    const context = this.context; if (!context) return;
    const oscillator = context.createOscillator(), gain = context.createGain(), time = context.currentTime;
    oscillator.type = 'sine'; oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.07, time); gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(time + duration);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
}
