# Workspace Memory

## Operating Instructions

- The user grants standing permission to use subagents whenever they are materially helpful and the work can be cleanly parallelized.
- Do not change the visual design or interaction design of pages unless the user explicitly asks for a design change. “Migrate to native/custom code” does not authorize any visual redesign.
- Keep this file current. Any agent working in this workspace should update this file whenever project goals, architecture, dependencies, deployment state, source-of-truth assumptions, major fixes, or known risks change in a way that a future agent would need to know.
- Favor concise factual updates. Do not add fluff. Do add enough context that a new agent can resume the project without rereading the full chat history.
- Do not scan outside this workspace unless absolutely necessary. Earlier cross-directory scans triggered repeated macOS privacy prompts in Conductor.
- Do not use Computer Use unless the user explicitly wants it. It previously caused confusion and is not needed for the current workflow.
- For small UI-only changes such as color, font, spacing, corner radius, or similarly scoped styling tweaks, do not run deep/full test suites by default. Use the lightest reasonable verification, such as type/lint only if relevant or a quick local visual/DOM check. Reserve Playwright smoke suites, full builds, and broader regression checks for larger feature work, interaction changes, routing changes, data/CMS changes, or risky refactors.
- Do not deploy after every change. Wait for the user to explicitly ask for deployment before running Vercel deploy or alias commands.
- When the user says "deploy it" for this repo, they mean commit the work, merge it into `main`, and push `main` so Vercel auto-deploys from Git. Do not create manual Vercel deployments unless the user explicitly asks for a manual Vercel deploy.
- When the user asks for "the link" or any user-facing site URL, give the canonical production URL (`https://ripe-studios.vercel.app`) by default, not the immutable Vercel deployment URL. Include deployment URLs only when specifically discussing deployment receipts, debugging, rollback, or exact-build verification.
- Do not expose external inspiration/reference/source names in client-facing code, filenames, CSS module class names, aria labels, comments, or DOM-visible strings. If a design starts from a reference, neutralize the implementation before handoff; use Ripe-owned names and local assets where practical.
- Hard rule from 2026-05-20: shadcn/ui and Tailwind/shadcn CSS are allowed only inside the visual editor surface. Never use shadcn/ui to restyle or rebuild the public website. Keep shadcn components under the editor-only namespace (`src/components/editor-ui`) and keep shadcn CSS route-scoped to the visual editor.

## Lessons From 2026-05-19 Comment/Deployment Incident

- When the user asks where visual changes went, do not assume the latest named branch contains the desired design. Compare all relevant branches/commits against `origin/main`; in this case the intended Figma-style note design was on `sample-comment-case-study`/`abdcdfa`, while `redesign-polestar-comment` held a later compact marker/card redesign that had replaced it on `main`.
- Restore lost visual work by applying it onto a fresh worktree based on latest `origin/main`, not by rolling the app back to the old feature branch. Preserve later fixes while restoring the design; here that meant keeping flexible-layout `fitMode="contain"` frame alignment and the Sanity cover-media fallback while reapplying the white 40px note shell UI.
- For Vercel work from a new worktree, always run `vercel link --yes --project ripe-studios-cms --scope anushgopalakrishnans-projects` before deploying. Running `vercel deploy` from an unlinked worktree can create a new accidental Vercel project. If that happens, remove the accidental project and relink to `ripe-studios-cms` before continuing.
- The Vercel project currently has Sanity environment variables only for Development and Production, not Preview. Preview deployments under `ripe-studios-cms` can return 404 for CMS-only case-study slugs such as `/case-studies/case-study-22`; use a production deployment/canonical alias for those checks unless Preview env vars are added.
- After a production deploy, explicitly alias `https://ripe-studios.vercel.app` to the intended `ripe-studios-cms` deployment. Do not rely on Vercel's automatic alias output, which may mention older/internal project domains such as `chengdu-chi.vercel.app`.
- For the restored case-study comments, verify the actual production page with Playwright/computed styles on `https://ripe-studios.vercel.app/case-studies/case-study-22`: closed note should be `max-width: 40px`, opened note should be `max-width: 413px`, author font should be Times-style serif, body font should be Graphik/sans, and body text should include `lorem ipsum dolor sit amet`.

## Project Goals

- Migrate the existing live Webflow Ripe Studios site into custom code with 1:1 visual design and functionality parity.
- The primary shipped artifact should be the real Ripe clone, not a placeholder scaffold or unrelated rebuild.
- Migrate CMS/content editing to a custom Sanity-backed CMS.
- Sanity should ultimately power the actual Ripe clone, not exist as a separate scaffold disconnected from the clone.
- Preserve the current interactions and visual behavior from the live Webflow staging site unless the user explicitly asks for changes.

## Source Of Truth

- Live staging site to clone:
  - `https://ripe-studios-e83bf0-64c72-4e9b8f09cddc9.webflow.io/`
- Webflow export ZIP provided by the user:
  - `.context/attachments/ripe-studios-e83bf0-64c72-4e9b8f09cddc9.webflow.zip`
- CMS CSV exports provided by the user live under:
  - `.context/attachments/`
- If there is ever a mismatch between the old scaffold and the mirrored live site, the mirrored live site is the product target.

## Current Repo Reality

- This repo currently contains two different tracks of work:
  - `site/`: the mirrored static clone of the real Ripe Webflow site
  - `src/` + `sanity.config.ts`: a separate Next.js + Sanity app/scaffold
- These two tracks are now unified enough that the public site mostly runs as app-owned Next routes.
- Public non-detail pages now render as native Next routes using the exported/mirrored Webflow DOM, CSS, and scripts inside the app.
- The only intentionally deferred public route family is `/case-studies/[slug]`, which still uses the mirror path.
- The user wants the clone and the CMS migration combined eventually, but today they are still separate implementation paths in the repo.

## What Exists Today

### Current Focus / Archive Organization

- As of 2026-05-15, the active app focus is intentionally narrowed to:
  - `/`
  - `/home-new-feed`
  - `/home-old-feed`
  - `/work-new`
  - `/work-new-alternate`
