import { db } from "@/lib/db";
import { dayplans, tasks, type DayPlan, type Plan, type PlanModule, type Task } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { addDays, WEEKDAYS, weekStart } from "./date";

export type InputPlan = Pick<Plan, "durationWeeks" | "coreWeekdays">;
export type InputModule = Pick<
  PlanModule,
  | "id"
  | "sessionsPerWeek"
  | "startWeek"
  | "endWeek"
  | "minutesPerSession"
  | "primaryUrl"
>;

export function weekdayNames(json: string): string[] {
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    /* fall through */
  }
  return ["mon", "tue", "wed", "thu", "fri"];
}

/**
 * Deterministic task placement:
 * - Week `w` starts at `start_date` (the Monday of week 1), then +7 days per week.
 * - A module active in week `w` fills its first `sessions_per_week` core weekdays
 *   in plan order (Mon first). Same weekday slots every week → n-back always
 *   lands Mon–Fri, matrix Mon–Thu, etc.
 * - Sat is optional (never auto-scheduled); Sun is rest.
 * - Idempotent: existing (user_plan_id, date) dayplans and (dayplan, module)
 *   task rows are never duplicated; re-running backfills only what's missing.
 */
export async function generateDaysForUserPlan(
  inputPlan: InputPlan,
  modules: InputModule[],
  userPlanId: string,
  startDate: string
): Promise<{ dayplans: DayPlan[]; tasks: Task[] }> {
  const coreIndexes = weekdayNames(inputPlan.coreWeekdays)
    .slice(0, 5)
    .map((w) => WEEKDAYS.indexOf(w as (typeof WEEKDAYS)[number]))
    .filter((i) => i >= 0);

  const existingRows = await db
    .select({ id: dayplans.id, date: dayplans.date })
    .from(dayplans)
    .where(eq(dayplans.userPlanId, userPlanId));
  const dateToDayplan = new Map(existingRows.map((d) => [d.date, d.id]));

  const ordered = [...modules].sort((a, b) => a.startWeek - b.startWeek);
  const createdDayplans: DayPlan[] = [];
  const createdTasks: Task[] = [];

  for (let w = 1; w <= inputPlan.durationWeeks; w++) {
    const weekStartDate = weekStart(startDate, w);
    const active = ordered.filter((m) => m.startWeek <= w && w <= m.endWeek);
    if (active.length === 0) continue;

    // Group modules by the weekday slots they own (earliest core days first).
    const byDate = new Map<string, InputModule[]>();
    for (const m of active) {
      const owned = coreIndexes.slice(0, m.sessionsPerWeek);
      for (const idx of owned) {
        const date = addDays(weekStartDate, idx);
        const list = byDate.get(date) ?? [];
        list.push(m);
        byDate.set(date, list);
      }
    }

    for (const [date, slotModules] of byDate) {
      let dayplanId = dateToDayplan.get(date);

      if (!dayplanId) {
        const [inserted] = await db
          .insert(dayplans)
          .values({ id: crypto.randomUUID(), userPlanId, date, isRestDay: 0 })
          .returning();
        dayplanId = inserted.id;
        dateToDayplan.set(date, dayplanId);
        createdDayplans.push(inserted);
      }

      for (const m of slotModules) {
        const [inserted] = await db
          .insert(tasks)
          .values({
            id: crypto.randomUUID(),
            dayplanId: dayplanId!,
            planModuleId: m.id,
            scheduledMinutes: m.minutesPerSession,
            url: m.primaryUrl,
          })
          .onConflictDoNothing()
          .returning();
        if (inserted) createdTasks.push(inserted);
      }
    }
  }

  return { dayplans: createdDayplans, tasks: createdTasks };
}