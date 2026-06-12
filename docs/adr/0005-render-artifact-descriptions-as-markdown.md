# 5. Render artifact descriptions as Markdown

Date: 2026-06-11

## Status

Accepted

## Context

Artifact `description` fields were rendered as a single escaped paragraph
(`<p>{data.description}</p>`). For short descriptions this is fine, but longer
ones — e.g. Canada's National AI Strategy, which covers a launch summary, a
lineage note, three priorities, six pillars, a list of headline measures, and
a set of economic targets — collapsed into one dense, hard-to-read block.
Source newlines were lost because adjacent text nodes collapse whitespace, so
authors had no way to express paragraph breaks or bullet lists.

We wanted authored descriptions to support at least paragraphs and bullet
lists (and ideally inline emphasis). Two options were considered:

1. A small in-repo block splitter that emits paragraphs and `- ` lists with
   hand-written Tailwind classes (no dependency).
2. A real Markdown renderer.

We chose Markdown for its familiarity, extensibility (bold, links, etc.), and
because the alternative — a bespoke parser plus its tests — is comparable in
total complexity to wiring up a maintained library.

## Decision

Render artifact descriptions through the [`marked`](https://marked.js.org/)
Markdown parser and inject the result with Astro's `set:html`. Style the
output with the `@tailwindcss/typography` plugin (`prose` classes), registered
in `src/styles/global.css` via `@plugin "@tailwindcss/typography"` (Tailwind
v4 CSS-based plugin registration).

Conventions:

- Descriptions are authored as Markdown directly in the data YAML.
- When a description needs paragraph breaks or lists, author it with a YAML
  **literal** block scalar (`description: |`). A **folded** scalar
  (`description: >`) collapses blank lines into single newlines, which
  CommonMark treats as soft breaks *within* a paragraph — so folded
  descriptions render as a single paragraph regardless of blank lines.
- `<meta name="description">` and the JSON-LD `description` use a plain-text
  lead derived from the first paragraph with inline `**` stripped, rather than
  the raw Markdown, so structural markers don't leak into SEO output. Folded
  descriptions without a blank-line break are passed through unchanged.
- Only the artifact detail page (`src/pages/artifacts/[id].astro`) renders
  Markdown today. Event descriptions remain plain text.

## Consequences

- Descriptions can use paragraphs, bullet lists, and inline emphasis, and the
  rendered output is styled consistently by the typography plugin.
- `set:html` injects raw HTML. This is safe here because descriptions are
  trusted, version-controlled repo content authored by maintainers — not
  user-supplied input. If descriptions ever become user-editable (e.g. a wiki
  backend), the Markdown output must be sanitised before injection.
- Two runtime dependencies were added: `marked` and
  `@tailwindcss/typography`.
- Existing folded-scalar (`>`) descriptions render as before (a single
  paragraph). Converting one to multi-paragraph layout means switching it to a
  literal (`|`) scalar — a deliberate, per-record choice.
- Markdown rendering is currently limited to artifact descriptions. Extending
  it to event descriptions or other free-text fields is a future option, not a
  commitment.
