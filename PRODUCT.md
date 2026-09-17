# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Self-directed adults running a personal cognitive-training program. Single user per
deployment; no accounts, no teams. They open the app most mornings to see today's
prescribed training, complete it off-site on dedicated trainer websites, and log
minutes and notes. (Inferred from build history; user has not named an audience.)

## Product Purpose

INTELLGNCE is a scheduler and ledger for scientifically supported cognitive
training. It generates all 56 days of an 8-week Core plan up front, presents each
day as a checklist, and converts completed dose into a conservative estimated
IQ-gain range with streaks, history, and a calendar grid. Training itself happens
off-site; the app plans, links, and records.

## Positioning

A program of record, not a content library: one plan, every day generated in
advance, every minute logged, estimates openly derived from a published formula.
Nothing here trains you inside the app; neighboring brain-training apps do.

## Operating Context

- Core plan: 8 weeks, 5 modules (Dual N-Back, Matrix Reasoning, Learning Sprint,
  Processing Speed, Logic Puzzles), expected gain +4 to +7 IQ.
- Daily ritual: open Today, train on linked external sites, check off tasks.
- Local-first SQLite; fresh databases self-create schema and seed the Core plan.
- Routes: `/` landing, `/today`, `/plans`, `/calendar`, `/progress`, `/science`.

## Capabilities and Constraints

- Server actions mutate tasks and plans; pages are dynamic except the landing.
- Module data (names, doses, URLs, evidence levels, IQ contributions) is fixed
  product content in `lib/seed.ts`; keep it consistent everywhere it appears.
- No authentication exists by explicit user decision; do not reintroduce logins.
- Copy must stay honest: estimates are ranges, never promises or guarantees.

## Brand Commitments

- Name: INTELLGNCE. Voice: direct, measured, no hype. (Inferred from prior copy.)
- Explicit rejections from the user: blocky brutalist look; dark neon-glass look.
  The replacement world must read as completely different from both.

## Evidence on Hand

- Real product content: plan/module data in `lib/seed.ts`, dose math in
  `lib/domain/estimation.ts`. No testimonials, customers, or benchmarks exist;
  do not fabricate any.

## Product Principles

1. The plan is the product; the interface serves the schedule.
2. Honest numbers or nothing: ranges, caps, and formulas shown, never implied.
3. One user, zero friction: open the app and train.
4. Proof over promise: show the mechanism (days, doses, ledger), not adjectives.
