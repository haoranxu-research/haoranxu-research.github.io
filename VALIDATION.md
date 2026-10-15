# Verification results — Warm Editorial

Verified locally on 2026-10-13. No public repository write or deployment.

| Check          | Result                                                                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Foundation     | Official al-folio starter, Jekyll 4.4.1, Ruby 3.3.12, al_folio_core 1.0.15; existing dependency pins retained                                     |
| Main pages     | About, Research, Reflections, plus a matching 404 page                                                                                            |
| Static build   | Local root build and production build with test `/profile` baseurl passed                                                                         |
| Links/assets   | Generated local URLs, fragments, image alt text, and absence of fictional template content checked                                                |
| Browser        | Installed headless Chrome; 1440px, 768px, 390px, 320px widths                                                                                     |
| Light/dark     | All three main pages captured in both themes; representative text contrast at least 4.5:1                                                         |
| Layout         | No horizontal overflow, broken local assets, or JavaScript errors during tested flows                                                             |
| Research       | Both panels, continuous Canvas change, keyboard arrow selection, and deep-linked Designing view passed                                            |
| Reflections    | Mouse and Enter-key disclosure; all three drafts expanded for full reading screenshots                                                            |
| Preferences    | Theme persists across reloads and page navigation                                                                                                 |
| Reduced motion | No active CSS/Web Animations; immediate research switch and native essay disclosure                                                               |
| No JavaScript  | Both research directions readable; native essay disclosure works                                                                                  |
| Visual review  | Complete desktop/mobile screenshots reviewed; capture corrected to reveal sections and return to page top; research text area given stable height |
| Fonts/photo    | Three local WOFF2 files; original photograph copied without pixel editing and cropped in CSS                                                      |
| Upgrade audit  | 0 blocking and 0 non-blocking findings; retained legacy overrides acknowledged                                                                    |
| Formatting     | Prettier and Git whitespace checks passed                                                                                                         |

Screenshots and detailed browser results: `preview/editorial/`. Review gallery: `preview/editorial/index.html`. Earlier design snapshots: `preview/before-editorial/`.

## Limits

- Reflections prose is provisional layout copy awaiting author approval, not confirmed personal philosophy.
- GitHub Actions and actual Pages deployment have not run against the user's account. Only local static builds and a simulated project baseurl were verified.
- The unused notebook plugin still emits its pre-existing missing-nbconvert warning. No notebook content is used, and builds succeed.
- Contrast checks cover representative text styles, not a claim of a complete accessibility certification.
- Desktop and mobile browser viewport checks do not substitute for checking every physical device.

## Repeat

```powershell
node scripts/check_editorial.cjs
```

The browser uses an isolated headless context, not the user's signed-in Chrome profile. It saves light/dark screenshots, Designing-state views, and expanded Reflections views. `CHECK_WIDTHS` may restrict the tested viewport widths for targeted rechecks.

## On Living integration — 2026-10-14

This section supersedes the earlier draft-essay notes above. Reflections now contains the author's formal bilingual essay, not the three AI samples.

- Both Markdown files match the incoming archive byte for byte; SHA256 records are in `preview/on-living/source-verification.txt`.
- Browser assertions compare all rendered paragraph text and punctuation with the source: 40 English paragraphs and 39 Chinese paragraphs, including the Chinese saying and exact English rendering.
- Verified article index/navigation, default English, keyboard and mouse language controls, paragraph-preserving mid-essay switching, Chinese direct URL/reload, light/dark themes, 1440px / 390px / 320px layout, reduced-motion, and no-JavaScript bilingual fallback.
- Full-page and viewport screenshots are in `preview/on-living/`; existing About/Research design remains in its prior presentation layer.
- Local root build and simulated GitHub Pages project-prefix build are checked; public deployment remains unperformed.
- The self-hosted Chinese font was subset locally; no author text was sent to a font service.
