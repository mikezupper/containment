# Xode CI workers

Every job uses `xode-linux-x64` through this repository's personal registration in the shared
Xode fleet. There is no GitHub-hosted fallback. GitHub coordinates jobs and stores logs; checks
and builds execute in fresh workers on the existing US and EU hosts. No runner is installed on
the development machine.

## Runtime and cleanup

The private `mikezupper/xode-actions-runners` repository owns registration, guards and operations.
Each region provides two slots. Every job gets its own bounded workspace and Docker daemon;
the fleet removes its workspace, images and build caches after the runner process exits. The
workflows install Node from `.nvmrc`; CI also installs all three Playwright browsers and their
system dependencies. Nothing depends on workstation toolchains or shared dependency caches.

Pushes to `main` and maintainer manual dispatches run CI. Failure reports and screenshots are
retained as workflow artifacts for one day and still count toward GitHub storage quota. Inspect
runs with:

```sh
gh run list --repo mikezupper/containment --limit 20
```

## Review pull requests before running their code

This is a public repository backed by trusted-code workers. Never add `pull_request` or
`pull_request_target` triggers. The fleet's mandatory job-start hook rejects those events before
actions execute. Review the patch, workflows, install scripts and dependencies before allowing
that commit to execute. Workers share the host kernel; they are not for unreviewed public code.

After review, get the PR's exact commit and dispatch CI from trusted `main`:

```sh
gh pr view 42 --repo mikezupper/containment --json headRefOid --jq .headRefOid
gh workflow run ci.yml --repo mikezupper/containment --ref main -f revision=REVIEWED_FULL_COMMIT_SHA
```

Replace `42` and the SHA placeholder. The workflow validates the full 40-character SHA, checks
out that revision and records it in the run summary. Review and test a new SHA if the contributor
pushes again. A manual run does not automatically attach checks to that PR's head.

## Deployments and maintenance

The Pages workflow also uses Xode and runs only by manual dispatch. Its publishing permissions
remain scoped; see [deployment](deployment.md). CI's read-only token does not deploy the site.
Actions retain their full commit pins and checkout does not persist Git credentials. Changing
runner routing does not activate Pages or authorize a deployment. Do not reinstall the retired
workstation runner or restore its old credentials.
