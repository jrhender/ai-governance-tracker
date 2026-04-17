# 2. Use Astro with React islands as the static site framework

Date: 2026-04-17

## Status

Accepted

## Context

The project (see `CLAUDE.md`) is a mostly read-only Canadian AI governance
timeline, backed by flat YAML files in `data/`. Editing happens via pull
requests to those files. Key requirements driving the framework choice:

- **SEO is a high priority.** Timeline entries should be individually
  indexable with pre-rendered HTML and good link previews.
- **Free / low cost** to host.
- **Portability** between hosting providers; no lock-in to a single vendor's
  proprietary features.
- **Custom domain** support.
- **React** as the frontend component model, at least for interactive parts.
- **YAML data layer** with minimal glue code.
- Optional **SSR** in the future without switching frameworks.

Frameworks considered:

- **Next.js (static export)** — all-React, large ecosystem, but heavier
  default JS payload, no built-in YAML content layer, and many libraries
  implicitly assume Vercel hosting, weakening portability in practice.
- **Gatsby** — purpose-built for content sites with a YAML/GraphQL data
  layer, but project momentum has slowed significantly.
- **Vite + React (SPA)** — lightweight and portable, but a pure SPA is a
  poor fit for SEO and we would assemble the content pipeline ourselves.
- **Remix / React Router v7** — overkill for a static content site.
- **Astro with React islands** — pre-renders every page to static HTML by
  default; native YAML/Markdown Content Collections with Zod schemas;
  React used only for interactive components ("islands"); deploys to any
  static host; opt-in SSR adapters available per route.

The main downside of Astro is the islands model: two React components on
the same page do not share a React tree, so cross-island state requires
either lifting interactivity into one larger island, using a shared store
(e.g. Nano Stores), or URL state. For a timeline with filters and an entry
list, a single interactive region is the natural shape, so this is a low
cost.

## Decision

Use **Astro** as the static site framework, with **React** for interactive
components via Astro's islands architecture. Initial deployment target is
**Cloudflare Pages** (free tier, global CDN, free custom domains), with the
expectation that we can move to another static host or enable SSR via an
Astro adapter later without migrating frameworks.

## Consequences

**Positive**

- Pre-rendered HTML per timeline entry satisfies the SEO requirement out of
  the box.
- Astro Content Collections give us typed, schema-validated access to the
  YAML files in `data/` with very little glue code.
- Static output deploys to any host; no vendor lock-in.
- Minimal JavaScript shipped to the client by default — only interactive
  islands hydrate.
- SSR can be added per-route later via adapters without rewriting.

**Negative / trade-offs**

- Page layout and data loading happen in `.astro` files, not JSX.
  Contributors need to learn Astro's component syntax in addition to React.
- Cross-island React state requires a deliberate pattern (single larger
  island, shared store, or URL state) rather than ambient Context.
- React-ecosystem libraries that assume Next.js primitives
  (`next/link`, `next/image`, `useRouter`) are unusable; framework-agnostic
  React libraries (Radix, shadcn/ui, TanStack Table, Framer Motion) work
  inside islands.
- No client-side routing by default; navigation is full page loads unless we
  opt into Astro's View Transitions.
