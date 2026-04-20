# 0003 — Deploy to Cloudflare Pages (static)

Date: 2026-04-20
Status: Accepted

## Context

The project needs a hosting provider that is free or low-cost, supports custom domains, and integrates cleanly with a GitHub-based editing workflow. Content lives in YAML files committed to the repository, so every content change already requires a git commit.

Cloudflare Pages was identified early (ADR-0002) as the intended deployment target.

## Decision

Deploy as a **static site** to Cloudflare Pages using Git integration. On every push to `main`, Cloudflare runs `pnpm build`, which produces a `dist/` directory of pre-rendered HTML, and serves that output globally via its CDN.

Configuration is tracked in `wrangler.toml` at the repo root:

```toml
name = "ai-governance-tracker"
compatibility_date = "2025-01-01"
pages_build_output_dir = "dist"
```

## Alternatives considered

**SSR via Cloudflare Workers (`@astrojs/cloudflare` adapter):** Pages would render on-demand at request time rather than at build time. This enables dynamic behaviour (server-side filtering, database reads) without a rebuild. Rejected because content lives in the repo — a rebuild is already required to publish new data, so SSR adds compute cost and operational complexity with no benefit.

**Other hosts (Netlify, Vercel, GitHub Pages):** All support static Astro sites. Cloudflare Pages was chosen for its generous free tier, global CDN performance, and native integration with Cloudflare DNS for custom domains.

## Consequences

- New content requires a git commit and a redeploy (typically ~1 minute).
- No server-side compute cost; the site is served entirely from Cloudflare's edge CDN.
- If the data model moves to a database or external CMS in the future, SSR should be reconsidered and this ADR superseded.
