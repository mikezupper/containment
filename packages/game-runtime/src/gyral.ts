import { command, defineDriver, provideDrivers, subscription, type Command } from '@gyral/core';
import { observeSelection, type SessionPort } from './core.js';

/** Bind game-owned sessions to Gyral without giving the bridge any game rules. */
export function createSessionBridge<Snapshot, Input, View>(options: {
  readonly name: string;
  readonly select: (snapshot: Snapshot) => View;
  readonly equal?: (a: View, b: View) => boolean;
}) {
  if (!/^[a-z][a-z0-9-]*$/.test(options.name)) throw new Error('Session bridge name must be a lowercase namespace.');
  const watchName = `${options.name}-watch`, actionName = `${options.name}-action`;
  const missing = (): never => { throw new Error(`Provide the ${options.name} session before mounting controls.`); };
  const toError = (error: unknown): string => error instanceof Error ? error.message : String(error);
  const watcher = subscription<View>(watchName, missing);
  const action = defineDriver<Input, void, string>({ name: actionName, run: missing, toError });
  return {
    action,
    watch: <M>(message: (view: View) => M): Command<M> => command(watcher, undefined, { onSuccess: message }),
    act: <M>(input: Input, failure: (message: string) => M): Command<M> => command<Input, void, string, M>(action, input,
      { onSuccess: () => undefined, onFailure: failure }),
    provide: (element: Element, session: SessionPort<Snapshot, Input>): (() => void) => provideDrivers(element, {
      [watchName]: subscription<View>(watchName, emit => observeSelection(session, options.select, emit, options.equal)),
      [actionName]: defineDriver<Input, void, string>({ name: actionName, run: input => session.dispatch(input), toError }),
    }),
  };
}
