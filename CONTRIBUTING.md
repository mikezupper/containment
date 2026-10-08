# Contributing to Containment

You can contribute code, documentation, bug reports, browser evidence, or accessibility
feedback. Small, focused changes are easier to review. Discuss new game modes, public
package APIs, and large dependencies before implementing them.

## Report a problem or propose a change

Search [existing issues](https://github.com/mikezupper/containment/issues) first. For a
bug, include reproduction steps, expected and actual behavior, browser/OS versions,
viewport or device details, and relevant screenshots or console messages. Explain
which part of play failed: placement, collisions, capture, controls, layout, or graphics.
Keep credentials and private information out of reports.

For a feature, explain the player or contributor problem and proposed behavior.
Historical JezzBall references are useful context, but exact emulation is not a current
requirement. Use [Discussions](https://github.com/mikezupper/containment/discussions)
for questions. Report vulnerabilities privately through [SECURITY.md](SECURITY.md).

## Set up a checkout

Fork the repository, clone your fork, and create a branch from `main`.

```sh
nvm use
npm ci
npx playwright install chromium firefox webkit
npm run dev
```

Node 24.15 or later in the Node 24 line is required. nvm is optional if you already
have a compatible installation. On Linux, `npx playwright install-deps` can install
missing system libraries and may require elevated installation privileges. No API keys,
backend, sibling repositories, Beads, or AI tools are needed for standard contributions.

## Follow the boundaries

Read [ARCHITECTURE.md](ARCHITECTURE.md) and the relevant [project docs](docs/README.md).

- Keep rules and session logic deterministic and free of browser globals, storage,
  wall-clock reads, and global random sources. Pass explicit inputs and seeds.
- Use typed messages and Gyral drivers. Reducers and views stay pure.
- Keep Three.js in `src/rendering`. Rendering must not decide collisions, captures,
  or scores. The board stays planar and the camera fixed.
- Give listeners, subscriptions, animation loops, audio, and graphics resources
  clear ownership and cleanup. Preserve pause and recovery behavior.
- Prefer native semantic controls, visible keyboard focus, light/dark themes,
  readable status text, and at least 44-pixel touch-control heights.
- Use the existing CSS layers and tokens. Check narrow portrait and short landscape
  layouts; do not hide overflow to conceal a broken layout.
- Keep runtime extraction small. New shared APIs need concrete consumers with matching
  behavior; rules and rendering remain game-owned.

Dependencies are locked with npm. Include lockfile changes when changing dependencies.
Vendored Gyral tarballs must remain reproducible: update provenance, hashes, and tests
together. Explain new runtime dependencies in the pull request.

The [vendored skills](.agents/SOURCES.md) document the project's Gyral, CSS, HTML, SEO,
writing, and tracking practices. Coding agents follow [AGENTS.md](AGENTS.md). Human
contributors can consult these references without adopting an agent workflow.

## Validate your change

Run `npm run check` before opening a pull request. Add focused regression tests for
changed rules, boundaries, or lifecycle behavior. Documentation-only changes need
accurate commands and working links rather than new unit tests.

For interface, input, or graphics changes, also run:

```sh
npm run verify:browser
npm run verify:compatibility
```

Inspect screenshots under `artifacts/`, check the browser console, and describe the
states reviewed. Distinguish automated audits and viewport emulation from manual or
physical-device checks. Include screenshots in the PR when useful.

`verify:hardware` and `verify:package` are optional checks with extra prerequisites,
documented in the [development guide](docs/development.md). CI requires neither a
physical device nor the owner's Greed checkout.

## Open a pull request

Explain the problem, resulting behavior, and validation. Link the public issue when
one exists. Keep unrelated formatting or dependency changes out of the patch. Update
the rules or architecture docs when their contract changes. Use a clear commit title;
no special prefix or signed-off commit is required.

CI runs on a manually started self-hosted runner. Public pull requests do not execute
automatically on the maintainer's machine. A maintainer reviews the exact commit and
dispatches CI for that commit; a queued run waits until the runner is online. Include
your local validation results while awaiting review. See [the runner guide](docs/self-hosted-ci.md).

GitHub issues are public intake and discussion. Maintainers record accepted implementation
work in Beads and link the related issue or PR. The local Dolt database is ignored by
Git and is not required in contributor clones. Do not commit databases, generated builds,
browser artifacts, credentials, or private source material.

You are responsible for understanding and verifying your contribution, including code
produced with assistance. Disclose material tool assistance when it helps a reviewer.
By submitting a contribution, you agree to license your original changes under MIT
and confirm that you have the right to contribute them. Preserve third-party notices.
No separate contributor license agreement is required.
