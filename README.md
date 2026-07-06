# Borbála Szilágyi — Portfolio

An interactive single-page portfolio. A cosmic canvas with a central "YOU" star, five
destinations arranged in a pentagon, and a pipe-rotation puzzle that gates each one.
Solving a puzzle "powers" the destination and reveals an artifact card with the content
behind it (about, leadership, engineering, AI, education). A fortune-cookie shooting star
sits in the top-right; an Aquarius constellation flourish lives in the bottom-left.

The AI destination contains an "ask me anything" chat box that answers questions about
Borbála's work, grounded on a system prompt held server-side.

## Tech stack

- **Astro 6** static site, **React 19** islands (only the canvas + chat are interactive).
- **TypeScript 6** strict throughout.
- **Zustand 5** with `sessionStorage` persistence for per-tab game state.
- **motion 12** (formerly framer-motion) for animations.
- **Vitest 4** + **@testing-library/react** + **MSW 2** for tests.
- **Cloudflare Pages** hosting; **Cloudflare Pages Functions** for the chat API.
- **Anthropic Claude Haiku** for the chat, with prompt caching on the system message.
- **Cloudflare KV** for per-IP rate limiting and the daily token-budget guard.

## Architecture

Strict layering. Each layer depends only on those below it.

```
components/         pure presentational React
   ↓
state/              Zustand store wiring domain + services
   ↓
services/           side effects: fetch, browser APIs (sessionStorage, etc.)
   ↓
domain/             pure types + rules (puzzle solver, etc.) — no React, no DOM
content/            typed data only (door content, system prompt, puzzles)
```

The Pages Function in `functions/api/chat.ts` is the only server-side code. It
applies an Origin allow-list, per-IP rate limits, a daily token-budget cap, and
forwards to Anthropic with the system prompt sent under `cache_control: ephemeral`.

## Local development

```bash
npm install
npm run dev          # Astro dev server only — /api/chat won't respond
npm test             # vitest
npm run build        # static output → ./dist
npm run typecheck    # astro check + tsc --noEmit
```

For the full stack (so `/api/chat` works locally):

```bash
npm run build
cp .dev.vars.example .dev.vars   # then fill in ANTHROPIC_API_KEY
wrangler pages dev dist
```

## Deployment

Every settable value lives in the Cloudflare Pages dashboard (or as a secret) —
**nothing sensitive or environment-specific is in this repo**. `wrangler.toml`
contains project metadata only.

For the first-time deploy walkthrough, see the **DEPLOYMENT CHECKLIST** task in
the project task list (it covers KV setup, env vars, Anthropic secret, and the
GitHub → Cloudflare Pages connection).

After the initial setup, pushing to the connected branch triggers an auto-deploy.

## Configuration surface

| Setting | Where | Default if absent |
|---|---|---|
| `ANTHROPIC_API_KEY` | Cloudflare dashboard (encrypted secret) | — |
| KV namespace bound to `CHAT_LIMITS` | Cloudflare dashboard → Functions → KV bindings | rate limit skipped |
| `CHAT_MODEL` | Cloudflare dashboard env var | `claude-haiku-4-5` |
| `CHAT_MAX_OUTPUT_TOKENS` | Cloudflare dashboard env var | `700` |
| `CHAT_RATE_LIMIT_PER_HOUR` | Cloudflare dashboard env var | `10` |
| `CHAT_RATE_LIMIT_PER_DAY` | Cloudflare dashboard env var | `30` |
| `CHAT_DAILY_TOKEN_BUDGET` | Cloudflare dashboard env var | `200000` |
| `ALLOWED_ORIGIN` | Cloudflare dashboard env var | `""` (permissive) |

## Repository layout

```
functions/api/chat.ts     Cloudflare Pages Function — POST /api/chat
src/
  components/             React components (canvas, chat, fallback)
  content/                typed content (door artifacts, system prompt, puzzles)
  domain/                 pure types + rules
  layouts/                Astro layouts
  pages/                  Astro routes
  services/               side-effectful helpers (fortune, chat, viewport)
  state/                  Zustand store
  styles/                 design tokens + global CSS
tests/                    vitest tests (unit + component)
public/                   static assets
wrangler.toml             project metadata for Cloudflare Pages
```

## License

Personal portfolio — content (text, images) © Borbála Szilágyi.
Code is shared as-is for reference; no implicit licence.
