import { getPlans } from "@/lib/data";
import { SATURATION_K, moduleFullDose } from "@/lib/domain/estimation";

export const dynamic = "force-dynamic";

export default async function SciencePage() {
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
      <h1 className="font-display text-5xl font-bold uppercase leading-[0.9] tracking-tight md:text-6xl">
        Why this, why this much.
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">
        INTELLGNCE is a hub, not the wheel. Every activity happens on an existing free
        site; the app only schedules, links, and keeps the ledger. The estimate below is
        deliberately conservative and openly derived.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {sections.map((s) => {
          const mod = worked.find((x) => x.m.name === s.name);
          return (
            <section key={s.name} className="card p-5 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-[26px] font-semibold uppercase leading-none tracking-wide">{s.name}</h2>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${
                    s.evidence === "strong"
                      ? "border-accent/50 bg-accent/10 text-accent-ink"
                      : s.evidence === "moderate"
                        ? "border-line-strong bg-paper text-ink-soft"
                        : "border-line bg-paper text-ink-soft"
                  }`}
                >
                  {s.evidence}
                </span>
              </div>
              <p className="label mt-2">{s.ability}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{s.body}</p>
              {mod && (
                <p className="microlabel mt-4 border-t border-line pt-3">
                  Dose: {mod.m.minutesPerSession} min × {mod.m.sessionsPerWeek}/wk × wk{" "}
                  {mod.m.startWeek}–{mod.m.endWeek} = {mod.full} min
                </p>
              )}
            </section>
          );
        })}
      </div>

      {core && (
        <section className="card-tint mt-6 p-6 md:p-8">
          <p className="label">The estimation formula — transparent, not a guarantee</p>
          <div className="mt-3 space-y-2 font-mono text-[12px] leading-relaxed text-ink">
            <p><b>1.</b> Full dose = min/session × sessions/wk × weeks active</p>
            <p>
              <b>2.</b> Ratio = logged minutes / full dose, capped at 1.0 (over-training earns
              nothing extra)
            </p>
            <p>
              <b>3.</b> Module gain = min + (max − min) × (1 − e<sup>−{SATURATION_K}·ratio</sup>)
            </p>
            <p>
              <b>4.</b> Total = Σ module gains, capped at the plan promise (+{core.plan.expectedIqGainMax} IQ)
            </p>
          </div>
          <div className="mt-4 grid gap-x-8 gap-y-1 md:grid-cols-2">
            {worked.map(({ m, full }) => (
              <p key={m.id} className="microlabel">
                {m.name}: {full} min → +{m.expectedIqContributionMin}…+{m.expectedIqContributionMax}
              </p>
            ))}
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink-soft">
            <b className="text-ink">Worked example:</b> train perfectly for the whole program —
            every module at 100% ratio lands the curve at about 90% of each module max, so the
            combined estimate reads roughly <b className="text-accent-ink">+5.0 to +12.6</b> before the
            plan cap. The cap then displays it honestly as{" "}
            <b className="text-accent-ink">+5.0 to +7</b>. Estimates are ranges, not promises;
            results vary with baseline, adherence, and biological limits. INTELLGNCE is a
            research-based training path, not a medical or psychological guarantee.
          </p>
        </section>
      )}
    </div>
  );
}