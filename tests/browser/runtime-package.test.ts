import { afterEach, expect, it } from 'vitest';
import { define, html, settled } from '@gyral/core';
import { createSessionBridge } from '@local-games/runtime/gyral';

const bridge = createSessionBridge<number, number, number>({ name: 'bridge-test', select: value => value });
type Msg = { readonly _tag: 'Value'; readonly value: number } | { readonly _tag: 'Add' } | { readonly _tag: 'Failed'; readonly message: string };
const Control = define<{ readonly value: number; readonly error: string }, Msg>('bridge-test-control', {
  shadow: false,
  init: () => [{ value: -1, error: '' }, [bridge.watch(value => ({ _tag: 'Value', value }))]],
  intent: { Add: () => ({ _tag: 'Add' }) },
  update: {
    Value: (state, msg) => ({ ...state, value: msg.value }),
    Failed: (state, msg) => ({ ...state, error: msg.message }),
    Add: state => [state, [bridge.act(1, message => ({ _tag: 'Failed', message }))]],
  },
  view: (state, intent) => html`<button data-intent=${intent.Add}>Add</button><output>${state.value}</output><p role="status">${state.error}</p>`,
});
const cleanup: (() => void)[] = [];
afterEach(() => { document.body.replaceChildren(); cleanup.splice(0).forEach(stop => stop()); });
function mount(initial: number, fail = false) {
  let value = initial;
  const listeners = new Set<(value: number) => void>();
  const host = document.createElement('div'); document.body.append(host);
  cleanup.push(bridge.provide(host, {
    get: () => value,
    subscribe: listener => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    dispatch: async amount => {
      if (fail) throw new Error('Session rejected the action');
      value += amount; for (const listener of listeners) listener(value);
    },
  }));
  const element = new Control(); host.append(element);
  return { host, element, listeners };
}
it('isolates provided sessions and unsubscribes when a component disconnects', async () => {
  const first = mount(2), second = mount(10); await settled();
  first.host.querySelector('button')!.click(); await settled();
  expect(first.host.querySelector('output')!.textContent).toBe('3');
  expect(second.host.querySelector('output')!.textContent).toBe('10');
  expect(first.listeners.size).toBe(1); first.element.remove(); await settled(); expect(first.listeners.size).toBe(0);
  expect(second.listeners.size).toBe(1);
});
it('maps rejected asynchronous game actions to a Gyral failure message', async () => {
  const { host } = mount(0, true); await settled(); host.querySelector('button')!.click(); await settled();
  expect(host.querySelector('[role="status"]')!.textContent).toBe('Session rejected the action');
  expect(host.querySelector('output')!.textContent).toBe('0');
});
