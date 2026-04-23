# Site analytics — Cloudflare Web Analytics

Date: 2026-04-22
Tracking issue: #1

## Goal

Instrument the site with privacy-respecting, cookieless analytics so we can see pageviews, referrers, paths, countries, and devices. No PII, no consent banner, no separate backend to run.

## Context

The site is a static Astro 5 bundle deployed to Cloudflare Pages (ADR-0003). There is currently no visibility into traffic — we don't know how many visitors load the timeline, where they come from, or which pages they read.

Cloudflare Web Analytics is included free with Cloudflare Pages, is cookieless, collects no PII, and requires no consent banner under GDPR. It covers pageviews, referrers, paths, countries, and device types. It does not support custom events; if we ever need funnels or custom tracking we can layer a second tool on top later.

Considered and rejected for now: GoatCounter (solo-maintainer bus-factor), Plausible ($9/mo for a hobby site), Umami (requires a separate server — doesn't fit a static deploy). Self-hosted Matomo was the original preference in issue #1 but requires PHP + MySQL, which doesn't fit Cloudflare Pages' static-only model.

## Architecture

Cloudflare Web Analytics is a single `<script>` beacon loaded on every page. We render it in `src/layouts/BaseLayout.astro`, gated on `import.meta.env.PROD` so `astro dev` never sends pageviews to the dashboard. The site token comes from the build-time env var `PUBLIC_CF_ANALYTICS_TOKEN`, set in the Cloudflare Pages project's build environment. A one-line disclosure — "Anonymous usage statistics via Cloudflare Web Analytics." — goes in the site footer and links to Cloudflare's privacy page.

If `PUBLIC_CF_ANALYTICS_TOKEN` is missing at build time, the beacon is skipped silently. This keeps local prod builds working for contributors who don't have a token.

## Components and files

### `src/layouts/BaseLayout.astro` (modify)

- Add a prod-only `<script>` block that reads `import.meta.env.PUBLIC_CF_ANALYTICS_TOKEN`. If the token is missing, render nothing.
- Add a one-line footer disclosure: "Anonymous usage statistics via [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/)."

Beacon markup:

```astro
---
const cfToken = import.meta.env.PUBLIC_CF_ANALYTICS_TOKEN;
const showBeacon = import.meta.env.PROD && cfToken;
---
{showBeacon && (
  <script
    defer
    src="https://static.cloudflareinsights.com/beacon.min.js"
    data-cf-beacon={`{"token":"${cfToken}"}`}
  ></script>
)}
```

### `.env.example` (create)

New file at repo root:

```
# Cloudflare Web Analytics site token. Get it from the CF dashboard:
# Analytics & Logs → Web Analytics → (site) → copy the `data-cf-beacon` token.
# Public by design — the token is embedded in the beacon on every page.
# Only required for production builds that should report traffic.
PUBLIC_CF_ANALYTICS_TOKEN=
```

Real `.env` stays gitignored (already is).

### `README.md` (modify)

Add a short "Analytics" subsection under Development explaining:
- Site uses Cloudflare Web Analytics, prod-only
- Set `PUBLIC_CF_ANALYTICS_TOKEN` in a local `.env` to test the beacon with `pnpm build && pnpm preview`
- Contributors don't need a token to work on the site

### `e2e/analytics.spec.ts` (create)

One Playwright spec with two assertions:

1. Footer contains the disclosure text ("Anonymous usage statistics via Cloudflare Web Analytics").
2. The beacon `<script>` tag with `src` matching `cloudflareinsights.com` is present in the rendered HTML.

Since Playwright runs against `astro preview` (production bundle), the prod-gated beacon should render. The test requires `PUBLIC_CF_ANALYTICS_TOKEN` to be set at build time.

### `.github/workflows/test.yml` (modify)

Set a dummy token in the `e2e` job env so the beacon renders during CI:

```yaml
env:
  PUBLIC_CF_ANALYTICS_TOKEN: "test-token-not-real"
```

Scoped to the `e2e` job only. Unit job doesn't need it.

## Cloudflare Pages setup (one-time, manual, not in repo)

1. In the Cloudflare dashboard: Pages → the project → Settings → Environment Variables → Production → add `PUBLIC_CF_ANALYTICS_TOKEN` with the real site token.
2. Analytics & Logs → Web Analytics → Add a site → select the Pages project → copy the token that appears in the `data-cf-beacon` attribute CF suggests. (Don't paste their whole snippet — we already have our own.)
3. Trigger a rebuild (merging the PR will do this automatically).

## Testing

- **Unit:** none. `BaseLayout.astro` is a template with no pure function worth isolating.
- **E2E:** `e2e/analytics.spec.ts` covers the two observable behaviors (footer text, beacon script present).
- **Manual post-deploy:** after merge, check the Cloudflare Web Analytics dashboard shows traffic within a few minutes of site activity.

## Privacy

- No cookies, no localStorage, no fingerprinting.
- No PII collected. Cloudflare Web Analytics collects: pageview, URL path, referrer, country (from IP, IP itself not retained per CF's docs), device type, browser.
- No consent banner required under GDPR for this data category.
- Footer disclosure links to Cloudflare's Web Analytics privacy documentation.

## Alternatives considered

- **Dashboard toggle instead of beacon in code.** Cloudflare Pages can inject the beacon automatically at the edge if you enable Web Analytics via the dashboard. Rejected because it leaves no trace in the repo; a future contributor reading the code would have no way to know the site is instrumented. Beacon-in-code is reviewable and survives moving off Pages.
- **Hardcoded token instead of env var.** Simpler, and the token is public anyway. Rejected to avoid coupling the repo to a single deployment — forks or a staging deploy can plug in their own token without code edits.
- **GoatCounter / Plausible / Umami.** See Context. Cloudflare Web Analytics wins on cost + ops + fit-to-deploy-model.
- **Self-hosted Matomo.** Original preference in issue #1; rejected because it requires a PHP + MySQL backend, incompatible with the Cloudflare Pages static-only deploy.
- **Skip testing entirely.** Considered — this is ~15 lines of template code. But the beacon is invisible on the deployed site (no visible artifact) and trivially breakable (one rename of the env var and nothing reports), so a regression-catching e2e is worth the ~30 lines.

## Acceptance criteria

- `BaseLayout.astro` renders the beacon in prod builds when `PUBLIC_CF_ANALYTICS_TOKEN` is set, and skips it silently otherwise.
- Footer shows the disclosure line on every page.
- `e2e/analytics.spec.ts` passes in CI with the dummy token.
- `.env.example` documents the variable.
- README has a short Analytics note.
- After merge + rebuild with the real token, the Cloudflare Web Analytics dashboard shows traffic.

## References

- Tracking issue: #1
- ADR-0003: Cloudflare Pages deploy
- ADR-0004: Testing stack (Vitest + Playwright)
- Cloudflare Web Analytics: https://www.cloudflare.com/web-analytics/
- Astro env vars: https://docs.astro.build/en/guides/environment-variables/
