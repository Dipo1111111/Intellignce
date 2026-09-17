import Link from "next/link";
import { getDefaultUser } from "@/lib/user";
import { getActiveUserPlan, getDayplan, getRunTasks } from "@/lib/data";
import { estimatePlan } from "@/lib/domain/estimation";
import { daysBetween, prettyDate, todayInTimeZone, addDays } from "@/lib/domain/date";
import type { Task } from "@/lib/schema";
import { TaskCard } from "@/components/task-card";

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      {dir === "left" ? (
        <path d="M9 2.5 4.5 7 9 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M5 2.5 9.5 7 5 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

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
      <div className="card p-6 md:p-10">
        <h1 className="font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight md:text-7xl">
          Measured.
        </h1>
        <p className="microlabel mt-4">Status · no program of record</p>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
          Pick the Core plan, choose a start, and INTELLGNCE generates every day for the
          next eight weeks. Training always happens off-site — this is the scheduler and ledger.
        </p>
        <Link className="btn btn-accent mt-6" href="/plans">
          Start a plan
        </Link>
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
        <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-ink pb-4">
          <div>
            <h1 className="font-display text-5xl font-bold uppercase leading-[0.9] tracking-tight md:text-6xl">
              {prettyDate(date)}
            </h1>
            <p className="microlabel mt-2">
              Week {String(week).padStart(2, "0")} / {String(activePlan.plan.durationWeeks).padStart(2, "0")} ·{" "}
              {isToday ? <span className="text-accent-ink">Today · live</span> : "History"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link className="btn btn-ghost px-3.5" aria-label="Previous day" href={`/today?date=${addDays(date, -1)}`}>
              <Chevron dir="left" />
            </Link>
            {!isToday && (
              <Link className="btn btn-ghost" href="/today">
                Today
              </Link>
            )}
            <Link className="btn btn-ghost px-3.5" aria-label="Next day" href={`/today?date=${addDays(date, 1)}`}>
              <Chevron dir="right" />
            </Link>
          </div>
        </div>

        {day ? (
          <div className="mt-5 flex flex-col gap-4">
            <p className="microlabel">
              {(() => {
                const doneCount = day.tasks.filter((t) => t.task.completed === 1).length;
                return `${doneCount} / ${day.tasks.length} blocks logged · ${
                  doneCount === day.tasks.length && day.tasks.length > 0 ? "DAY COMPLETE" : "IN PROGRESS"
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
              <p className="card-tint p-6 text-sm leading-relaxed text-ink-soft">
                Rest day — no prescribed blocks. Recovery is part of the dose.
              </p>
            )}
          </div>
        ) : (
          <p className="card-tint mt-5 p-6 text-sm leading-relaxed text-ink-soft">
            No plan on this date.
          </p>
        )}
      </div>

      <aside className="space-y-5 self-start lg:sticky lg:top-8">
        <section className="card p-5">
          <p className="label">Est. IQ gain so far</p>
          <p className="split-num mt-2 text-[40px]">
            +{estimate.totalMin.toFixed(1)} <span className="text-ink-soft">–</span> +{estimate.totalMax.toFixed(1)}
            <span className="ml-1 font-sans text-[15px] font-semibold text-ink-soft">IQ</span>
          </p>
          <p className="microlabel mt-2">
            {signedNotComplete ? "Train something to seed the estimate" : `${Math.round(estimate.completeRatio * 100)}% of full dose`}
          </p>
        </section>
        <section className="card p-5">
          <p className="label">Prescribed load</p>
          <ul className="mt-3 space-y-2">
            {activePlan.modules.map((m) => {
              const pm = estimate.perModule.find((e) => e.module.id === m.id);
              return (
                <li key={m.id} className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-[13px] text-ink-soft">{m.name}</span>
                  <span className="microlabel">
                    {pm ? `${pm.earnedMinutes}/${pm.fullDose} min` : "0 min"}
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
