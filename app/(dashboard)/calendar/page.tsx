"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getDefaultUser } from "@/lib/user";
import { getActiveUserPlan, getDayplansForRun, getRunTasks } from "@/lib/data";
import { addDays, weekStart } from "@/lib/domain/date";
import type { Plan, UserPlan } from "@/lib/schema";
import { PageLoading } from "@/components/loading";

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

type Loaded = {
  plan: Plan;
  userPlan: UserPlan;
  taskCounts: Map<string, { done: number; total: number }>;
  today: string;
} | null;

function phase(counts: { done: number; total: number } | undefined, weekend: boolean): string {
  if (!counts) return weekend ? "Rest" : "Pending";
  if (counts.total === 0) return "Rest";
  return counts.done === counts.total ? "Logged" : "Active";
}

export default function CalendarPage() {
  const [loaded, setLoaded] = useState<Loaded>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      const user = await getDefaultUser();
      const timezone = user.timezone ?? "UTC";
      const active = await getActiveUserPlan(user.id);
      if (!live) return;
      if (!active) {
        setMissing(true);
        return;
      }
      const [dps, rows] = await Promise.all([
        getDayplansForRun(active.userPlan.id),
        getRunTasks(active.userPlan.id),
      ]);
      const taskCounts = new Map<string, { done: number; total: number }>();
      for (const dp of dps) {
        const dayTasks = rows.filter((r) => r.task.dayplanId === dp.id);
        if (dayTasks.length === 0) continue;
        const done = dayTasks.filter((r) => r.task.completed === 1).length;
        taskCounts.set(dp.date, { done, total: dayTasks.length });
      }
      let today: string;
      try {
        today = new Intl.DateTimeFormat("en-CA", {
          timeZone: timezone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date());
      } catch {
        today = new Date().toISOString().slice(0, 10);
      }
      if (!live) return;
      setLoaded({ plan: active.plan, userPlan: active.userPlan, taskCounts, today });
    })();
    return () => {
      live = false;
    };
  }, []);

  if (missing) {
    return (
      <div className="card p-6 md:p-10">
        <h1 className="font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight md:text-5xl">
          No grid yet.
        </h1>
        <p className="microlabel mt-3">Status · no program of record</p>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-soft">
          Start a plan to see its 56-day grid.
        </p>
        <Link className="btn btn-accent mt-6" href="/plans">
          Start a plan
        </Link>
      </div>
    );
  }

  if (!loaded) return <PageLoading label="Calendar" />;
  const { plan, userPlan, taskCounts, today } = loaded;
  const weeks = Array.from({ length: plan.durationWeeks }, (_, i) => i + 1);

  return (
    <div>
      <h1 className="font-display text-5xl font-bold uppercase leading-[0.9] tracking-tight md:text-6xl">
        The grid.
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
        {plan.name} · started {userPlan.startDate.split("-").reverse().join(" / ")}.
        Every cell is a day — select one to open it as a checklist.
      </p>

      <div className="mt-8 overflow-x-auto">
        <div className="card min-w-[880px] overflow-hidden">
          <div className="grid grid-cols-[88px_repeat(8,1fr)] border-b border-line bg-[#f5f7fa]">
            <div className="border-r border-line p-2" />
            {weeks.map((w) => (
              <div key={w} className="microlabel border-r border-line p-2 text-center last:border-r-0">
                Wk {String(w).padStart(2, "0")}
              </div>
            ))}
          </div>

          {WEEKDAYS.map((wd, wdIdx) => (
            <div
              key={wd}
              className={`grid grid-cols-[88px_repeat(8,1fr)] ${wdIdx < 7 ? "border-b border-line" : ""}`}
            >
              <div className="flex items-center border-r border-line bg-[#f5f7fa] p-2">
                <span className="microlabel">{wd}</span>
              </div>
              {weeks.map((w) => {
                const date = addDays(weekStart(userPlan.startDate, w), wdIdx);
                const counts = taskCounts.get(date);
                const isToday = date === today;
                const weekend = wdIdx >= 5;
                const complete = counts != null && counts.done === counts.total && counts.total > 0;
                return (
                  <div key={w} className="border-r border-line p-1 last:border-r-0">
                    <Link
                      href={`/today?date=${date}`}
                      aria-label={`${wd} ${date} — ${phase(counts, weekend)}`}
                      title={`${phase(counts, weekend)}`}
                      className={`flex min-h-[54px] flex-col items-start justify-between rounded-lg p-1.5 transition-colors ${
                        complete
                          ? "bg-accent/[0.12] shadow-[inset_0_0_0_1px_rgba(232,73,15,0.45)]"
                          : isToday
                            ? "shadow-[inset_0_0_0_1.5px_rgba(16,21,27,0.7)]"
                            : ""
                      } hover:bg-ink/[0.04]`}
                    >
                      <span className="flex w-full items-center justify-between">
                        <span className="font-mono text-[11px] tabular-nums text-ink-soft">
                          {Number(date.slice(8, 10)).toString().padStart(2, "0")}
                        </span>
                        {isToday && <span className="pulse-dot" aria-hidden />}
                      </span>
                      <span className={`font-mono text-[10px] uppercase tracking-[0.08em] ${complete ? "text-accent-ink" : weekend ? "text-rail" : "text-ink-soft"}`}>
                        {counts ? `${counts.done}/${counts.total}` : weekend ? "Rest" : "·"}
                      </span>
                    </Link>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <p className="microlabel mt-4">
        Today marker · n/m blocks logged · weekends are recovery, not failure
      </p>
    </div>
  );
}
