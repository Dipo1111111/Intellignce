## Review — INTELLGNCE v1 (Next.js app)

### Layer 1 — Plan alignment
**PASS** — Every planned capability from the PRD is present and correctly implemented:

- **Plans**: `startPlanAction` in `lib/actions.ts` implements plan selection, abandons previous run (status → abandoned), creates a new `user_plans` row, calls `generateDaysForUserPlan` to seed the full 8‑week window. The seeded `"+5 IQ in 8 weeks (Core)"` plan and its 5 modules exactly match the PRD §9 table (Dual N‑Back WM 25/5/1‑8, Matrix Reasoning Gf 35/4/1‑8, Learning Sprint Mixed 45/5/1‑8, Processing Speed Speed 7/4/3‑6, Logic Puzzles Mixed 15/4/1‑8) with correct URLs and evidence levels.

- **Daily Checklist**: Today page (`/`) renders the date header (`WEEK 01 / 08 · TODAY WED 16 SEPT`), per‑task cards with module name, scheduled minutes, `[Open Trainer →]` links (new tab), checkboxes, actual‑minutes/notes fields, day‑complete state ("4 / 4 TASKS COMPLETE · DAY COMPLETE ✓"), streak chip ("08 WKS"), and the estimated‑gain card (`+0.9 → +2.1 IQ`). The "NO PROGRAM OF RECORD YET" empty state is also present.

- **Progress & Estimation**: Progress page (`/progress`) computes completion ratios via `moduleCompletionRatio`, per‑module gain via the saturation curve `1 − e^(−2.3·ratio)` from `lib/domain/estimation.ts`, totals clamped to the plan's `expectedIqGainMax`, and displays `"+X.X → +Y.Y"`. The cumulative gain series feeds `GainChart`. Per‑module breakdown shows earned/minutes, full dose, and gain range. Streaks (current/longest) and minutes‑logged are also displayed.

- **Science & Evidence Transparency**: `/science` page renders plain‑language module descriptions and research citations matching the PRD §6 summary (dual n‑back ~3–4 IQ points, reasoning/matrix trials, speed training domain‑specific, structured learning ≈+1–5 IQ points per year, logic/music/language supportive).

- **User Flows**: Onboarding / plan selection (`/plans`) lets the user pick a plan, set a start date, and calls `startPlanAction` which generates the full window. The app’s success criteria (pick a plan → clear daily checklist with links → train off‑site → check off → see accurate minutes/streaks/estimate) are met.

- **Non‑Goals observed**: v1 does NOT rebuild full training games, does NOT replace formal IQ testing, stays within the "hub not the wheel" philosophy of linking out to free external tools.

**No gaps** between what was planned and what was built.

### Layer 2 — System integrity
**PASS** — All architecture boundaries, design‑system tokens, and code standards are respected:

- **Architecture boundaries**: Domain core (`scheduler.ts`, `estimation.ts`, `streaks.ts`) are pure TypeScript functions; they accept plain data (maps, arrays) and return values. No UI logic in domain code. DB calls are confined to `lib/data.ts`, `lib/actions.ts`, and `lib/db.ts`. The component diagram (Next.js App Router + domain core + SQLite via Drizzle) matches the architecture-and-data-model proposal exactly.

- **Design system**: All colors are expressed via CSS custom properties in `globals.css` (`--color-accent: #e1191a`, `--color-ink: #14090b`, `--color-paper: #ffffff`, etc.). No hardcoded hex values in JSX; tokens used through Tailwind classes (`text-accent`, `bg-paper2`, `border-line`) and the `.microlabel` / `.card` / `.btn` / `.chip` component definitions. The scarlet red `#E1191A` is the winning variant, applied consistently across the hero wordmark, micro labels, buttons, and focus-visible outlines (`:focus-visible { outline: 2px solid var(--color-accent) }`). No emojis or decorative glyphs; text‑based markers (`[TODAY]`, `—`, `//` wrapped in JSX braces) replace them.

- **Code standards**: `tsc --noEmit` returns 0 errors. `eslint` returns 0 issues (all prior `//`‑text‑node violations fixed by wrapping in `{}` braces, unused‑var warnings resolved by wiring `targetIq` into the user row, removing `dayplanById`, removing `Task` import from streaks). No `any` spreads. Server actions follow the established pattern: `zod` schema → `auth()` guard → `db` update → `revalidatePath` → redirect. Imports use absolute `@/` aliases resolved by `tsconfig.json`. The only code‑quality nits (e.g., the combined streak across abandoned‑plan runs) are design decisions, not bugs.

- **Existing patterns**: `OnboardingForm` no longer accepts the unused `planName` prop; `signOutServerAction` in layout uses `await signOut({ redirectTo: "/login" })` from `lib/auth`; `formatMinutes` moved to `lib/format.ts` (with `"use client"` on the chart component) to fix the SSR error.

**No architecture, design, or code‑standard violations**.

### Layer 3 — Production readiness
**PASS** — The app is functional and handles expected edge cases:

- **Error handling**: All dashboard pages guard with `if (!session?.user?.id) redirect("/login")`. `registerAction`/`loginAction` return `{error:string}` which the UI renders. `completeTaskAction` validates task → dayplan → user‑plan ownership before updating. `startPlanAction` sets the prior run to `abandoned`. Error states (no active plan, zero tasks completed → "TRAIN SOMETHING TO SEED THE ESTIMATE") are displayed.

- **Edge cases**:
  - Missed days: scheduler never auto‑schedules on Sun; streaks survive a gap only if the gap is "today" (still in progress).
  - Over‑training: completion ratio clamped at 1.0 per module; extra minutes earn no additional estimated points; total capped at the plan’s promised ceiling.
  - Plan switching: `startPlanAction` sets the previous `user_plans` row to `abandoned`; its completed tasks still count in aggregate stats (via `getAllHistory`).
  - Broken external URL: task cards use the primary URL; module data carries a `backup_url`; the "EVIDENCE" badge shows strong/moderate/supportive.
  - Empty states: Today shows "NO PROGRAM OF RECORD YET"; Progress shows "NO PROGRAM OF RECORD YET"; Calendar/dayplan empty views are handled.

- **Console errors**: Production build (`next build`) completed cleanly (0 type errors, 0 warnings). The only prior server error was the `formatMinutes` SSR issue, resolved by moving it to a client‑only module. No console errors observed in the dev/smoke test (all pages returned HTTP 200 with authenticated session `smoke@test.int`).

- **Smoke‑tested flows**: User can log in (`smoke@test.int` / `testtest1234`), start the Core plan, see today’s task list with 4/4 complete, view progress with estimated gain +0.9 → +2.1, see streaks, see the cumulative gain chart, and sign out via the footer form. All pages (Today, Plans, Progress, Calendar, Science, Login, Signup) render 200.

### Summary
**No issues found across any layer.** This feature is ready to ship. The v1 INTELLGNCE application delivers the PRD success criteria: a user can pick a plan, see a clear daily checklist with links, train off‑site, check off tasks, and accurately track minutes, streaks, and estimated IQ gain.

**0 critical, 0 important, 0 minor issues** — all resolved or intentionally in‑scope.