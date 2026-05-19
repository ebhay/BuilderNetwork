# AGENTS.md

This file applies to the entire repository. The app implementation lives in `my-app/`. More specific `AGENTS.md` files inside subdirectories also apply and take precedence for files under their scope.

## 1. Project Source of Truth

- Follow `plan.md` for implementation structure, phases, architecture, data model, contracts, acceptance criteria, and progress tracking.
- Follow `platform_prd.md` for product behavior, business rules, MVP boundaries, user flows, and non-goals.
- Follow `design.md` for all frontend design, visual system, layout, typography, spacing, and component styling.
- Do not invent features outside the MVP unless `plan.md` is explicitly updated first.
- If `plan.md`, `platform_prd.md`, and `design.md` appear to conflict, stop and resolve the conflict before coding. Product behavior comes from `platform_prd.md`; implementation details come from `plan.md`; visual decisions come from `design.md`.
- The MVP must remain a lightweight builder network, not a project management tool.
- Before implementing Next.js App Router APIs, route handlers, metadata, caching, redirects, forms, or server actions, read the relevant local Next.js docs under `my-app/node_modules/next/dist/docs/` because this template uses a newer Next.js version with breaking changes.

## 2. Frontend Design Rules

- Build SaaS-style pages with separate reusable components: navbar, hero, CTA sections, feature cards, idea cards, filters, profile sections, dashboard tabs, forms, and footer.
- Use the Notion-inspired design system from `design.md`.
- Use token-based colors from CSS variables, not hardcoded colors.
- Define theme tokens centrally in `my-app/app/globals.css` or the agreed global theme file.
- Use a consistent color system based on `design.md`: primary purple CTA, deep navy hero sections, soft surfaces, pastel cards, hairline borders, and ink/slate text colors.
- Use two fonts consistently: one primary font for UI/body and one secondary/display font for headings or hero text.
- Configure fonts centrally in layout/theme files, not per component.
- Use shadcn/ui as the base component layer.
- Buttons must use consistent rectangular radius. Do not use random pill styling except for badges and tabs.
- Cards, badges, inputs, forms, and sections must follow the spacing, radius, border, and elevation rules from `design.md`.
- Do not hardcode random colors, shadows, spacing, border radius, or fonts inside components.
- Keep the landing page polished: SaaS navbar, deep hero, workspace/mockup section, feature sections, CTA section, and footer.
- Use responsive layouts from `design.md`: single-column mobile, 2-column tablet grids, desktop feature grids, and a collapsed mobile nav.
- Use `next/image` for optimized images where possible and configure remote patterns for Supabase-hosted image URLs.
- Verify frontend by actually running the app and checking rendered pages when possible.

## 3. Backend Rules

- Backend code must be modular.
- Keep Supabase clients, validation, permissions, AI client, image helpers, and constants in separate files under `my-app/lib/` or `my-app/features/`.
- Use Supabase Auth, Supabase Postgres, Supabase Storage, and RLS.
- Use server actions or route handlers for mutations.
- Use Next.js server route/action processing for MVP AI review jobs. Do not add Supabase Edge Functions unless `plan.md` is updated to require them later.
- Never expose service role keys in browser code.
- Use environment variables for all secrets and provider config.
- Create `my-app/.env.example` with required keys.
- Do not commit real `.env`, `.env.local`, service role keys, API keys, OAuth secrets, or provider secrets.
- The user will manually paste keys into `.env.local` or `.env`.
- Supabase service role may only be used in server-only code for narrowly scoped privileged work such as AI review job updates and demo seeding.
- DB enum values must use uppercase snake case. UI must map DB values to readable labels.
- Use a unique expression index for skill uniqueness: `(user_id, lower(name))`.
- Do not use Prisma, NextAuth, or Neon unless `plan.md` changes.

## 4. Product Rules

- Public users can browse landing, idea feed, idea detail, implementation detail, and public profiles.
- Auth is required for mutations.
- Ideas and implementations are separate domain concepts.
- Idea author and implementation lead are separate roles, but may be the same user.
- Multiple implementations per idea must be supported.
- Join requests target implementations, not ideas.
- Every implementation credits the original idea giver by default.
- Low-score ideas can be manually published as `NEEDS_REFINEMENT`.
- `NEEDS_REFINEMENT` ideas must be downranked and excluded from featured/high-quality sections.
- Store usable image URLs in Postgres, not raw image binaries and not path-only fields.
- Use `profiles.profile_image_url` and `ideas.screenshot_url`.
- Do not expose raw `implementation_members` publicly. Use safe public queries/views with only display-safe profile fields.
- `markImplementationBuilt()` must update `deployed_url` and `status=BUILT` together in one mutation.
- For the fast demo build, assume email confirmation is disabled in the Supabase dashboard. If email confirmation is enabled, show a clear "check your email" state instead of treating login as broken.
- Keep the first demo focused on: submit idea, AI review, publish, start build with GitHub repo, add deployed link.