- Active focus route files remain in `src/app/(site)`.
- `/` now renders the same custom native feed experience that was previously only on `/home-new-feed`.
- The previous Webflow mirrored homepage feed was archived at `/home-old-feed`.
- `/home-copy` and `/home-motion-hero` remain available as archived homepage variants.
- Resolved on 2026-05-15: `HomeFeed` now sets the feed wrapper background to white in `src/components/home-feed.module.css` via `--home-feed-bg: #ffffff`, with default wrapper text color set to black.
- Resolved on 2026-05-15: `HomeFeed` hover pills now center and pad the absolutely positioned action label, fixing clipped/misaligned revealed "View" text on case-study/feed blocks.
- Resolved on 2026-05-15: removed external inspiration/reference naming from the native feed and related app-owned source. The feed component now uses neutral `HomeFeed` naming, the feed aria label is `Featured work feed`, feed/work/detail media were localized under `public/feed-media`, `public/work-media`, `public/case-detail-media`, and local font files live under `public/fonts`.
- Corrected on 2026-05-15: active routes `/`, `/home-new-feed`, `/work-new`, and `/work-new-alternate` must keep the original mirrored page shell for visual parity. A native shell/hero replacement changed the design and was reverted. The homepage now uses the original mirrored hero/nav/footer shell with only the feed section swapped to the neutral `HomeFeed` component.
- Correction on 2026-05-19: the current checked-in component is still `StudioBFeed` (`src/components/studio-b-feed.tsx`), and `src/components/home-feed.tsx` is not present in git history. Homepage routes currently import `StudioBFeed`.
- Update on 2026-05-21: `/team` and `/team/[slug]` are now native Next.js routes under `src/app/(site)/team`, backed by Sanity `teamMember` documents (`getTeamMembers`, `getTeamMemberBySlug`, `TEAM_MEMBERS_QUERY`, `TEAM_MEMBER_QUERY`). `/team` now renders interactive group hover cards, copy-email tooltip behavior, and open-roles directional hover in React (`src/components/team-page-client.tsx` + `src/components/team-page-client.module.css`). Previous mirrored team routes were archived as `src/app/(archive)/team/page.archived.tsx` and `src/app/(archive)/team/[slug]/page.archived.tsx`.
- Update on 2026-05-25: `/careers` was migrated off the archived mirror route into a native app route at `src/app/(site)/careers/page.tsx`, and the former archive route file was renamed to `src/app/(archive)/careers/page.archived.tsx` to avoid duplicate App Router path conflicts. The new native page is a custom four-section careers layout (hero image rail + mission/vision, pillars section, editorial mosaic section, and founders/group-photo + open roles) with hardcoded stock-image URLs for now.
- Update on 2026-05-25: careers hero was revised to closely match the Zelvin About-section source DOM/CSS for the first block only. `src/app/(site)/careers/page.tsx` + `page.module.css` now use the same hero copy, `our story` pill treatment, mission/vision copy, trust row wording (`Trust by 50k+ clients & organisations`), overlapped avatar row (Framer image assets), and `Get In Touch` button style. Image showcase carousel work is intentionally deferred to the next pass.
- Update on 2026-05-25: inserted a Last Studio-inspired moving filmstrip block between careers hero headline and mission/vision (`src/app/(site)/careers/page.tsx` + `page.module.css`). The strip uses the same source assets (3 images + 1 video), desktop/tablet dimensions from the extracted Framer markup (`340x274/510/340` and `255x205/383/255` with `24px/16px` gaps), and a continuous slow horizontal loop via CSS keyframes.
- Follow-up on 2026-05-25: fixed careers hero layout constraint/alignment issues from the first filmstrip pass. `src/app/(site)/careers/page.module.css` now widens the hero container to `1290px` (`max-width: 80.625rem`) so the strip viewport is not over-constrained by the default section max width, right-aligns the Zelvin mission/vision/trust block (`margin-left: auto`), and sets explicit avatar-stack height to prevent overlap/collapse into the next section.
- Follow-up on 2026-05-25: made the careers filmstrip viewport full-bleed so it spans screen width instead of being constrained by section max widths. In `src/app/(site)/careers/page.module.css`, hero max width is unset for the section, and desktop filmstrip wrapper now uses negative side offset (`margin-left: -2rem`) with expanded width (`calc(100% + 4rem)`); tablet/mobile keeps normal inset width.
- Follow-up on 2026-05-25: careers filmstrip full-bleed behavior was tightened to true viewport width. `.filmstripWrap` now uses `width: 100vw` with `margin-left: calc(50% - 50vw)` so only the strip ignores parent/container constraints while surrounding hero content remains layout-bound.
- Correction on 2026-05-25: fixed an invalid pillars sizing pass that forced fixed `165x211` dimensions on full pillar columns and caused text overflow/overlap. Pillars grid/columns are back to fluid width/auto height; only the requested section top spacing (`122px`) remains.
- Follow-up on 2026-05-25: pillars are now responsive and tied to hero content width. In `src/app/(site)/careers/page.module.css`, hero and pillars share `--hero-content-max` (`53.75rem`), pillars have `gap: 0` (no spacing between cards), and pillar card padding/typography now scale with viewport using `clamp()` (Plantin MT Pro, `-0.025em` letter-spacing).
- Follow-up on 2026-05-25: pillars should fill the normal page container width (not full viewport width). The temporary `.pillarsSection` full-width override was removed; default section margins remain, while `.pillarsGrid` stays unconstrained by the old hero-width cap so cards use the entire container.
- Follow-up on 2026-05-25: careers pillars were adjusted again per latest direction: `.pillarsGrid` now full-bleed (`width: 100vw`, centered with `margin-left: calc(50% - 50vw)`), internal pillar card content gap reduced, and the “Work thrives…” statement now has explicit `122px` top margin.
- Correction on 2026-05-25: full-bleed `100vw` behavior belongs to the section after “Work thrives…” (the mosaic/cards section), not the pillars grid. `src/app/(site)/careers/page.module.css` now keeps `.pillarsGrid` at container width and applies `100vw` + centered breakout to `.mosaicSection`.
- Follow-up on 2026-05-26: `.mosaicSection` needed a higher-specificity override to escape the global `.page section` `max-width`/padding constraint. Added `.page section.mosaicSection` with full-bleed viewport breakout (`width: 100vw`, centered with `margin-left: calc(50% - 50vw)`, zero horizontal padding) and tightened inter-card gap.
- Follow-up on 2026-05-26: updated careers mosaic card top-left labels to include a Veru-style blue circular indicator and refined label micro-typography (`inline-flex` label alignment, tighter tracking/size). Blue cards keep a higher-contrast indicator border for visibility.
- Follow-up on 2026-05-26: careers mosaic cards were reworked again to closer-match Veru’s home grid structure/content: preserved 9-card layout, switched to Veru media assets (`wXUG...`, `TRRk...`, `K6bq...`, `UC0I...`, `xI3k...`), added tag metadata (`(TEAM)`, `(3)`, `(BRANDING)`, blog dates), and changed neutral card background to the Veru light-grey token (`rgb(245,245,245)`).
- Follow-up on 2026-05-26: replaced the old static careers mosaic block with a dedicated interactive component (`src/app/(site)/careers/careers-mosaic.tsx` + `careers-mosaic.module.css`) to match the reference behavior: fixed 3-column top grid + 3-card blog row, logo ticker/filmstrip in the clients card using extracted SVG logo assets (`public/logos/studio-logo-*.svg`), rotating testimonial carousel with interactive dots, typewriter-style services word cycling, and hover-reveal title/arrow interactions on image cards.
- Follow-up on 2026-05-26: updated careers open-roles copy text block and list sizing rules per direction: `Open Roles` heading is `20px`, first-row offset is `14px` (`ul` top margin), role row padding is `14px`, and role title text (`.rolesListWrap span`) is `8px`.
- Follow-up on 2026-05-26: adjusted roles typography again per latest direction: left copy font size reduced to `1rem`, `Open Roles` increased to `32px`, and role listing title text increased to `14px`.
- Follow-up on 2026-05-26: `/careers` scrolling felt capped before the page end while Lenis was active. Kept smooth scrolling enabled globally and updated `src/components/smooth-scroll-provider.tsx` to aggressively refresh Lenis dimensions on route changes/media readiness (`scrollTo(0, immediate)`, delayed `resize()` calls, image/video load listeners, plus window/font resize hooks) so late-loading media no longer truncates scroll limit near the careers page bottom.
- Follow-up on 2026-05-26: Team Open Roles is kept on its original implementation in `src/components/team-page-client.tsx` (Join Us heading, copy tooltip behavior, directional row interactions). Careers now renders an exact-clone client block at `src/components/careers-open-roles.tsx` using the same join-us DOM/class structure and directional hover logic with careers role data.
- Update on 2026-05-26: Added a shared Sanity CMS collection for jobs: `jobPosting` (`src/sanity/schemaTypes/jobPosting.ts`) with required fields `title`, `location`, `contractType`, and `externalUrl` plus optional `order`. Added `JOB_POSTINGS_QUERY` in `src/sanity/lib/queries.ts` and `getJobPostings()` in `src/lib/content.ts` (published + draft fallback + local fallback list). Both `/team` and `/careers` now consume the same `getJobPostings()` dataset: `src/app/(site)/team/page.tsx` passes roles into `TeamPageClient`, and `src/app/(site)/careers/page.tsx` passes roles into `CareersOpenRoles`.
- Follow-up on 2026-05-26: careers founder cards now source images/names/roles from Team CMS members filtered by `group == Leadership` (`getTeamMembers()` in `src/app/(site)/careers/page.tsx`), with fallback backfill to hardcoded founders only when fewer than two leadership members have avatar media.
- Follow-up on 2026-05-28: applied a visual-editor handoff for `/careers`: removed the hero `our story` pill, changed the hero H1 to normal-weight Times New Roman, and changed desktop page padding from `32px 0 80px` to `80px 0`.
- Follow-up on 2026-06-18: cleaned up `/careers` typography/CTA/rhythm. Header-style text now consistently uses Times New Roman, body copy stays sans where applicable, CTAs/open role rows/copy email have hover/focus states, section gaps use shared responsive spacing instead of `!important` margins, and the filmstrip/page now clips horizontal overflow. Verification: `pnpm lint`, `pnpm typecheck`, and Playwright checks at 1440/900/390 widths passed for heading fonts, spacing, no text overlap, and no horizontal overflow.
- Correction on 2026-06-18: reverted the Careers Open Roles section-specific styling changes from the typography/CTA cleanup after user feedback that the previous section was better. Removed the broad `.peopleSection` job-row/heading/copy-email overrides and restored the prior roles selectors/serif treatment; `CareersOpenRoles` copy-email markup is back to its previous non-button shape. Verification: local `/careers` computed styles show Open Roles using the original Plantin/serif path with no row transform override; `pnpm typecheck` and `pnpm lint` passed.
- Follow-up on 2026-05-26: main `/case-studies/[slug]` route now uses padded desktop side insets matching the prior `/case-studies-padded/[slug]` experiment by applying the same `200px` horizontal values directly in `src/app/(site)/detail-page.module.css` (`.formaChrome`, `.formaHeroCopy`, `.formaInfo`, `.formaIntroMedia`, `.formaCarousel`, `.formaWideFeature`, `.formaFlexibleLayouts`, `.formaFooter`). Existing main-route client logic (including row-span layout support) remains unchanged.
- Update on 2026-05-21: case-study pinned comments now source commenter references from `teamMember` instead of `caseStudyCommenter` (`src/sanity/schemaTypes/caseStudy.ts`), and case-study queries resolve avatar URLs from the teamMember `mediaBlock` avatar structure with legacy fallback handling (`src/sanity/lib/queries.ts`).
- Pages and route handlers that are not currently being worked on were moved into `src/app/(archive)` so they are preserved but visually out of the main working area.
- The archive move uses a Next.js route group, so the archived routes are still available if needed. This was an organization change, not a deletion.
- Update on 2026-05-19: `src/app/(archive)/case-studies/[slug]/page.tsx` was renamed to `page.archived.tsx` to prevent duplicate App Router path resolution with the active `src/app/(site)/case-studies/[slug]/page.tsx`.
- Update on 2026-05-19: case-study flexible layout rendering now uses a 1440-canvas ratio model with 20px side padding assumptions and per-row responsive height scaling (capped at authored desktop size). Layout media now defaults to no-crop (`object-fit: contain`) and pinned comments are offset-aware so markers stay aligned when contain letterboxing is present.
- Update on 2026-05-19: Sanity `caseStudyLayout` now includes `designWidth` (default 1440), row cell-width sum validation (must total 100%), and row preview helper text with computed target row/cell pixel dimensions for the 1440/20/20 system. Case-study queries/types now project `designWidth`, with runtime fallback to 1440 for older documents.
- Fix on 2026-05-19: Studio width constraint was caused by mirrored Webflow CSS links being loaded globally from `src/app/layout.tsx`. Those links plus the hero critical style were moved to `src/app/(site)/head.tsx` so they only apply to public site routes and not `/studio`.
- Regression fix on 2026-05-25: Studio width became narrow again because exported Webflow CSS links and the hero critical style had reappeared in the root `src/app/layout.tsx`. Removed those links/styles from the root layout, route-scoped the public-site Webflow CSS links/critical style through `src/app/(site)/layout.tsx`, and hardened the Studio global reset in `src/app/globals.css` (`body:has(#sanity)` now has `margin: 0`, full width/min-height; `#sanity` uses `width: 100%`). Local verification on `/studio`: no Webflow/normalize stylesheet links, `body` width equals viewport, `#sanity` width equals viewport at x=0. Also verified `/` and `/case-studies/zetachain` still load public-site CSS and `pnpm typecheck` passes.
- Deployed via Git on 2026-05-25: branch commit `dec913b` was pushed directly to `origin/main` (fast-forward from `62a3640`) so Vercel auto-deployed from main. Ready production deployment: `https://ripe-studios-ewzx1v3lw-anushgopalakrishnans-projects.vercel.app` (`dpl_2LBowP6i2oJkEfF8tcxuQ3uctqyx`), aliased to `https://ripe-studios.vercel.app`. Live verification: `https://ripe-studios.vercel.app/studio` has `#sanity` full viewport width at x=0, body margin `0`, and no Webflow/normalize stylesheet links; `/case-studies/zetachain` returns 200.
- Follow-up on 2026-05-19: flexible case-study layout blocks now also cap rendered row width to the design inner width (`designWidth - 40`), not just row height, so ultrawide viewports cannot produce oversized media widths (for example ~1444px) that break the 1440-canvas math.
- Follow-up on 2026-05-19: removed responsive row-height scaling math (`min(authored, scaled)`) for flexible layouts. Desktop/tablet rows now use literal CMS-authored heights in px; mobile still stacks rows and uses computed per-cell aspect ratio.
- Update on 2026-05-19: reverted the max-width cap and fixed-height behavior for flexible case-study layouts. Rows now scale height from current rendered row width using authored row ratio so layout width remains page-responsive while maintaining aspect ratio.
- Update on 2026-05-19: flexible row sizing no longer uses inline `height: calc(...)`; rows now use CSS `aspect-ratio` derived from design inner width and authored row height.
- Update on 2026-05-19: case-study hero overlay left copy now uses `detailEyebrow` (short description) to match the Forma reference behavior.
- Update on 2026-05-19: case-study detail info-stage wrapper is now explicitly opaque white (`.formaInfoStage` + `.formaInfo` background) with `isolation: isolate` to prevent underlying pinned-hero tint/transparency bleed-through.
- Update on 2026-05-19: case-study detail info-stage hardening now uses explicit white/background opacity resets with `!important` (`.formaInfoStage`, `.formaInfoStage .formaInfo`, `.formaHeroStageContent`) to defeat external stylesheet transparency/filter bleed.
- Update on 2026-05-19: case-study hero scroll effect no longer scales (zooms) media. Parallax translation remains, but `scale(...)` was removed from `.formaHeroStage .formaHeroMedia` on desktop and mobile breakpoints.
- Update on 2026-05-19: removed inter-section gap between info stage and following content by zeroing flexible-layout top margin (`.formaFlexibleLayouts`) and moving breathing room to internal info padding (`.formaInfo` desktop/mobile bottom padding reduced to compact internal spacing).
- Update on 2026-05-19: case-study detail facts now source `Services` strictly from Sanity `detailServices` and `Year` strictly from Sanity `year` in `src/app/(site)/case-studies/[slug]/page.tsx` (removed fallback from `tags` for services). Studio schema now enforces both fields: `detailServices` required with min 1, `year` required.
- Update on 2026-05-19: hardened `detailServices` query mapping to avoid null deref values: GROQ now uses `array::compact(detailServices[]->coalesce(title, name, label))` and also returns `detailServicesRaw` for legacy string-array docs. Client mapping now falls back only to legacy raw strings from `detailServices` when dereferenced titles are empty (still no fallback to `tags`).
- Correction on 2026-05-19: previous `detailServices[]->coalesce(...)` GROQ caused parser failure. Query now projects valid fields (`detailServices[]->title`, `detailServicesExpanded`, `detailServicesRaw`) and TS normalization in `src/app/(site)/case-studies/[slug]/page.tsx` converts string/object service payloads (`title`/`name`/`label`) into plain unique strings, preventing `[object Object]` in rendered Services.
- Update on 2026-05-19: Services fact row (above Industry) now prioritizes `detailServicesResolved`, a GROQ subquery that resolves `caseStudyTag` titles by referenced IDs from `detailServices` (including refs stored with `drafts.` prefix). Mapping then falls back through `detailServices`, `detailServicesExpanded`, and `detailServicesRaw` normalization.
- Correction on 2026-05-19: simplified Services pipeline to a single canonical field from Sanity `detailServices` only. GROQ now normalizes each entry via `coalesce(@->title, @.title, @)` inside the array projection, and client mapping uses only this normalized `detailServices` list (deduped) for the row above Industry.
- Update on 2026-05-19: `getCaseStudyBySlug` now performs a targeted server-side fallback fetch in Sanity `drafts` perspective (using `SANITY_API_READ_TOKEN`) when the published query returns a case study with empty `detailServices`. This is specifically to ensure the Services fact row populates when `detailServices` references point to draft/unpublished tag documents.
- Update on 2026-05-19: disabled long-lived data-cache for single case-study fetches. `getCaseStudyBySlug` now calls `sanityFetch` with `revalidate: 0` and `tags: []`, ensuring `/case-studies/[slug]` always pulls fresh Sanity data (fixes stale Detail Services not appearing after updates).
- Correction on 2026-05-19: reverted overly transformed `detailServices` projection. Query now fetches raw `detailServices` plus explicit dereference field `"detailServiceTitles": detailServices[]->title`; client mapping prioritizes `detailServiceTitles` for the Services row above Industry, then falls back to normalized raw `detailServices`.
- Update on 2026-05-19: added hard fallback for Services resolution in `getCaseStudyBySlug`. If `detailServiceTitles` is empty but `detailServices` contains references, the server now extracts `_ref` IDs (including `drafts.`-prefixed refs), normalizes them, fetches matching `caseStudyTag` docs by `_id`, and injects `detailServiceTitles` before rendering.
- Correction on 2026-05-19: some `detailServices` refs are legacy slug-shaped values (`caseStudyTag.<slug>`) rather than document `_id`s. Resolver now handles both forms: it fetches tags by `_id` and by `slug.current`, then rebuilds service titles in original ref order; if slug lookup misses, it humanizes the slug token as a last-resort label.
- Update on 2026-05-19: flexible case-study layout media now defaults to crop-safe behavior with `object-fit: cover` (runtime `fitMode="cover"` + CSS `.formaLayoutMedia { object-fit: cover; }`) so incorrect asset aspect ratios are handled gracefully by the layout.
- Update on 2026-05-19: mobile flexible layout behavior was simplified by request: under the mobile breakpoint, fancy row/cell ratio composition is disabled (`.formaLayoutRow` `aspect-ratio: auto`, single-column) and cells/media render as a straightforward stacked list of assets.
- Update on 2026-05-25: re-enabled experimental case-study row-span support. Flexible layouts again support optional per-cell `rowSpan` in Sanity templates/legacy rows, with span-aware content mapping and span-capable rendering for compatible layouts (uniform columns by row). The floating comments toggle still only appears when at least one comment exists across hero/layout/media sections, and keyboard `C` toggle stays disabled when no comments are present.
- Update on 2026-05-22: added a test duplicate detail route at `/case-studies-padded/[slug]` (`src/app/(site)/case-studies-padded/[slug]/page.tsx`) that mirrors `/case-studies/[slug]` data/rendering but uses a copied client + stylesheet with desktop horizontal side padding increased from `20px` to `200px`. Follow-up fix: flexible-layout aspect-ratio math was decoupled from the visual gutter and restored to the authored design baseline (`designWidth - 20 - 20`) so row proportions remain correct.
- Update on 2026-05-25: added case-study long-form HLS video support using Media Chrome controls. `mediaBlock` now has `longFormEnabled` + `longFormHlsUrl` with validation (long-form requires video media + HLS URL), case-study GROQ media projection now returns `longForm { enabled, hlsUrl }`, and both detail route clients (`/case-studies/[slug]` and `/case-studies-padded/[slug]`) now branch to a Media Chrome + `<hls-video>` player (manual play, full controls including seek/time/volume/rate/PiP/fullscreen) when long-form is enabled. Existing short-form autoplay video path and comment overlays remain unchanged.
- Regression fix on 2026-05-25: long-form case-study player became non-interactive after merge/poster wiring. Restored interaction by ensuring `.detailLongFormPlayer` allows pointer events (`pointer-events: auto`) in both detail stylesheets, corrected poster helper call sites to pass `src` (not `videoSrc`) in both detail clients, and hardened `CaseStudyLongFormPlayer` with a `typeof video.play === "function"` guard plus an `error` listener that exits loading state to `paused`.
- Follow-up fix on 2026-05-25: long-form playback clicks were still blocked by overlay layers in detail styles. Set `.detailCommentable::before` to `pointer-events: none` and set `.detailLongFormInterface` to `pointer-events: none` (while keeping `.detailLongFormInterfaceBottom` interactive) in both standard and padded detail stylesheets so the center play button and media surface can receive pointer input.
- Update on 2026-05-25: automatic video poster resolution for case studies is now precomputed server-side in `src/lib/content.ts` during case-study normalization (`normalizeCaseStudyMedia`), including cover media, detail hero/intro/carousel/layout/cta media, detail more-project media, and testimonial avatars. Case-study detail clients and the case-studies index client no longer call `resolveVideoPoster` at render time and now consume pre-resolved `poster` values from server data.
- Follow-up hardening on 2026-05-25 for poster artifacting: adjusted provider-derived poster URLs in `src/lib/video-poster.ts` (`Mux` now uses `.webp` + `width=1600&fit_mode=preserve`; `Cloudflare Stream` now uses `time=2s&height=720&fit=clip`). Also updated `CaseStudyLongFormPlayer` to render a dedicated poster overlay image and keep it visible until the first decoded frame is ready (`data-frame-ready`), preventing black/patchy decode frames from showing through at startup.
- Update on 2026-05-25: Sanity uploaded poster images are now first-priority in GROQ projections by switching poster coalesce order to `coalesce(posterImage.asset->url, poster)` in `src/sanity/lib/queries.ts` (home hero media, case-study media, writing author/cover media, and team avatar media). This ensures uploaded `posterImage` is the default poster source before URL/manual/auto fallbacks.
- Follow-up on 2026-05-25: case-study video rendering now defers network loading for non-priority/non-eager video blocks using `IntersectionObserver` (`rootMargin: 300px`) while preserving poster-first paint. Both native video and long-form `<hls-video>` branches now keep `preload="none"` until near viewport, then switch to metadata/auto loading, so offscreen sections do not fetch video immediately and avoid empty black media surfaces when poster is provided.
- Follow-up on 2026-05-25 (all videos): applied poster-first + lazy-loading UX to all app-owned video renderers, not only long-form case-study detail. Added deferred video loading and first-frame placeholders (now static fade placeholders, no sweeping shimmer animation) in:
  - case studies index/list preview (`src/app/(site)/case-studies/case-studies-index-client.tsx` + `case-studies-native.css`)
  - work journal grid/list preview (`src/components/work-journal-section.tsx` + `work-journal-section.module.css`)
  - home feed video cards (`src/components/home-feed.tsx` + `home-feed.module.css`)
  - shared media player (`src/components/media-player.tsx` + `media-player.module.css`)
  - case-study detail + padded detail commentable videos (added first-frame readiness overlay state in both detail clients/styles).
  Work journal video poster fallback now defaults to `item.image` when explicit poster is missing.
