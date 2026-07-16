# PortfolioPage

![The portfolio canvas: a pentagon of destinations around a central YOU star](public/previews/portfolio.webp)

Interactive single-page showcase portfolio built around a cosmic canvas,
lightweight constellation puzzles, project cards, a CV download, and a scoped
AI assistant.

## Goal

The goal is to make a portfolio feel more like a small product than a static
resume page:

- fast static first load
- rich interactive canvas on desktop
- simpler responsive flow on mobile
- project and writing cards that are easy to scan
- server-side AI assistant with strict scope, rate limits, and cost guards
- public-safe CV and contact surface

## Tech Stack

- **Astro 6** for the static site shell
- **React 19** islands for the interactive canvas, puzzles, cards, and chat
- **TypeScript 6**
- **Zustand 5** for per-tab canvas state
- **motion 12** for UI animation
- **Cloudflare Pages** for hosting
- **Cloudflare Pages Functions** for `/api/chat` and `/api/fortune`
- **Cloudflare KV** for chat rate-limit and token-budget counters
- **OpenAI or Anthropic** for the portfolio assistant (provider + model set via env)
- **Vitest 4**, Testing Library, and MSW for tests

## Architecture

```text
functions/api/     Cloudflare Pages Functions
public/            Static assets and downloadable CV
src/components/    Canvas, puzzle, chat, and card UI
src/config/        Feature switches
src/content/       Typed portfolio content and assistant prompt
src/domain/        Pure domain logic
src/layouts/       Astro layouts
src/pages/         Astro routes
src/services/      API/browser service wrappers
src/state/         Zustand state
src/styles/        Global CSS and design tokens
tests/             Unit and component tests
```

The site is static by default. Runtime behavior that needs secrets or abuse
guards is isolated in Cloudflare Pages Functions.

## Checks

```bash
npm run test
npm run typecheck
npm run build
```

## License

Personal portfolio. Content, images, CV, and personal materials are not licensed
for reuse. Code is shared as-is for reference; no implicit license.
