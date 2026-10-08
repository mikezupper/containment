import { expect, it, vi } from 'vitest';
import { observeSelection, type SnapshotSource } from '@local-games/runtime/core';

function source(eager: boolean) {
  let value = { score: 0, frame: 0 };
  const listeners = new Set<(snapshot: typeof value) => void>();
  const port: SnapshotSource<typeof value> = {
    get: () => value,
    subscribe: listener => {
      listeners.add(listener); if (eager) listener(value);
      return () => { listeners.delete(listener); };
    },
  };
  return { port, listeners, set: (next: typeof value) => { value = next; for (const listener of listeners) listener(next); } };
}
for (const eager of [true, false]) it(`emits an initial selection once and filters unrelated frames (${eager ? 'eager' : 'change-only'})`, () => {
  const state = source(eager), seen = vi.fn();
  const stop = observeSelection(state.port, snapshot => snapshot.score, seen);
  expect(seen.mock.calls).toEqual([[0]]);
  state.set({ score: 0, frame: 1 }); state.set({ score: 4, frame: 2 }); state.set({ score: 4, frame: 3 });
  expect(seen.mock.calls).toEqual([[0], [4]]);
  stop(); stop(); state.set({ score: 8, frame: 4 }); expect(seen).toHaveBeenCalledTimes(2);
  expect(state.listeners.size).toBe(0);
});
it('uses caller equality for object projections and keeps observers independent', () => {
  const state = source(true), first = vi.fn(), second = vi.fn();
  const select = (snapshot: { score: number }) => ({ points: snapshot.score });
  const equal = (a: { points: number }, b: { points: number }) => a.points === b.points;
  const stopFirst = observeSelection(state.port, select, first, equal);
  const stopSecond = observeSelection(state.port, select, second, equal);
  state.set({ score: 0, frame: 1 }); stopFirst(); state.set({ score: 3, frame: 2 });
  expect(first.mock.calls).toEqual([[{ points: 0 }]]); expect(second.mock.calls).toEqual([[{ points: 0 }], [{ points: 3 }]]);
  stopSecond();
});
it('ignores late queued callbacks after unsubscribe and releases the source only once', () => {
  let callback: ((value: number) => void) | undefined;
  const released = vi.fn(), seen = vi.fn();
  const stop = observeSelection({ get: () => 1, subscribe: listener => { callback = listener; return released; } }, value => value, seen);
  stop(); stop(); callback?.(2);
  expect(released).toHaveBeenCalledTimes(1); expect(seen.mock.calls).toEqual([[1]]);
});
