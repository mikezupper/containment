# Development

Use Node 24.15 or a later Node 24 release and npm. `npm ci` restores the exact lockfile.
Gyral is installed from local tarballs; the other dependencies come from npm. A network
connection is needed for uncached installation. The running game makes no API requests.

| Command | Result |
| --- | --- |
| `npm run dev` | Local Vite development server with HMR |
| `npm run check` | Types, Gyral lint, architecture checks, vendor hashes, tests, build |
| `npm run test:unit` | Deterministic rule and session tests |
| `npm run test:browser` | Gyral and WebGL widget tests in Chromium |
| `npm run verify:browser` | Production-page Playwright/axe checks and screenshots |
| `npm run verify:compatibility` | Production touch play and responsive checks in Chromium, Firefox, and WebKit |
| `npm run verify:hardware` | Graphics lifecycle checks in headed, installed Chrome; rejects software renderers |
| `npm run build:runtime` | Compile the private workspace's JavaScript and declarations |
| `npm run verify:package` | Pack/install/typecheck the workspace and exercise real Containment/Greed session consumers |
| `npm run preview` | Serve the current production build |

Install the browser with `npx playwright install chromium` when needed. Browser checks
use software WebGL in headless Chromium; manual hardware testing is still useful for
visual quality and device performance. `verify:browser` starts its own preview on port
4173. Set `CONTAINMENT_URL` to inspect an already running server instead.
The former `JEZZBALL_URL` variable remains a fallback for existing scripts.
`verify:compatibility` uses port 4174 and requires `npx playwright install firefox webkit`.
Its WebKit result does not substitute for shipping Safari or a physical iPhone test.
The compatibility run includes nine phone sizes from 320 × 568 to 844 × 390, plus
expanded settings, visible 44-pixel controls, hit testing, and paused canvas resizing.
The hardware command requires installed Google Chrome, a working graphical display,
and an identifiable hardware WebGL renderer. It records five checks under
`artifacts/hardware/` and prints the renderer. It is separate from the portable checks.

For a physical phone on the same network, run `npm run build`, then
`npm run preview -- --host 0.0.0.0 --port 4176 --strictPort`. Open the network URL Vite
prints on the phone. This serves the production build, without development source or
test interfaces. Stop the preview after testing. Record device, OS/browser versions,
portrait/landscape screenshots, touch behavior, background/resume, and graphics recovery
in the Beads issue before claiming device validation.

The private runtime workspace builds before dev, typechecking, and the production
build. If changing its source during an active dev session, run `npm run build:runtime`
to refresh its compiled exports. The package verification uses port 4175, temporary
files, and the sibling `../greed-dice-game` checkout; set `GREED_REPO` for another path.
It installs that game's pinned Zod and the vendored Gyral peer into the temporary
consumer, leaving both sibling source and dependencies untouched.

## Tracking and handoff

Read the local Beads skill, run `bd prime` and `bd ready`, and claim an issue before
implementation. Record discoveries as dependent Beads issues. Put completed validation
in issue notes, then close the issue with a concrete reason. Do not mark unfinished
work complete or hide it in a documentation checklist.

The initial build uses issue `jezz-6gx`. Beads runs with an embedded Dolt database under
`.beads/`. `no-git-ops: true` prevents later Beads commands from committing or pushing.
The initial `bd init` created a metadata-only bootstrap commit automatically. The owner
subsequently authorized committing and publishing the project to
`https://github.com/mikezupper/containment`. Later commits still require task authorization.

GitHub issues and PRs provide public contribution intake; maintainers use Beads for
implementation tracking and link public requests. Human contributors do not need the
local database. CI uses manually operated self-hosted runners; see [the runner guide](self-hosted-ci.md).
Static hosting is described in [deployment](deployment.md).

No Dolt remote or backup destination is configured. The database is available on this
machine; git alone does not preserve its issue history. Use Beads-native backup/sync
when a real destination is chosen. A JSONL export, if produced for a viewer, is not the
live database and is not a full backup.

## Skill and framework updates

Local skills and their reference material live under `.agents/skills`; their source
paths and versions are recorded in `.agents/SOURCES.md`. The Semantic HTML entry was
renamed from upstream `skills.md` to `SKILL.md` so agents can discover it consistently.
Its CSS/JavaScript restriction is explicitly superseded by this project's user request.

To change Gyral, obtain a new reproducible set of artifacts from its source checkout,
record the source commit and packaging date, and update the lockfile and tests together.
Do not replace an artifact in place while retaining an old checksum. The existing
`SOURCE.json` describes the original packaging run; only core and testing are vendored
here, exactly as in Greed.