## 5. AI Review Rules

- Use NVIDIA NIM through an OpenAI-compatible API for production.
- Use local mock AI review only in development when no API key exists.
- AI must score, classify, tag, infer required skills, identify broad alternatives, and suggest improvements.
- AI must not rewrite the user’s title or description.
- AI must not invent exact market facts, competitor statistics, or fake certainty.
- If AI alternatives are uncertain, say "similar category" instead of claiming exact competition.
- If AI fails, keep the idea saved as `PENDING_REVIEW` and allow retry.
- Persist AI review results and avoid repeated AI review for unchanged idea content.
- Use content hashing to detect whether an idea changed.
- Production missing-key, rate-limit, malformed response, and transient-failure paths must not lose user-submitted ideas.

## 6. Performance and Optimization Rules

- Avoid unnecessary client components.
- Prefer server components where possible.
- Keep queries efficient and avoid repeated expensive calls.
- Use pagination or limited queries for feeds.
- Cache or persist AI review results.
- Avoid repeated AI review for unchanged idea content.
- Compress images before upload.
- Store final usable image URLs.
- Enforce image size/type limits before and after upload.
- Use fixed aspect-ratio containers for feed/detail images to prevent layout shift.
- Avoid over-engineered abstractions, but keep code clean and extendable.
- Keep route-level data fetching explicit and close to the feature unless shared helpers are clearly useful.
- Do not create broad generic frameworks before the MVP needs them.
- Do not install heavy libraries unless required by `plan.md`. Before adding a dependency, prefer built-in Next.js, Supabase SDK, shadcn/ui, or small focused utilities.

## 7. Verification Loop

After every meaningful change, run available checks from `my-app/` when applicable:

- Install/dependency check if dependencies changed.
- Typecheck.
- Lint.
- Build.
- Tests if available.
- App render check if possible.

Use Windows-safe commands. Prefer `npm.cmd` over `npm` in PowerShell if script execution policy causes issues.

If a check fails, fix it before moving on unless the failure is clearly unrelated and documented in `plan.md`.

If no test script exists yet, do not invent large test infrastructure in Phase 0. Add only minimal tests when helper logic appears.

Recommended commands once scripts exist:

- `npm.cmd install`
- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd test`

Do not claim verification passed unless it actually ran and passed.

## 8. Progress Tracking

After every phase or meaningful step, update `plan.md` with:

- Completed work.
- Changed files.
- Commands run.
- Pass/fail result.
- Design decisions made.
- Known limitations.

Progress notes must be factual and concise. Do not mark a phase complete unless its exit criteria in `plan.md` are satisfied.

## 9. Things To Avoid

- Do not build internal chat in MVP.
- Do not build task boards, Kanban, sprint planning, or heavy PM features.
- Do not add paid plans.
- Do not expose private social links.
- Do not expose service role keys to the browser.
- Do not use Prisma, NextAuth, or Neon unless the plan changes.
- Do not hardcode design colors.
- Do not ignore `design.md`.
- Do not store raw image binaries in Postgres.
- Do not store path-only image fields for MVP rendering.
- Do not expose raw membership tables publicly.
- Do not add Cloudinary or another third-party image provider in MVP; keep third-party image optimization as future scope only.
- Do not implement Supabase Edge Functions for MVP AI review processing unless `plan.md` changes.
- Do not rewrite user-submitted idea content with AI.
- Do not add artificial scope beyond the MVP to make the app look bigger.

## 10. Implementation Discipline

- Work phase-by-phase according to `plan.md`.
- Start with foundation: Supabase setup, schema/RLS, shadcn/ui, env contract, app shell, and design tokens.
- Keep feature code grouped by domain under `features/`.
- Keep shared infrastructure under `lib/`.
- Keep mutations server-side.
- Validate all user input at the server boundary.
- Keep RLS policies narrow and test public/private boundaries.
- Use readable, explicit names. Do not hide core product logic behind vague generic helpers.
- Prefer small components with clear ownership over large page files.
- Update `.env.example` whenever required environment variables change.
- If a requirement is ambiguous, inspect `plan.md`, `platform_prd.md`, and `design.md` first; ask the user only when the ambiguity cannot be resolved from those files.
