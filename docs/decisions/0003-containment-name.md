# Decision 0003: name the game Containment

Date: 8 October 2026. Status: accepted at the owner's request.

Use Containment for the game heading, browser title, search and social descriptions,
accessible labels, current project documentation, and private root package
(`containment-game`). JezzBall identifies the original inspiration in the historical
research and attribution. Earlier verification records retain the name used during
those runs.

Keep the existing `jezzball.best.v1` storage key so saved best scores survive the rename.
Verification scripts accept `CONTAINMENT_URL`, with `JEZZBALL_URL` as a fallback for
existing callers. Internal custom-element names, Beads IDs, and the checkout directory
remain stable. The reusable workspace keeps its independent `@local-games/runtime` name.
