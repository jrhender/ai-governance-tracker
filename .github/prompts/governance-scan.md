You are scanning for Canadian AI governance developments that are not yet
recorded in this tracker.

## Context

Run this first — it prints JSON with everything you need to avoid duplicates:

    node scripts/governance-scan/context.mjs

The JSON contains:
- `tracked` — every record already in `data/`. If a development is here, it is
  NOT a lead.
- `reportedTitles` — titles of every `content`-labelled issue, open and closed.
  If a development is here it has already been raised, possibly by a human, and
  is NOT a lead. Closed means handled or deliberately declined — still not a lead.
- `since` — only consider developments published on or after this date.

## Task

1. Read `.github/sources.yaml`.
2. Visit each source. Look for developments published on or after `since`.
3. Drop any candidate that describes something already in `tracked`, even when
   the wording differs — e.g. "Add AIDA bill" describes the same event as a
   tracked record titled "Bill C-27 introduced." Matching by meaning, not just
   by string, is your job: the deterministic filter only catches exact-string
   matches and cannot make this call for you.

   Then collect every surviving candidate as JSON and pipe it through the
   filter. **You may only file candidates the filter returns** — it is a
   mandatory floor you cannot bypass or overrule, and it enforces the
   already-reported check, the missing-URL rule, and the five-per-run cap:

       echo '{"candidates":[{"title":"Add ...","url":"https://...","date":"2026-08-20","why":"..."}]}' \
         | node scripts/governance-scan/filter.mjs

4. File a GitHub issue for each candidate the filter returns — and only those.
   If it returns `[]`, file nothing.

## Rules

- **Never file a lead without a source URL.** If you cannot point at the page
  that documents it, drop it. A wrong lead costs more trust than a missed one.
- **Maximum 5 issues per run.** If you have more, file the 5 most significant
  and note in the last issue body that more were found.
- **Never edit, close, or comment on an existing issue.** You only create.
- **Do not modify anything in `data/`.** You have no write access; do not try.
- If nothing survives the filters, do nothing and say `NO_NEW_LEADS`. Most days
  will be this. That is a success, not a failure.

## Issue format

Title: `Add <thing>` — matching the existing convention, e.g. "Add bill C-25".

Body:

    **Source:** <url>
    **Date:** <YYYY-MM-DD>
    **Why this looks untracked:** <one sentence>

    <two or three sentences on what happened and why it belongs in the tracker>

    ---
    Filed automatically by the daily governance scan. Verify before adding to `data/`.

Labels: `content` and `needs further review`. Both already exist.

Create issues with:

    gh issue create --title "..." --body "..." --label content --label "needs further review"

## Dry run

If the environment variable `DRY_RUN` is `true`, do NOT create issues. Instead
print each issue you would have created, prefixed with `WOULD FILE:`, then stop.
