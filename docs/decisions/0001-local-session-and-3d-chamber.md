# Decision 0001: local session with a separate 3D chamber

Date: 8 October 2026. Status: accepted for the first playable build.

The owner wants a JezzBall remake that follows the Gyral approach used by Greed, uses
the requested skills, and presents the board as a modern lit 3D chamber. Greed and
Sabacc also suggest a possible shared npm package.

Use vendored Gyral core/testing for interface state and effects, Three.js for the
chamber, and an independent pure rules engine with a fixed-step session. Keep physics
in the board plane. A rigid-body engine adds complexity without improving this rule set.
Use a fixed camera and plane raycasting so visual depth does not sacrifice placement.

Delay npm extraction until this third game demonstrates which session and lifecycle
code survives all three examples. Keep extraction candidates isolated in `src/runtime`,
while leaving JezzBall geometry and rendering game-owned. Publishing a package is a
separate decision from scaffolding this application.

This makes simulation tests fast and deterministic and allows browser rendering to be
replaced without rewriting rules. It also means continuous-frame ownership must be
handled explicitly, unlike a turn-based table. Architecture checks enforce the dependency
direction and lifecycle tests exercise resource cleanup.

Timing and scoring use explicit modern values. The historical research remains the
reference for original behavior; [the product rules](../product/rules.md) record differences.

The later [private package decision](0002-private-session-bridge.md) records the small
extraction made after the playable game and real-consumer comparison.
The [naming decision](0003-containment-name.md) records the owner's subsequent choice
of Containment as the game's name.
