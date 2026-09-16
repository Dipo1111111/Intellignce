import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getActiveUserPlan, getDayplansForRun, getRunTasks } from "@/lib/data";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { addDays, weekStart } from "@/lib/domain/date";

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.select().from(users).where(eq(users.id, session.user.id)).get();
  const timezone = user?.timezone ?? "UTC";

  const active = await getActiveUserPlan(session.user.id);
  if (!active) {
    return (
      <div className="border-2 border-ink p-8">
        <p className="microlabel">{"// "}NO PROGRAM OF RECORD</p>
        <h1 className="mt-2 text-3xl font-bold">START A PLAN TO SEE ITS GRID.</h1>
      </div>
    );
  }

  const weeks = Array.from({ length: active.plan.durationWeeks }, (_, i) => i + 1);

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

  const today = (() => {
    try {
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());
    } catch {
      return new Date().toISOString().slice(0, 10);
    }
  })();

  return (
    <div>
      <p className="microlabel">{"// "}FIG.03 — PLAN WINDOW</p>
      <h1 className="mt-2 text-4xl font-bold tracking-[-0.02em] md:text-5xl">
        THE GRID<span className="text-accent">.</span>
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
        {active.plan.name} · started {active.userPlan.startDate.split("-").reverse().join(" / ")}.
        Click any day to open it as a checklist.
      </p>

      <div className="mt-8 overflow-x-auto">
        <div className="min-w-[880px] border border-line">
          <div className="grid grid-cols-[88px_repeat(8,1fr)] border-b border-line">
            <div className="border-r border-line p-2" />
            {weeks.map((w) => (
              <div key={w} className="microlabel border-r border-line p-2 text-center last:border-r-0">
                WK {String(w).padStart(2, "0")}
              </div>
            ))}
          </div>

          {WEEKDAYS.map((wd, wdIdx) => (
            <div
              key={wd}
              className={`grid grid-cols-[88px_repeat(8,1fr)] ${wdIdx < 7 ? "border-b border-line" : ""}`}
            >
              <div className="flex items-center border-r border-line bg-paper p-2">
                <span className="microlabel">{wd}</span>
              </div>
              {weeks.map((w) => {
                const date = addDays(weekStart(active.userPlan.startDate, w), wdIdx);
                const counts = taskCounts.get(date);
                const isToday = date === today;
                const weekend = wdIdx >= 5;
                return (
                  <div key={w} className="border-r border-line p-1 last:border-r-0">
                    <Link
                      href={`/?date=${date}`}
                      aria-label={`${wd} ${date}`}
                      className={`flex min-h-[54px] flex-col items-start justify-between p-1.5 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
                        counts != null && counts.done === counts.total && counts.total > 0
                          ? "bg-paper2"
                          : ""
                      } hover:bg-paper2`}
                    >
                      <span className="flex w-full items-center justify-between">
                        <span className="text-ink-soft">
                          {Number(date.slice(8, 10)).toString().padStart(2, "0")}
                        </span>
                        {isToday && <span className="block h-2 w-2 bg-accent" aria-hidden />}
                      </span>
                      <span className={weekend ? "text-line-strong" : "text-accent"}>
                        {counts ? `${counts.done}/${counts.total}` : weekend ? "·" : "·"}
                      </span>
                    </Link>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 microlabel">
        <span className="mr-1 inline-block h-2 w-2 bg-accent align-middle" aria-hidden /> TODAY ·{" "}
        <span className="which">N/M</span> TASKS DONE · WEEKENDS ARE RECOVERY, NOT A FAILURE
      </p>
    </div>
  );
}