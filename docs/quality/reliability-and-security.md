# Reliability and security

The application runs locally in the browser and has no backend, account, network game
protocol, analytics, or remote leaderboard. Input enters through typed buttons and
validated placement coordinates. Text is rendered through Gyral templates or text nodes.
There is no user-supplied HTML or `eval` path.

## Time and lifecycle

The simulation receives elapsed time from one browser-owned animation loop and runs
fixed 120 Hz ticks. A frame contributes no more than 100 ms. Page visibility and window
blur pause explicitly rather than consuming the player's clock in the background.

Gyral subscriptions end when controls disconnect. The chamber disconnects its resize
observer and event listeners, disposes its graphics resources, and releases its WebGL
context. HMR and ordinary page exit close the session and audio context. A cached page
pauses and keeps its resources for restoration.

WebGL 2 is required to play. Failure to create a context displays an explanation and
a retry button beside the persistent rules. Context loss pauses the session and blocks
start, resume, and placement. A canvas restoration event rebuilds all renderer resources,
including generated environment textures. The player can also retry manually if the
browser does not restore automatically. Both paths preserve the run and require explicit
resume. Native context loss/restoration is exercised in Chromium with the
[WebGL testing extension](https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_lose_context/restoreContext).
GPU performance is not established by headless software-rendering tests.

## Persistence and dependencies

Only a numeric best score is stored under `jezzball.best.v1`. Reading requires a safe,
nonnegative integer. Read/write failures are caught and do not stop play. This is a
convenience score, not an authenticated result or a security boundary.
The original key is retained under the Containment name so existing best scores survive.

Gyral artifacts are pinned with source provenance and SHA-256 sums. Other packages are
fixed by `package-lock.json`; `npm ci` is the reproducible install path. The source has
no credentials and needs no environment secrets. A deployment should choose its real
origin and HTTP headers before adding origin-dependent metadata or a service worker.

Beads history currently lives in the local embedded Dolt database. No remote backup
destination is configured. See [development](../development.md) before moving machines.
