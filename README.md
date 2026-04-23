# AI Safety Gov Tracker

A Canadian AI governance and policy timeline — tracking AI safety events such as Senate hearings, published reports, and significant government or ministerial changes.

## Features

- Chronological timeline view with running summary
- Tags on each entry
- Links to original sources (Senate hearing pages, video recordings)
- Links to external resources: Wikipedia, org websites, related initiatives
- Track implementation status of policy recommendations

## Development

```bash
pnpm install
pnpm dev
```

## Running tests

Unit and component tests run with [Vitest](https://vitest.dev/).

```bash
pnpm test          # run once
pnpm test:watch    # re-run on file changes
```

Tests live alongside the source files they cover (`foo.test.ts` next to `foo.ts`).

### End-to-end tests

Browser tests run with [Playwright](https://playwright.dev/) against the production build.

```bash
pnpm test:e2e              # build + run all e2e tests
pnpm exec playwright test  # skip the build (assumes dist/ is fresh)
```

The HTML report lands in `playwright-report/` (gitignored). Specs live in `e2e/`.

### Analytics

The site uses [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) — cookieless, no PII, no consent banner. The beacon only renders in production builds (`import.meta.env.PROD`) and only when `PUBLIC_CF_ANALYTICS_TOKEN` is set. Contributors don't need a token to work on the site.

To test the beacon locally, copy `.env.example` to `.env`, set a dummy token, then run:

```bash
pnpm build
pnpm preview
```

The production site's token is set in Cloudflare Pages' build environment, not in the repo.

## License

This project uses a dual license:

- **Code** (everything outside `data/`) — [MIT](LICENSE)
- **Data** (`data/` directory) — [Creative Commons Attribution 4.0 International (CC BY 4.0)](data/LICENSE)

You are free to use, share, and adapt the data with attribution. The code may be used freely under the MIT license.
