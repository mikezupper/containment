import { advance, dispatch, newGame } from '../game/engine.ts';
import { STEP, type Axis, type Game, type Input } from '../game/types.ts';

export interface Snapshot { readonly game: Game; readonly axis: Axis; readonly best: number; readonly sound: boolean; readonly blocked: string | null }
export type Action = Input | { readonly type: 'rotate' } | { readonly type: 'sound' } | { readonly type: 'restart' };
/** Browser-independent session. The host supplies elapsed time and the initial seed. */
export class Session {
  private value: Snapshot;
  private accumulator = 0;
  private closed = false;
  private readonly listeners = new Set<(snapshot: Snapshot) => void>();
  constructor(seed: number, best = 0) { this.value = { game: newGame(seed), axis: 'vertical', best, sound: false, blocked: null }; }
  get snapshot(): Snapshot { return this.value; }
  get(): Snapshot { return this.value; }
  subscribe(listener: (snapshot: Snapshot) => void): () => void {
    if (this.closed) return () => {};
    this.listeners.add(listener); listener(this.value);
    return () => this.listeners.delete(listener);
  }
  dispatch(action: Action): void {
    if (this.closed) return;
    if (this.value.blocked && !['rotate', 'sound', 'speed'].includes(action.type)) return;
    if (action.type === 'rotate') this.value = { ...this.value, axis: this.value.axis === 'vertical' ? 'horizontal' : 'vertical' };
    else if (action.type === 'sound') this.value = { ...this.value, sound: !this.value.sound };
    else {
      const input: Input = action.type === 'restart' ? { type: 'start', seed: this.value.game.seed + 1 } : action;
      const game = dispatch(this.value.game, input);
      this.value = { ...this.value, game, best: Math.max(this.value.best, game.score) };
      if (game.phase !== 'playing' || input.type === 'start' || input.type === 'next') this.accumulator = 0;
    }
    this.emit();
  }
  /** The host can suspend play while an essential service is unavailable. */
  setBlocked(reason: string | null): void {
    if (this.closed || reason === this.value.blocked) return;
    const game = reason && this.value.game.phase === 'playing' ? dispatch(this.value.game, { type: 'pause' }) : this.value.game;
    this.value = { ...this.value, game, blocked: reason }; this.accumulator = 0; this.emit();
  }
  frame(seconds: number): void {
    if (this.closed || this.value.game.phase !== 'playing' || !Number.isFinite(seconds) || seconds <= 0) return;
    // Drop a long stall instead of simulating a burst of unavoidable losses.
    this.accumulator += Math.min(0.1, seconds);
    let game = this.value.game;
    while (this.accumulator >= STEP && game.phase === 'playing') { game = advance(game); this.accumulator -= STEP; }
    this.value = { ...this.value, game, best: Math.max(this.value.best, game.score) };
    this.emit();
  }
  close(): void { this.closed = true; this.listeners.clear(); this.accumulator = 0; }
  private emit(): void { for (const listener of this.listeners) listener(this.value); }
}