- Follow-up on 2026-05-25: removed animated white sweep/shimmer loading overlays from all updated video placeholder surfaces (`case-studies-native.css`, `work-journal-section.module.css`, `home-feed.module.css`, `media-player.module.css`, `detail-page.module.css`, and padded detail stylesheet) to avoid persistent sweeping gradients after video load on slower/event-missing paths.
- Follow-up on 2026-05-25: added shared poster resolution utility (`src/lib/video-poster.ts`) and wired it into all app-owned video renderers. Poster priority is now: explicit poster URL/upload from Sanity first, then auto-derived poster for known HLS providers (Mux `stream.mux.com` -> `image.mux.com` thumbnail; Cloudflare Stream `.../manifest/video.m3u8` -> `.../thumbnails/thumbnail.jpg`) using source/HLS URL. This includes long-form case-study `<hls-video>` player branches.
- Follow-up on 2026-05-25: loosened Sanity `mediaBlock.posterImage` field visibility so custom poster uploads remain available when `kind` is unset/auto (hidden only when kind is explicitly `image`), supporting custom poster overrides without forcing manual `kind: video`.
- Update on 2026-05-25: restyled the native case-study long-form player in both `/case-studies/[slug]` and `/case-studies-padded/[slug]` with Ripe editorial UI: centered large play affordance, dark media shade, bottom overlay control bar, sharp black/white/orange controls, orange timeline/thumb, and compact mobile controls. `<hls-video>` now includes `tabIndex={-1}` plus `suppressHydrationWarning` to avoid Media Chrome/client-added attribute warnings. Local verification with `.env.local` from Vercel development env: `pnpm typecheck` passed; Playwright DOM checks on `/case-studies/zetachain` at 1440 and 390 widths found `media-controller`, `hls-video`, 10 controls, center play visible while paused, and no console errors.
- Follow-up on 2026-05-25: adapted the supplied Osmo-style HLS player behavior onto the native Media Chrome case-study player without copying external class/data naming or adding a second HLS runtime. The player now has paused/loading/playing overlay states, hover/interaction-revealed controls, an active-buffering loading layer, center play/pause behavior, dark overlay opacity changes, and inactive fade-out while playing. Verification: `pnpm typecheck` passed; Playwright click test on local `/case-studies/zetachain` started playback (`readyState: 4`, time advanced), then overlays faded while inactive with no console errors.
- Correction on 2026-05-25: user requested the supplied player UI exactly, not a Media Chrome adaptation. Replaced the visible long-form player controls with a custom Ripe-owned component (`src/components/case-study-long-form-player.tsx`) that mirrors the supplied UI structure: full-surface play/pause overlay, circular blurred big button, bottom play/time/timeline/mute/fullscreen controls, orange progress/buffer/handle treatment, loading overlay, status/hover/mute/fullscreen data-state styling, and the same reduced button set (removed seek, volume range, playback rate, PiP from the visible UI). The implementation still uses the existing `<hls-video>` source path and neutral class names. Verified `pnpm typecheck`, desktop playback (`readyState: 4`, time advanced, controls faded while idle), and mobile 390px geometry.
- Follow-up on 2026-05-25: long-form player media now uses `object-fit: contain` instead of `cover` to prevent video cropping when the CMS layout slot aspect ratio differs from the HLS video aspect ratio. Player corner rounding and mask clipping were removed (`border-radius: 0`, no radial mask) in both active and padded detail styles. Verified locally on `/case-studies/zetachain`: computed player radius `0px`, video `object-fit: contain`, and `pnpm typecheck` passed.
- Follow-up on 2026-05-25: the `contain` behavior can create side letterboxing when the layout slot is wider than the video. The long-form player and nested `hls-video` now explicitly use black backgrounds so letterbox space does not show as white/gray page gutters. Verified computed `playerBg`/`videoBg` are `rgb(0, 0, 0)`, `object-fit: contain`, radius `0px`, and `pnpm typecheck` passed.
- Follow-up on 2026-05-25: the long-form player timeline accent is now case-study configurable. Both active detail routes pass the existing `accentColor` field from Sanity/work-journal data into the page-level CSS custom property `--case-study-player-accent`, and the timeline progress/handle use `var(--case-study-player-accent, #ffffff)`. Default is white when no case-study accent is set. Verified `pnpm typecheck` and local `/case-studies/zetachain` computed `--case-study-player-accent: #ffffff`, progress/handle `rgb(255, 255, 255)`, and `hls-video` `object-fit: contain`.
- Follow-up on 2026-05-25: the long-form player mute control now exposes a vertical volume slider on hover and keyboard focus. Slider changes set `hls-video.volume`, moving above 0 unmutes, moving to 0 mutes, and the mute button keeps its click-to-mute/unmute behavior with accessible labels.
- Follow-up on 2026-05-25: Sanity `caseStudy.accentColor` remains stored as a string for frontend compatibility, but the Studio field now uses a custom `ColorStringInput` (`src/sanity/components/color-string-input.tsx`) with a native color picker, editable CSS color text field, and clear button. The picker writes normalized hex strings; empty still defaults the frontend player accent to white. Verified `pnpm typecheck` and local `/studio` returns 200.
- Follow-up on 2026-05-25: case-study detail sans-serif typography now uses Graphik instead of the page-local Switzer font. Removed the Switzer `@font-face` blocks and changed the remaining sans stacks in both active and padded detail styles to `"Graphik", Arial, sans-serif`. Verified locally on `/case-studies/zetachain`: main, hero H1, and player time text compute to Graphik; no Switzer style text remains; `pnpm typecheck` passed.
- Follow-up on 2026-05-25: case-study detail sans typography was refined to Graphik Regular only on the active and padded detail pages. Remaining page-local sans weights were changed from 500/600 to 400. The Information block now measures its rendered copy and collapses only when it exceeds 10 lines, showing a `(SEE MORE)` button one line below the clipped copy; clicking toggles expansion to `(SEE LESS)`. The button has `8rem` bottom margin. Verified locally on `/case-studies/zetachain`: fact/info text computes to Graphik weight 400, information copy collapsed from 261px to 201px, `(SEE MORE)` appears, click expands to full height, and `pnpm typecheck` passed.
- Follow-up on 2026-05-25: case-study detail info typography was tightened in both active and padded routes. All bracketed project labels (`(Brand)`, `(Services)`, `(Industry)`, `(Year)`, `(Information)`) now compute to 11px. Information copy now matches the Brand value text style (`15px`, `20.7px` line-height), the expand control is underlined `See More..` / `See Less..` without brackets, and collapsed copy shows a `..` marker at the clipped end.
- Follow-up correction on 2026-05-25: the Information truncation dots are no longer an absolutely positioned CSS marker at the right edge. The active and padded clients now measure a 10-line collapsed preview string and append `..` inline to the truncated text itself; the expand labels are `See More` / `See Less` with no trailing dots. The expand button bottom spacing is now `12rem`, and the button rests at 50% opacity, becoming fully opaque on hover/focus.
- Follow-up fix on 2026-05-26: long-form player volume slider hover is now reachable from the mute icon. Active and padded detail CSS add a hover bridge above the volume icon so moving into the popover does not drop `:hover`, and the vertical range input is widened while its track background remains centered so the volume thumb appears centered on the track. Added a focused Playwright regression on `/case-studies/zetachain`.
- Update on 2026-05-19: mobile hero text composition adjusted to match reference: title and short description now form a fixed left-aligned overlay block (`.formaHeroCopy` mobile top offset var, title top anchored, description positioned directly beneath with constrained width).
- Fix on 2026-05-20: favicon intermittently disappeared on mirrored `(site)` routes due head composition differences. Added explicit icon metadata (`/favicon.ico`) in `src/lib/metadata.ts` and explicit favicon links in `src/app/(site)/head.tsx` to keep the icon stable across site pages.
- Follow-up fix on 2026-05-20: mirrored route head sanitizer now strips incoming icon/manifest links from Webflow head markup (`stripHeadNoise` in `src/lib/native-mirror.ts`). This prevents mirror-injected favicon links from overriding/removing the app-level `/favicon.ico` during navigation.
- Fix on 2026-05-20: case-study detail images now render with responsive high-DPR `srcset`/`sizes` in `src/app/(site)/case-studies/[slug]/case-study-client.tsx`. Sanity-hosted images are requested via `auto=format`, `fit=max`, explicit `w` candidates, and elevated quality (`q=90`), and Webflow `-p-*` URL variants are normalized to base assets when present to avoid low-resolution renders.
- Follow-up on 2026-05-20: the initial case-study image optimization was too aggressive and caused slow/broken media on routes such as `/case-studies/case-study-14`. The Webflow URL normalization was removed, Sanity fallback `src` reverted to the original URL (not forced max width), and Sanity `srcset` tuning was reduced (`q=82`, width candidates up to 1920) to restore reliable loading while retaining high-DPR improvements.
- Follow-up on 2026-05-20: case-study detail image `srcset` optimizations were fully rolled back in `src/app/(site)/case-studies/[slug]/case-study-client.tsx` after continued regressions (extremely slow loads and broken image renders showing alt text on `/case-studies/case-study-14`). Route now uses direct `img src` again for stability; any future quality work should be reintroduced incrementally with route-specific validation.
- Update on 2026-05-20: user confirmed the missing images were a source upload issue. Case-study detail image delivery is now optimized via `next/image` in `src/app/(site)/case-studies/[slug]/case-study-client.tsx` (no URL rewriting). `CommentableMedia` image branches now use `Image` with explicit section `sizes` to generate responsive `srcset`, and the “Other Case Studies” card images use `Image` with fixed intrinsic dimensions plus responsive `sizes`.
- Update on 2026-05-20: case-study detail now includes a fixed bottom-center comments control in `src/app/(site)/case-studies/[slug]/case-study-client.tsx` and `src/app/(site)/detail-page.module.css`, visually styled as a large black rounded pill with `Show Comments` / `Hide Comments` and a `C` keycap. Pressing keyboard `C` toggles the same global comments visibility state (except when typing in input/textarea/select/contenteditable), and all `CommentableMedia` overlays respect this global on/off state.
- Follow-up on 2026-05-20: comments toggle pill was resized to match design proportions in `src/app/(site)/detail-page.module.css` (about `208px` width, `50px` height, compact keycap, and `letter-spacing: -0.1px`).
- Follow-up on 2026-05-20: comments toggle typography/spacing was refined to design spec: Graphik `16px`, `letter-spacing: -0.1px`, `padding: 17px 24px`, and `8px` gap between label and shortcut indicator.
- Temporary on 2026-05-20: case-study hero overlay text (eyebrow/title/scroll note) is hidden without removing markup. `src/app/(site)/case-studies/[slug]/case-study-client.tsx` now uses a local `hideHeroOverlayText` flag and `src/app/(site)/detail-page.module.css` adds `.formaHeroCopyHidden { display: none; }` for quick restoration.
- Update on 2026-05-19: hero media motion was fully disabled on case-study detail. `.formaHeroStage .formaHeroMedia` now uses `transform: none` with no transition at desktop/mobile, removing remaining scroll drift/parallax on the hero image/video.
- Update on 2026-05-19: `caseStudy.detailServices` in Sanity now uses references to `caseStudyTag` (instead of free text), and queries project these as tag titles via `detailServices[]->title`.
- Resolved on 2026-05-19: native case-study detail positioned faux comments were redesigned as clean Figma-style notes in `src/app/(site)/case-studies/[slug]/case-study-client.tsx` and `src/app/(site)/detail-page.module.css`. They are visual notes, not real comments; closed state is a white 40x40 smart-comment shell with a 32x32 avatar, open state uses 413px as a max width and shrinks width/height to content, and the sharp corner is edge-aware by quadrant so the panel expands into the side of the media with the most space while that sharp origin stays pinned. Author text uses Times-style serif, note body uses Graphik/sans, avatar stays left of top-aligned text, desktop opens on hover/focus with a short hover-off delay, and touch opens by tap.
- Temporary on 2026-05-19: case-study detail notes are draggable in local React state for edge-awareness testing. Dragging updates only the in-memory percentage position for the current page session; refresh resets it and Sanity/CMS data is untouched. Remove this temporary drag affordance before final shipping if not wanted.
- Corrected on 2026-05-15: active routes `/`, `/home-new-feed`, `/work-new`, and `/work-new-alternate` must keep the original mirrored page shell for visual parity. A native shell/hero replacement changed the design and was reverted. The homepage now uses the original mirrored hero/nav/footer shell with only the feed section swapped to the neutral `HomeFeed` component.
- Corrected on 2026-05-19 after PR #6 merge: remove stray root `memory.md` and `package-lock.json`; keep pnpm as the only package manager lockfile; neutralize external Framer/Forma traces introduced into the app-owned native case-study detail files by using local project assets, local fonts, neutral CSS-module naming, and the Ripe contact email.
- Changed on 2026-05-19: native case-study placed comments were intentionally redesigned in the shared `CommentableMedia` UI as compact avatar/comment markers that open into matte annotation cards. This applies to CMS-provided comments such as the Polestar/`case-study-19` detail comment, not a hardcoded page-specific overlay.
- Merged on 2026-05-19: `redesign-polestar-comment` was merged back into GitHub `main` with merge commit `96edad1`. Conflict resolution kept current `origin/main` case-study media/frame behavior from PR #9 while restoring the Polestar branch comment marker/card structure and CSS under neutral `detailComment*` class names. Verification in a temporary worktree: `pnpm typecheck` and `pnpm lint` passed.
- Restored on 2026-05-19: the user's earlier visual case-study comment changes were found on `sample-comment-case-study`/commit `abdcdfa`, not on latest `origin/main`. They were reapplied onto latest `origin/main` in local branch `restore-comment-visual-notes` commit `7ab7459`, preserving the newer flexible-layout `fitMode="contain"` frame alignment. The restored UI is the white 40x40 note shell with 32x32 avatar, edge-aware expansion, Times-style author, Graphik/sans body, hover/focus/touch opening, and temporary in-session drag positioning.
- Deployed on 2026-05-19: commit `7ab7459` was pushed to GitHub `main`, deployed to Vercel project `ripe-studios-cms` as deployment `dpl_9yqvZQ1yrWgj6VHzNhJx1tWiR5Br` (`https://ripe-studios-9c46toqk2-anushgopalakrishnans-projects.vercel.app`), and `https://ripe-studios.vercel.app` was explicitly aliased to it. Verification: `https://ripe-studios.vercel.app/case-studies/case-study-22` returned 200 and Playwright confirmed note closed state `max-width: 40px`, open state `max-width: 413px`, Times author font, Graphik/sans body font, and comment body `lorem ipsum dolor sit amet`. An accidental temporary Vercel project `restore-comment-visuals` was created during preview deployment and then removed successfully; the correct preview deployment remains under `ripe-studios-cms`.
- Follow-up on 2026-05-19: GitHub CI for merge commit `96edad1` failed only because `tests/smoke.spec.ts` used a strict `getByText("A South African icon.")` locator after the page rendered that copy twice. Pushed `88cc056` to `main` to scope the assertion to `getByLabel("Project information")`. Local verification before push: `pnpm typecheck`, `pnpm lint`, `pnpm build`, and targeted Playwright smoke test for the case-study detail passed.
- Deployment cleanup on 2026-05-19: latest `main` was deployed to the canonical `ripe-studios-cms` Vercel project and `https://ripe-studios.vercel.app` now points to deployment `https://ripe-studios-2ib87nm6m-anushgopalakrishnans-projects.vercel.app` (`dpl_GHMfWGSffsFP54ZcTvxuiv2wDwSL`). During deploy, the canonical project build exposed a Sanity data bug: published `case-study-22` had `coverMedia: null`, causing `/case-studies/tags/[slug]` page-data collection to crash on `study.coverMedia.kind`. Fixed in `src/lib/content.ts` by normalizing missing case-study cover media to a static fallback, pushed as `a53a5ee`, and GitHub CI passed. The accidental Vercel project `ripe-new-sprint` was removed; `vercel project inspect ripe-new-sprint` now returns no project.
- QA note on 2026-05-19: canonical production `/case-studies/case-study-22` ("Gamp") returns 200 and has a CMS-provided placed comment on the first layout media item, suitable for testing the redesigned comment marker/card UI. Nearby Sanity-backed slugs `/case-studies/case-study-19`, `/case-studies/case-study-20`, and `/case-studies/case-study-21` returned 500 on production when checked with curl, despite metadata rendering; investigate before using those as public QA examples.
- Fixed locally on 2026-05-19: `/studio` appeared broken because globally loaded exported Webflow CSS set `body { display:flex; align-items:center; }`, causing Sanity's direct `#sanity` body child to shrink to intrinsic width and center with large white side gutters. `src/app/globals.css` now resets body layout when `#sanity` is present and forces `#sanity` to fill the viewport.
- Pages and route handlers that are not currently being worked on were moved into `src/app/(archive)` so they are preserved but visually out of the main working area.
- The archive move uses a Next.js route group, so the archived routes are still available if needed. This was an organization change, not a deletion.
- `src/app/(archive)/README.md` documents the current active/archived split.
- Site pages use `lenis` for lightweight smooth scrolling via `src/components/smooth-scroll-provider.tsx`, mounted in `src/app/(site)/layout.tsx`. Settings are intentionally conservative (`lerp: 0.075`, `wheelMultiplier: 0.82`) to avoid strong scroll-jacking.
- Page transitions are handled by `src/components/page-transition-controller.tsx`. The current temporary transition is an Osmo-style shutter transition adapted for Next without Barba but using `gsap`: ten stacked `data-transition-shutter` panels cover the page before navigation, then reveal the next page. The controller intercepts same-origin link clicks and the temporary `Shift + H` shortcut, which toggles between `/home-copy` and `/work-new-alternate?view=grid` for transition testing. `src/app/(site)/template.tsx` wraps pages in `data-page-transition-container` so the current page can animate upward before route change and the next page can enter from below.
- `NativeRouteRuntime` tracks already-executed external native script URLs in `window.__RIPE_EXECUTED_NATIVE_SCRIPT_SRCS__` so Webflow global scripts are not reloaded on client-side navigation. This avoids the `t is not a function` runtime error from duplicate `webflow.js` initialization.

### Native Work Journal Pages

- Experimental native work journal pages exist and are actively being designed:
  - `/work-new`
  - `/work-new-alternate`
- Both support `view=grid` and `view=list` query params and preserve filter state with `filters=...`.
- The project view control is a single toggle. The button text/icon shows the current mode by default; hovering the button previews only the alternate button text/icon. Hover must not change the actual grid/list layout or the URL. Clicking is the only action that switches the page view and persists it into the URL.
- The regular `/work-new` grid uses equal-height cards. `/work-new-alternate` uses the mixed small/big card layout.
- Filters use immediate UI/URL state updates and delayed card reflow animation. Rapid multi-filter clicks should work: selected filter buttons and the URL update immediately, then the card set animates to the latest pending filter set.
- List view columns are Industry, Project Name, Services, and Year. Description is intentionally hidden in list view.
- The hover theme should only activate when hovering inside an actual card/list row, not empty grid space.
- The card hover image effect is zoom-only; blur and card border radius were intentionally removed.
- The work journal pages add a scoped body class while mounted and force the mirrored navbar shell (`.nav_wrap`, `.nav_contain.u-container`) to transparent for the entire page lifetime. This prevents a white navbar background flash when the hover theme activates.
- Work journal hover themes should use the original Webflow-exported vertical contrast logic from `site/vendor/ripe/scripts/case-studies/hover-theme.js`: blend the active theme color toward white over the first 70% of the viewport, evaluate each themed element/card text independently by its viewport `rect.top`, and only switch that element to light text when the computed background luminance is `<= 0.45`. Card title/list text uses white or `#0a0a0a`; secondary card copy uses `rgba(255,255,255,0.6)` or `rgba(10,10,10,0.6)`.
- In list view, the floating project image preview should animate only for the first hovered row in a hover session. While the pointer stays within the list and moves across other rows, the visible preview image should swap immediately without replaying the opacity/scale reveal. Leaving the list resets the session, so the next fresh hover can animate in again.

