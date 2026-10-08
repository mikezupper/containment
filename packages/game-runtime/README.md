# Local games runtime prototype

This private npm workspace extracts two small pieces used by the Containment and Greed
session models. It is an extraction experiment, not a published library or a final
package name. Containment uses it directly. The packed-consumer check runs against Greed's
actual local session without editing the Greed checkout.

## Core

`@local-games/runtime/core` exports `SnapshotSource`, `SessionPort`, and
`observeSelection(source, select, listener, equal?)`. The core has no runtime dependencies,
browser globals, UI framework, rendering library, or rules engine.

A source offers `get()` and `subscribe(listener)`. Its subscription may emit immediately
or only on changes. `observeSelection` registers first, emits the latest selected value
once, and filters later values using `Object.is` or the supplied equality function.
Unsubscribe is idempotent and ignores late callbacks. Sources must register synchronously
and publish complete snapshots. Selectors are pure; callers own snapshot immutability.
This helper does not combine several cells into an atomic snapshot. Sabacc still needs
its existing coalescing adapter before adopting this contract.

## Gyral

`@local-games/runtime/gyral` exports `createSessionBridge({ name, select, equal? })`.
It returns `watch(toMessage)`, `act(input, onFailure)`, the action driver for model tests,
and `provide(element, session)`. Each bridge has namespaced watch/action drivers.
The provider's cleanup removes the binding; component disconnection cancels the watch.
The host continues to own session shutdown.

```ts
const bridge = createSessionBridge({
  name: 'my-game',
  select: (snapshot: MySnapshot) => snapshot.score,
});
const stopProviding = bridge.provide(root, session);
```

Install the matching Gyral peer to use the Gyral entry point. Core-only consumers need
no peer. The exact prerelease peer matches the vendored artifacts currently used by
these games. A public release needs a stable framework dependency strategy first.

## Build and verify

From the Containment repository, `npm run build:runtime` emits JavaScript and declarations.
`npm run verify:package` packs the workspace, installs it into an isolated temporary
consumer, checks that the core works without Gyral, and exercises the package with real
Containment and Greed sessions. Unit and Chromium tests cover filtering, dispatch, command
data, provider isolation, and disconnection. There are no shared clock, physics, save,
replay, room, or rendering exports in this prototype.

## License

MIT; see [LICENSE](LICENSE). This workspace stays private to prevent accidental npm
publication while its API is experimental. Its source is open for contributions and reuse.
