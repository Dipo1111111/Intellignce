import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPlans } from "@/lib/data";
import { SATURATION_K, moduleFullDose } from "@/lib/domain/estimation";

export default async function SciencePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const plans = await getPlans();
  const core = plans.find((p) => p.plan.name.includes("8 weeks")) ?? plans[0];

  const sections = [
    {
      name: "Dual N-Back",
      ability: "Working memory → fluid intelligence",
      evidence: "strong" as const,
      body: "Meta-analyses of n-back training report small-to-moderate gains in fluid intelligence — on average roughly 3–4 IQ points with consistent training. We schedule 25 minutes, five days a week, for all eight weeks.",
    },
    {
      name: "Matrix Reasoning",
      ability: "Fluid reasoning (Gf)",
      evidence: "strong" as const,
      body: "Matrix-style problems directly exercise the pattern-induction machinery that tests of fluid intelligence measure. Trials show meaningful gains on nonverbal reasoning and IQ-like measures, especially in untrained populations.",
    },
    {
      name: "Learning Sprint (Programming)",
      ability: "Mixed — education effect",
      evidence: "strong" as const,
      body: "Each additional year of schooling is associated with roughly +1 to +5 IQ points on average. Structured, progressive learning in math, logic, or programming is the closest controlled proxy for that effect, so it earns the largest single daily block.",
    },
    {
      name: "Processing Speed",
      ability: "Speed of processing",
      evidence: "moderate" as const,
      body: "Speed-of-processing training (UFOV-style) produces robust gains on speeded tasks and smaller, indirect effects on overall IQ. It runs as a four-week block (weeks 3–6), seven minutes a day — a light, short stimulus.",
    },
    {
      name: "Logic Puzzles (Support)",
      ability: "Mixed — executive support",
      evidence: "supportive" as const,
      body: "Deduction and rule-discovery puzzles support reasoning stamina, working memory load management, and problem decomposition. Direct IQ-point estimates are weaker, so the module is deliberately capped at a small contribution.",
    },
  ];

  const worked = core
    ? core.modules.map((m) => {
        const full = moduleFullDose(m);
        return { m, full };
      })
    : [];

  return (
    <div>
      <p className="microlabel">{"// "}FIG.04 — METHOD</p>
      <h1 className="mt-2 text-4xl font-bold tracking-[-0.02em] md:text-5xl">
        WHY THIS, WHY THIS MUCH<span className="text-accent">.</span>
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
        INTELLGNCE is a hub, not the wheel. Every activity happens on an existing free
        site; the app only schedules, links, and keeps the ledger. The estimate below is
        deliberately conservative and openly derived.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {sections.map((s, i) => {
          const mod = worked.find((x) => x.m.name === s.name);
          return (
            <section key={s.name} className="card p-5 md:p-6">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-bold">{s.name}</h2>
                <span className="microlabel">
                  {String(i + 1).padStart(2, "0")} ·{" "}
                  <span
                    className={
                      s.evidence === "strong"
                        ? "text-accent"
                        : s.evidence === "moderate"
                          ? "text-ink"
                          : "text-ink-soft"
                    }
                  >
                    {s.evidence}
                  </span>
                </span>
              </div>
              <p className="microlabel mt-1">{s.ability}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{s.body}</p>
              {mod && (
                <p className="mt-3 border-t border-line pt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft">
                  DOSE: {mod.m.minutesPerSession} MIN × {mod.m.sessionsPerWeek}/WK × WK{" "}
                  {mod.m.startWeek}–{mod.m.endWeek} = {mod.full} MIN
                </p>
              )}
            </section>
          );
        })}
      </div>

      {core && (
        <section className="card-tint sbracket mt-8 p-6 md:p-8">
          <p className="microlabel">THE ESTIMATION FORMULA — TRANSPARENT, NOT A GUARANTEE</p>
          <div className="mt-3 space-y-2 font-mono text-[12px] leading-relaxed text-ink-soft">
            <p>1. FULL DOSE = MIN/SESSION × SESSIONS/WK × WEEKS ACTIVE</p>
            <p>
              2. RATIO = LOGGED MINUTES / FULL DOSE, CAPPED AT 1.0 (OVER-TRAINING EARNS
              NOTHING EXTRA)
            </p>
            <p>
              3. MODULE GAIN = MIN + (MAX − MIN) × (1 − e<sup>−{SATURATION_K}·RATIO</sup>)
            </p>
            <p>
              4. TOTAL = Σ MODULE GAINS, CAPPED AT THE PLAN PROMISE (+{core.plan.expectedIqGainMax} IQ)
            </p>
          </div>
          <div className="mt-4 grid gap-x-8 gap-y-1 md:grid-cols-2">
            {worked.map(({ m, full }) => (
              <p key={m.id} className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                {m.name}: {full} MIN → +{m.expectedIqContributionMin}…+{m.expectedIqContributionMax}
              </p>
            ))}
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink-soft">
            <b className="text-ink">Worked example:</b> train perfectly for the whole program —
            every module at 100% ratio lands the curve at about 90% of each module max, so the
            combined estimate reads roughly <b className="text-accent">+5.0 to +12.6</b> before the
            plan cap. The cap then displays it honestly as{" "}
            <b className="text-accent">+5.0 to +7</b>. Estimates are ranges, not promises;
            results vary with baseline, adherence, and biological limits. INTELLGNCE is a
            research-based training path, not a medical or psychological guarantee.
          </p>
        </section>
      )}
    </div>
  );
}