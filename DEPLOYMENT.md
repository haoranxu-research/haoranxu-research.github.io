# GitHub Pages deployment

This is a **Jekyll / al-folio** site with custom Warm Editorial layouts,
self-hosted fonts and photographs, and bilingual Reflections.
Production: <https://haoranxu-research.github.io/> (`baseurl: ""`).
Repository: `haoranxu-research/haoranxu-research.github.io`.

## Automatic deployment

`.github/workflows/deploy.yml` runs on pushes to `main`, pull requests, and manual
dispatch. It installs Ruby gems and Node development tools, checks formatting
and publication boundaries, builds Jekyll in production mode, checks links and
CSS resources, and uploads only `_site`. The deploy job publishes `main` through
the `github-pages` environment. Pull requests build without publishing.

In **Settings > Pages > Build and deployment > Source**, select **GitHub Actions**.
No `gh-pages` branch or `PUBLISH_SITE` variable is needed. The workflow uses
GitHub's short-lived `GITHUB_TOKEN` and OIDC; do not commit a personal token.
See [GitHub's official custom-workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Future updates

1. Edit the public source: `_pages/about.md`, `_pages/research.md`, or the
   Reflections collection. See `docs/REFLECTIONS.md` for bilingual article files.
2. Preview and run the checks below.
3. Review `git status` and `git diff`; stage specific public files.
4. Commit and push, for example:

   ```powershell
   git add -- _pages/about.md
   git commit -m "Update introduction"
   git push origin main
   ```

5. Check **Actions > Build and deploy academic site**. Once build and deploy are
   successful, reload the live site.

Do not force-push. `upstream` refers to the official template and intentionally
has an invalid push URL; use `origin` for your own site.

## Local preview

The existing project-local Ruby is used by:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/preview.ps1
```

Open <http://localhost:4000/>. Jekyll's development server overrides the URL for
local preview; production builds use the configured GitHub Pages URL.

In a Ruby/Bundler shell:

```powershell
bundle install
npm ci
npm run lint:prettier
bundle exec al-folio upgrade overrides audit
bundle exec jekyll build
python scripts/check_site.py _site
python scripts/check_publication.py --source --site _site
node scripts/check_editorial.cjs
node scripts/check_reflections.cjs
```

Browser checks expect the preview server to be running. To check production,
set `$env:SITE_URL = 'https://haoranxu-research.github.io'` first.

## Publication boundary

- `.local/` is ignored by Git and excluded from Jekyll. It contains local tools
  and the **private CV draft**; the CV remains unpublished.
- Previews, credentials, manuscript folders, research data, incoming ZIP files,
  retired AI drafts, and duplicate article packages are not committed or published.
- Approved essay sources in `_includes/reflections/` are required for the
  bilingual site and are committed.
- Publications, CV, and Projects page files remain excluded from site output.
- Only `_site`, never the whole project, is uploaded as the Pages artifact.

Publishing the CV later requires separate approval and replacing `[Email]`.
