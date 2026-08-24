# Daily Governance Scan — Design

**Date:** 2026-08-23
**Status:** Approved, pending implementation

## Problem

Canadian AI governance events — bills, committee meetings, ministerial
announcements, think-tank reports — happen whether or not anyone is watching
the tracker. Finding them today means remembering to check a dozen sites by
hand. The gap between "something happened" and "it's in `data/`" is bounded
only by attention.

This automation closes the *detection* half of that gap. It does not draft
records, and deliberately so: dates and attributions are exactly what an agent
gets subtly wrong, and this is a factual reference. Detection is cheap and
verifiable; drafting is neither.

## Scope

**In:** a weekday-morning GitHub Actions run that reports candidate untracked
events as GitHub issues.

**Out:** writing or modifying anything under `data/`. Out of scope by
construction, not by convention — see Permissions.

## Approach

A scheduled workflow runs Claude Code headless (`claude -p`) with a checked-in
prompt. The agent reads what is already tracked, walks a curated source list,
and files an issue per new lead.

### Why headless CLI over `anthropics/claude-code-action`

Both were proven viable by the auth probe (see Prior Art). The CLI won on
fewer moving parts: three workflow steps, no third-party action version to
track, no action inputs to keep in sync with upstream renames.

### Why issues, not pull requests

An issue costs a few sentences to produce; a PR costs a full drafting session
against `data/` conventions and puts plausible-looking wrong dates in front of
a reviewer — which is precisely where they slip through. Quota on a Pro
subscription is the binding constraint, and most mornings should find nothing.
Drafting stays an interactive job, where the human is already in the loop.

## Files

```
.github/workflows/governance-scan.yml   # trigger, permissions, three steps
.github/prompts/governance-scan.md      # agent instructions (versioned separately)
.github/sources.yaml                    # curated source list
```

`sources.yaml` lives in `.github/`, not `data/`. `data/` is tracker content
consumed by the Astro build; an automation config there risks being picked up
as a record type.

The prompt is a separate file from the workflow so it can be edited and
reviewed as prose, without touching YAML that controls permissions.

## Trigger

```yaml
on:
  schedule:
    - cron: '0 12 * * 1-5'
  workflow_dispatch:
    inputs:
      dry_run: {type: boolean, default: false}
```

Weekdays only — Ottawa does not announce on Saturdays, and it cuts quota ~30%.
Cron is UTC, so `12:00` is 8am Eastern in summer and 7am in winter. The drift
is accepted rather than worked around; nothing here is hour-sensitive.

`workflow_dispatch` is the manual test path and must remain, because a
schedule-only workflow can only be tested by waiting for tomorrow.

## Permissions

```yaml
permissions:
  contents: read
  issues: write
```

No `contents: write`. The agent cannot commit, cannot open a PR, and cannot
modify `data/` even if its prompt is misread or a source page contains
injected instructions. This is the primary safety property of the design and
must not be relaxed to add convenience later.

## Algorithm

1. **Build the tracked set.** Read `data/**/*.yaml` — ids, dates, titles,
   tags. ~50 records today, comfortably within context. Revisit when this
   approaches a few hundred.
2. **Walk the sources.** For each entry in `.github/sources.yaml`, look for
   items published in a **rolling 14-day window** — not "since yesterday," so
   a failed or missed run leaves no permanent gap in coverage.
3. **Filter against tracked records** from step 1.
4. **Filter against existing issues.** Search `content`-labelled issues, both
   open and closed, and drop anything already reported.
5. **File**, or exit 0 in silence.

### Dedupe

The dedupe key is the **`content` label**, searched across open and closed
issues, covering both human-filed and bot-filed issues.

Spanning human issues is essential, not incidental: #122 "Add Canadian Compute
Strategy" and #116 "Add bill C-25" are untracked-but-known leads. An agent
that only checked its own issues would re-file them, and the first thing the
human sees would be a duplicate of their own work.

Closed issues count for as much as open ones. #101 "Add hiroshima AI process"
is closed *and* present in `data/`; a closed `content` issue reliably means
"handled, or deliberately declined" — either way, do not raise it again.

Consequence: closing a bot issue permanently suppresses that lead. This is the
intended triage gesture and should be documented for the user.

### Issue format

Title follows the existing human convention, `Add <thing>`, so bot issues sit
naturally alongside hand-filed ones. Body carries the source URL, the date,
and one line on why it appears untracked.

Labels: `content` (dedupe key, matches existing practice) and
`needs further review` (provenance marker, applied only by the bot, so
machine-filed leads stay filterable).

The agent never edits, closes, or comments on an issue it did not create.

## Guardrails

- **No source URL, no issue.** A lead the agent cannot point at is a
  hallucination, and filing it trains the reader to distrust the whole feed.
- **Maximum 5 issues per run.** A confused run cannot spam forty. Hitting the
  cap is itself a signal worth investigating.
- **Concurrency group**, so an overlapping run cannot double-file.
- **Fail loudly.** Non-zero exit on auth failure; GitHub emails on scheduled
  workflow failure. Silence is the dangerous mode — a cron that quietly stopped
  working looks identical to a quiet week in Canadian AI policy.

### Token expiry

`CLAUDE_CODE_OAUTH_TOKEN` is long-lived, not permanent. When it expires the
workflow fails loudly per above, and the fix is to re-run `claude setup-token`
and update the secret. Worth noting in the workflow comments so the failure is
self-explaining months from now.

## Testing

Actions logs are not readable from the development sandbox (they redirect to
blocked blob storage), so **job exit status must carry the signal** — the same
constraint that shaped the auth probe. Diagnosis goes through the check-runs
annotations API.

1. **`dry_run` mode** prints what it would file, and files nothing. Main
   iteration loop.
2. **Negative test — the one that matters.** Point it at something already in
   `data/` and confirm it is skipped. A scanner that finds everything is
   useless; only the negative test proves the filter works.
3. **Positive test.** Point it at a known-untracked event and confirm it
   surfaces.
4. **Dedupe test.** Run twice against the same state; the second run must file
   nothing.

## Risks

| Risk | Mitigation |
|---|---|
| Hallucinated leads | Source URL required; human triage before anything reaches `data/` |
| Duplicate noise | `content` label dedupe spanning human + bot, open + closed |
| Quota contention on Pro | Weekdays only; detection not drafting; 5-issue cap |
| Prompt injection from a source page | `contents: read` only — no write path exists to abuse |
| Silent death (token expiry, disabled cron) | Loud failure + email; GitHub disables schedules after 60 days repo inactivity |

## Prior Art

Auth was de-risked before this design was written. Throwaway probe on
`chore/actions-auth-probe` (run 32656465332) confirmed that a Pro subscription
`CLAUDE_CODE_OAUTH_TOKEN` is accepted by `claude -p` on a GitHub-hosted
runner — no API credits required. That branch stays until this workflow merges,
then both it and `.github/workflows/auth-probe.yml` are deleted.

GitHub-hosted runners have unrestricted outbound network, so the agent can read
`parl.ca` and `canada.ca` primary sources directly — unlike the development
sandbox, which blocks most external fetches. This is a genuine advantage of
Actions over the alternatives considered.

## Open Question

`.github/sources.yaml` has no contents yet. Candidates: LEGISinfo, ISED
newsroom, INDU committee, Senate committee pages, CIFAR, AIGS, CIGI, Munk
School, CAISI. The list should be settled with the user during implementation
rather than guessed here — it determines the signal quality of every future
run, and is the file most likely to need tuning over time.
