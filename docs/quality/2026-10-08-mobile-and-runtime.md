# Mobile, graphics recovery, and runtime extraction: 8 October 2026

This pass follows the [first playable build](2026-10-08-first-playable.md). It improves
mobile control access, handles graphics interruption, and tests a private shared runtime
against real sessions. Verification used Node 24.15.0 and npm 11.12.1 locally.

## Verified changes

The console precedes the chamber and becomes a compact sticky panel on narrow screens.
Pause and orientation remain visible during the tested play layouts. Secondary settings
are collapsed in native details. The 844 × 390 landscape view uses a side panel, and
its clock stays on one line.

Real WebGL loss pauses and blocks play. Automatic restoration recreates all graphics
resources, while a visible retry button supports manual recreation. Both preserve balls,
construction, and simulation tick, and require explicit resume. A cancelled touch cannot
place a wall from stale coordinates. Resize now redraws the existing scene while paused;
this fixes the cleared canvas found during screenshot review.

The private package supplies snapshot observation and Gyral watch/action wiring. JezzBall
uses it directly. An isolated consumer installs the packed archive and runs copied,
unchanged JezzBall and Greed local session code. Rules, renderer, clocks, and resource
ownership remain in their games. Nothing was published to npm.

## Evidence

| Command | Result |
| --- | --- |
| `npm ci` | Reproducible install; zero known vulnerabilities reported |
| `npm run check` | Types, Gyral lint, layer/vendor checks, 27 tests in five files, and production build passed |
| `npm run verify:browser` | Production Chromium keyboard/touch, persistence, real GPU loss/manual recovery, no-JavaScript rules, responsive layouts, and light/dark axe A/AA checks passed; no console warnings/errors |
| `npm run verify:compatibility` | Chromium 153.0.8010.12, Firefox 155.0, and WebKit 26.6 passed touch construction, score, pause, rotation, portrait/landscape layout, and light/dark axe A/AA checks |
| Paused landscape resize | All three engines retained visible chamber pixels after resizing; pixel checks reject a cleared canvas; screenshots inspected |
| `npm run verify:package` | Packed files and declarations, core without Gyral, both real session contracts, actual Start actions, and namespaced driver isolation passed |
| Documentation links | Local links in project Markdown resolved |

Generated reports live at `artifacts/browser/report.json`,
`artifacts/compatibility/report.json`, and `artifacts/package/report.json`. Screenshots
are beside the corresponding reports. These local artifacts are ignored by git. The
package report includes archive integrity and source hashes for both session consumers.
Unit and Chromium component tests cover observation filtering, asynchronous failures,
provider isolation, unsubscribe, native GPU restoration, and manual retry.

The lazy Three.js chunk remains 131.1 KiB gzip against its 150 KiB budget. Screenshot
inspection covers desktop, portrait WebKit, landscape Firefox, and the interrupted
graphics state. Pixel checks supplement that review; they are not an image-quality metric.

## Limits

These are automated desktop engines with touch emulation, including software-rendered
Chromium. WebKit testing is [distinct from testing shipping Safari](https://playwright.dev/docs/browsers#webkit).
Physical phones, actual Safari, GPU performance, battery use, and thermal behavior remain
unverified in this pass. The later [device-readiness record](2026-10-08-device-readiness.md)
adds desktop-GPU evidence and records the owner's waiver of physical-phone and actual
Safari testing for closure of `jezz-s0s`. Axe does not establish complete nonvisual
playability of a timing-based visual game.

The Greed proof exercises its actual lobby-to-opening transition, not its dice worker,
network rooms, or a production migration. Sabacc has been compared but still needs its
game-owned aggregate adapter. Public naming, licensing, and a stable Gyral dependency
strategy remain release decisions.

The owner closed `jezz-3gt` on 8 October 2026 because original-game timing and collision
calibration is no longer required. The
[calibration record](../references/original-calibration.md) identifies confirmed help
rules and unresolved executable measurements. No historical tuning was changed based
on inference alone. Deployment remains unconfigured until a real host and origin exist.
