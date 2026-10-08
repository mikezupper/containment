# Harness principles

The user supplied Ryan Lopopolo's “Harness engineering: leveraging Codex in an
agent-first world” (11 February 2026) as a local Markdown reference.
This repository applies its guidance to a small browser game. The local file is the
source used here; this document does not claim to reproduce every practice in the article.

## Make the repository explain itself

`AGENTS.md` is a short map to the architecture, skills, product rules, and checks.
The documentation index leads to focused records. Decisions explain why a boundary
exists, and product rules distinguish verified history from remake tuning. A future
agent should not need this conversation to discover those constraints.

Beads owns active work and handoff state, as the user requested. Documentation records
the design and verification evidence. This substitutes Beads issues for markdown
execution-task lists without losing the article's principle of explicit work state.

## Enforce the useful constraints

The boundary check keeps game rules free from browser and rendering dependencies.
TypeScript checks message and snapshot shapes. Gyral lint and template compilation
check effect and view conventions. SHA-256 verification protects the vendored framework
provenance. A committed npm lockfile fixes the installed dependency graph.

These checks give concrete remediation text when possible. They are kept small enough
to read and run locally; no separate orchestration service is needed to start building.

## Make the result observable

The production-page script drives a real Chromium browser, exercises controls, audits
accessible DOM, and captures screenshots. Unit tests make simulation failures reproducible
from seed and tick. Visible phase attributes expose the game phase to browser checks
without introducing a production debug panel or mutation API.

The first build was local-only. The public repository now adds manually operated
self-hosted CI and an optional deployment workflow. Hosted traces, external metrics, distributed agent review,
and a release pipeline are not prerequisites for validating this scope. They should be
added when the deployment and operations needs are concrete.
