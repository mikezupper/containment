export interface SnapshotSource<Snapshot> {
  readonly get: () => Snapshot;
  readonly subscribe: (listener: (snapshot: Snapshot) => void) => () => void;
}
/** The bridge owns subscriptions, while the game owns its session and shutdown. */
export interface SessionPort<Snapshot, Input> extends SnapshotSource<Snapshot> {
  readonly dispatch: (input: Input) => void | Promise<void>;
}

/** One selected value now, then changes. Works with eager and change-only sources. */
export function observeSelection<Snapshot, View>(source: SnapshotSource<Snapshot>, select: (snapshot: Snapshot) => View,
  listener: (view: View) => void, equal: (a: View, b: View) => boolean = Object.is): () => void {
  let active = true, initialized = false, previous: View;
  const changed = (snapshot: Snapshot): void => {
    if (!active) return;
    const next = select(snapshot);
    if (initialized && equal(previous, next)) return;
    previous = next; initialized = true; listener(next);
  };
  const stop = source.subscribe(changed);
  if (!initialized) changed(source.get());
  return () => { if (!active) return; active = false; stop(); };
}
