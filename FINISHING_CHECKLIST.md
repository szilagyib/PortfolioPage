# Finishing Checklist

Ranked review, harsh mode. Assumes: all placeholder images replaced with real screenshots, all repos live with deploy links, GlassBox RAG post written. What is still missing or weak after that.

Legend: **[BLOCKER]** must land · **[CONTENT]** copy/story · **[UX]** interaction/design · **[TECH]** operational

---

## Tier 1 — Ship-blockers (do these or it isn't finished)

### 1. Real numbers on Leadership metrics — [BLOCKER] [CONTENT]
"60+ features", "+30% delivery uplift", "<24h PR cycle" all round. Meanwhile the AI system prompt has `379 tickets resolved (+7% YoY against 33% more demand)` — that's the number a recruiter respects: specific, unmarketable-sounding. Bring at least one concrete number to Leadership metrics. If you can't defend "60+" in a hiring call, drop it. Round numbers scream fabrication.

### 2. Testimonials on Leadership — [BLOCKER] [CONTENT]
Already flagged as pending (#95). Every senior portfolio you're benchmarking against has 2–3 real quotes. The Leadership prose is well-written but purely aspirational — "high trust, disagreements aired out loud" is felt, not proven. One real quote from a direct report does more work than 200 words of philosophy.

### 3. Impact line per product — [BLOCKER] [CONTENT]
Product summaries are stack-heavy and impact-light. Titanium currently reads as "End-to-end component and inventory management for manufacturing and production environments." — so what changed? Every product needs one line: "X operators use it daily", "cut Y-time from 15min to seconds", "runs across N factory sites". Right now the stack lists work harder than the summaries.

### 4. First-visit UX for time-pressed recruiters — [BLOCKER] [UX]
Recruiter has 30s. Landing on the cosmic pentagon with no context, they either love the puzzle or bounce. The pulsing "↓ see everything" helps. Two upgrades:
- Auto-open the see-all view on a returning visit (localStorage flag). Nobody wants to solve puzzles they already solved.
- Add "TL;DR — just show me the CV" as an equal-weight action, not a subtle top-right button.

### 5. Impact anchors on About/Leadership prose — [BLOCKER] [CONTENT]
Philosophy currently reads as beliefs, not incidents. One concrete decision-story lands harder than a paragraph of principles:
> *"The hardest call this year was choosing to rewrite ProrisCAD's parameterisation layer instead of patching — 3 months of delivery gone, no user-visible feature. It shipped in October. Two months later we tripled the domain we can model."*
You have those stories; the current prose is hiding them.

---

## Tier 2 — Content weaknesses

### 6. Bio math is drifting — [CONTENT]
System prompt says "10 years writing code (incl. university), 4+ years engineering + 6-month C++ internship". Portfolio About says "10 years, 5 industry, 2+ leading". Pick one canonical bio and mirror it everywhere. Recruiters cross-check.

### 7. Engineering intro is 2 sentences with no POV — [CONTENT]
"4 active products across rail and manufacturing. Java backend, React frontend." — that's the whole intro. Missing one line that says why safety-critical rail matters or what makes it different from CRUD-with-extra-steps. Voice is absent from the section that most needs it.

### 8. ELSEWHERE writings will be sparse — [CONTENT]
Two posts after RAG lands is thin. Either commit to 4+, or reframe the section as "Recent writing" and be transparent this is selective.

### 9. No proof outside Prolan — [CONTENT]
Portfolio makes it look like nothing exists beyond dayjob. If the AI meetup talk mentioned in the system prompt has happened, name it in ELSEWHERE. Same for OSS contributions, formal mentoring, conference attendance.

### 10. AI chat suggestions are all softballs — [CONTENT]
"How does she use AI in day-to-day coding?" is the answer she wants people to ask. Add one uncomfortable-honest question: *"Why should I hire you?"* or *"What's a mistake you made in the leadership move?"* — signals confidence. The current pills feel like steering people away from hard questions.

### 11. Fortune advice-slip is decorative filler — [CONTENT]
It just serves random cosmic strings, disconnected from her identity. Either lean in (mix in her own saved rules-of-thumb / favourite quotes) or delete. It currently doesn't earn its place.

---

## Tier 3 — UI/UX weaknesses

### 12. No skip-to-content, no visible focus rings — [UX]
Tab through the page — where does focus land? On a "designer-work-ish" page, keyboard nav has to be first-class. Currently invisible = accessibility gap.

### 13. Chat has no persistence across opens — [UX]
Close card → reopen → history is gone. LocalStorage this (24h expiry). Cheap win.

### 14. CV download has no acknowledgment — [UX]
Click ↓ CV, file downloads, button looks identical. A micro-animation (border pulse or ✓ swap for 1.5s) makes the action feel real. Right now it feels dead.

### 15. Mobile has no puzzle — [UX]
Defensible choice, but half the story of the site (constellation-drawing) is invisible on mobile. Either accept it and don't mention constellations anywhere mobile visitors see, or ship a mobile puzzle.

### 16. No 404 page — [UX]
Cloudflare's default 404 breaks the aesthetic instantly. `src/pages/404.astro` with cosmic theme + "return home" — 30 min of work.

### 17. Fortune star lacks affordance — [UX]
First-time visitor sees a corner star with no signal it's clickable. Needs a tiny label or first-mount hover tooltip.

### 18. SkipButton pulse runs forever — [UX]
Once someone has clicked through even once, they know it's there. Consider fading the pulse to steady after 15s or after any interaction.

### 19. No visible "last updated" hint — [UX]
Silent site feels frozen. A tiny "updated Jul 2026" in the footer of AllDoorsStack, or a "commits: N this year" tag, signals aliveness without being cute.

### 20. Prefers-reduced-motion not respected in chat — [UX]
`ai-thinking-dots` animation bounces even for users with vestibular-motion sensitivity. Existing `ReducedMotionView` handles the canvas but not the chat.

### 21. Prefers-color-scheme not offered — [UX]
Dark-only is defensible for cosmic theme but explicitly write it — commit to dark, or add a `[data-theme="light"]` variant (paper-white cosmic). The see-all view especially would read differently in light.

### 22. Chat suggestions grid may break with new copy — [UX]
`.chat-suggestions` at `repeat(3, max-content)` — verify all 3 pills fit at 1200px+ without wrapping weirdly when one question is long and two are short. Recheck after content changes.

### 23. Modal panel bloom origin — [UX]
`transformOrigin` from destination percent is clever but on smaller viewports the origin can land outside the panel edges. Verify it still reads as directional.

### 24. No CMD+K / global shortcut — [UX]
Modern devsy portfolios have this. Not required but hallmark of "designer-work-ish".

---

## Tier 4 — Technical / operational

### 25. No error boundary around Canvas island — [TECH]
If a puzzle bugs out, the whole page throws. Add an ErrorBoundary at Base.astro level.

### 26. No visible rate-limit budget in chat composer — [TECH]
If someone hits the limit mid-conversation, the reject is a surprise. Show "N of 20 today" quietly under the input.

### 27. CV PDF has no cache headers — [TECH]
Add `Cache-Control: public, max-age=31536000, immutable` via `_headers` file in `public/`.

### 28. Analytics token still pending — [TECH]
`PUBLIC_CF_ANALYTICS_TOKEN` was flagged months ago. Either wire it in the Cloudflare dashboard or delete the code path.

### 29. `plain.astro` — is it linked? — [TECH]
If nothing links to it for crawlers, it's dead code. Confirm intent.

### 30. OG image is possibly still placeholder — [TECH]
`/previews/og-card.png` — verify this is the real 1200×630 card, not the setup placeholder.

### 31. No sitemap.xml, no robots.txt — [TECH]
LinkedIn/Google crawl these. Trivial to add.

### 32. No PWA manifest — [TECH]
Not required, but `site.webmanifest` makes the site installable on mobile. Signals depth beyond static portfolio.

---

## If you do only N things

**5-item cut:**
1. Real testimonials (2 minimum)
2. Concrete Leadership numbers (replace hand-wavy rounds with real 2025 data)
3. Impact line per Engineering product
4. Skip-to-content + focus rings (accessibility floor)
5. 404 page + OG image + analytics token

**10-item cut (add these):**

6. LocalStorage chat memory + returning-visitor auto-skip
7. Specific incident/decision anchor in About or Leadership
8. Expand or reframe ELSEWHERE writings
9. CV download acknowledgment micro-animation
10. Reduced-motion respect for chat dots

---

## Verdict

The site is a genuinely impressive craft artifact. What's holding it back from *"hire her"* is that the content still reads as **belief** rather than **evidence**. Numbers, quotes, and specific incidents fix that. Everything else is polish.

---

# Final content-edit plan (locked)

Confirmed decisions after review round:
- Bio math: `4+ years industry`, mirrored everywhere.
- Skip the engineering POV line ("getting it wrong costs more than getting it slow").
- Skip the `20% hands-on` metric.
- Leadership bullet #3: keep current verbatim.
- Post statuses / dates: handled separately (Borbála provides).

## Files touched
- `src/content/doors.data.ts`
- `src/content/ai-system-prompt.ts` (bio math mirror)

## Changes

### 1. About — bio math
`10 years writing code, 5 of them in industry, and 2+ leading…` → `10 years writing code, 4+ in industry, 2+ leading…`. Paragraphs 2 and 3 unchanged.
 -> ok

### 2. System prompt — bio math mirror
Line 20 currently: *"about 5 years in industry — 4+ years full-time engineering plus a 6-month C++ developer internship"*. Sync to `4+`: *"about 4+ years in industry — full-time engineering plus a 6-month C++ developer internship"*.
 -> ok
 
### 3. Leadership metrics — swap for 4 defensible
Drop `60+ features shipped`, `<24h PR → merge cycle`, `+30% delivery uplift from AI`. Result:

 
```
379    · tickets resolved in 2025
+7%    · YoY output, on 33% more demand
4      · engineers, 4 products
0      · attrition since 2024
```

 -> dont touch this; one maybe: you can replace features shipped with tickets resolved IF you genuanly think it will make good, but still round it

### 4. Leadership prose — collapse two paragraphs into one
Replace both with:

> Team lead at Prolan since 2024, running a cross-functional team of 4 engineers across 4 products in a safety-critical environment. Still hands-on in code review, architecture, and anything gnarly enough to need full context. What I care about is a team people actually want to be on — ownership on whoever is closest to the problem, room to try things (new tools, better designs, ideas that haven't earned their place yet), and honest calls about what's ready and what isn't.
 -> no, dont touch
 
### 5. Leadership bullets — no change
Keep current 4 verbatim including #3.

### 6. Engineering intro — no change
Keep current 2 sentences. No POV line added.

### 7. Engineering product summaries — add impact, no HU place names

- **Titanium** — *"End-to-end component and inventory management for manufacturing and production environments. Stabilized a partially finished modernization, retired the legacy system, and redesigned the permission model with a middle tier — routine admin work without full super-user rights."*

- **WebDiag** — flagged: current copy already says "real-time diagnostics for safety-critical railway signalling stations", which is impact-conveying without needing more. Default: leave unchanged unless Borbála wants an addition.

- **DisCom** — *"Cross-border railway communication with real-time translation between operational languages. Delivered under shifting scope; picked the more-thoroughly-tested desktop deployment over the newer web variant, which would have needed more security testing than the timeline allowed."*

- **ProrisCAD** — *"Model-driven CAD for designing and parameterising railway safety systems: safety engineers describe signalling logic in custom DSLs, and the tool generates deployable parameterisation. Started as a resisted internal tool; once we started building it with the users, they took it further than we did."*
  (Trailing "Built on Eclipse Modeling Framework — Xtext … Graphiti …" clause dropped — stack tags already list all three.)
-> nom we need rewrites but this is not good enough.

### 8. Writings — rename section label
`sectionLabel: 'Writings'` → `sectionLabel: 'Recent writing'`
-> no, leave the label (only in description should we say recent, and its already there)

## Not touching
- ELSEWHERE intro paragraph (already in voice)
- All taglines (`team-lead since 2024`, `AI assistant`, `a little wisdom`, etc.)
- Post statuses / dates (waiting on real input)
- ELSEWHERE project card summaries
- ASK ME, ABOUT-profile, FORTUNE sections
- No addition for 20% hands-on

## Open question
- Confirm: leave WebDiag alone, or add an impact clause?
