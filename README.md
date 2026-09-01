# Ripe Studios Site

Custom Next.js App Router scaffold for the Ripe Studios Webflow-to-custom migration.

## Stack

- Next.js 16 + TypeScript
- CSS Modules + global design tokens
- Sanity Studio embedded at `/studio`
- Production-backed component system at `/component-system`
- Draft Mode and on-demand revalidation scaffolding
- Playwright smoke coverage

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Copy the environment template and fill in Sanity values when ready:

```bash
cp .env.example .env.local
```

3. Run the app:

```bash
pnpm dev
```

## Useful Commands

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test:smoke
pnpm exec playwright test tests/component-system.spec.ts
```

## Notes

- The frontend renders local fallback content until Sanity environment variables are configured.
- `/studio` is scaffolded but requires a real Sanity project to become fully functional.
- Revalidation is wired through `/api/revalidate` using `SANITY_REVALIDATE_SECRET`.
- The unlisted component system lives at `/component-system`, with foundations at `/component-system/styles` and the component catalogue at `/component-system/components`. Catalogue specimens import the same typed public components used by production pages.
