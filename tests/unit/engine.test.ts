import { describe, expect, it } from 'vitest';
import { advance, dispatch, newGame } from '../../src/game/engine.ts';
import { capture, free, index } from '../../src/game/geometry.ts';
import { HEIGHT, STEP, WIDTH, type Game } from '../../src/game/types.ts';

const still = (x: number, y: number) => ({ x, y, vx: 0, vy: 0 });
const playing = (): Game => ({ ...newGame(71), phase: 'playing', balls: [still(2.5, 2.5), still(2.5, 17.5)] });
function ticks(game: Game, count: number): Game { for (let i = 0; i < count; i++) game = advance(game); return game; }

describe('Containment rules', () => {
  it('replays the same seed and tick inputs without mutating snapshots', () => {
    const start = dispatch(newGame(12), { type: 'start', seed: 12 });
    const saved = JSON.stringify(start);
    expect(ticks(start, 600)).toEqual(ticks(start, 600));
    expect(JSON.stringify(start)).toBe(saved);
    expect(newGame(13).balls).not.toEqual(newGame(12).balls);
  });
  it('starts with two lives and adds balls through the level-49 cap', () => {
    expect(newGame().lives).toBe(2);
    expect(newGame(1, 7).balls).toHaveLength(8);
    const last = dispatch({ ...newGame(1, 49, 123), phase: 'won' }, { type: 'next' });
    expect(last.level).toBe(49); expect(last.balls).toHaveLength(50); expect(last.score).toBe(123);
  });
  it('rejects out-of-range input, a second growing cut, and placement while paused', () => {
    const game = playing();
    for (const x of [NaN, Infinity, -1, WIDTH]) expect(dispatch(game, { type: 'place', x, y: 3, axis: 'vertical' })).toBe(game);
    const cut = dispatch(game, { type: 'place', x: 14, y: 10, axis: 'vertical' });
    expect(dispatch(cut, { type: 'place', x: 3, y: 3, axis: 'horizontal' })).toBe(cut);
    const paused = dispatch(game, { type: 'pause' });
    expect(advance(paused)).toBe(paused);
    expect(dispatch(paused, { type: 'place', x: 3, y: 3, axis: 'vertical' })).toBe(paused);
  });
  it('captures an empty region and counts the finished wall in area and points', () => {
    const end = ticks(dispatch(playing(), { type: 'place', x: 14, y: 10, axis: 'vertical' }), 140);
    expect(end.cut).toBeNull(); expect(end.lives).toBe(2);
    expect(end.captured).toBe(14 * HEIGHT);
    expect(end.score).toBe(end.captured * 10);
    expect(end.cells[index(13, 8)]).toBe(false);
    expect(end.cells[index(14, 8)]).toBe(true);
    expect(end.cells[index(27, 8)]).toBe(true);
  });
  it('keeps disconnected regions containing any ball', () => {
    const cells = Array<boolean>(WIDTH * HEIGHT).fill(false);
    for (let y = 0; y < HEIGHT; y++) cells[index(14, y)] = true;
    const result = capture(cells, [still(2, 5), still(20, 5)]);
    expect(result.filter(Boolean)).toHaveLength(HEIGHT);
  });
  it('keeps a completed half when the other half is hit', () => {
    const game = { ...playing(), balls: [still(14.5, 8), still(2.5, 2.5)] };
    const result = ticks(dispatch(game, { type: 'place', x: 14, y: 10, axis: 'vertical' }), 150);
    expect(result.lives).toBe(1); expect(result.cut).toBeNull();
    expect(result.cells[index(14, 19)]).toBe(true);
    expect(result.cells[index(14, 3)]).toBe(false);
  });
  it('charges one life for each independently failed half', () => {
    const game = { ...playing(), balls: [still(14.5, 8), still(14.5, 12)] };
    const result = ticks(dispatch(game, { type: 'place', x: 14, y: 10, axis: 'vertical' }), 100);
    expect(result.lives).toBe(0); expect(result.phase).toBe('over');
  });
  it('never solidifies the shared starting square around a ball near a boundary', () => {
    const game = { ...playing(), balls: [still(14.5, 0.9), still(2.5, 2.5)] };
    const result = ticks(dispatch(game, { type: 'place', x: 14, y: 0, axis: 'vertical' }), 10);
    expect(result.cells[index(14, 0)]).toBe(false);
    expect(result.balls.every(ball => free(result.cells, ball.x, ball.y))).toBe(true);
    expect(result.phase).toBe('over');
  });
  it('handles a horizontal capture and rejects building on a finished wall', () => {
    const game = { ...playing(), balls: [still(2.5, 2.5), still(22.5, 2.5)] };
    const result = ticks(dispatch(game, { type: 'place', x: 14, y: 10, axis: 'horizontal' }), 180);
    expect(result.captured).toBe(WIDTH * 10);
    expect(result.cells[index(2, 19)]).toBe(true);
    expect(dispatch(result, { type: 'place', x: 2, y: 10, axis: 'horizontal' })).toBe(result);
  });
  it('bounces a circle off a solid cell and conserves speed in a ball collision', () => {
    const game = playing(), cells = [...game.cells]; cells[index(4, 3)] = true;
    const bounce = advance({ ...game, cells, balls: [{ x: 3.67, y: 3.5, vx: 5, vy: 0 }] });
    expect(bounce.balls[0]!.vx).toBe(-5); expect(free(cells, bounce.balls[0]!.x, bounce.balls[0]!.y)).toBe(true);
    const collision = advance({ ...game, balls: [{ x: 5, y: 5, vx: 2, vy: 0 }, { x: 5.62, y: 5, vx: -2, vy: 0 }] });
    expect(collision.balls.map(b => b.vx)).toEqual([-2, 2]);
  });
  it('wins at 75% and awards the level bonus only once', () => {
    const game = playing(), cells = game.cells.map((_, cell) => cell % WIDTH >= 7);
    const won = advance({ ...game, cells, captured: 420 });
    expect(won.phase).toBe('won'); expect(won.score).toBeGreaterThan(game.score);
    expect(advance(won)).toBe(won);
    const next = dispatch(won, { type: 'next' });
    expect(next.level).toBe(2); expect(next.lives).toBe(3); expect(next.captured).toBe(0); expect(next.score).toBe(won.score);
  });
  it('expires the timer, freezes during pause, and changes speed without changing direction', () => {
    expect(advance({ ...playing(), remaining: STEP / 2 }).phase).toBe('over');
    const paused = dispatch(playing(), { type: 'pause' }); expect(ticks(paused, 120)).toBe(paused);
    const slowed = dispatch(paused, { type: 'speed', slow: true });
    expect(slowed.slow).toBe(true); expect(slowed.remaining).toBe(paused.remaining);
    const moving = dispatch(newGame(1), { type: 'speed', slow: true });
    expect(Math.hypot(moving.balls[0]!.vx, moving.balls[0]!.vy)).toBeCloseTo(3.2);
  });
  it('keeps all balls out of solid cells over sustained simulation', () => {
    let game: Game = { ...newGame(934, 15), phase: 'playing' };
    for (let i = 0; i < 10000; i++) {
      if (i % 180 === 0) game = dispatch(game, { type: 'place', x: (i / 180 * 7) % WIDTH, y: 10, axis: 'vertical' });
      game = advance(game);
      expect(game.balls.every(b => free(game.cells, b.x, b.y))).toBe(true);
      if (game.phase === 'over') break;
    }
  });
});
