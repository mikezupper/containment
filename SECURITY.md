# Security policy

## Supported code

Security fixes target the current `main` branch. There are no supported older release
lines yet. The game is a static browser application without accounts, a backend, or a
public leaderboard. Its local best score is not an authenticated result.

## Report a vulnerability privately

Use [GitHub's private vulnerability reporting](https://github.com/mikezupper/containment/security/advisories/new).
Include the affected commit, reproduction steps or a small proof of concept, expected
impact, and relevant browser versions. Remove credentials and other people's personal
information from attachments.

Avoid public issues or pull requests containing an undisclosed vulnerability. If the
private reporting form is unavailable, use the **Get In Touch** link on the
[maintainer's website](https://mikezupper.com/) to arrange a private report.

The maintainer will assess the report, work on a fix where applicable, and coordinate
disclosure with the reporter. This is a small volunteer project; no response-time SLA
or bug bounty is offered.

Ordinary gameplay bugs and graphics-driver limitations belong in the issue tracker.
Do not test against other people's systems or data. See the
[reliability notes](docs/quality/reliability-and-security.md) and
[self-hosted runner policy](docs/self-hosted-ci.md) for current boundaries.
