# RSS Feed + Email Subscribe — Design Spec

Date: 2026-05-02
Issue: #62

## Overview

Add a weekly email digest for subscribers. The implementation has two parts: a static RSS feed generated at build time, and a plain-HTML subscribe form in the site footer. Buttondown (managed newsletter service) handles subscriber storage, double opt-in, unsubscribe links, CASL compliance, and weekly RSS-to-email batching.

## RSS Feed

**Endpoint:** `/rss.xml` — generated at build time by `src/pages/rss.xml.ts` using `@astrojs/rss`.

**Content:** All artifacts, plus events that have no artifact derived from them. This deduplication rule ensures that when an event and a derived artifact are both present in the data, only the artifact appears in the feed — preventing duplicate entries for the same real-world update.

**Deduplication logic:**
1. Load all events (from `data/events/`) and all artifacts (from `data/artifacts/`).
2. Collect the set of event IDs referenced by any artifact's `derives_from[].id` field.
3. Exclude events whose `id` appears in that set.
4. Merge remaining events + all artifacts; sort descending by date (`date` for events, `published_date` for artifacts).
5. Map each record to an RSS item:
   - `title`: record's `title` field
   - `description`: record's `description` field (truncated to ~300 chars if needed)
   - `pubDate`: record's date field
   - `link`: absolute URL to the detail page (`/events/<id>` or `/artifacts/<id>`)
   - `guid`: same as `link` (permanent, does not change on content updates)

**Update behaviour:** Updates to existing records are not re-delivered to subscribers. The `guid` is fixed to the item URL, so Buttondown treats updated items as already-seen. This is an accepted limitation; significant update notifications are out of scope for now.

**Auto-discovery:** A `<link rel="alternate" type="application/rss+xml" title="AI Governance Tracker" href="/rss.xml">` tag is added to the site `<head>` (in the shared layout).

## Subscribe Form

A plain HTML `<form>` embedded in the site footer. It POSTs directly to Buttondown's public subscribe endpoint:

```
https://buttondown.com/api/emails/embed-subscribe/<buttondown-username>
```

The form contains a single email `<input>` and a submit button. On submission, the browser navigates to Buttondown's hosted confirmation page (no JavaScript required, no CORS concerns). Error and success states are handled by Buttondown's default pages.

The Buttondown username is a public value defined as a named constant in the footer component (e.g. `const BUTTONDOWN_USERNAME = "your-username"`), making it easy to locate and update after account creation (see Post-Deploy Steps below).

## Package Dependency

Add `@astrojs/rss` as a production dependency. No other new packages required.

## Post-Deploy Steps (manual, in Buttondown)

1. Create a Buttondown account.
2. Note your Buttondown username and substitute it into the subscribe form `action` URL in the footer.
3. In Buttondown, create an RSS automation:
   - Feed URL: `https://<your-domain>/rss.xml`
   - Cadence: weekly
4. Buttondown will batch new feed items (items with unseen `guid`s) and send them to subscribers once per week.

## Out of Scope

- Per-tag feeds
- "Significant update" re-delivery
- JavaScript-powered inline subscribe confirmation
- Multiple feeds (events-only, artifacts-only)
