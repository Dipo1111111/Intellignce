import Link from "next/link";
import { getDefaultUser } from "@/lib/user";
import { getActiveUserPlan, getDayplan, getRunTasks } from "@/lib/data";
import { estimatePlan } from "@/lib/domain/estimation";
import { daysBetween, prettyDate, todayInTimeZone, addDays } from "@/lib/domain/date";
import type { Task } from "@/lib/schema";
import { TaskCard } from "@/components/task-card";

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const user = await getDefaultUser();
  const timezone = user.timezone ?? "UTC";
  const today = todayInTimeZone(timezone);
  const date = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : today;
  const isToday = date === today;

  const activePlan = await getActiveUserPlan(user.id);
  if (!activePlan) {
    return (
      <div className="panel-hero p-8 md:p-12">
        <div className="relative">
        <p className="microlabel">NO PROGRAM OF RECORD YET</p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-[1.0] tracking-tight md:text-6xl">
          Measured<span className="text-gradient">.</span>
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
          Pick the Core plan, choose a start, and INTELLGNCE generates every day for the
          next eight weeks. Training always happens off-site — this is the scheduler and ledger.
        </p>
          <Link className="btn btn-accent mt-6" href="/plans">
            Start a plan →
          </Link>
        </div>
      </div>
    );
  }

  const day = await getDayplan(activePlan.userPlan.id, date);
  const week = Math.floor(daysBetween(activePlan.userPlan.startDate, date) / 7) + 1;

  // Estimated gain so far from the active run only.
  const runTasks = await getRunTasks(activePlan.userPlan.id);
  const byModule = new Map<string, Task[]>();
  const tasksArr = runTasks.map((r) => r.task);
  for (const t of tasksArr) {
    const list = byModule.get(t.planModuleId) ?? [];
    list.push(t);
    byModule.set(t.planModuleId, list);
  }
  const estimate = estimatePlan(activePlan.plan, activePlan.modules, byModule);
  const signedNotComplete = estimate.totalMax <= 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_290px]">
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-4">
          <div>
            <p className="microlabel">
              WEEK {String(week).padStart(2, "0")} / {String(activePlan.plan.durationWeeks).padStart(2, "0")} ·{" "}
              {isToday ? "TODAY" : "HISTORY"}
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-[44px] md:leading-[1.0]">
              {prettyDate(date)}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link className="btn btn-ghost px-3 py-2" href={`/today?date=${addDays(date, -1)}`}>
              ←
            </Link>
            {!isToday && (
              <Link className="btn btn-ghost px-3 py-2" href="/today">
                TODAY
              </Link>
            )}
            <Link className="btn btn-ghost px-3 py-2" href={`/today?date=${addDays(date, 1)}`}>
              →
            </Link>
          </div>
        </div>

        {day ? (
          <div className="mt-5 flex flex-col gap-4">
            <p className="microlabel">
              {(() => {
                const doneCount = day.tasks.filter((t) => t.task.completed === 1).length;
                return `${doneCount} / ${day.tasks.length} TASKS COMPLETE · ${
                  doneCount === day.tasks.length && day.tasks.length > 0 ? "DAY COMPLETE ✓" : "IN PROGRESS"
                }`;
              })()}
            </p>
            {day.tasks.map(({ task, module }) => (
              <TaskCard
                key={task.id}
                taskId={task.id}
                moduleName={module?.name ?? "Unknown module"}
                targetAbility={module?.targetAbility ?? "-"}
                scheduledMinutes={task.scheduledMinutes}
                url={task.url}
                completed={task.completed === 1}
                actualMinutes={task.actualMinutes}
                notes={task.notes}
                isToday={isToday}
              />
            ))}
            {day.tasks.length === 0 && (
              <p className="card-tint p-6 font-mono text-[12px] uppercase tracking-[0.12em] text-ink-soft">
                REST DAY — NO PRESCRIBED TASKS. RECOVERY IS PART OF THE DOSE.
              </p>
            )}
          </div>
        ) : (
          <p className="card-tint mt-5 p-6 font-mono text-[12px] uppercase tracking-[0.12em] text-ink-soft">
            NO PLAN ON THIS DATE.
          </p>
        )}
      </div>

      <aside className="space-y-5 self-start lg:sticky lg:top-8">
        <section className="card-tint sbracket p-5">
          <p className="microlabel">EST. IQ GAIN SO FAR</p>
          <p className="mt-2 font-display text-[28px] font-bold leading-none tracking-tight">
            <span className="text-gradient">+{estimate.totalMin.toFixed(1)} <span>→</span> +{estimate.totalMax.toFixed(1)}</span>
            <span className="ml-1 align-baseline font-mono text-[15px] font-normal text-ink-soft">IQ</span>
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
            {signedNotComplete ? "TRAIN SOMETHING TO SEED THE ESTIMATE" : `${Math.round(estimate.completeRatio * 100)}% OF FULL DOSE`}
          </p>
        </section>
        <section className="card p-5">
          <p className="microlabel">PRESCRIBED LOAD</p>
          <ul className="mt-3 space-y-2">
            {activePlan.modules.map((m) => {
              const pm = estimate.perModule.find((e) => e.module.id === m.id);
              return (
                <li key={m.id} className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-[13px] text-ink-soft">{m.name}</span>
                  <span className="microlabel">
                    {pm ? `${pm.earnedMinutes}/${pm.fullDose} MIN` : "0 MIN"}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </aside>
    </div>
  );
}