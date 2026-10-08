# Device readiness: 8 October 2026

This follow-up completes Beads issue `jezz-s0s` with an owner waiver for physical-device
and actual Safari testing. The available machine is Linux with an
NVIDIA GeForce GTX 1650. The owner confirmed that no physical phone is available for
testing. No shipping Safari or iOS run is claimed.

## Changes and checks

The smallest portrait layout previously clipped the board's bottom, and 568 × 320
landscape placed the board below the controls. The short-screen sidebar now starts at
480 pixels wide, uses a flexible width, and preserves its heading for assistive
technology while hiding it visually on very short screens. Narrow portrait boards have
a viewport-based height cap. These fixes retain the full board and reachable controls.

The compatibility command now checks 320 × 568, 360 × 640, 375 × 667, 390 × 844,
414 × 896, 430 × 932, 568 × 320, 667 × 375, and 844 × 390 in each browser engine.
It checks document width, board visibility, native hit targets, minimum 44-pixel button
height, settings expansion, and visible rendered pixels after paused resizing. The live
touch path and light/dark accessibility audits run before the paused geometry comparison.

`npm run verify:hardware` runs the existing component/input and graphics-recovery suite
in installed, headed Chrome. It rejects an unidentified or software renderer. The actual
renderer was `ANGLE (NVIDIA Corporation, NVIDIA GeForce GTX 1650/PCIe/SSE2, OpenGL 4.5.0)`
in Chrome 155.0.8059.39. All five hardware checks passed, including automatic restoration,
manual retry, retained balls/construction/tick, blocked resume, and cancelled touch.

`npm run check` passed all 27 standard tests and the build. Production Chromium checks
passed, including real context loss and manual recovery. The nine-size compatibility
matrix and hardware report are generated under `artifacts/compatibility/` and
`artifacts/hardware/`. Screenshots are reviewed alongside layout and pixel assertions.

## Physical-device acceptance

On 8 October 2026, the owner waived physical-phone and actual Safari testing and
requested closure of `jezz-s0s`. The completed browser, layout, and desktop-GPU checks
support that closure. Physical-phone and shipping Safari behavior remain unverified;
no phone, remote device service, or Safari host is configured in this environment.

## Optional future physical-device validation

The [development guide](../development.md) explains how to serve the production build
on the local network when a device is available. On that phone, start a run, tap to
build, change direction, pause, rotate the device, and resume. Confirm the whole chamber
and primary controls remain reachable. Background the browser and return; the run should
stay paused until explicitly resumed. Record the device model, OS/browser versions,
viewport orientation, observed failures, and screenshots in the Beads issue.

For a controlled graphics-loss check, use the phone's remote inspector to call the
canvas WebGL context's `WEBGL_lose_context.loseContext()`, retain the extension object,
and later call `restoreContext()`. Verify the clock and scene remain paused, the canvas
is recreated, and play resumes only after a player action. The manual retry path should
behave the same way. If the extension is unavailable, record that limit rather than
calling the check passed. See [MDN's restoration example](https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_lose_context/restoreContext),
[WebKit's iOS remote-inspection setup](https://webkit.org/web-inspector/enabling-web-inspector/),
and [Chrome's Android remote-debugging guide](https://developer.chrome.com/docs/devtools/remote-debugging).
