# Design: Open Graph and Twitter Card Meta Tags (Issue #48)

## Problem

Links shared to social media or messaging apps show no preview — no image, generic title, missing description. This is a missed opportunity for discoverability and credibility.

## Goal

Add standard Open Graph and Twitter Card meta tags so that every page on the site renders a rich social preview automatically, with no per-page work required from content editors.

## Design

### Where changes live

All changes are in `src/layouts/BaseLayout.astro`. Because every page in the site uses this layout, all existing and future pages inherit the tags with no additional work.

### Tags to add

| Tag | Value |
|-----|-------|
| `og:title` | `fullTitle` (already computed — includes site name) |
| `og:description` | `description` prop (same source as `<meta name="description">`) |
| `og:type` | `"website"` (hardcoded) |
| `og:url` | `canonicalURL` (already computed per-page from `Astro.url.pathname`) |
| `og:site_name` | `"AI Governance Tracker"` |
| `og:image` | `ogImage` prop, falling back to `Astro.site + "og-image.png"` |
| `og:image:width` | `1200` |
| `og:image:height` | `630` |
| `twitter:card` | `"summary_large_image"` |
| `twitter:title` | same as `og:title` |
| `twitter:description` | same as `og:description` |

### Props interface change

Add an optional `ogImage` prop to `BaseLayout`:

```ts
interface Props {
  title: string;
  description?: string;
  ogImage?: string;  // absolute URL; defaults to /og-image.png
}
```

Pages that have a page-specific image can pass it; all others fall back to the site-wide og-image.

### og:image asset

A branded PNG at `public/og-image.png` (1200×630px). Design: dark teal background (`#0f3040`), teal "AI" badge, white/teal title "AI Governance Tracker — Canada", subtitle text, teal accent bar. The "— Canada" suffix is intentional — a reminder to update if the site ever expands beyond Canada.

### New pages

No action required from page authors. `BaseLayout` handles everything. The `og:url` uses `canonicalURL` which is already computed per-page, so each page gets the correct URL automatically.

## Files Changed

- `src/layouts/BaseLayout.astro` — add OG/Twitter meta tags and `ogImage` prop
- `public/og-image.png` — new branded social preview image (1200×630)

## Out of Scope

- Per-page dynamic og:image generation (e.g. Satori/sharp-based images per event or artifact)
- `twitter:site` handle (no Twitter account exists yet)
- `og:image:alt` (can be added later alongside any dynamic image work)
