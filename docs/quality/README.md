# Quality checks

`npm run check` checks types, Gyral lint and templates, import boundaries, vendored
checksums, pure model behavior, real-browser components, and production output. The
rule tests cover seeded replay, independent half failures, partial-wall retention,
multi-component capture, solid-cell and ball collisions, area scoring, progression,
pause, expiry, and sustained simulation invariants.

`npm run verify:browser` checks the built page in Chromium: desktop, narrow layout,
mobile touch, dark theme, and reduced motion. It audits WCAG A/AA rules with axe, checks
overflow and console output, builds a wall with the keyboard, checks capture points,
pausing, rotation, and local best-score persistence, and reads rules without JavaScript.
It saves screenshots and a JSON report under `artifacts/browser/`.

`npm run verify:compatibility` adds touch construction and portrait/landscape play in
Chromium, Firefox, and WebKit. It checks visible chamber pixels after paused resize,
layout, the single-line clock, console errors, and light/dark axe A/AA results. Its
reports and screenshots are under `artifacts/compatibility/`. This is desktop engine
automation; physical-device and shipping Safari behavior remain unverified.

`npm run verify:hardware` runs the graphics/input lifecycle suite in headed, installed
Chrome and checks that WebGL identifies a hardware renderer. This exercises exact-state
recovery on the available desktop GPU; it does not establish phone GPU or Safari behavior.
Results are in `artifacts/hardware/report.json` and the renderer is printed in the terminal.

`npm run verify:package` installs the packed private workspace into a temporary consumer.
It loads the core without Gyral, typechecks real Containment/Greed sessions, and drives both
through the Gyral bridge in Chromium. Evidence is under `artifacts/package/`.

The 720-pixel viewport checks layout at the effective width of a 1440-pixel display
zoomed to 200%. It is not a claim that every browser's zoom implementation has been
tested. Axe catches many DOM problems; it does not establish complete accessibility
or nonvisual playability. See [presentation](../design/presentation.md).

## Evidence

The [8 October 2026 first-build record](2026-10-08-first-playable.md) reports the
initial checks and observed limits. The later [mobile and runtime record](2026-10-08-mobile-and-runtime.md)
records graphics recovery, cross-engine play, and the packed-consumer experiment.
The [device-readiness record](2026-10-08-device-readiness.md) adds smaller phone layouts
and a real desktop-GPU run. It records the owner's waiver of physical-phone and actual
Safari testing for closure of `jezz-s0s`.
Browser artifacts are generated locally rather
than committed. Keep future evidence dated and tied to the command that produced it.
Beads holds any incomplete work.
