import { expect, it } from 'vitest';
import { Session } from '../../src/runtime/session.ts';
import { initial, inputsFor, step } from '@gyral/testing';
import { Controls } from '../../src/app/controls.ts';
import { actionDriver } from '../../src/app/drivers.ts';

it('uses fixed ticks regardless of frame grouping and disposes subscriptions', () => {
  const a = new Session(7), b = new Session(7);
  a.dispatch({ type: 'start', seed: 7 }); b.dispatch({ type: 'start', seed: 7 });
  for (let i = 0; i < 120; i++) a.frame(1 / 120);
  for (let i = 0; i < 60; i++) b.frame(1 / 60);
  expect(a.snapshot).toEqual(b.snapshot);
  let calls = 0; const stop = a.subscribe(() => calls++); expect(calls).toBe(1);
  stop(); a.frame(1 / 60); expect(calls).toBe(1);
  const before = a.snapshot; a.close(); a.frame(1); a.dispatch({ type: 'rotate' }); expect(a.snapshot).toBe(before);
});
it('drops long frame stalls and clears accumulated time on pause', () => {
  const session = new Session(7); session.dispatch({ type: 'restart' }); session.frame(100);
  expect(session.snapshot.game.tick).toBeLessThanOrEqual(12);
  session.dispatch({ type: 'pause' }); const before = session.snapshot;
  session.frame(100); expect(session.snapshot).toBe(before);
});
it('Gyral requests session actions as data while keeping its reducer pure', () => {
  const { state } = initial(Controls.spec);
  const result = step(Controls.spec, state, { _tag: 'Rotate' });
  expect(result.state).toBe(state); expect(inputsFor(result.commands, actionDriver)).toEqual([{ type: 'rotate' }]);
  const speed = step(Controls.spec, state, { _tag: 'Speed' });
  expect(inputsFor(speed.commands, actionDriver)).toEqual([{ type: 'speed', slow: true }]);
});
it('blocks starts and resumes while the host is unavailable, preserving the run', () => {
  const session = new Session(17); session.dispatch({ type: 'restart' }); session.frame(0.05);
  session.setBlocked('Recovering graphics'); const snapshot = session.snapshot;
  expect(snapshot.game.phase).toBe('paused');
  for (const type of ['pause', 'restart', 'next'] as const) session.dispatch({ type });
  session.frame(1); expect(session.snapshot).toBe(snapshot);
  session.setBlocked(null); expect(session.snapshot.game).toBe(snapshot.game);
  session.dispatch({ type: 'pause' }); session.frame(0.05); expect(session.snapshot.game.tick).toBeGreaterThan(snapshot.game.tick);
});
