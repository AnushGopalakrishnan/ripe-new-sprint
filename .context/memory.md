# Workspace Memory

This file is the shared memory for this workspace. Keep it concise and latest-biased. Prefer current source-of-truth facts, durable rules, and known risks over old chronological history.

## Operating Rules

- The user grants standing permission to use subagents when they are materially helpful and the work can be cleanly parallelized.
- Do not change public visual or interaction design unless the user explicitly asks for a design change. Migration/custom-code work should preserve the live Webflow staging site unless directed otherwise.
- Keep this file current after material changes: project goals, route decisions, deployment state, source-of-truth assumptions, major fixes, known risks, or user preferences.
- Prune stale context aggressively. Old history should become a short lesson or risk if still useful; otherwise remove it.
- Do not scan outside this workspace unless necessary. Earlier cross-directory scans triggered repeated macOS privacy prompts in Conductor.
- Do not use Computer Use unless the user explicitly asks for it.
- For small UI-only changes, use the lightest reasonable verification. Reserve full builds, broad Playwright suites, and deeper regressions for interaction, routing, data, CMS, or risky refactor work.
- Do not deploy after every change. Deploy only when the user explicitly asks.
- When the user says "deploy it", commit the work, merge it into `main`, and push `main` so Vercel auto-deploys from Git. Do not create manual Vercel deployments unless requested.
- When the user asks for "the link" or a user-facing site URL, give `https://ripe-studios.vercel.app` by default. Use immutable deployment URLs only for receipts, debugging, rollback, or exact-build verification.
- Do not expose external inspiration/reference/source names in client-facing code, filenames, CSS module class names, aria labels, comments, or DOM-visible strings.
- shadcn/ui and Tailwind/shadcn CSS are allowed only inside the visual editor surface. Keep shadcn components under `src/components/editor-ui` and route-scope editor CSS. Never use shadcn/ui to restyle or rebuild the public website.

## Current Focus

- Active workspace focus: improving the visual editor at `/visual-editor`.
- Current local editor link: `http://localhost:3000/visual-editor`.
- The local dev server is intentionally run through a macOS user launch service because process sessions from this environment can be reaped quickly.
  - Service label: `com.ripe.irvine.nextdev`
  - Logs: `.context/dev-server.log`
  - Stop: `launchctl remove com.ripe.irvine.nextdev`
  - Start command used: `launchctl submit -l com.ripe.irvine.nextdev -- /bin/zsh -lc 'cd /Users/anushgopalakrishnan/conductor/workspaces/ripe-new-sprint/irvine && exec /opt/homebrew/bin/pnpm dev >> .context/dev-server.log 2>&1'`
- Latest editor commits:
  - `6e58cec` `feat: refine editor comment workflow`
  - `1970f96` `design: overhaul editor shell`

## Product Goal

- Migrate the real Ripe Studios Webflow site to custom code with 1:1 visual and functional parity unless the user asks for a redesign.
- Migrate CMS/content editing to a Sanity-backed workflow that powers the real clone, not a disconnected scaffold.
- Source of truth:
  - Live staging site: `https://ripe-studios-e83bf0-64c72-4e9b8f09cddc9.webflow.io/`
  - Webflow export ZIP: `.context/attachments/ripe-studios-e83bf0-64c72-4e9b8f09cddc9.webflow.zip`
  - CMS CSV exports: `.context/attachments/`
- If an old scaffold conflicts with the mirrored live site, the mirrored live site is the product target.

## Repo Reality

- The repo has two historically separate tracks:
  - `site/`: mirrored static clone of the live Webflow site.
  - `src/` + `sanity.config.ts`: Next.js + Sanity app.
- These tracks are now mostly unified through app-owned Next routes, but some mirrored assets/DOM/CSS remain intentionally used for parity.
- Active public focus routes include `/`, `/home-new-feed`, `/home-old-feed`, `/work-new`, `/work-new-alternate`, `/team`, `/careers`, and visual-editor/editor routes.
- Case-study detail routing has had the most historical churn; verify current source before changing it.

## Visual Editor State

- Main implementation areas:
  - `src/app/(archive)/__editor/shell.tsx`
  - `src/app/(archive)/__editor/shell.module.css`
  - `src/lib/editor/bridge-source.ts`
  - `src/lib/editor/types.ts`
  - `src/components/editor-ui`
- `/visual-editor` currently rewrites/renders through the archived editor implementation.
- Comment workflow as of 2026-06-22:
  - `Shift+C` is the single comments toggle.
  - Off hides all comment bubbles and disables creating comments.
  - On shows existing bubbles and allows clicking the preview to create comments.
  - Clicking in the preview opens an on-canvas Figma-style comment card at the click position and focuses its textarea.
  - Typed comment text syncs to the sidebar and localStorage.
  - Blur/hover-out collapses the card into a numbered bubble.
  - Hovering a bubble opens it; hovering out collapses it.
  - Only one comment dialog can be open at a time.
  - Empty/whitespace-only comment drafts are temporary only: they can be blank while focused, but are auto-discarded on blur, hide/toggle, or handoff/export, and are not persisted to localStorage.
