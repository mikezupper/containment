# Decision 0002: extract observation and the Gyral bridge privately

Date: 8 October 2026. Status: accepted as a local extraction experiment.

Containment and Greed expose a complete session snapshot, subscribe to changes, and
dispatch typed actions. Their Gyral controls repeat the same watch/action wiring.
Sabacc reaches a similar UI boundary by coalescing several cells. Its internal update
order must remain game-owned.

Extract `SnapshotSource`, `SessionPort`, and `observeSelection` into a dependency-free
core, with `createSessionBridge` in a separate Gyral entry point. Accept eager and
change-only sources, emit one initial selection, and filter later values using explicit
equality. Require coherent snapshots rather than attempting to combine arbitrary cells.

The workspace is private and uses a temporary name, `@local-games/runtime`. Containment
uses it directly. A packed archive is installed into an isolated consumer and tested
with actual Containment and Greed local sessions. This establishes compatibility without
editing the sibling game. It does not establish production adoption there.

Keep rules, clocks, rendering, input, saves, replay, workers, and networking in the
games. The host retains session shutdown; Gyral retains component subscription cleanup.
The exact optional Gyral peer matches the existing vendored prerelease. Core consumers
do not need that peer installed.

A public release needs a package name, license, repository, stable dependency strategy,
and production consumers. Those decisions are separate from this experiment. More
exports need two concrete consumers with matching semantics. See the
[comparison and API assessment](../references/game-architecture-and-reusable-package.md)
and [package README](../../packages/game-runtime/README.md).