### Static Mirror Of The Real Site

- The mirrored clone lives under:
  - `site/`
- Mirror generator:
  - `scripts/mirror-webflow-site.mjs`
- Local static server for the mirror:
  - `scripts/serve-site.mjs`
- Vendored custom scripts/styles used by the mirrored site live under:
  - `site/vendor/`
- Imported previous Netlify/loader-based assets are vendored locally there as well.

### Next.js + Sanity App

- Root app is a Next.js 16 app with Sanity integration scaffolding.
- Main files:
  - `src/app/`
  - `src/sanity/`
  - `sanity.config.ts`
  - `sanity.cli.ts`
- This app builds successfully.
- Public runtime behavior now uses `src/proxy.ts` to:
  - serve native Next routes for `/`, `/case-studies`, `/case-studies/tags/[slug]`, `/writing`, `/writing/[slug]`, `/team`, `/team/[slug]`, `/services`, `/careers`, and `/work`
  - keep `/case-studies/[slug]`, `/feed-posts/[slug]`, and `/job-listings/[slug]` on the mirror path
  - preserve `/studio` as the real Next/Sanity route
- The visual editor canvas now uses native routes for migrated pages. For example, `/__editor?path=/case-studies-new` now loads iframe src `/case-studies?__editor=1`.
- Fix on 2026-05-20: visual editor desktop/tablet/mobile switching was broken because global mirrored Webflow body CSS (`display:flex; align-items:center`) shrank and centered the editor shell, and a `max-width:1080px` editor CSS rule forced the canvas to `1000px !important`. `src/app/(archive)/__editor/shell.tsx` now marks the editor with `data-visual-editor-shell`, `src/app/globals.css` resets body layout when that shell is present, and `src/app/(archive)/__editor/shell.module.css` no longer overrides the selected viewport width at narrow editor-window sizes. Verified locally on `/__editor?path=/case-studies/case-study-14`: mobile `390px`, tablet `834px`, desktop expands to available desktop canvas width.
- Fix on 2026-05-20: visual editor case-study detail pages were still rendering the old static mirror because `canvasPath()` did not treat `/case-studies/[slug]` as a migrated native route. `src/app/(archive)/__editor/shell.tsx` now sends detail slugs to `/case-studies/[slug]?__editor=1`, and `src/components/editor-bridge-runtime.tsx` is mounted from `src/app/(site)/layout.tsx` so app-owned native pages install the editor bridge when `__editor=1` is present. Verified locally for Oum Ceramics: `/__editor?path=/case-studies/case-study-14` iframe src is `/case-studies/case-study-14?__editor=1`, native detail markers are present, mirror detail shell is absent, and `window.__RIPE_EDITOR_BRIDGE__` is true inside the iframe.
- Update on 2026-05-20: visual editor UI was overhauled as an editor-only shadcn island. `components.json` points shadcn output to `src/components/editor-ui`, Tailwind/shadcn CSS is scoped to `src/app/(archive)/visual-editor/editor.css`, and the public direct case-study route does not preload the editor CSS. The editor now uses a minimal shadcn toolbar, route select/search sheet, exact viewport toggles, source badges, centered native preview, resizable inspector, local-only draft patches, and clearer grouped handoff export. Verified locally on Oum Ceramics: editor iframe uses `/case-studies/case-study-14?__editor=1`, first 6 direct/editor images match, no gradient strip/patterned background remains, desktop/tablet/mobile behavior works, selection updates inspector, style/text/image local previews reset correctly, copy handoff works, and route switching keeps editor state usable.
- Fix on 2026-05-20: visual editor draft counts caused a hydration mismatch when `localStorage` already contained draft patches. `src/app/(archive)/__editor/shell.tsx` now renders an empty draft list on the server/initial client pass, loads saved drafts after hydration, and persists drafts only from editor update actions. Verified with a Playwright repro that preloads `localStorage` with one Oum Ceramics draft: no hydration error and the inspector updates to `1 drafted`.
- Fix on 2026-05-20: visual editor inspector/sidebar appeared offscreen because `react-resizable-panels` v4 treats numeric `defaultSize`/`minSize`/`maxSize` props as pixels, not percentages. `src/app/(archive)/__editor/shell.tsx` now uses explicit pixel strings for the inspector panel (`360px` default, `300px` min, `520px` max) and preserves that pixel size while the preview panel fills the rest. Verified locally from 640px through 1500px editor widths and after closing/reopening the inspector.
- Follow-up fix on 2026-05-20: visual editor inspector still broke at narrow Conductor/browser widths. Root causes were the resizable split trying to fit preview + inspector side-by-side below ~560px and Radix ScrollArea's internal sizing allowing inspector content to spill horizontally. `src/app/(archive)/__editor/shell.module.css` now switches the inspector to a right overlay at `max-width: 720px`, constrains the ScrollArea/body widths, and compacts the route search button below 420px. Playwright verified widths 1500/900/760/700/560/430/360 with no sidebar clipping or horizontal overflow; close/reopen at 430px and iframe element selection at 900px also pass.
- Update on 2026-05-26: visual editor scalar style inputs now separate numeric values from units for fields such as font size, line height, tracking, radius, opacity, width, height, gap, and max width. The unit is shown as a fixed suffix, focus selects only the number, arrow buttons and keyboard ArrowUp/ArrowDown adjust by field-specific steps, and dragging up/down on the input group slides the value with Shift for larger steps and Option for finer steps. Compound fields such as margin/padding intentionally remain raw CSS text inputs.
- Follow-up on 2026-05-26: visual editor form controls now share a scoped control contract in `src/app/(archive)/__editor/shell.module.css`: 32px height for single-line inputs/selects/input groups, 8px radius across text inputs, numeric input groups, selects, small/icon buttons, and route-sheet command inputs, plus consistent background/border/focus ring tokens. The route sheet portal receives `styles.editorOverlay` so the same input styling applies outside the main editor DOM subtree; `src/components/editor-ui/command.tsx` also pins the command search input group to the same 8px radius because it previously used an important rounded utility.
- Follow-up on 2026-05-26: visual editor selection controls were split into an explicit element-selector toggle (`MousePointer2` toolbar button) and the existing inspector panel toggle. The iframe bridge (`src/lib/editor/bridge-source.ts`) now tracks selected/hovered targets and redraws overlay boxes on document scroll, viewport scroll/resize, window resize, and preview updates so the red selected-element box remains aligned while the preview scrolls. Numeric style inputs now support unit switching with a compact native unit select and typed-unit parsing (`50%`, `2rem`, `24px`, etc.); supported units are length/text sets (`px`, `%`, `rem`, `em`, viewport units, `ch` where relevant) and line-height also supports `unitless`. Verified locally on `/__editor?path=/case-studies/zetachain`: selector toggle hides/re-enables the red box, red box scroll delta stays 0, typed units and unit selects work across Layout/Type/Paint, opacity clamps, compound spacing text remains editable, content controls render consistently, and no console errors.
- Follow-up correction on 2026-05-26: visual editor hover/selection overlay boxes should move instantly. Removed the 80ms top/left/width/height transition from `src/lib/editor/bridge-source.ts` and set overlay transition to `none`.
- Follow-up fix on 2026-05-26: visual editor numeric unit dropdown clicks were being intercepted by the numeric input group's drag-to-adjust pointer handler. `NumericStyleInput` now ignores pointer starts from `button`, `select`, and `option`, and the native unit `<select>` stops click/pointer propagation so unit menus open/change normally without arming drag state. Verified on `/__editor?path=/case-studies/zetachain`: typing `50%` sets value `50` + unit `%`, clicking the unit select does not set `data-dragging`, and changing to `rem` updates the style unit.
- Follow-up on 2026-05-26: visual editor iframe overlays now use a purple design-tool treatment instead of black/red. Hover/can-select uses a subtle dashed purple outline with faint fill; selected uses a stronger purple outline and no movement transition. The selected-box resize handles were removed because they implied drag-resize support that does not exist yet.
- Follow-up on 2026-05-26: added a public-page shortcut for opening the visual editor. Any public page with `?editor` now rewrites through `src/proxy.ts` to the editor route with the current pathname as the target while preserving the visible public URL, e.g. `/case-studies/zetachain?editor` renders the editor shell with iframe target `/case-studies/zetachain?__editor=1`. The internal `/__editor?path=...` route remains supported for direct editor links.
- Follow-up on 2026-05-26: visual editor margin and padding controls now use four upgraded side inputs (top/right/bottom/left) instead of raw CSS shorthand text boxes. Each side uses the same numeric UX as scalar controls: number-only editing, unit dropdown, arrows, keyboard increments, and drag-to-adjust, then writes back a compact CSS shorthand.
- Follow-up on 2026-05-26: visual editor Type tab now includes a custom font switcher for `fontFamily`. It uses Chromium's Local Font Access API (`window.queryLocalFonts`) to request installed system fonts when available, falls back to document/common fonts when unavailable or denied, renders each font option in its own font, and temporarily previews the hovered font in the iframe before click-to-commit writes a `fontFamily` draft.
- Follow-up on 2026-05-26: visual editor color fields (`color`, `backgroundColor`) now use a richer shadcn-themed control: a checkerboard-backed swatch button opens a themed picker panel with native color input and presets, while the adjacent mono text field remains editable for hex or other valid CSS colors. Computed RGB values display as hex where possible; invalid typed values are marked without committing.
- Follow-up on 2026-05-26: visual editor generic text-like controls were upgraded so style fallbacks use a smart CSS value input with validation and presets, image source uses a preview/URL/action control, selected text/handoff note use metadata-backed textarea controls, and margin/padding side inputs now sit in a compact box-model grid instead of a plain two-column list.
- Follow-up on 2026-05-26: visual editor numeric unit dropdowns now convert values when switching units instead of preserving the raw number. Conversion is measured against the selected element inside the preview iframe, so px/rem/em/viewport/ch/% changes use the real page context where possible; if measurement is impossible, the control falls back to the previous suffix-swap behavior.
- Follow-up on 2026-05-26: visual editor now has element-level Hide and Delete controls next to the selection card. Hide previews `visibility:hidden`; Delete previews `display:none` so layout closes up while staying reversible. Added session undo/redo stacks with toolbar buttons and non-input keyboard shortcuts (`Cmd/Ctrl+Z`, `Cmd/Ctrl+Shift+Z`, `Cmd/Ctrl+Y`) covering style/content/hide/delete/note draft edits; undo/redo reapplies all local preview patches into the iframe.
- Follow-up on 2026-05-26: visual editor margin/padding controls were redesigned into a Figma-style spacing row. Collapsed state shows two icon-led smart numeric inputs: horizontal writes left+right, vertical writes top+bottom. The trailing expand button reveals four individual side inputs while preserving the same unit/dropdown/stepper/drag behavior.
- Follow-up fix on 2026-05-26: visual editor undo/redo shortcuts now take precedence over browser/input defaults. The editor shell captures `Cmd/Ctrl+Z`, `Cmd/Ctrl+Shift+Z`, and `Cmd/Ctrl+Y` in capture phase even when a control is focused, and the preview iframe bridge forwards the same shortcuts to the parent editor when focus is inside the page preview.
- Follow-up fix on 2026-05-26: visual editor numeric drag-to-adjust now creates a single undo checkpoint per pointer drag gesture instead of one undo entry per drag step/pixel. `NumericStyleInput` passes undo metadata through style changes, skips intermediate drag snapshots, and suppresses the redundant post-drag blur commit. Added a focused Playwright regression that drags Width multiple steps and verifies one Undo restores the original value.
- Follow-up on 2026-05-26: visual editor draft patch rows now include a trash action. Deleting a row removes that local patch from storage, clears/reapplies iframe preview patches so the target returns to its base state, resets the selected inspector values if it was the active target, and is itself undoable through the editor history.
- Follow-up on 2026-05-26: visual editor inspector header now includes Reset all changes alongside Reset selected. Reset all clears every local patch for the current route, clears the iframe preview back to base state, resets active inspector edit state, persists the empty draft list, and is undoable.
- Follow-up on 2026-05-26: visual editor supports multi-select via Shift/Cmd/Ctrl-click in the preview iframe. Style/hide/delete/reset-selected edits fan out to all selected targets and create per-target draft patches. The inspector computes common style values for the selected set, shows a multi-selection label, and hides incompatible controls: text-only typography fields show only when every selected target is text-compatible, while shared layout/spacing/appearance fields remain available for mixed selections such as text plus media.
- Follow-up on 2026-05-26: visual editor draft patch rows now show richer summaries and expand/collapse details. Collapsed rows show target tag, selector, change count, and a human-readable summary such as `Size` or `Hide`; clicking the row expands exact before/after values with metadata badges, and clicking again collapses. The trash button remains an independent control and does not toggle expansion.
- Follow-up on 2026-05-26: visual editor inspector layout was changed from tabbed groups to stacked Figma-style sections (Selection, element actions, Layout, Space, Type, Paint, Content, Handoff note, Draft patches). Numeric input arrow steppers were removed from the visible UI; keyboard arrows and drag-to-adjust still work.
- Follow-up on 2026-06-17: visual editor shell was simplified again for the select-and-edit workflow. `/__editor` now uses a compact three-zone command bar, a true empty inspector state that hides disabled fields until an element is selected, and selected-element inspector tabs (`Style`, `Content`, `Drafts`) while preserving existing editor behavior, route/search, viewport, undo/redo, reset, and handoff controls. Changes are isolated to `src/app/(archive)/__editor/shell.tsx` and `shell.module.css`; verification passed `pnpm typecheck` and targeted Playwright editor smoke tests.
- Follow-up fix on 2026-06-17: visual editor desktop preview images looked wrong because the iframe canvas used the requested `1440px` inline width but still flex-shrank to the available split-pane width (~1047px with the inspector open). This changed the iframe viewport and Next responsive image candidate/cropping. `src/app/(archive)/__editor/shell.tsx` now sets the canvas width directly from the selected viewport, and `shell.module.css` sets `.canvasChrome { flex: 0 0 auto; margin-inline: auto; }` with the stage left-aligned for overflow. Verified `/__editor?path=/case-studies/zetachain`: desktop iframe innerWidth is 1440 and uses the same first-image URL as the public page; mobile remains 390.
- Follow-up fix on 2026-06-17: visual editor `Align`/`Justify` selects appeared blank/no-affordance when computed CSS returned `normal`, because `normal` was not in those option lists. Added `normal` to `alignItems`/`justifyContent` options, made unknown option values display as `Unset` instead of a blank trigger, and gave `.valueSelectTrigger` an explicit inset control outline/focus treatment for consistency with numeric/text controls. Verified by screenshot plus `pnpm typecheck` and targeted editor smoke tests.
- Follow-up fix on 2026-06-17: this workspace was missing `.env.local`, so the local/editor preview could not read Sanity and fell back to hardcoded work-journal media. Added public Sanity env values locally (`NEXT_PUBLIC_SANITY_PROJECT_ID=w4cpj4jh`, `NEXT_PUBLIC_SANITY_DATASET=production`, `NEXT_PUBLIC_SANITY_API_VERSION=2026-03-01`) and reordered editor route discovery so CMS collection routes appear before hardcoded work-journal fallback routes. Verified `/__editor?path=/case-studies/case-study-21`: iframe path `/case-studies/case-study-21?__editor=1`, title `Polestar - Case Study`, 7 Sanity CDN media entries, and 0 `/work-media/` media entries. Note: `/case-studies/zetachain` is not a published Sanity slug, so it remains a fallback/local-media route unless a Sanity document or slug alias is added.
- Build fix on 2026-06-17: Next 16 CSS Modules reject standalone globals such as `:global(.copy-email)` as impure. `src/components/team-page-client.module.css` now uses a local `.copyEmail` class with `:global(.tooltip-visible/.tooltip-hiding)` only as state suffixes, and both team/careers email tooltip spans include that local class. `pnpm typecheck` and `pnpm build` passed.
- Editor persistence fix on 2026-06-18: visual editor selections are now normalized back to original draft baselines when reselecting an already-patched element. `src/app/(archive)/__editor/shell.tsx` stores baseline text/image/style values in selection state while showing drafted inspector values, preventing later edits from rebuilding a patch using already-mutated iframe computed styles. Verified with a browser reproduction on `/visual-editor?path=%2Fcareers`: color edit persisted after reload/reselect and adding a font-size edit; `pnpm typecheck` and `pnpm lint` passed.
- Editor media-frame selection fix on 2026-06-18: clicking a single image/video inside a rounded clipping wrapper now selects the visual media frame instead of the raw media element. This makes the inspector show the visible wrapper radius (for example the Careers moving filmstrip now reports Radius `24`) while preserving image-source editing for the contained image. Implemented in `src/lib/editor/bridge-source.ts`; verified on `/visual-editor?path=%2Fcareers` by selecting a moving filmstrip image, editing radius to `12px`, and confirming the draft targets the `figure` with `before: 24px`; `pnpm typecheck` and `pnpm lint` passed.
- Editor direct patching feature on 2026-06-18: visual editor now has a top-sidebar `Patch changes` button when drafts exist. It POSTs drafts to `/api/editor/apply`, which is disabled in production and rewrites `public/editor-patches.css` with supported CSS/style/hide/delete changes; text/image-source changes still require handoff and are reported in a warning toast. `(site)/layout.tsx` loads `/editor-patches.css` after exported CSS. Verified the button writes CSS from a seeded `/careers` draft, then reset the tracked placeholder; `pnpm typecheck`, `pnpm lint`, and route-level POST checks passed.
- Editor source apply feature on 2026-06-18: visual editor now separates direct source writes from override CSS. The inspector header shows `Apply source` and `CSS patch` when drafts exist. `Apply source` POSTs `mode: "source"` to `/api/editor/apply`, maps compiled CSS-module class names back to source `.module.css` classes with PostCSS, and writes supported desktop style changes directly into CSS module files. Unsupported edits (content/image/hide/delete, non-desktop viewport styles, ambiguous selectors) remain as drafts for override/handoff. `CSS patch` keeps the existing `public/editor-patches.css` override behavior. Verification: `pnpm typecheck`, `pnpm lint`, `pnpm build`, source-mode API smoke on `/careers`, and headless editor button visibility check passed.
- Editor sidebar/preview layout fix on 2026-06-18: inspector input focus rings no longer clip against sidebar padding. `src/app/(archive)/__editor/shell.module.css` now lets the inspector/scroll/body overflow be visible and adds a small inspector-body inset. The preview canvas now receives `--canvas-width` from `src/app/(archive)/__editor/shell.tsx` and flex-shrinks/clamps within the preview panel, so resizing the sidebar leaves the iframe preview filling remaining space instead of being covered by the inspector. Verified on `/visual-editor?path=%2Fcareers`; `pnpm typecheck`, `pnpm lint`, and `git diff --check` passed.
- Editor tracking input fix on 2026-06-18: numeric style inputs now preserve raw in-progress typed values while focused, fixing Tracking inputs where typing `-0.02em` or `-0.025em` previously normalized `-0` back to `0` before the decimal could be completed. Tracking (`letterSpacing`) now uses `0.01` step increments and keeps up to 4 decimal places on commit, so fine `em` tracking values are not rounded away. Verified with a direct Playwright repro against local `/__editor?path=/case-studies/zetachain`: typed `-0.025em` character-by-character, preview and committed iframe style stayed `-0.025em`; `pnpm typecheck` and `pnpm lint` passed.
- Editor sidebar typography preference on 2026-06-18: visual editor sidebar text should avoid bold/semibold weights. `src/app/(archive)/__editor/shell.module.css` now scopes inspector headings, buttons, tabs, badges, section titles, empty-state headings, and patch labels to regular `font-weight: 400`; top toolbar branding/buttons are unchanged. Verification: local computed-style check confirmed visible sidebar `h2` and button weights are `400`; `pnpm lint` passed.
- Editor sidebar compactness fix on 2026-06-18: the selected-element summary card in the visual editor sidebar should not be sticky. `src/app/(archive)/__editor/shell.module.css` removed `position: sticky` from `.selectionCard`, reduced the inspector header from `80px` to `54px`, and reduced the selected-element card from `64px` to `44px` so it no longer overlaps controls while scrolling and takes less vertical space. Verification: `pnpm lint` passed; static CSS check confirmed no `position: sticky` remains on `.selectionCard`.
- Editor color picker update on 2026-06-18: replaced the visual editor sidebar's basic native color popover with a Figma-style picker in `src/app/(archive)/__editor/shell.tsx` and `shell.module.css`: Custom/Libraries header, saturation/value square, hue slider, alpha slider, hex + opacity inputs, eyedropper hook, and "On this page" swatches. Verification: `pnpm typecheck`, `pnpm lint`, and a headless editor smoke check passed; selecting orange updated iframe preview color to `rgb(249, 115, 22)`.
- Editor numeric unit control fix on 2026-06-18: visual editor unit controls now paint a shrink-wrapped label over an accessible native select so short units like `px` no longer render with oversized focus boxes. Numeric inputs also accept a trailing `-` as an explicit unitless marker on fields that support unitless values, e.g. typing `1-` in Line height previews/commits `line-height: 1`. Verification: `pnpm typecheck`, `pnpm lint`, `pnpm build`, and focused Playwright `visual editor units and spacing controls stay stable` passed.
- Follow-up on 2026-06-17: applied shadcn preset `b3L0yGCKP2` only to the editor-scoped shadcn config/theme/font surface. Editor shell and editor-ui components now use the preset's Hugeicons, generated Geist/JetBrains font variables live in `src/app/(archive)/visual-editor/layout.tsx` instead of root `src/app/layout.tsx`, preset sky/mist tokens are scoped to `body:has([data-visual-editor-shell])`, and the editor shell chrome/inspector/cards/tabs follow the preset's sharp Lyra control treatment in `shell.module.css`. Public-site layout remains untouched. Verification: clean `pnpm typecheck`, `pnpm build`, desktop/mobile Playwright screenshots, selected-state check, and `/__editor?path=/case-studies/case-study-21` returns 200.
- Follow-up on 2026-06-17: editor inspector/control-panel styling was updated to a DialKit-derived dark glass panel treatment per user request. DialKit is MIT licensed; `THIRD_PARTY_NOTICES.md` records attribution. The implementation stays scoped to `src/app/(archive)/__editor/shell.module.css` and `shell.tsx`: dark 14px-radius inspector frame, 36px soft rows, 8px control radii, 13px labels/values, subtle divider-based sections, compact 320px default inspector width, and mobile-stable overlay. Verification: `pnpm typecheck`, local `/__editor?path=/case-studies/case-study-21` 200, desktop selected-state screenshot, and 390px mobile screenshot with no horizontal overflow.
- Follow-up fix on 2026-06-17: visual editor numeric drag-to-adjust now rounds dragged length-style values to whole numbers so dragging no longer leaves values like `100.5px` or `62.625px`. Opacity and unitless line-height keep decimal precision because those fields need fractional values. Updated the numeric drag regression to use Alt/Option fine-drag and assert Width rounds to `101` instead of `100.5`. Verification: `pnpm typecheck`, `pnpm build`, and focused Playwright test `visual editor numeric drag creates one undo step` passed.
- Follow-up fix on 2026-06-17: visual editor numeric controls now accept property-valid CSS keywords without swapping to the fallback text field. Width/height accept `auto`, `min-content`, `max-content`, and `fit-content`; max-width accepts `none` plus intrinsic sizing keywords; margin accepts `auto`; padding does not expose invalid `auto`. Keyword values hide the unit selector and survive reselection. The small unit selector inside numeric controls now shrink-wraps the unit label instead of using the old fixed 42px width. Verification: `pnpm typecheck` and a one-off Playwright check against `http://127.0.0.1:3000/__editor?path=/case-studies/zetachain` passed with width/height `auto`, reselection persistence, `max-width: none`, and `Width unit` measured 33px.
- Follow-up simplification on 2026-06-18: visual editor chrome now hides secondary controls until useful. The route picker displays page title only; topbar route status/collection badges were removed because collection navigation exists in the Routes sheet; inspector reset controls appear only when drafts exist; handoff copy lives only in the Drafts tab; Drafts is hidden while empty; incompatible Content fields are hidden with a short empty message; Hide/Delete moved behind a collapsed More disclosure; display/position/gap/align/justify/opacity moved behind Advanced layout. Verification: `pnpm typecheck`, `pnpm build`, and targeted visual editor smoke tests passed.
- Follow-up fix on 2026-06-17: selecting an element with existing draft edits no longer snaps the inspector/preview back to computed defaults. The selection handler now rehydrates selected targets from existing local draft patches: style `before` values become `baseStyles`, style `after` values become `styleValues`, and text/image/note/hide/delete draft state is restored. It also reads current persisted route drafts during selection to avoid stale React listener closures immediately after commit. Added a Playwright regression that edits width, commits, reselects the same element, and verifies the width remains edited. Verification: `pnpm typecheck` and targeted editor smoke tests passed.
- Follow-up fix on 2026-05-26: visual editor preview updates now restore each target's originally captured DOM state before applying the current payload. This fixes stale preview cases where reverting styles/text/images back to base removed the draft row but left old visual changes in the iframe. Image preview restore now also restores/removes the original `srcset`.
- Follow-up on 2026-05-26: visual editor iframe supports hierarchy keyboard navigation. `Enter` selects the de-duped immediate selectable children of the current selection set in DOM order; `Shift+Enter` selects the de-duped immediate selectable parents. Shortcuts are ignored while typing in editable controls and leave selection unchanged if no valid target exists.
- Follow-up on 2026-05-26: visual editor numeric values now normalize to at most 2 decimal places, including typed values, keyboard stepping, drag adjustments, and unit conversions. Trailing zeros are still trimmed.
- Landed via Git on 2026-05-26: visual editor inspector/reliability changes were committed as `d90d810` (`feat: refine visual editor inspector`) and pushed directly to `origin/main` by fast-forward from `0634b9c`. No manual Vercel deploy or alias command was run.
- Follow-up on 2026-05-26: visual editor spacing controls now use lucide `MoveHorizontal`/`MoveVertical` icons instead of custom drawn axis glyphs, and spacing/expand icons were reduced to 14px with lighter stroke. Expanded T/R/B/L side labels were reduced to 18px boxes with smaller text. Unit conversion formatting also now always applies the 2-decimal numeric normalization.
- Follow-up fix on 2026-05-26: visual editor font switcher now closes when focus or pointer movement leaves the switcher. `FontFamilyInput` listens for document-level capture `pointerdown`/`focusin` events while open, ignores events inside its own root, and restores iframe font previews when closing. Added a focused Playwright smoke regression for clicking outside the font list.
- Follow-up fix on 2026-05-26: visual editor layout width previews now neutralize target `max-width` constraints while a width draft is active. This fixes cases such as Next/image fill media where the editor applied `width: ... !important` but the preview still rendered at the old size because page CSS kept `max-width: 100%`. Added a focused Playwright regression on the ZetaChain layout image.
- Follow-up stabilization on 2026-05-26: visual editor inputs now use field-session transactions: typing previews immediately but draft persistence/undo snapshots commit on blur/Enter, Escape cancels back to the pre-edit snapshot, and text/image/note/numeric/color/CSS fallback controls share the same model. Numeric fields preserve invalid raw values, expose compact field errors, use a dedicated drag handle instead of dragging from the text input, and disable unit conversion for multi-select. The iframe bridge now generates uniqueness-checked selectors, treats page form controls as selectable editor targets while selector mode is enabled, and sends selection capabilities (`canEditText`, `canEditImage`, editable-control, selector uniqueness) so complex containers are not text-editable. Viewport toggles no longer create draft patches. Verification: `pnpm typecheck`, `pnpm build`, and focused `pnpm exec playwright test tests/smoke.spec.ts -g "visual editor" --reporter=line` passed (7/7). Full `pnpm exec playwright test --reporter=line` still has 5 failures in older non-editor smoke expectations for `/team`, `/careers`, team detail title, and case-study detail comment/video controls; the visual-editor group passed within that full run.
- Update on 2026-05-20: visual editor same-collection page switching was restored. `src/lib/editor/mirror.ts` now annotates detail routes with collection metadata (case studies, case study tags, feed posts, job listings, team, writing), merges Sanity-backed case-study/writing routes plus local work journal labels into the editor route list, and `src/app/(archive)/__editor/shell.tsx` shows a compact same-collection selector in the toolbar plus a same-collection group at the top of the Routes sheet. Verified with Playwright: Oum Ceramics appears as the current case-study item, switching to Tabletop updates the editor path and iframe to `/case-studies/case-study-10?__editor=1`, the narrow Routes sheet includes `Case studies pages` and Oum, and Writing routes expose a `Switch Writing page` selector.
- Fix on 2026-05-20: visual editor iframe selection now treats page buttons/links as selectable editor targets while still ignoring real editable controls. `src/lib/editor/bridge-source.ts` intercepts button/link pointer-down and click events in editor mode, so the case-study `Hide comments` pill and placed comment buttons select as `button` targets instead of firing page actions or selecting the image behind. `src/app/(archive)/__editor/shell.tsx` and `shell.module.css` also tightened sidebar input UX: uniform 32px value inputs/select triggers, 96px resizable textareas, CSS-value placeholders, disabled field state, and disabled reset/copy icon buttons when unavailable. Playwright verified Oum Ceramics editor: Hide Comments selects without toggling, a placed note selects as `button` not `img`, style edits enable handoff copy, no console errors, and inspector stays within 900/430/360px viewports.
- Local env note on 2026-05-20: Vercel `production` env pull for this workspace returned blank Sanity values, but Vercel `development` env pull contains the populated Sanity config/token used by `pnpm dev`. Local `.env.local` was set from Development env and `pnpm dev` restarted. Verified Oum Ceramics direct localhost, visual editor iframe, and production all use matching first eight Sanity-backed asset URLs.
- Update on 2026-05-21: app-owned public shell routes moved off route-level Webflow shell parsing. `/`, `/home-new-feed`, `/home-copy`, `/home-old-feed`, `/work-new`, `/work-new-alternate`, `/case-studies`, and `/case-studies/tags/[slug]` now compose through `RipeNativeShell`, which renders the same vendored Webflow nav/footer markup and assets with native React scroll/menu behavior. Home routes still use the mirrored body content between nav/footer to preserve exact page visuals while replacing only the shell. Legacy `NativeRouteDocument` remains for intentional fallback/mirror surfaces such as legacy case-study detail fallback.
- Fix on 2026-05-21: mobile `/case-studies?view=grid` and tag grids were broken because the alternating work journal grid kept the desktop four-column rule on mobile and also removed the media aspect ratio while using `next/image fill`. `src/components/work-journal-section.module.css` now gives the alternating grid a same-specificity one-column mobile override and preserves media ratios, restoring visible full-width mobile cards without changing assets or copy.
- Self-contained audit/fix on 2026-05-26: non-CMS external runtime dependencies from the previous audit were removed for served Next routes. Active case-study detail Switzer fonts now use local `public/fonts/home-feed-sans.woff2` and `public/fonts/detail-sans-medium.woff2`; `RipeHeadAssets` keeps only Sanity preconnects; `next.config.ts` allows `next/image` remotes only for `cdn.sanity.io`; the exported Webflow checkbox checkmark now uses local `site/images/custom-checkbox-checkmark.svg`; local `site/js/webflow.js` no longer references Webflow badge CloudFront images; Slater/CodeSandbox vendor shims are no-ops; the Ripe loader only loads local `/vendor/ripe` scripts/styles; writing scripts no longer dynamically import Finsweet or Pretext from CDNs. `src/lib/native-mirror.ts` and `src/lib/editor/mirror.ts` strip remote `<script>`/`<link>` tags from served mirror HTML and rewrite Website Files media URLs to deterministic local files under `site/images/remote`. Verification: `pnpm typecheck`, `pnpm lint`, and `pnpm build` passed; production-start Playwright checks on `/`, `/case-studies?view=grid`, `/case-studies/case-study-14`, `/visual-mirror/archive/careers`, and `/visual-mirror/case-studies/case-study-14` made zero requests to the blocked non-CMS external hosts and had zero remote script/link runtime tags, except allowed Sanity.
- Merge follow-up on 2026-05-26: while merging the native shell/self-contained work onto current `origin/main`, newer native `/careers` and `/team` changes had introduced Framer/Unsplash/Website Files asset URLs. Those assets were localized under `public/careers-media` and `public/team-media`, and team placeholder usage now points to `/team-media/placeholder.svg`, preserving the self-contained rule for non-CMS public assets. The mirrored homepage showreel video from `osmo.b-cdn.net` was also localized under `public/mirror-media` and rewritten by both native/editor mirror loaders.
- Phase 0 mirror stabilization is now implemented locally:
  - Webflow export assets are vendored into `site/css`, `site/fonts`, `site/images`, and `site/js`
  - `src/lib/editor/mirror.ts` now serves mirror assets from `site/`, not from `.context/webflow-export`
  - this makes the deployed `__mirror` surface self-contained

