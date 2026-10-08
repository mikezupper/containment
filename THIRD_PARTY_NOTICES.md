# Third-party notices

The root MIT license covers Containment's original code and project documentation.
The materials below retain their own licenses and attribution. This list describes
the bundled runtime and development references, not an inventory of every npm tool.
Installed npm dependencies retain their licenses in `node_modules` and the lockfile.

| Material | License and attribution |
| --- | --- |
| Gyral core/testing tarballs | MIT, © 2026 Mike Zupper; [license](vendor/gyral/0.3.1-next.1/LICENSE), [Cycle.js attribution](vendor/gyral/0.3.1-next.1/NOTICE), [provenance](vendor/gyral/0.3.1-next.1/SOURCE.json) |
| Three.js | MIT, © 2010–2026 three.js authors; full text included in [runtime notices](public/third-party-notices.txt) |
| Beads skill | MIT, © 2026 Mike Zupper; [license](.agents/skills/beads/LICENSE), [upstream attribution](.agents/skills/beads/NOTICE.md) |
| Gyral skill | MIT, © 2026 Mike Zupper; [license](.agents/skills/gyral/LICENSE), [notice](.agents/skills/gyral/NOTICE) |
| Sense of Style skill | MIT, © 2026 Mike Zupper; [license](.agents/skills/sense-of-style/LICENSE). Independent guidance; no copy of Steven Pinker's book is bundled |
| Modern CSS skill | CC BY 4.0; [license](.agents/skills/modern-css/LICENSE), source and author recorded in [skill provenance](.agents/SOURCES.md) |
| Semantic HTML skill | CC BY 4.0; [license](.agents/skills/semantic-html/LICENSE), [upstream README](.agents/skills/semantic-html/UPSTREAM-README.md). Upstream `skills.md` is preserved as `SKILL.md` |
| Google SEO skill and reference documents | CC BY 4.0; [license](.agents/skills/google-seo/LICENSE). Google Search Central documents retain a source link in each reference; code samples follow Google's stated [Apache-2.0 terms](.agents/skills/google-seo/APACHE-2.0.txt) where applicable |

Google reference text is reproduced or cleaned up from work shared by Google under
its [site policies](https://developers.google.com/terms/site-policies) and
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The source URLs and collection
notes identify the original pages and modifications. Google trademarks and separately
licensed media are not licensed by those terms. The skills are development references,
not game runtime dependencies.

The [runtime notices](public/third-party-notices.txt) are copied into `dist/` with each
build so static-site distributions retain Gyral, Cycle.js, and Three.js notices. Keep
that file with deployed or redistributed builds.

JezzBall is historical inspiration, credited to Dima Pavlovsky and its original
publisher, Microsoft. Original game code, artwork, audio, binaries, and help files
are not bundled. The historical references link to outside sources; those materials
retain their owners' rights. No Microsoft affiliation is implied.
