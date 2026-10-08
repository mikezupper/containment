# First playable build: 8 October 2026

Verified locally with Node 24.15.0, npm 11.12.1, and headless Chromium. The final
production browser report was generated at 11:25 UTC. Work is recorded in Beads
issue `jezz-6gx`.

Later results are recorded in [mobile, graphics recovery, and runtime extraction](2026-10-08-mobile-and-runtime.md).
The limits below describe this initial milestone.

## Results

| Check | Evidence |
| --- | --- |
| Reproducible install | `npm ci` completed; npm reported zero known vulnerabilities |
| Types and Gyral lint | `npm run check` passed |
| Architecture and vendor integrity | Import boundaries and all three Gyral SHA-256 entries passed |
| Rules, session, and browser components | 18 tests passed in three files: 16 unit/model tests and two Chromium tests |
| Production build | Vite build completed without warnings |
| Desktop page | 1440 × 1100; ready and paused states passed axe A/AA audit and overflow checks |
| Narrow layout | 720 × 900 passed overflow and axe checks |
| Mobile touch | 390 × 844, touch enabled; start, rotation, tap placement, and pause passed |
| Preferences | Dark theme and reduced motion passed the production-page audit |
| Input and persistence | Keyboard wall construction, cleared-cell score, frozen paused clock, rotation, blur pause, and best-score reload passed |
| No JavaScript | Initial HTML retained the game description, rules, and controls guide |
| Browser console | No errors or warnings in the verification report |
| HTML conformance | Nu HTML Checker 26.10.7 returned an empty messages array for `dist/index.html` |
| Renderer size | Lazy Three.js chunk measured 131.1 KiB gzip against a 150 KiB budget |
| Documentation links | All local links in project documentation resolved |

The commands were `npm ci`, `npm run check`, and `npm run verify:browser`. Production
HTML was submitted to the [Nu HTML Checker](https://validator.w3.org/nu/) using its JSON
endpoint. Its response is saved at `artifacts/html-validation.json`. The Playwright
report and desktop, paused, dark, and mobile screenshots are in `artifacts/browser/`.
Those screenshots were inspected after the final lighting changes.

The capture tests cover both wall orientations and the case where a completed half
survives failure of the other. A boundary regression confirms that a completed starting
cell never encloses a ball. Seeded replay and fixed-frame grouping produce equal
snapshots; old snapshots remain unchanged.

## Practical limits

These are Chromium software-rendering results, rather than physical phone or GPU
measurements. Safari and Firefox have not been verified. The narrow viewport represents
the layout width of 200% zoom, rather than a direct browser-zoom test. Axe does not
establish full accessibility of a visual timing game.

Physical-device play, more convenient mobile controls, and WebGL context restoration
are tracked in `jezz-s0s`. Historical fidelity calibration is tracked in `jezz-3gt`.
The three-game npm package evaluation is tracked in `jezz-yu5`. The first milestone
does not publish or deploy the application or a package.
