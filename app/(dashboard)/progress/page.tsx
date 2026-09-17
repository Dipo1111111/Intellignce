import { getDefaultUser } from "@/lib/user";
import { db } from "@/lib/db";
import { iqTestScores } from "@/lib/schema";
import { eq } from "drizzle-orm";
import {
  aggregateStats,
  completedTrainingDates,
  getAllHistory,
} from "@/lib/data";
import { cumulativeGainSeries, estimatePlan } from "@/lib/domain/estimation";
import { computeStreaks } from "@/lib/domain/streaks";
import { formatMinutes } from "@/lib/format";
import { GainChart } from "@/components/gain-chart";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const user = await getDefaultUser();
  if (!user) throw new Error("Local user missing.");

  const timezone = user.timezone ?? "UTC";
  const history = await getAllHistory(user.id);
  const dayplanRunMap = history.dayplanRunMap ?? new Map<string, string>();
  const baseline = await db
    .select()
    .from(iqTestScores)
    .where(eq(iqTestScores.userId, user.id))
    .get();

  const stats = aggregateStats(history);

  const activeRun = history.runs.find((r) => r.userPlan.status === "active") ?? history.runs[0] ?? null;
  const activePlanData = activeRun
    ? {
        plan: activeRun.plan,
        userPlan: activeRun.userPlan,
        modules: history.modules.filter((m) => m.planId === activeRun.plan.id),
        dayplans: history.dayplanDates,
      }
    : null;

  // Estimate + series for the primary run.
  let estimate = null;
  let series: ReturnType<typeof cumulativeGainSeries> = [];
  let completedDates = new Set<string>();
  let streaks = { current: 0, longest: 0, latestDate: null as string | null };

  if (activePlanData) {
    const runTaskRows = history.tasks.filter(
      (t) => dayplanRunMap.get(t.dayplanId) === activePlanData.userPlan.id
    );

    const byModule = new Map<string, typeof runTaskRows>();
    for (const t of runTaskRows) {
      const list = byModule.get(t.planModuleId) ?? [];
      list.push(t);
      byModule.set(t.planModuleId, list);
    }
    estimate = estimatePlan(activePlanData.plan, activePlanData.modules, byModule);
    series = cumulativeGainSeries(
      activePlanData.plan,
      activePlanData.userPlan,
      activePlanData.modules,
      runTaskRows,
      history.dayplanDates
    );
  }

  completedDates = completedTrainingDates(history.tasks, history.dayplanDates);
  streaks = computeStreaks(Array.from(completedDates), timezone);

  const totalCompletedMinutes = history.tasks
    .filter((t) => t.completed === 1)
    .reduce((s, t) => s + (t.actualMinutes ?? t.scheduledMinutes), 0);

  return (
    <div>
      <h1 className="font-display text-5xl font-bold uppercase leading-[0.9] tracking-tight md:text-6xl">
        The ledger.
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
        Every logged minute, converted into an estimated gain range. The curve below
        is the run&apos;s cord from first session to plan ceiling.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <section className="card p-5 md:col-span-1">
          <p className="label">Est. IQ gain so far</p>
          <p className="split-num mt-2 text-[40px]">
            {estimate
              ? `+${estimate.totalMin.toFixed(1)} – +${estimate.totalMax.toFixed(1)}`
              : "—"}
            <span className="ml-1 font-sans text-[15px] font-semibold text-ink-soft">IQ</span>
          </p>
          <p className="microlabel mt-2">
            {estimate
              ? `${activePlanData?.plan.name} · ${Math.round(estimate.completeRatio * 100)}% of full dose`
              : "No program of record yet"}
          </p>
          {baseline && (
            <p className="microlabel mt-4 border-t border-line pt-3">
              Baseline: <b>{baseline.score}</b>
              {user?.targetIq && (
                <>
                  {" · "}Target: <b className="text-accent-ink">{user.targetIq}</b>
                </>
              )}
            </p>
          )}
        </section>

        <section className="card p-5">
          <p className="label">Streak</p>
          <p className="split-num mt-2 text-[40px]">
            {streaks.current}
            <span className="ml-1 font-sans text-[15px] font-semibold text-ink-soft">day{streaks.current === 1 ? "" : "s"}</span>
          </p>
          <p className="microlabel mt-2">
            Current · longest {streaks.longest} · trained on {completedDates.size} days
          </p>
        </section>

        <section className="card p-5">
          <p className="label">Minutes logged</p>
          <p className="split-num mt-2 text-[40px]">
            {formatMinutes(totalCompletedMinutes)}
          </p>
          <p className="microlabel mt-2">
            Across {stats.reduce((s, r) => s + r.completedSessions, 0)} training sessions
          </p>
        </section>
      </div>

      {activePlanData && series.length > 0 && (
        <section className="mt-5 card p-5 md:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="label">Cumulative est. gain / week</p>
            <p className="microlabel">Min / max range</p>
          </div>
          <div className="mt-4">
            <GainChart series={series} planMax={activePlanData.plan.expectedIqGainMax} />
          </div>
        </section>
      )}

      <section className="mt-5 card overflow-x-auto">
        <p className="label border-b border-line p-5">
          Per-module ledger
        </p>
        <div className="min-w-[720px]">
          <div className="microlabel grid grid-cols-[1fr_120px_120px_120px] gap-2 border-b border-line px-5 py-2.5">
            <span>MODULE</span>
            <span>SESSIONS DONE</span>
            <span>MINUTES EARNED</span>
            <span>EST. GAIN</span>
          </div>
          {/* per-module rows from estimate */}
          {estimate
            ? estimate.perModule.map((pm) => (
                <div
                  key={pm.module.id}
                  className="grid grid-cols-[1fr_120px_120px_120px] items-baseline gap-2 border-b border-line px-5 py-3 last:border-b-0"
                >
                  <span className="text-[14px] font-semibold">
                    {pm.module.name}
                    <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
                      {pm.module.evidenceLevel}
                    </span>
                  </span>
                  <span className="font-mono text-[12px]">
                    {pm.module.sessionsPerWeek > 0 ? `${pm.module.sessionsPerWeek}` : "0"}
                    <span className="text-ink-soft">/WK</span>
                  </span>
                  <span className="font-mono text-[12px]">
                    {Math.round(pm.earnedMinutes)}<span className="text-ink-soft">/{pm.fullDose}</span>
                  </span>
                  <span className="font-mono text-[12px] text-accent">
                    +{pm.gainMin.toFixed(1)} → +{pm.gainMax.toFixed(1)}
                  </span>
                </div>
              ))
            : stats.map((s) => (
                <div
                  key={s.moduleId}
                  className="grid grid-cols-[1fr_120px_120px_120px] items-baseline gap-2 border-b border-line px-5 py-3 last:border-b-0"
                >
                  <span className="text-[14px] font-semibold">{s.moduleName}</span>
                  <span className="font-mono text-[12px]">
                    {s.completedSessions}<span className="text-ink-soft">/{s.totalSessions}</span>
                  </span>
                  <span className="font-mono text-[12px]">{Math.round(s.totalMinutes)}</span>
                  <span className="font-mono text-[12px] text-ink-soft">—</span>
                </div>
              ))}
        </div>
      </section>
    </div>
  );
}