## Important History / Prior Misstep

- A scaffolded Next.js/Sanity app was built earlier from the migration plan instead of rebuilding the actual live site.
- That was not what the user wanted.
- The user explicitly corrected this and wants the actual Ripe Webflow site cloned first.
- Do not treat the scaffold as the final product.
- Do not present the scaffold as the deployed site.

## Current Deployment State

### Static Clone Deployment

- Vercel project for the static mirrored site:
  - `site`
  - local Vercel link file: `site/.vercel/project.json`
- Known stable public deployment/alias for the mirrored clone:
  - `https://site-nine-pied-57.vercel.app`
- This static deployment still exists as a fallback/reference artifact, but it is no longer the preferred public integration path.

### Root Next.js / Sanity Deployment

- Root Vercel project link file:
  - `.vercel/project.json`
- That project was auto-created as `chengdu` and later renamed on Vercel to:
  - `ripe-studios-cms`
- Root app deployments now act as the preferred unified artifact:
  - public clone routes are served by rewrite to the mirrored site
  - `/studio` is served by the real Next/Sanity app
- Current canonical unified public domain:
  - `https://ripe-studios.vercel.app`
- Latest verified production deployment on 2026-05-19:
  - `https://ripe-studios-7lrm5tg4z-anushgopalakrishnans-projects.vercel.app`
  - deployment id: `dpl_VU1hrghaF8SvFQ2cQYZwd5cQFntw`
  - deployed from the correct `ripe-studios-cms` Vercel project after relinking this workspace with `pnpm dlx vercel link --yes --project ripe-studios-cms`
  - `https://ripe-studios.vercel.app` was explicitly repointed to this deployment with `pnpm dlx vercel alias set ripe-studios-7lrm5tg4z-anushgopalakrishnans-projects.vercel.app ripe-studios.vercel.app`
  - verification: production `/studio` has `#sanity` at `x=0` and fills a 1600x1000 viewport; production `/` has title `The Natural Outcome | Ripe Studios`, the original mirrored `.hero_section`, and the white `Featured work feed`.
