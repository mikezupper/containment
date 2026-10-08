# Working in Containment

This is a local-first browser game: Gyral controls, a deterministic territory-capture engine,
and a fixed-camera Three.js chamber. Start with [README.md](README.md) and
[ARCHITECTURE.md](ARCHITECTURE.md). The repository holds the decisions needed to work here.

## Work tracking

Read [.agents/skills/beads/SKILL.md](.agents/skills/beads/SKILL.md), then run `bd prime`
and `bd ready`. Run `bd prime` again after context compaction. Beads is the sole task
tracker; do not add TODO files, markdown task checklists, or a second tracker.
Create a described issue with acceptance criteria before new implementation work.
Claim it with `bd update <id> --claim`. Close only completed work with a reason.
The initial playable build is tracked in `jezz-6gx`.

GitHub issues and pull requests are public intake, linked to accepted Beads work by
maintainers. Human contributors do not need Beads. CI uses manually started self-hosted
runners only; read [the runner policy](docs/self-hosted-ci.md) before changing triggers
or runner labels. Keep machine-specific environment files out of Git.

Do not commit or push without an explicit user request. Beads has `no-git-ops: true`.
Its Dolt database is local; exports are interchange, not durable sync. See
[the development guide](docs/development.md).

## Required skills

Load the relevant local skill before changing its area:

- [Gyral](.agents/skills/gyral/SKILL.md): every `@gyral/*` change. Read references on demand.
- [Modern CSS](.agents/skills/modern-css/SKILL.md): styles and responsive presentation.
- [Semantic HTML](.agents/skills/semantic-html/SKILL.md): document structure and controls.
- [Google SEO](.agents/skills/google-seo/SKILL.md): public page content and search metadata.
- [Sense of Style](.agents/skills/sense-of-style/SKILL.md): all prose, including interface copy.
- [Beads](.agents/skills/beads/SKILL.md): tracking and session handoff.

The user's interactive 3D game request overrides Semantic HTML's static/no-CSS/no-JS
constraint. Keep its semantic and accessibility guidance. A public domain is not
configured: do not invent canonical URLs, a sitemap host, or social-image URLs.
Skill origins and licenses are recorded in [.agents/SOURCES.md](.agents/SOURCES.md).

## Commands and constraints

Use Node 24 (`.nvmrc`), `npm ci`, and the committed npm lockfile. `npm run dev`
serves the app locally. `npm run check` runs types, Gyral lint, layer and vendor
checks, unit/browser tests, and the production build. `npm run verify:browser`
drives the production preview with Playwright and axe; install Chromium first
with `npx playwright install chromium` if it is missing.
`npm run verify:compatibility` checks Chromium, Firefox, and WebKit. `npm run verify:package`
tests the private workspace's packed exports against Containment and the sibling Greed checkout.

Keep changes within the layer rules in [ARCHITECTURE.md](ARCHITECTURE.md).
Rules and session code must not read a browser, wall clock, storage, or global
random source. Gyral reducers/views remain pure; actions use provided drivers.
Three.js belongs in `src/rendering`. Do not add Rapier for planar ball collisions.
Every renderer, listener, subscription, and browser resource needs an owner and cleanup.

Prefer tests for rules, boundaries, and lifecycle behavior. Exercise UI changes
in Chromium. Inspect screenshots; passing a DOM test does not prove the game is visible.
Keep console output clean. Do not weaken a failing check to make a change pass.

## Repository map

- [Documentation index](docs/README.md): product, design, decisions, and quality evidence.
- [Rules and tuning](docs/product/rules.md): implemented behavior and historical differences.
- [Original JezzBall research](docs/references/jezzball-details.md): sourced historical detail.
- [Package proposal](docs/references/game-architecture-and-reusable-package.md): shared-code advice.
- [Private runtime workspace](packages/game-runtime/README.md): core observation and optional Gyral bridge.
- [Harness principles](docs/design/harness.md): application of the supplied engineering article.
- [Quality guide](docs/quality/README.md): checks, limits, and verification evidence.

Update the corresponding docs when behavior or architecture changes. Track unfinished
work in Beads, with dependencies and concrete acceptance criteria.
