# Borbála Szilágyi Portfolio

Interactive showcase portfolio for Borbála Szilágyi, a Budapest-based software
engineering team lead focused on pragmatic AI adoption, developer tooling, and
engineering leadership.

The site is built as a single-page portfolio experience: visitors explore a
cosmic canvas, unlock sections through lightweight constellation puzzles, read
selected project and writing cards, download the CV, and ask a scoped AI
assistant about Borbála's professional background.

## What It Showcases

- Professional profile, leadership style, engineering background, education, and
  selected writing.
- Project highlights for the portfolio itself, GlassBox RAG, GitAgents, and
  RAMSey.
- A server-side AI assistant grounded on a curated system prompt, with refusal
  rules and rate limits.
- Responsive desktop and mobile portfolio flows.
- Recruiter-friendly CV access and contact-oriented navigation.

## Tech Stack

- **Astro 6** for the static site shell.
- **React 19** islands for the interactive canvas, puzzles, and chat UI.
- **TypeScript 6** throughout.
- **Zustand 5** for per-tab canvas state.
- **motion 12** for UI animation.
- **Vitest 4**, Testing Library, and MSW for unit/component tests.
- **Cloudflare Pages** for hosting.
- **Cloudflare Pages Functions** for `/api/chat` and `/api/fortune`.
- **Cloudflare KV** for chat rate-limit and token-budget counters.
- **Anthropic Claude** for the portfolio assistant.

## Architecture

The app keeps the interactive surface split into small layers:

```text
src/components/   React UI components
src/state/        Zustand store and canvas state wiring
src/services/     Browser/API side effects
src/domain/       Pure types and puzzle rules
src/content/      Typed portfolio content and assistant prompt
functions/api/    Cloudflare Pages Functions
```

The portfolio is static by default. Server-side behavior is isolated to
Cloudflare Pages Functions so secrets never ship to the browser.

## Local Development

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run test
npm run typecheck
npm run build
```

`npm run dev` starts the Astro dev server. The Cloudflare function endpoints are
available when running through Wrangler:

```bash
npm run build
cp .dev.vars.example .dev.vars
wrangler pages dev dist
```

Fill `.dev.vars` locally with an Anthropic API key. Real secrets are ignored by
Git.

## Deployment

Target platform: **Cloudflare Pages**.

Recommended build settings:

```text
Framework preset: Astro
Build command: npm run build
Build output directory: dist
Node version: 20+
```

The production domain is intended to be:

```text
borbalaszilagyi.com
www.borbalaszilagyi.com
```

Use the Cloudflare dashboard for production secrets, environment variables, and
KV bindings.

## Configuration

| Setting | Where | Default |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | Cloudflare secret / `.dev.vars` | required for chat |
| `CHAT_LIMITS` | Cloudflare KV binding | rate-limit storage disabled if absent |
| `CHAT_MODEL` | Cloudflare env var | `claude-haiku-4-5` |
| `CHAT_MAX_OUTPUT_TOKENS` | Cloudflare env var | `700` |
| `CHAT_RATE_LIMIT_PER_HOUR` | Cloudflare env var | `10` |
| `CHAT_RATE_LIMIT_PER_DAY` | Cloudflare env var | `30` |
| `CHAT_DAILY_TOKEN_BUDGET` | Cloudflare env var | `200000` |
| `ALLOWED_ORIGIN` | Cloudflare env var | permissive if empty |

## Repository Layout

```text
functions/api/     Cloudflare Pages Functions
public/            Static assets, CV, profile image
src/components/    Canvas, puzzle, chat, and fallback components
src/config/        Feature/config switches
src/content/       Portfolio data and assistant system prompt
src/domain/        Pure domain logic
src/layouts/       Astro layouts
src/pages/         Astro routes
src/services/      Client-side service wrappers
src/state/         Zustand state
src/styles/        Global CSS and tokens
tests/             Unit and component tests
```

## License

Personal portfolio. Content, images, CV, and personal materials are copyright
Borbála Szilágyi. Code is shared as-is for reference; no implicit license.
