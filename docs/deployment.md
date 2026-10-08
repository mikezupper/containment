# Deploying Containment

Containment is a static browser application. Build with Node 24 and npm, then serve
the contents of `dist/` over HTTPS. No backend, database, runtime environment file,
or API key is needed. Browsers need JavaScript and WebGL 2 to play; the rules remain
readable without JavaScript.

## Build for your host

For a domain root:

```sh
npm ci
npm run build
npm run preview
```

For a project path such as `/containment/`:

```sh
npm run build -- --base=/containment/
npm run preview -- --base=/containment/
```

Open the preview URL with the project path. Vite rewrites bundled assets to match the
base; the home link, favicon, and license link also use it. Keep all of `dist/`,
including `third-party-notices.txt`, together. `vite preview` verifies a build locally;
it is not the production server. See [Vite's deployment guide](https://vite.dev/guide/static-deploy.html).

For a host with a Git integration, use `npm ci && npm run build` as the build command,
Node 24 as the runtime, and `dist` as the output directory. Pass the appropriate
`--base` for a subpath. No server-side route rewrite is needed for this single page.
Use short cache lifetimes for HTML and long immutable caching for hashed assets.

## Optional GitHub Pages deployment

The [Pages workflow](../.github/workflows/pages.yml) builds and deploys on the manually
operated local runner; it does not use a GitHub-hosted runner. If enabled, the website
is hosted by GitHub Pages. Creating or pushing the repository does not activate it.

A maintainer can enable it as follows:

1. In **Settings → Pages**, select **GitHub Actions** as the deployment source.
2. Start the local runner as described in [self-hosted CI](self-hosted-ci.md).
3. Run **Deploy Pages** from the Actions tab, selecting trusted `main`, or run
   `gh workflow run pages.yml --repo mikezupper/containment --ref main`.
4. Wait for deployment and use the URL reported by the workflow.
5. Let the remaining queue drain, then stop the foreground runner.

The workflow derives the project base from the repository name. A custom domain needs
a root-base build and domain configuration; update the workflow accordingly. Review
[GitHub's workflow requirements](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
when changing Pages permissions or artifacts.

## Verify and update

Run `npm run check`, `npm run verify:browser`, and `npm run verify:compatibility` before
publishing a changed game. Verify subpath builds at the actual path, including the
home link, favicon, lazy renderer chunk, and notices. Set `CONTAINMENT_URL` to an
existing local preview's full URL when invoking browser checks.

Choose a real public origin before adding canonical URLs, `og:url`, or hosted share
images. Keep development hostnames and machine-specific `.env.local` values out of Git
and deployment artifacts. Serve the built files rather than the Vite dev server.
Retain a previous successful build or commit for rollback. There is no database
migration; a user's local best score stays in their browser.
