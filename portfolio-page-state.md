# Portfolio page — working state

Rolling notes for this project. Replaces `FINISHING_CHECKLIST.md` (May review, now
retired — everything in its "if you do only N things" list has shipped) and the
`docs/superpowers/` build plans (all executed).

Last updated: 2026-07-31

---

## Open TODO

### 1. 2–3 preview images per project — the only feature work left

Today each project card carries exactly one screenshot. `ArtifactBlock.projectCard`
has a single `preview: { src, alt }`, rendered once on the canvas
(`BodyBlocks.tsx`, `case 'projectCard'`) and once on the written page
(`index.astro`, `plain-project-preview`). Supporting more is a domain change,
not just new files:

- `src/domain/artifact.ts` — `preview` → `previews: readonly { src, alt }[]`
  (keep it a required non-empty array; every card has one today).
- `src/components/canvas/BodyBlocks.tsx` — the card is already not-a-link, so a
  small thumbnail strip under the hero shot fits without nesting anchors.
- `src/pages/index.astro` — `.plain-project-preview` is a single `<a><img></a>`.
- `src/content/doors.data.ts` — the data.
- Tests in `/tests` that assert on preview alt text.

**Presentation — recommendation:** one hero shot at full column width, then a row
of 2 small thumbnails beneath it that swap into the hero slot on click. No
carousel, no lightbox, no auto-advance. Reasons: the row keeps every shot visible
at a glance (a carousel hides 2 of 3 and nobody clicks the arrows on a portfolio),
it needs no library, and it degrades to "three images stacked" without JS. The
thumbnails need a fixed `aspect-ratio` so the row stays even — the hero slot must
*not* get one, since the previews have genuinely different proportions (see the
RAG sizing note below) and forcing a ratio is what pillarboxed the tall one before.

**Rule for all shots:** real data on screen, no empty states, window chrome cropped
out, dark theme (the cards sit on a dark surface and a light screenshot punches a
hole in the page). 1280px wide, `.webp`, under ~60KB like the existing three.

**Captured 2026-08-01 — second shot ready for each project:**

| file | what it shows | how |
| --- | --- | --- |
| `ramsey-fault-tree.webp` | fault tree, 19 nodes, solved: P=0.005909 | driven live via Playwright against the running Docker stack |
| `gitagents-dashboard.webp` | cost dashboard — $0.87430, 285 140 tokens, cost by file | cropped from `C:\git\gitagents-private\assets\dashboard-dark.png` |
| `rag-evaluation.webp` | evaluation lab + the circular-metrics warning | cropped from `C:\git\GlassBoxRAG\assets\evaluation-warning-dark.png` |

The RAMSey capture is reproducible: `scratchpad/shoot-ramsey.mjs` seeds
`localStorage['ramsey-theme']='dark'`, creates a guest diagram, imports
`examples/fault-tree-cooling-loss.json` through the real File → Import JSON flow,
runs the solver, and shoots at deviceScaleFactor 2. Same flow as
`e2e/import-example.spec.ts`.

**Still to shoot (blocked, needs a decision or a credential):**

- **GlassBox RAG — the pipeline trace.** `assets/pipeline-trace-dark.png` and
  `traces-overview-dark.png` are exactly the right content (chunks, similarity
  scores, per-stage timings) but every latency reads 110 000–268 000 ms, because
  they were produced against local CPU Ollama. Three minutes an answer is not a
  number to put on a portfolio. Needs a re-run against a faster backend — litellm
  already supports hosted providers, so this is an API key, not a code change.
- **RAMSey — two cursors mid-edit.** The summary leads with Yjs CRDTs and nothing
  on screen shows collaboration. Needs a registered (non-guest) diagram plus two
  browser contexts; guest mode has no Yjs at all. Doable with the auth flow in
  `e2e/auth-journey.spec.ts` and the running mailpit, just more moving parts.
- **GitAgents — a one-click fix landing.** Needs a live PR on a real repo with
  tokens configured; `assets/bot-dark.png` covers the review comment only.
- **AgentsSquad** — no card yet (`public/previews/agentssquad.webp` exists,
  untracked). Takes the top slot in ELSEWHERE once it demos; at 4 cards the
  `.project-card-grid` orphan rule stops applying and the grid becomes a clean 2×2.

### 2. Not verified on a real device

Everything below was verified by build + tests + reading emitted CSS. Layout on an
actual phone needs a deploy — Cloudflare Pages builds from `main`.

---

## Decisions worth not re-litigating

- **Two surfaces, one content source.** `/` is the written profile, `/interactive`
  is the canvas; both render from `src/content/doors.data.ts`. Copy fixes belong in
  the data file, layout fixes in the two renderers.
- **Gold = the other surface.** `--accent-warm` marks cross-surface links and the
  assistant. Not used for emphasis or "featured" — that is what killed the gold
  border on the lead project card.
- **Viewport units on mobile:** `svh` shrinks and grows with the URL bar, which
  causes mid-scroll relayouts. Use `lvh` for anything that must not move, and
  never size an image off viewport height. This is what made the portrait jump.
- **Chip rows stay one line.** Adding a technology to a project card means
  shortening or dropping another.
- **Stack chips must be true.** Verify against the source repo before adding —
  GitAgents is at `C:\git\gitagents-private`.

## Known-good verification loop

```
npm run build     # Astro build, catches template + type errors
npm test          # vitest, 97 tests
```

This repo carries the `claude:allow-git-writes` marker in `CLAUDE.md` — it sits
inside an HTML comment on line 3, so it is invisible in rendered markdown. Git
writes are allowed here and prompt for per-call approval; don't assume otherwise
from reading the rendered file.