- Editor shell design as of 2026-06-22:
  - Unified dark product workspace across topbar, route controls, viewport controls, toolbar, canvas, inspector, tabs, sections, selected/empty states, and mobile bottom-sheet behavior.
  - Inspector default width is 360px; min 320px, max 480px.
  - `src/proxy.ts` lets `/fonts/home-feed-sans.woff2` serve from `public/fonts` instead of rewriting it to the mirror.
- Editor class-scope editing as of 2026-06-22:
  - The selected-target card has a Scope dropdown with `This element`, `All <tag> tags`, and class options derived from the selected iframe element.
  - Tag/class options show page match counts and warn when a scope affects multiple elements.
  - Style edits can be tag- or class-scoped; text/image/hide/delete remain selected-element actions.
  - The iframe shows dashed scope highlight boxes for all matching elements, and copied handoff marks whether a patch is element-, tag-, or class-scoped.
  - Tag/class-scoped style edits persist as broad-scope drafts and are rediscovered when selecting any matching element; a prior bug tied `All h2 tags` edits to the first selected h2.
- Latest verification after the design overhaul:
  - `pnpm typecheck` passed.
  - `pnpm lint` passed.
  - Browser/Playwright desktop and mobile editor checks passed with zero console errors.
  - Interaction checks covered selection, tabs, comment creation/sidebar sync, and `Shift+C` hide/show.
- Design audit screenshots live under:
  - `~/.gstack/projects/irvine/designs/design-audit-20260622-130440/`

## Public Site State

- Public navigation is app-owned via `src/components/public-navigation.tsx` and `src/app/(site)/layout.tsx`.
- Public navigation uses hardcoded Ripe links plus Sanity `siteSettings` for nav labels, contact email, and navigation showreel video.
- The navigation showreel preview GIF is generated app-side; editors do not upload a GIF directly.
- `/team` and `/team/[slug]` are native Next routes backed by Sanity `teamMember` documents.
- `/careers` is a native app route. It has custom hero, filmstrip, pillars, benefits/mosaic, founders/group-photo, and open-roles sections.
- `/`, `/home-new-feed`, `/work-new`, and `/work-new-alternate` still preserve original mirrored page shell behavior for visual parity, with native/app-owned sections where already migrated.
- Work feed/list/filter behavior has several deliberately tuned interactions. Before changing it, verify current behavior in the browser instead of relying on older memory.

## Sanity And CMS

- Sanity reads are part of the app and some production reads require `SANITY_API_READ_TOKEN`; the dataset is not assumed to be publicly readable.
- `sanityFetch()` uses the token for published server reads when available and disables CDN in that case.
- Site settings select the latest updated `siteSettings` document and merge partial CMS values with fallbacks.
- Local Studio can be sensitive to CORS and auth state; verify current config before assuming `/studio` is usable everywhere.

## Deployment

- Canonical production URL: `https://ripe-studios.vercel.app`
- Vercel project: `ripe-studios-cms`
- If deploying manually from a fresh worktree, first link with:
  - `vercel link --yes --project ripe-studios-cms --scope anushgopalakrishnans-projects`
- Preview env vars have historically differed from Production, especially Sanity vars. If preview behaves differently from production, check Vercel env configuration before debugging app code.
- After production deployment, ensure the canonical alias points at the intended `ripe-studios-cms` deployment.

## Known Risks

- Do not accidentally create a new Vercel project from an unlinked worktree.
- Do not use shadcn/Tailwind editor styling on the public site.
- Do not replace mirrored public shell structure unless the user asks for a visual redesign.
- Do not reintroduce external inspiration/reference naming into shipped/client-visible code.
- Do not assume the latest branch contains the intended design if the user asks where visual changes went; compare relevant commits/branches against `origin/main`.
- For visual regressions, preserve later functional fixes while restoring design. Avoid rolling the app back wholesale to old feature branches.
- `next dev` cache corruption or missing native `lightningcss` binaries has happened before; if local dev fails oddly, stop the server, clear generated `.next`, verify disk space, and rerun install/postinstall before changing app code.

## Key Commands

- Typecheck: `pnpm typecheck`
- Lint: `pnpm lint`
- Build: `pnpm build`
- Stable local dev logs: `tail -f .context/dev-server.log`
- Check local editor: `curl -I http://localhost:3000/visual-editor`

## Maintenance

- Update this file in the same work session after material changes.
- Keep the file short enough that future agents actually read it.
- Bias this file toward the current state of the workspace, not a full project diary.
