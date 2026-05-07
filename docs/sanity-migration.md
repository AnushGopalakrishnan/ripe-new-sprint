# Sanity Migration

This repo now includes a Sanity schema and import pipeline for the Ripe Studios Webflow migration.

## What is in place

- Studio config at `/studio`
- Document types for:
  - `caseStudy`
  - `caseStudyTag`
  - `writing`
  - `writingTag`
  - `teamMember`
  - `teamTag`
  - `feedPost`
  - `feedTag`
  - `siteSettings`
- Import builder that converts the provided Webflow CSV exports and mirrored `/writing/*` pages into Sanity documents

## Build the import file

```bash
pnpm sanity:build-import
```

This writes:

- `.context/sanity/import.ndjson`
- `.context/sanity/import-summary.json`

## Required env

Set these before importing into a real dataset:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-03-01
SANITY_API_WRITE_TOKEN=...
SANITY_API_READ_TOKEN=...
SANITY_REVALIDATE_SECRET=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Import documents into Sanity

```bash
pnpm sanity:import
```

That script uses `createOrReplace`, so reruns are idempotent for the generated document IDs.

## Open the Studio

Once the env vars are present and the app is running:

```bash
pnpm dev
```

Studio URL:

```text
http://localhost:3000/studio
```

## Current limitation

The machine used for this migration is not logged into Sanity yet, so the repo-side migration is ready, but the actual remote project creation and dataset import still need valid Sanity auth.