- Latest verified production deployment on 2026-05-15:
  - `https://ripe-studios-2u8tmv4jq-anushgopalakrishnans-projects.vercel.app`
  - deployment id: `dpl_DbVQVGNK3jNeKSByUnngtAFdY1ac`
  - deployed from the correct `ripe-studios-cms` Vercel project after linking this workspace with `pnpm dlx vercel link --yes --project ripe-studios-cms`
  - `https://ripe-studios.vercel.app` was manually repointed to this deployment with `pnpm dlx vercel alias set ripe-studios-2u8tmv4jq-anushgopalakrishnans-projects.vercel.app ripe-studios.vercel.app`
  - verification: public `/` has the original mirrored `.hero_section` and `.nav_wrap`, has no native shell marker, contains 25 feed articles, and the `[aria-label="Featured work feed"]` computed background is `rgb(255, 255, 255)`
  - warning: pushing `main` also triggered a separate Vercel deployment on a protected `ripe-new-sprint` project (`https://ripe-new-sprint-gv9xen5u7-anushgopalakrishnans-projects.vercel.app`), but that is not the canonical public site.
- Latest route-promotion PR:
  - `https://github.com/AnushGopalakrishnan/ripe-new-sprint/pull/4`
- On the canonical domain:
  - `/` is the promoted new feed homepage and keeps the public title `The Natural Outcome | Ripe Studios`
  - `/home-new-feed` remains available as the duplicate new feed route
  - `/home-old-feed` is the archived previous homepage
  - `/home-copy` and `/home-motion-hero` remain available as archived variants
  - non-detail clone-facing routes resolve through native Next pages
  - `/case-studies/[slug]` still resolves through `visual-mirror`
  - `/studio` resolves to the Sanity Studio app
- Be careful not to confuse:
  - the old static-only `site-nine-pied-57.vercel.app`
  - the previous root unified deployment aliases on `ripe-studios-cms.vercel.app` / `ripe-studios-clone.vercel.app`

## Sanity Status

- Sanity schema work has been done in the root app.
- Import tooling exists:
  - `scripts/sanity/build_import.py`
  - `scripts/sanity/import-documents.mjs`
- Generated import artifacts exist:
  - `.context/sanity/import.ndjson`
  - `.context/sanity/import-summary.json`
- Imported content count previously verified:
  - `63` documents
- Imported into Sanity project:
  - project id: `w4cpj4jh`
  - dataset: `production`
- The root Next app can serve Studio at `/studio` when configured, but this is still separate from the static mirror.
- The remaining product-level work is to connect Sanity to the actual Ripe clone path, not merely keep a separate Studio app alive.

## Files And Entry Points That Matter

### Mirror / Clone

- `site/`
- `site/css/`
- `site/fonts/`
- `site/images/`
- `site/js/`
- `scripts/mirror-webflow-site.mjs`
- `scripts/serve-site.mjs`
- `site/vendor/ripe/scripts/`
- `site/vendor/ripe/styles/`

### Next / Sanity

- `src/app/(site)/`
- `src/app/(site)/team/`
- `src/app/(site)/services/`
- `src/app/(site)/careers/`
- `src/app/(site)/work/`
- `src/app/(studio)/studio/[[...tool]]/page.tsx`
- `src/proxy.ts`
- `src/app/__editor/page.tsx`
- `src/app/visual-editor/page.tsx`
- `src/app/__editor/shell.tsx`
- `src/app/__mirror/[[...path]]/route.ts`
- `src/app/visual-mirror/[[...path]]/route.ts`
- `src/lib/editor/`
- `src/lib/native-mirror.ts`
- `src/sanity/schemaTypes/`
- `src/sanity/lib/`
- `sanity.config.ts`

### Tests

- `playwright.config.ts`
- `tests/`

## Verified Fixes Already Made On The Mirror

- Fixed mirrored Webflow form success/error blocks (`.w-form-done`, `.w-form-fail`) being visibly rendered on case studies pages by injecting hide rules in both the runtime mirror path and the mirror generator.
- Verified that fix on the unified deployed editor and mirror routes after redeploying and repointing aliases on 2026-05-07:
  - `https://ripe-studios-cms.vercel.app/__editor?path=/case-studies-new`
  - `https://ripe-studios-cms.vercel.app/__mirror/case-studies-new`
  - browser check confirmed the `.w-form-done` and `.w-form-fail` nodes still exist in the DOM but render with `display:none` and `visibility:hidden`
- Removed the visible “Made in Webflow” badge locally/in the mirror flow.
- Fixed case studies grid rendering where cards were hidden because the imported grid script targeted nested list structures incorrectly.
- Fixed the case-study hover theme behavior where the imported script expected a different color attribute than the mirrored HTML provided.
- Updated the mirror generator so those fixes survive future mirror rebuilds.

## Playwright / Test State

- Playwright was updated to validate the mirrored site instead of the discarded scaffold assumptions.
- `playwright.config.ts` now runs against the root Next app using `pnpm start --hostname 127.0.0.1 --port 3100`.
- `tests/smoke.spec.ts` now covers:
  - `/`
  - canonical `/case-studies`
  - canonical `/case-studies/tags/strategy`
  - canonical `/writing`
  - canonical `/writing/[slug]`
  - canonical `/team`, `/services`, `/careers`, `/work`
  - canonical `/team/[slug]`
  - legacy redirect matrix for the current clean URL contract
  - `/case-studies/zetachain`
  - direct `__mirror` CSS/JS/image asset requests
  - `/__editor?path=/case-studies-new`
- Verified locally on 2026-05-07:
  - `pnpm typecheck`
  - `pnpm build`
  - `pnpm test:smoke`
  - result: `23 passed`
- Verified locally on 2026-05-11 after work journal interaction updates:
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm build`
  - `pnpm exec playwright test tests/smoke.spec.ts -g "work new" --reporter=line`
  - result: focused work journal tests passed (`3 passed`)

## Known Product / Architecture Gap

- The actual user goal is not “static mirror forever.”
- The actual user goal is:
  - first get a faithful custom-code clone of the current Webflow site
  - then make that real clone editable through Sanity
- Current repo status is:
  - faithful native Next translation is complete for all current non-detail public pages
  - Sanity schema/import path exists
  - the root app serves both the clone and Studio on one host
  - case-study detail pages are still intentionally deferred and continue to use the mirror path
  - the current imported case-study dataset is not sufficient for faithful detail-page parity: the row-builder content used by the mirrored detail pages is not present in the imported docs

## Known Risks / Things To Avoid

- Do not describe the root scaffold as the site the user asked for.
- Do not deploy the scaffold and hand that link over as if it were the clone.
- Do not assume alias names are truthful. Verify aliases before reporting links. As of 2026-05-07, `ripe-studios-cms.vercel.app` and `ripe-studios-clone.vercel.app` point to the root unified Next/Sanity deployment.
- Do not run broad searches over `/Users/anushgopalakrishnan` or protected macOS folders unless absolutely necessary.
- Do not reintroduce Computer Use or other background helpers casually; they contributed to repeated privacy prompt issues.
- If changing deployment aliases, verify the exact target deployment and verify public `200` responses afterward.

## Conductor / Process Notes

- Conductor previously kept helper processes alive after tool use:
  - `conductor-runtime sidecar`
  - `codex app-server --listen stdio://`
  - `SkyComputerUseClient mcp`
- The repeated “Conductor.app would like to access data from other apps” prompt was likely tied to that helper chain plus earlier out-of-workspace scans.
- Future agents should avoid repeating those triggers.

## Recommended Next Steps

- Rebuild `/case-studies/[slug]` natively once the desired structure/content model is defined.
- Wire the native public routes to Sanity-backed content without changing the rendered design or interactions.
- Migrate the in-page editor from generic DOM patching to route-specific field bindings on the native pages.

## Current Work Experiments

- `/work-new` is the active work-page experiment that uses `src/components/work-journal-section.tsx` and `src/components/work-journal-section.module.css`.
- `/work-new-alternate` is the alternate card-size work-page experiment using the same component with `layout="alternating"`.
- The work journal has a single grid/list toggle centered above the filters. It should show only the next available view, not both options at once: `List View` while the grid is active and `Grid View` while the list is active. The grid mode is a Ripe image-card grid. The list mode is a compact four-column editorial list with Graphik 12px headers, Times/Plantin-scale 42.4px row text, 44px rows, equal-width columns, and a hidden centered image preview that appears on row hover.
- Current list view columns are: `Industry`, `Project Name`, `Services`, `Year`. Project descriptions are intentionally hidden in list view and remain visible in grid cards. `src/data/work-journal.ts` now includes temporary `industry` and `year` fields; years are placeholder values from 2026 through 2022 in descending order and should be replaced when real CMS data exists.
- The list-mode `Year` column and its `Year` header label are right-aligned to the right edge of the fourth column/page in both `/work-new` and `/work-new-alternate`.
- In list view, the hovered card gets a higher stacking context and its preview image has higher z-index so the hover image appears above row text, not underneath it.
- The work journal toggle animation is a clipped vertical track: `List View` slides up out of the button and `Grid View` slides in when switching to list, with the reverse animation when returning to grid. Keep this as a single accessible button, not two visible buttons.
- Grid/list layout changes use a staged card transition in the shared `WorkJournalSection`: `data-transition="exiting"` animates current cards out, then the component switches `view`, then `data-transition="entering"` animates the new layout in. This applies to both `/work-new` and `/work-new-alternate`; keep Playwright geometry checks waiting for `data-transition="idle"` before measuring.
- Filter changes also use the same staged transition path, but selected filter UI and the `filters` query param update immediately on click. The rendered card set uses a separate `displayedFilters` state that updates after the exit phase, then the filtered set animates in. This avoids the “click twice” feeling while preserving animated reflow. Tests should wait for `data-transition="idle"` before measuring final card counts/geometry.
- After a view transition completes, the grid sets `data-view-transitioned="true"` and suppresses the default `.card` `cardIn` animation while `data-transition="idle"`. This prevents the first post-toggle hover from restarting/reflowing the whole grid before hover interactions activate.
- The work journal view toggle previews the alternate layout on hover without changing the URL. Clicking persists the preview/current target into the `view` query param. Leaving the toggle without clicking reverts to the committed view. Toggle hover opacity is intentionally reduced to `0.62`.
- List mode has `8rem` bottom padding so the final row is not tight against the footer.
- The work journal preserves shareable UI state in query params. `view=grid` and `view=list` are both explicit and apply to `/work-new` and `/work-new-alternate`; `filters=Motion,Web%20Design` restores selected filters. If a work journal URL has no `view`, the client writes `view=grid` with `history.replaceState`.
- The gap between the work journal view toggle and filters is intentionally `4rem`. List-mode media transitions are disabled during grid/list layout changes to prevent all project images animating awkwardly; only the hovered list preview image should animate in.
- Regular `/work-new` grid cards intentionally use a uniform `4 / 5` media aspect ratio so all card images occupy the same height. `/work-new-alternate` intentionally keeps mixed media aspect ratios.
- The work journal still maps only the content fields currently available in `src/data/work-journal.ts`: title, description, image, tags, and accent color. There is no real year field yet, so the list view year column uses an em dash placeholder instead of inventing content.
- Do not change the work-page visual language unless the user explicitly requests it. Current user-requested details include sharp/no-radius cards, no card blur on hover, theme changes on card hover, selected filters moving upward, comma-space separators in filters, a full-width 2px divider below filters, and slower/smoother filter/theme/card animations.

## Most Recent Major Change

- The root Next app now owns all non-detail public routes directly and only uses proxy rewrites for deferred or dead route families.
- Fixed a major native-rendering parity regression on 2026-05-07:
  - `src/lib/native-mirror.ts` now replaces the full Webflow stylesheet `<link>` instead of injecting local `<link>` tags inside an existing `href`, which caused raw `integrity/crossorigin` text to render in the page.
  - `src/proxy.ts` now serves exported Webflow assets from public paths (`/css`, `/fonts`, `/images`, `/js`, `/vendor`) by rewriting to `visual-mirror`.
  - `src/app/globals.css` was reduced to a no-op comment and `src/app/layout.tsx` no longer injects scaffold Google font classes, preventing old scaffold styling from leaking into the clone.
  - Exported Webflow scripts are converted to inert templates on SSR and executed by `src/components/native-route-runtime.tsx` after `window.__RIPE_NATIVE_SOURCE_ROUTE__` is set, so canonical routes like `/case-studies` load the same route-specific assets as their Webflow source routes like `/case-studies-new`.
  - `site/vendor/loader.js` now honors `window.__RIPE_NATIVE_SOURCE_ROUTE__` and is idempotent per route to avoid duplicate asset injection.
- Production parity check after the fix:
  - `https://ripe-studios-cms.vercel.app/case-studies` has 12 cards, first card `Sticky Notes`, `body.theme-active-ready`, no raw stylesheet attribute leakage, no `detail-builder.css` on the index, and the same measured desktop grid/filter geometry as the Webflow source.
  - `https://ripe-studios-cms.vercel.app/__editor?path=/case-studies-new` renders 12 case-study cards in the editor iframe.
  - Production Playwright check reported no console errors for that flow.
- Clean canonical routes now exist on the root app with public redirects from the legacy Webflow/archive paths:
  - `/home-new-feed` duplicate of the current home page, labelled `Home (new feed)` in the in-page editor route list
  - `/case-studies`
  - `/case-studies/tags/[slug]`
  - `/writing`
  - `/writing/[slug]`
  - `/team`
  - `/team/[slug]`
  - `/services`
  - `/careers`
  - `/work`
- Legacy public routes currently redirect with `308`:
  - `/case-studies-new`
  - `/case-studies-new-copy`
  - `/case-studies-tags/[slug]`
  - `/archive/writing`
  - `/archive/writing-new-copy`
  - `/archive/team`
  - `/archive/team-new`
  - `/archive/services`
  - `/archive/careers`
  - `/archive/work`
- The current native implementation preserves the original Webflow-exported DOM/CSS/script contract instead of introducing new design or layout code.
- The repo also contains a separate in-page editor/dev panel:
  - public/editor entry path: `/__editor`
  - internal route target: `/visual-editor`
  - mirrored page iframe/assets are still served through `/__mirror/*` and `/visual-mirror/*` for non-migrated routes
  - the editor accepts `?path=/some/route` to open a specific mirrored route inside the panel
  - examples:
    - `/__editor`
    - `/__editor?path=/case-studies-new`
    - `/__editor?path=/archive/writing-new-copy`
- Verified locally in `next dev`:
  - `/`, `/case-studies`, `/case-studies/tags/[slug]`, `/writing`, `/writing/[slug]`, `/team`, `/team/[slug]`, `/services`, `/careers`, and `/work` render as native Next pages
  - `/case-studies/[slug]` still rewrites to `/visual-mirror`
  - `/__editor?path=/case-studies-new` uses iframe src `/case-studies?__editor=1`
  - `/__mirror/css/ripe-studios-e83bf0-64c72-4e9b8f09cddc9.webflow.css` returns `200`
  - `/__mirror/images/favicon.svg` returns `200`
  - `/__mirror/js/webflow.js` returns `200`
  - `/studio` remains the real Next/Sanity route
- Previously deployed unified root builds:
  - older deployment url: `https://ripe-studios-g494lwkkt-anushgopalakrishnans-projects.vercel.app`
  - current deployment url: `https://ripe-studios-19joascnk-anushgopalakrishnans-projects.vercel.app`
- Repointed public aliases to the current unified root deployment on 2026-05-07:
  - `https://ripe-studios-cms.vercel.app`
  - `https://ripe-studios-clone.vercel.app`
