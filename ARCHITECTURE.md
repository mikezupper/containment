# Architecture

Containment's rules run in two dimensions. Three.js presents those rules as a physical
chamber; rendering never changes where a ball can go or whether a region is captured.
This keeps placement precise and the simulation reproducible.

## Dependency direction

```text
src/main.ts                browser composition and lifecycle
    ↓
src/app/                   Gyral controls, drivers, input, audio
    ↓             ↓
src/runtime/      src/rendering/
session           Three.js projection, picking, resource disposal
    ↓             ↓
src/game/                  types, geometry, deterministic rules
```

The runtime and renderer may import the game. They may not import each other or the
app. The app may import all three. Only the composition root starts the animation
loop, reads storage, chooses a random seed, and wires lifecycle events.
`scripts/check-boundaries.mjs` checks static and dynamic imports and rejects browser,
clock, and global-random dependencies in the game and runtime.

## Ownership and data flow

`Session` owns the current immutable snapshot and its subscribers. `dispatch` accepts
typed player actions; `frame` accumulates elapsed time and calls `advance` at 120 Hz.
Both rules functions return new snapshots without mutating old ones. The seed and
tick are explicit. They permit deterministic replay in tests; there is no replay-file
format or save/resume feature yet.

The browser host owns one animation loop. A frame contributes at most 100 ms, so a
stall cannot trigger a long catch-up burst. Tab hiding and window blur pause the game;
the player resumes it explicitly. A paused session advances neither balls nor time.

Gyral receives a compact HUD through a provided subscription driver. The driver emits
only when the visible fields change. Buttons return action commands. Reducers and
views never touch the session, the DOM, storage, or randomness directly.
The observation and Gyral bridge come from the private `packages/game-runtime`
workspace; HUD projection and equality remain Containment code.

`ChamberElement` owns pointer and keyboard listeners, a renderer, and its session
subscription. Removing it synchronously releases those resources. `ChamberRenderer`
owns WebGL objects, the resize observer, geometry, materials, instanced captured cells,
and environment textures. A plane raycast maps pointer coordinates back to rule-space
coordinates. The camera stays fixed; no orbit controls change the aiming surface.
Graphics loss blocks actions and pauses the run. Restoration rebuilds the renderer,
including generated environment textures; a retry button also permits manual recovery.
Clearing the graphics block never resumes play automatically.

The host releases audio, animation, subscriptions, and elements on normal page exit
and Vite HMR. A back/forward-cache transition pauses instead of destroying the page.

## Package boundaries

The private `@local-games/runtime` workspace exports a framework-independent snapshot
observer and an optional Gyral session bridge. Containment consumes it; an isolated packed
consumer checks it with Greed's real local session. Sabacc still needs its own aggregate
adapter. The package owns neither session shutdown nor game clocks. The wall geometry,
capture algorithm, ball collision, controls, and Three.js chamber remain Containment code.
Nothing is published to npm. See the [package assessment](docs/references/game-architecture-and-reusable-package.md).

## External dependencies

Gyral core/testing are local tarballs at `vendor/gyral/0.3.1-next.1`. Their provenance is
unchanged from Greed; checksums run during lint. Three.js is lazy-loaded with the chamber.
The renderer has a 150 KiB gzip budget, checked against production output. The HTML,
rules, and controls do not require a Three.js bundle to be indexable or understandable.

There is no backend, identity service, multiplayer transport, or analytics integration.
The only persisted player data is the best score in this browser's local storage.
