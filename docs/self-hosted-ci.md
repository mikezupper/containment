# Manually operated self-hosted CI

Every job uses `[self-hosted, linux, x64, containment]`. There is no GitHub-hosted
runner fallback. GitHub coordinates the queue and stores logs/artifacts; checks and
builds execute on a local runner that the maintainer starts in a terminal.

## Register a runner once

Keep runner software and credentials outside this checkout, for example at
`~/.local/share/github-actions/containment`. Use an ordinary user account. Install
the Linux x64 runner from **Settings → Actions → Runners → New self-hosted runner**
in [mikezupper/containment](https://github.com/mikezupper/containment/settings/actions/runners).
Use GitHub's download and checksum instructions for the current release.

During configuration, select this repository's URL and add the custom label
`containment` alongside the default `self-hosted`, `linux`, and `x64` labels. Give it
a recognizable name, such as `containment-local`. The short-lived registration token
belongs only in the local configuration command. Keep credentials out of source control.

Do not install a background service. Operate the runner through `run.sh`. The host needs
Playwright's browser system libraries. Install them once when preparing the machine,
using `npx playwright install-deps chromium firefox webkit` from a project checkout
with npm dependencies installed. This may need elevated installation privileges.
Workflow jobs install browser binaries without `sudo`.

npm downloads and browser binaries reuse the host's local caches. Both workflows
disable setup-node's remote package-manager cache; they do not archive or upload
the machine's shared npm cache to GitHub. Browser verification reports and screenshots
are still uploaded as workflow artifacts.

## Start, drain, stop

In the runner directory:

```sh
./run.sh
```

Leave that terminal open while jobs execute. Pushes to `main` queue CI. If the runner
was offline, queued jobs begin when it connects. CI installs locked dependencies,
uses `.nvmrc`, runs standard and production checks, and uploads evidence. No
`.env.local` file or development-host settings are required in the runner checkout.

Inspect the queue from another terminal:

```sh
gh run list --repo mikezupper/containment --limit 20
```

After there are no queued or running jobs and the runner says it is listening for
jobs, press **Ctrl+C** in its terminal. Wait for it to exit. Stopping during a job can
cancel that job; let it finish first. The registration remains for the next manual
session. A queued run can expire while offline; rerun it if needed.

## Review pull requests before running their code

This is a public repository backed by a local machine. The workflow deliberately has
no automatic `pull_request` or `pull_request_target` trigger. Review the patch,
workflows, install scripts, and dependencies before allowing that commit to execute.
An npm install or test can execute code with the runner user's access.

After review, get the PR's current full commit SHA and dispatch CI from trusted `main`:

```sh
gh pr view 42 --repo mikezupper/containment --json headRefOid --jq .headRefOid
gh workflow run ci.yml --repo mikezupper/containment --ref main -f revision=REVIEWED_FULL_COMMIT_SHA
```

Replace `42` and the SHA placeholder. The workflow accepts a full 40-character SHA,
checks out that exact revision, and records the tested commit in the run summary.
If the contributor pushes another commit, review and test that new SHA. Link the run
when reviewing the PR; a manual run does not automatically attach checks to its head.

A dedicated runner user or isolated machine provides stronger separation from
personal files and credentials. Checkout does not persist Git credentials, CI jobs
have read-only repository access, and actions are pinned to full commit hashes. The
maintainer decides whether a reviewed change is appropriate to run locally.

## Deployments and maintenance

The Pages workflow also uses the local runner and runs only by manual dispatch. It
has scoped publishing permissions; see [deployment](deployment.md). CI's read-only
token does not deploy the site. Keep the runner current and retain full action pins
when updating workflows. Runner credentials, workspaces, caches, and diagnostics
are local state, separate from Git and the game's Beads database.