- Latest deployment after adding the `Home (new feed)` duplicate:
  - `https://ripe-studios-qkj610511-anushgopalakrishnans-projects.vercel.app`
  - aliases `ripe-studios-cms.vercel.app` and `ripe-studios-clone.vercel.app` were repointed to it
- `/home-new-feed` now replaces the old home feed section with a native Next/React feed.
  - Implementation files: `src/components/home-feed.tsx`, `src/components/home-feed.module.css`, and `src/app/(site)/home-new-feed/page.tsx`.
  - It is app-owned JSX/CSS with no visible reference-site naming in the implementation.
  - Production verification on 2026-05-07: 24 feed cards, first desktop card rect `x:15 y:2337 w:460 h:182`, editor iframe src `/home-new-feed?__editor=1`, no console errors.
- Latest deployment after fixing the home feed videos and services typewriter:
  - deployment url: `https://ripe-studios-ob1wuj80t-anushgopalakrishnans-projects.vercel.app`
  - aliases `https://ripe-studios-cms.vercel.app` and `https://ripe-studios-clone.vercel.app` were repointed to it on 2026-05-07.
  - `/home-new-feed` now uses native `<video>` cards for Maison Margiela and Polestar.
  - The feed now has a native services typewriter card cycling `Strategy`, `Identity`, `Design`, and `Motion`.
  - Added an IntersectionObserver/load-event autoplay recovery hook so below-the-fold muted looping videos actually start when the feed enters view.
  - Production Playwright verification against `https://ripe-studios-cms.vercel.app/home-new-feed`: 24 cards, 2 feed videos, both videos `readyState` 4, `paused: false`, `muted: true`, `loop: true`, current times above 5 seconds, and services text changed from `Mot|` to `Strategy|`.
  - Full local smoke suite passes after the test update: `25 passed`.
- Latest deployment after matching home feed interactions:
  - deployment url: `https://ripe-studios-lv428zihr-anushgopalakrishnans-projects.vercel.app`
  - aliases `https://ripe-studios-cms.vercel.app` and `https://ripe-studios-clone.vercel.app` were repointed to it on 2026-05-07.
  - `/home-new-feed` now includes stacked pill hover/focus interactions: `Work` -> `View`, `Feature/Talk/Interview` -> `Read`, `Studio` -> `About` or `Sounds`.
  - Feed cards now have native full-card anchors pointing to internal Ripe routes.
  - The Clients card now has a native animated logo marquee that pauses on hover.
  - The Sounds card embeds a local static studio playlist panel.
  - Fixed the media layer stack by moving feed images/videos above the card background and below overlays/text/links.
  - Production Playwright verification against `https://ripe-studios-cms.vercel.app/home-new-feed`: 24 cards, 19 links, 2 videos playing, first images loaded with natural widths, Raf Simons and article links present, hover pill transform active, logo marquee transform changes over time, and no console errors.
  - Full local smoke suite passes after the test update: `25 passed`.
- Branch `ui-kit-style-guide` adds an internal Ripe UI kit/style guide route:
  - route: `/style-guide`
  - implementation: `src/app/(internal)/style-guide/page.tsx` and `src/app/(internal)/style-guide/style-guide.module.css`
  - shared tokens: `src/styles/ripe-tokens.css`, imported from `src/app/globals.css`
  - purpose: design future UI against the current Ripe visual language, not the custom home feed language.
  - token source: exported Webflow/Ripe style vocabulary, including Plantin MT Pro, Graphik, Chivo Mono, ink `#191919`, beige `#f1ebe2`, paper, orange accent `#ff4c24`, spacing, sharp radius tokens, and motion variables.
  - typography rule: Ripe serif typography uses `Plantin MT Pro Light` everywhere at font weight `300`. The shared tokens define `--ripe-font-serif: "Plantin MT Pro Light", "Plantin MT Pro", "Times New Roman", serif` and `--ripe-font-serif-weight: 300`; future serif components should use those tokens rather than defaulting to browser `400`.
  - user style preference for Ripe design-system work: no generic boxed/card-heavy UI and no rounded corners. Keep layouts editorial, ruled, sharp-cornered, and aligned with the existing Ripe/Webflow language.
  - latest style guide revision removes card-box section wrappers, removes rounded radii, uses border rules/open grids, sets `--ripe-radius-pill`, `--ripe-radius-sm`, and `--ripe-radius-md` to `0`, and changes the motion sample shape from circular to square.
  - production gate: `/style-guide` calls `notFound()` when `process.env.VERCEL_ENV === "production"` unless `ENABLE_STYLE_GUIDE=true`; local and Vercel preview builds can render it.
  - SEO: route metadata is `noindex, nofollow`.
  - local verification on 2026-05-08: `/style-guide` renders title `Ripe Style Guide | Ripe Studios`, sections `tokens`, `typography`, `color`, `components`, `forms`, and `motion`, no console errors, and the production-gate check returned `404` with `VERCEL_ENV=production`.
  - latest local visual contract check on 2026-05-08 found no computed non-zero border radii in the style guide, `boxedSections: 0`, and `radiusToken: "0"`.
  - smoke suite now includes the style guide route and passes `26 passed`.
  - old Vercel preview deployment for review before the sharp/no-box revision: `https://ripe-studios-j9w6hk2qx-anushgopalakrishnans-projects.vercel.app/style-guide`
  - latest sharp/no-box Vercel preview deployment before Plantin Light token fix: `https://ripe-studios-2ca385txr-anushgopalakrishnans-projects.vercel.app/style-guide`
  - latest Plantin MT Pro Light / 300 Vercel preview deployment for review: `https://ripe-studios-52f7pmr61-anushgopalakrishnans-projects.vercel.app/style-guide`
  - Production alias check: `https://ripe-studios-cms.vercel.app/style-guide` returns `404`.
- Verified on the unified domain:
  - `/` returns `200`
  - `/case-studies` returns `200`
  - `/writing` returns `200`
  - `/team` returns `200`
  - `/studio` returns `200`
  - `/home-new-feed` returns `200`, title is `Home (new feed)`, and renders the current home page content
  - `/__editor?path=/home-new-feed` returns `200` and uses iframe src `/home-new-feed?__editor=1`
  - `/__editor?path=/case-studies-new` returns `200`
  - `/__mirror/css/ripe-studios-e83bf0-64c72-4e9b8f09cddc9.webflow.css` returns `200`
  - a browser-level Playwright check against `https://ripe-studios-cms.vercel.app/__editor?path=/case-studies-new` saw iframe src `/case-studies?__editor=1` and first case-study title `Sticky Notes`

## Recent Writing Feed Flattening

- The `/writing` index used to flash Webflow-era intermediate layout because the page server-rendered a hidden CMS list and template panels, then `site/vendor/ripe/scripts/writings/horizontal-feed.js` rebuilt the final horizontal rail on the client.
- This has been flattened for first paint:
  - `src/lib/writing-feed-ssr.ts` prepares the writing index document server-side.
  - It reads the mirrored hidden CMS list, computes the same temporary tags used by the old loader, renders the final large/small writing feed panels into a `.writing-feed-track`, hides the original templates, clips the hidden CMS list, and forces the rail opacity to `1`.
  - `src/app/(site)/writing/page.tsx` applies that server transform before rendering `NativeRouteDocument`.
  - `site/vendor/ripe/scripts/writings/horizontal-feed.js` now removes an existing SSR `.writing-feed-track` before rebuilding/binding scroll and filter interactions, preventing nested tracks.
  - Inline mirrored scripts are encoded into template data attributes in `src/lib/native-mirror.ts` and decoded by `src/components/native-route-runtime.tsx`, avoiding React hydration text mismatches from `<template>` script content.
- Verification on 2026-05-08:
  - Built `/writing` with every script blocked: rail opacity `1`, track display `flex`, 6 cards, first title `Understanding Writing Techniques`, hidden CMS height `1px`, templates visible `0`.
  - Hydrated `/writing`: 6 cards, 4 panels, no nested tracks, first title unchanged, no console errors.
  - Smoke suite now includes a no-loader regression for this and passes `27 passed`.
  - Vercel preview verified: `https://ripe-studios-q145csxfi-anushgopalakrishnans-projects.vercel.app/writing`.
- Follow-up fix after user still saw layout shift:
  - The remaining shift was not from card rebuilding; it came from the legacy loader injecting the writing feed CSS and pin shell after first paint.
  - `src/lib/writing-feed-ssr.ts` now server-wraps the writing main section in `.writing-feed-pin-shell`, emits render-blocking writing feed stylesheet links, and includes critical inline CSS for the hero, filter rail, hidden CMS, pin shell, and horizontal track dimensions.
  - It also preloads `PlantinMTProLight.TTF` and `GraphikRegular.otf` on `/writing` to reduce font-metric swap after first paint.
  - `site/vendor/loader.js` no longer injects its old `[data-horizontal-scroll-wrap] { opacity: 0 !important; }` critical rule when the SSR writing feed is present.
  - `site/vendor/ripe/scripts/writings/horizontal-feed.js` now adopts the server-rendered `.writing-feed-track` on initial load instead of deleting/rebuilding it; rebuilds are reserved for later filter/responsive changes.
  - Local production-mode measurement after this fix: first and final card/filter rects match within sub-pixel tolerance, CLS `0.0016`, 6 cards, 4 panels, no nested tracks, no console errors.
  - Final first-paint lock commit: `c44ba86 lock writing filter first paint`.
  - This adds critical CSS for the writing filter band height (`42px`) and divider (`2px`) so the server-painted filter geometry matches the hydrated CSS exactly.
  - Latest preview for this fix: `https://ripe-studios-cqa0vfhi9-anushgopalakrishnans-projects.vercel.app/writing`.
  - Deployed Playwright verification on 2026-05-08: early paint has 6 `.demo-card` writing cards, first title `Understanding Writing Techniques`, first card rect `x=64 y=518 w=700 h=576`, filter rect height `42`, wrap opacity `1`, track display `flex`, templates visible `0`; after hydration it still has 6 cards, no nested tracks, first card y `517.999`, filter height `42`, CLS `0.001259`, and no console/page errors.
  - Note for future verification: the native/Webflow-compatible card selector is `.writing-feed-track .demo-card`, not `.writing-feed-card`.
- Follow-up cross-route first-paint flattening:
  - Shared loader CSS is now server-rendered through `src/lib/ripe-loader-styles.ts` for mirrored routes, instead of waiting for `site/vendor/loader.js` to append global/page styles after first paint.
  - `src/components/native-route-runtime.tsx` now emits a tiny inline bootstrap script before mirrored markup so Webflow `html`/`body` attributes and body classes are applied before page content paints. The client runtime still reapplies them after hydration for navigation safety.
  - `src/app/layout.tsx` preloads the core local fonts: `PlantinMTProLight.TTF`, `GraphikRegular.otf`, and `ChivoMono-Regular.ttf`.
  - Home `/` has `src/lib/home-first-paint.ts`, which makes the exported masonry feed visible immediately and gives the desktop masonry list the same initial footprint as the hydrated Isotope layout. Local production verification: early and late scroll height both `6937`, no masonry geometry diffs.
  - Writing detail pages now use `src/lib/writing-article-ssr.ts`, which reads exported rich text and server-renders visible `.article__panel` content into `.writing-article-track` with `data-ssr-writing-article="true"`. `site/vendor/ripe/scripts/writings/horizontal-blog.js` adopts that existing track instead of rebuilding on load.
  - Verified writing details locally: `/writing/the-power-of-words` first paint has 2 visible panels and opacity `1`; `/writing/developing-your-writing-voice` first paint has 6 visible panels and opacity `1`; early and late panel counts/positions match.
  - Work `/work` has `src/lib/work-first-paint.ts`, which locks the case-study grid to the hydrated footprint before late scripts/styles run. Local production verification: CLS dropped from about `0.326` to `0.0006`.
  - Added Playwright regressions for home masonry first-paint, writing detail first-paint panels, work grid first-paint, and `/home-new-feed` hero/feed first-paint stability. Smoke suite now runs 31 tests and passes.
  - `/home-new-feed` now uses `src/lib/home-new-feed-first-paint.ts` plus a tiny root critical style in `src/app/layout.tsx` for the shared hero-card footprint. This prevents the duplicate home page hero cards from painting shrink-wrapped and then expanding after image/script load.
  - Local production verification on 2026-05-08: `/home-new-feed` keeps early/final `scrollHeight`, custom feed y-position, and hero title y-position stable; CLS is below `0.005` in the regression.
  - Vercel preview deployed on 2026-05-08: `https://ripe-studios-n8ww61cei-anushgopalakrishnans-projects.vercel.app`.
  - Deployed verification for `/home-new-feed`: title `Home (new feed)`, 24 feed articles, 2 videos, early/final hero y `263`, feed y `1922`, scroll height `6288`, CLS `0.0003401837`, and `/__editor?path=/home-new-feed` returns `200`.
- Work page duplicate experiment:
  - `/work-new` is a copy/variant of the Work page that keeps the existing Ripe nav/footer shell but replaces the work grid with a native React journal section.
  - Implementation files: `src/app/(site)/work-new/page.tsx`, `src/components/work-journal-section.tsx`, `src/components/work-journal-section.module.css`, and `src/data/work-journal.ts`.
  - The section maps the 12 exported Ripe case studies into a four-column image journal grid with 17px gutters/gaps, large Times-style titles, mono category labels over images, and responsive 4/2/1 column behavior.
  - The top filters are preserved as native controls above the grid: Strategy, Identity, Motion, Web Design, Brand Extensions. Filtering is client-side OR filtering; clicking an active filter toggles it off.
  - Follow-up filter/media refinement on 2026-05-11: filters now match the original Ripe/Webflow style more closely with Plantin 2.25rem light labels, comma separators, and a period after the final filter. Active filters drop to 50% opacity.
  - The journal media blocks now let image natural aspect ratio define card image height instead of enforcing a fixed ratio. Verified first image natural `648x872` renders at `338.75x455.84375`.
  - Filter changes remount the visible grid with a staggered `cardIn` animation; reduced-motion users get no animation.
  - Native hover theme restored on `/work-new`: hovering/focusing a project card writes `--work-journal-theme` and `data-work-journal-tone` to `body`, makes the nav shell transparent, shows a fixed page-gradient overlay behind the nav and page, flips nav/filter text between light/dark based on accent luminance, and fades/desaturates non-hovered media only. Project titles/descriptions remain visible and are not dimmed by hover.
  - `/work-new` card accent overlays stay hidden on default and hover states. The hovered card must show its image at full color with no per-card color overlay; all non-hovered cards are the ones that dim/greyscale. Latest verification: hovered card overlay opacity `0`, hovered image filter `none`, second media opacity `<0.5`, second image filter includes `grayscale`, nav background `rgba(0, 0, 0, 0)` while themed.
  - `/work-new` filters now use the same Times-style typography as the project titles, while keeping comma separators with a visual space after each comma and a final period. The punctuation/spacing is CSS-only and must not affect filter button text or filtering behavior.
  - `/work-new` hover smoothing update on 2026-05-11: clearing the page theme now happens from the grid/focus boundary instead of every card `pointerleave`, so moving between cards does not enter the fading/reset path. The previous hover rule that toggled card animations off/on was removed to prevent the card entrance animation replaying after leaving the grid.
  - `/work-new` project subtitles now use Graphik regular at `0.875rem` font size, `1.4286` line-height, and `0.0107em` letter spacing, matching 14px / 20px / 0.15px at a 16px root. The work journal component stylesheet has been converted away from fixed `px` values for typography/spacing/media queries.
  - `/work-new` motion was slowed slightly on 2026-05-11: theme/media fades are `420ms`, page/text color transitions are `560ms`, and card entrance animation is `720ms` with a `58ms` stagger. Keep these timings unless the user explicitly asks to speed it back up.
  - `/work-new` hover structure: the hovered project image scales to `1.04` while remaining in full color. The image tag is hidden by default and animates in with opacity/translate only on the hovered/focused card; non-hovered tags stay hidden.
  - `/work-new` tablet layout trial on 2026-05-11: removed the 2-column tablet breakpoint so the journal grid remains 4 columns until the mobile breakpoint at `50.5625em`, where it becomes 1 column. This is an intentional trial requested by the user and may be reverted if it feels too cramped.
  - `/work-new` theme transition fix on 2026-05-11: the page theme overlay now uses an animatable `background-color: var(--work-journal-theme)` layer with a separate `::after` white gradient falloff. Do not put the theme color back inside the gradient stop, because that snaps between card hover colors instead of transitioning.
  - `/work-new` latest layout/style tweaks after commit `f9f5b4a`: filter block spacing is `8rem` above and below; a `2px` divider sits below the filters and spans the section width inside the page gutter; the grid starts `2rem` below the divider. Cards are sharp-cornered with no media border radius. Hovered card images zoom to `1.04` but no longer blur. In-card category/tag text now matches the subtitle style: Graphik regular, `0.875rem`, `1.4286` line-height, `0.0107em` letter spacing. Active filter buttons nudge upward (`translateY(-0.06em)`) instead of downward. The divider changes color with the active hover theme.
  - `/work-new` hover-target fix: grid items use `align-items: start` and cards use `align-self: start` so card anchors do not stretch into empty row space. Cards now also call the debounced `clearTheme` on `pointerleave`; entering another card cancels the pending clear, so empty grid space clears hover while card-to-card movement stays smooth.
  - `/work-new` active filter animation timing was slowed: filter button opacity transition is `520ms`, transform transition is `620ms`. Regression waits for the longer transform before asserting the active filter moves upward.
  - `/work-new` and `/work-new-alternate` now include a centered `Project view` toggle above the filters with `Grid` and `List` buttons plus inline SVG icons. Default is grid. List view switches the project cards into full-width rows with a media column, title column, and description column while preserving the same filter/theme/hover behavior.
