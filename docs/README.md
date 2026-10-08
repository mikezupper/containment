# Containment documentation

Start with the [architecture](../ARCHITECTURE.md) for code ownership and the
[development guide](development.md) for commands and tracking.

| Document | Purpose |
| --- | --- |
| [Rules and tuning](product/rules.md) | Current game behavior and explicit remake choices |
| [Presentation and accessibility](design/presentation.md) | Chamber, input, layout, and accessibility decisions |
| [Harness principles](design/harness.md) | How the engineering article shapes this repository |
| [Initial architecture decision](decisions/0001-local-session-and-3d-chamber.md) | Why Gyral, a pure engine, and a separate renderer |
| [Private package decision](decisions/0002-private-session-bridge.md) | Why observation and Gyral wiring are shared, while clocks and rules stay local |
| [Game naming decision](decisions/0003-containment-name.md) | Containment branding, historical attribution, and compatibility identifiers |
| [Quality and evidence](quality/README.md) | Verification commands, evidence, and practical limits |
| [Self-hosted CI](self-hosted-ci.md) | Start the local runner, review PR commits, drain jobs, and stop |
| [Deployment](deployment.md) | Static builds, base paths, hosting, and optional manual Pages deployment |
| [Reliability and security](quality/reliability-and-security.md) | Lifecycle, persistence, and trust boundaries |
| [Original JezzBall](references/jezzball-details.md) | Sourced rules, appearance, and historical uncertainties |
| [Calibration evidence](references/original-calibration.md) | Original artifact hashes, confirmed rules, and limits of historical timing evidence |
| [Reusable package proposal](references/game-architecture-and-reusable-package.md) | Comparison of Greed, Sabacc, and a possible npm package |

Beads owns implementation tasks and their status. Documentation records decisions,
contracts, and verified behavior, rather than maintaining a parallel task list.