- Site-wide page transition experiment:
  - Added a basic public-site transition using `src/app/(site)/template.tsx`, `src/components/page-transition-controller.tsx`, and global CSS in `src/app/globals.css`.
  - The implementation intentionally does not wrap page markup, because an initial wrapper-based implementation disturbed the `/home-new-feed` layout stability regression. The controller toggles `ripe-page-entering` on `<html>` per pathname change and animates `body` opacity for `420ms`; reduced-motion disables it.
  - This is an entry animation only, not a full exit/enter router interception system.
- `/work-new-alternate` experiment:
  - Added a duplicate of `/work-new` at `/work-new-alternate`, titled `Work (alternate journal)`, with the same data, filters, hover theme behavior, divider, and editor support.
  - `WorkJournalSection` now accepts `layout="standard" | "alternating"`. The alternate route passes `layout="alternating"`.
  - The first implementation used mixed card widths; the user corrected this. The intended alternate layout keeps equal 4-column card widths and creates the small/big rhythm through alternating image aspect ratios/crops. Mobile still collapses to 1 column with natural image height.
  - Editor path `/__editor?path=/work-new-alternate` is routed to `/work-new-alternate?__editor=1` and appears in the editor route list as `Work (alternate journal)`.
  - Smoke coverage now includes `work new alternate route renders mixed small and big project cards`; it checks equal card widths and varied media heights. Latest run after this correction: `33 passed`.
  - `/__editor?path=/work-new` is routed to `/work-new?__editor=1` in the in-page editor shell.
  - Local production verification on 2026-05-11: `/work-new` renders 12 cards, first card x `17`, width `338.75`, first image `338.75 x 455.84375`, footer is present, Motion filter returns 4 cards (`ZetaChain`, `Volvo`, `Tabletop`, `Redbull`), no console errors, and editor route returns `200`.
  - Smoke suite includes `work new route renders the filtered journal grid`; the regression asserts the no-overlay hover contract above, the no card-to-card fading reset, no card animation replay after leaving the grid, and the Graphik subtitle typography. Latest local run after hover smoothing/subtitle updates: `32 passed`.
  - Mobile-only work journal controls were updated on 2026-05-11 using the top control pattern from `https://www.kinfolk.com/stories`: desktop filters remain unchanged, but under the `50.5625em` breakpoint the page shows an `All Work` title, a left `Categories` trigger with a stacked-line icon, a right grid/list view toggle, and a `2px` underline. The filter buttons move into a fullscreen mobile dialog opened by `Categories`; the dialog locks body scroll, hides/disables the mirrored Webflow nav while open, keeps multi-select filter behavior, and still persists filters/view in query params. Regression coverage: `work new route uses mobile categories modal controls`; latest focused local production run: `pnpm exec playwright test tests/smoke.spec.ts -g "work new" --reporter=line` passed `4 passed`. Deployed production URL: `https://ripe-studios-d1r74z9o4-anushgopalakrishnans-projects.vercel.app`; stable aliases repointed to this deployment: `https://ripe-studios-cms.vercel.app` and `https://ripe-studios-clone.vercel.app`. Live Playwright check verified `/work-new?view=grid` has `All Work`, visible `Categories`, hidden desktop filters, fullscreen modal with all 5 filters, nav opacity `0` while modal is open, and `filters=Motion` persists after selecting Motion.
  - Mobile hover replacement on 2026-05-11: under the same mobile breakpoint, the work journal now activates the project nearest a viewport trigger line during scroll instead of depending on hover. This reuses the existing `handleCardEnter`/theme path, so the scroll-active card gets the same page theme, full-color image, zoom, tag reveal, and per-card text contrast behavior as desktop hover; inactive visible cards dim/greyscale. Desktop pointer hover remains unchanged. The scroll observer is `requestAnimationFrame`-throttled and clears the theme only when the grid is mostly outside the viewport. Regression coverage was added to `work new route uses mobile categories modal controls`; it checks Sticky Notes is initially active on mobile, scrolling to `900` activates ZetaChain and changes the theme to `#0d7c5f`, with the active image unfiltered and inactive image greyscaled. Deployed production URL: `https://ripe-studios-4c8l3kkei-anushgopalakrishnans-projects.vercel.app`; stable aliases `https://ripe-studios-cms.vercel.app` and `https://ripe-studios-clone.vercel.app` were repointed. Live mobile Playwright check on `ripe-studios-cms` verified initial active `Sticky Notes`/`#4e3aaa`, scroll active `ZetaChain`/`#0d7c5f`, active image `none`, inactive image `grayscale(1)`.
  - Mobile filter modal refinement on 2026-05-11: the Categories modal now slides down from the top using `transform: translateY(-100%) -> 0`, uses background `#F1EBE2`, and centers smaller Graphik uppercase filter options in the middle of the viewport. The modal filter text has a higher-specificity black override so active hover themes cannot force it white. Regression now asserts modal background, open transform, black text color, centered text, and Graphik font.
  - Follow-up mobile modal refinement on 2026-05-11: removed the selected-filter summary/header from the Categories modal entirely. The only top chrome is the `Close` button. Filter labels remain centered in the middle of the modal but now use the page serif stack (`Times New Roman`, matching current project-title typography), normal casing, black text, and no heading/Viewing text. Regression now asserts no heading/Viewing text and Times font.
  - Grid/list toggle behavior was restored on 2026-05-11: the button rests on the opposite/target view (`List View` while currently in grid, `Grid View` while currently in list), hover slides to preview the other/current label, and click still commits the target view. This applies to desktop and mobile controls on both `/work-new` and `/work-new-alternate`. Focused regression `pnpm exec playwright test tests/smoke.spec.ts -g "work new" --reporter=line` passed `4 passed`.
  - List view hover was disabled on 2026-05-11. `handleCardEnter` now returns early when `viewModeRef.current === "list"`, and the mobile scroll trigger also only runs in grid view. Switching into list clears any active grid theme. The old list preview timer/state was removed; rows keep `data-hovered="false"`, `data-list-preview-entry="false"`, no page theme, and no image preview on hover. Grid hover and mobile grid scroll activation remain active. Regression now checks list hover is inert.
  - Correction on 2026-05-11: list view should NOT theme the page, but it SHOULD keep the image preview animation. Restored list preview state/timer and `data-list-preview-entry`; `handleCardEnter` in list now sets `hoveredSlug` and first-hover preview entry but returns before `applyTheme`. Result: list row hover shows the image preview animation and subsequent rows swap image without reanimating, while `body.themeActive` stays false and `--work-journal-theme` stays empty. Regression now asserts image preview works in list while theme remains inactive.
  - Mobile filter usability fix on 2026-05-11: the filter logic was applying correctly, but because the fullscreen Categories modal stayed open after tapping a filter, it looked broken on device. Mobile modal filter buttons now call `toggleFilter(filter)` and immediately close the modal (`closeOnSelect` option in `renderFilterButtons`). The filtered grid becomes visible right away. Regression now asserts selecting Motion closes the modal, unlocks body scroll, URL has `filters=Motion`, transition returns to idle, and the visible work grid has 4 Motion cards including ZetaChain.

## Runtime Notes

- `pnpm build` passes with the native non-detail route cutover.
- Visual editor sidebar redesign on 2026-06-18: `/__editor` inspector now uses stable `Style` / `Content` / `Review` tabs, a compact target header with draft status plus reset/hide/delete icon actions, and a Review command center for handoff notes, patch list, copy handoff, patch changes, reset all, and expand/collapse all. Style sections are ordered Type, Paint, Space, Layout, with advanced layout still collapsed. CSS remains scoped to `src/app/(archive)/__editor/shell.module.css`; public site routes and APIs were untouched. Verification: `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm lint`, `git diff --check`, and Playwright checks on `/__editor?path=%2Fcareers` at 1440/900/390 confirmed stable tabs, selected target header, no horizontal overflow, sidebar h2/button weights `400`, and note-draft create/reset workflow.
- Visual editor color picker fix on 2026-06-18: color picker popover now renders through a `document.body` portal with fixed viewport positioning so the inspector scroll area cannot clip it. Picker styling was rethemed to match the dark sidebar surface (`#212121`, 8px radius, muted white text/borders) instead of the prior light panel. Verification: `pnpm typecheck`, `pnpm lint`, `git diff --check`, and Playwright on `/__editor?path=%2Fcareers` at 1440/390 confirmed the picker parent is `BODY`, position is fixed, it stays within viewport, no horizontal overflow, and the computed picker background/radius are `rgb(33, 33, 33)` / `8px`.
- Visual editor numeric shorthand on 2026-06-18: numeric inputs now accept compound unit conversion commands like `40pxrem`. The parser treats the first unit as the source value, converts through the existing selected-element unit conversion path, and applies the second unit back into the input. Example verified on `/__editor?path=%2Fcareers`: entering `40pxrem` in the selected text Size field becomes `2.5` with unit `rem` and creates the expected draft. Verification: `pnpm typecheck`, `pnpm lint`, `git diff --check`, and Playwright smoke.
- Visual editor selection persistence fix on 2026-06-18: selecting another iframe element now flushes pending sidebar edits before replacing the selected target. `src/app/(archive)/__editor/shell.tsx` keeps a synchronous latest editor-state ref, forces active editor controls through `change`/`focusout` before selection switch, caches persistable preview payloads, and falls back to live iframe DOM comparison when building drafts. This targets the intermittent bug where a previewed edit could appear to revert when clicking another element before the field commit settled. Verification: `pnpm typecheck`, `pnpm lint`, `git diff --check`, and a focused local `/__editor?path=%2Fcareers` smoke confirmed H1 font-size edits still persist to `localStorage` and preview as expected.
- Follow-up editor persistence fix on 2026-06-18: the remaining parent-selection case was caused by preview edits not being persisted until blur/selection flush; selecting a parent could leave the visual inline preview in the iframe but no draft row/localStorage entry. Style/text/image/note preview updates now call `commitDraft` immediately while keeping the existing field transaction snapshot for undo/Escape. The live DOM fallback also derives touched properties from inline preview styles when React's touched-property set is empty. Verified on fresh local webpack dev server `http://127.0.0.1:3001/__editor?path=%2Fcareers`: edit H1 size to `24px` without blur, select parent `section`, draft remains in `localStorage`, sidebar shows `1 draft`, and H1 remains `24px`. `pnpm typecheck`, `pnpm lint`, and `git diff --check` passed.
- Local dev recovery note from 2026-06-17: repeated `/__editor` 500s were caused by Turbopack dev cache corruption and near-full disk after deleting `.next` while `pnpm dev` was still running. Stop the dev server first, clear generated `.next`, then restart with webpack while disk is tight: `pnpm exec next dev --webpack -H 127.0.0.1 -p 3000`. The recovered editor URL returned `200`: `http://127.0.0.1:3000/__editor?path=/case-studies/zetachain`.
- Visual editor preset correction on 2026-06-17: the user specifically wants shadcn preset `b3L0yGCKP2` followed exactly for the editor UI. The preset decodes to Lyra, Mist base, Sky theme, Hugeicons, Geist body font, JetBrains Mono heading font, and radius default; the generated Lyra controls themselves use `rounded-none`, `text-xs`, `ring-1`, square menu items, and sharp select/button/input geometry. Treat the shadcn create page's dark/rounded customizer chrome as website UI, not the generated app style. Editor UI should keep sharp controls/surfaces, light Mist/Sky tokens, scoped Geist/JetBrains fonts, Hugeicons, and editor-only borders. Keep shadcn/Tailwind CSS scoped to `src/app/(archive)/visual-editor/editor.css` behind `body:has([data-visual-editor-shell])`; do not put generated font classes or shadcn tokens back into root `src/app/layout.tsx`.
- Fix on 2026-05-21: Apple Silicon/Turbopack local dev could throw `Cannot find module '../lightningcss.darwin-arm64.node'` from `lightningcss/node/index.js` during PostCSS evaluation. Added `scripts/fix-lightningcss-native.mjs` and root `postinstall` hook (`node scripts/fix-lightningcss-native.mjs`) to copy the platform binary from `node_modules/lightningcss-<platform-arch>/` into `node_modules/lightningcss/` as fallback for the relative native-module load path.
- Follow-up on 2026-05-22: reintroduced the `scripts/fix-lightningcss-native.mjs` + `postinstall` hook after it disappeared, and hardened the script for pnpm installs by copying the platform binary into both root and `.pnpm/.../node_modules/lightningcss` package paths when missing. This addresses failures thrown from the `.pnpm` `lightningcss/node/index.js` fallback import (`../lightningcss.<platform-arch>.node`).
- Local `next dev` correctly serves the rewritten clone routes and `/studio`.
- Local `next start` now works for smoke coverage through `playwright.config.ts`.
- Active home/work static-mirror cleanup on 2026-05-12:
  - Active routes `/`, `/home-copy`, `/home-new-feed`, `/work-new`, and `/work-new-alternate` now use `src/lib/static-mirror-document.ts` before rendering mirrored shell markup.
  - This strips `template[data-ripe-native-script]` blocks and all `data-wf-*` attributes from active mirrored markup/head fragments.
  - `NativeRouteRuntime` now supports `executeScripts={false}` and `webflowRuntime={false}`. Active home/work pages pass both flags, so they no longer execute Webflow/exported loader scripts and no longer stamp Webflow `data-wf-*` attributes or `w-mod-*`/`wf-*` runtime classes onto `<html>`.
  - The remaining `w-*` class names in active home/work markup are still intentionally preserved because the nav/hero/footer shell still depends on exported CSS hooks. Do not remove those class names until those sections are rebuilt as native React components.
  - Light verification after this cleanup: `pnpm typecheck` passed; Playwright smoke over `/`, `/home-copy`, `/home-new-feed`, `/work-new?view=grid`, and `/work-new-alternate?view=grid` found `0` Webflow scripts/templates, `0` `data-wf-*` attributes, visible home hero cards, 12 work cards on both work variants, nav/footer present, and no console errors.
- Sanity comment placement CMS test on 2026-05-12:
  - Added `Comment Placement Test` document type in `src/sanity/schemaTypes/commentPlacementTest.ts`.
  - Added `commentPosition` object type with a custom React Studio input at `src/sanity/components/comment-position-input.tsx`.
  - The editor sees one visual click/drag field, but the stored value is normalized `{x, y}` percentages with `_type: "commentPosition"`.
  - The test document structure is `imageSections[] -> comments[] -> position`, matching the intended future case-study detail model where each image owns its own faux comments.
  - Registered both `commentPositionType` and `commentPlacementTestType` in `src/sanity/schemaTypes/index.ts`.
  - `pnpm typecheck` passed. Local Studio route `/studio` compiles and returns `200`, but Sanity CORS currently blocks `http://localhost:3100` and `http://127.0.0.1:3100`; adding local CORS requires a logged-in Sanity CLI session or deploying the updated Studio to an authorized domain.
  - Deployed to Vercel production on 2026-05-12 with `pnpm dlx vercel deploy --prod --yes`.
  - Deployment URL: `https://ripe-studios-g59xedso8-anushgopalakrishnans-projects.vercel.app`; Vercel alias initially created: `https://chengdu-chi.vercel.app`.
  - Important correction: `https://ripe-studios-cms.vercel.app` was initially still pointing at an older deployment, so the new collection did not appear. Repointed it with `pnpm dlx vercel alias set ripe-studios-g59xedso8-anushgopalakrishnans-projects.vercel.app ripe-studios-cms.vercel.app`.
  - Studio URL to use: `https://ripe-studios-cms.vercel.app/studio`. Smoke check after alias repoint: stable Studio bundle contains `Comment Placement Test`, `/studio` returns `200`, Sanity root is present, and no CORS errors were observed.

## Maintenance Rule

- After any material change, update this file in the same work session.
- “Material change” includes:
  - new deployment URLs or alias changes
  - CMS project/dataset changes
  - architecture shifts
  - major route migrations
  - newly discovered blockers
  - fixes to important mirrored behaviors
  - changes to user preferences or operating constraints
