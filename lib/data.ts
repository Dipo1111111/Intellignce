import { db } from "@/lib/db";
import { dayplans, planModules, plans, tasks, userPlans, type Task } from "@/lib/schema";
import { asc, desc, eq, inArray, and } from "drizzle-orm";

export type PlanWithModules = Awaited<ReturnType<typeof getPlans>>[number];

export async function getPlans() {
  const rows = await db
    .select({
      plan: plans,
      module: planModules,
    })
    .from(plans)
    .leftJoin(planModules, eq(planModules.planId, plans.id))
    .where(eq(plans.isActive, 1))
    .orderBy(asc(plans.name), asc(planModules.sortOrder));

  const grouped = new Map<string, { plan: typeof plans.$inferSelect; modules: typeof planModules.$inferSelect[] }>();
  for (const { plan, module } of rows) {
    if (!module) continue;
    if (!grouped.has(plan.id)) {
      grouped.set(plan.id, { plan, modules: [] });
    }
    grouped.get(plan.id)!.modules.push(module);
  }
  return Array.from(grouped.values());
}

export async function getActiveUserPlan(userId: string) {
  const row = await db
    .select({
      userPlan: userPlans,
      plan: plans,
    })
    .from(userPlans)
    .innerJoin(plans, eq(plans.id, userPlans.planId))
    .where(and(eq(userPlans.userId, userId), eq(userPlans.status, "active")))
    .orderBy(desc(userPlans.createdAt))
    .limit(1)
    .get();

  if (!row) return null;
  const modules = await db
    .select()
    .from(planModules)
    .where(eq(planModules.planId, row.plan.id))
    .orderBy(asc(planModules.sortOrder));
  return { ...row, modules };
}

export async function getDayplan(userPlanId: string, date: string) {
  const dayplan = await db
    .select()
    .from(dayplans)
    .where(and(eq(dayplans.userPlanId, userPlanId), eq(dayplans.date, date)))
    .get();
  if (!dayplan) return null;

  const moduleMap = new Map(
    (await db.select().from(planModules)).map((m) => [m.id, m])
  );
  const taskRows = await db
    .select()
    .from(tasks)
    .where(eq(tasks.dayplanId, dayplan.id))
    .orderBy(asc(tasks.id));

  return {
    dayplan,
    tasks: taskRows.map((t) => ({ task: t, module: moduleMap.get(t.planModuleId) })),
  };
}

export async function getAllHistory(userId: string) {
  const runs = await db
    .select({
      userPlan: userPlans,
      plan: plans,
    })
    .from(userPlans)
    .innerJoin(plans, eq(plans.id, userPlans.planId))
    .where(eq(userPlans.userId, userId))
    .orderBy(asc(userPlans.startDate));

  if (runs.length === 0) {
    return {
      runs: [],
      modules: [] as typeof planModules.$inferSelect[],
      tasks: [] as Task[],
      dayplanDates: new Map<string, string>(),
      dayplanRunMap: new Map<string, string>(),
    };
  }

  const planIds = runs.map((r) => r.plan.id);
  const modules = await db.select().from(planModules).where(inArray(planModules.planId, planIds));

  const userPlanIds = runs.map((r) => r.userPlan.id);
  const dps = await db.select().from(dayplans).where(inArray(dayplans.userPlanId, userPlanIds));

  const allTasks = await db
    .select()
    .from(tasks)
    .where(
      inArray(
        tasks.dayplanId,
        dps.map((d) => d.id)
      )
    );

  return {
    runs,
    modules,
    tasks: allTasks,
    dayplanDates: new Map(dps.map((d) => [d.id, d.date])),
    dayplanRunMap: new Map(dps.map((d) => [d.id, d.userPlanId])),
  };
}

export async function getRunTasks(userPlanId: string) {
  return db
    .select({ task: tasks })
    .from(tasks)
    .innerJoin(dayplans, eq(dayplans.id, tasks.dayplanId))
    .where(eq(dayplans.userPlanId, userPlanId));
}

export async function getDayplansForRun(userPlanId: string) {
  return db.select().from(dayplans).where(eq(dayplans.userPlanId, userPlanId)).orderBy(asc(dayplans.date));
}

/** All dates (ISO) with at least one completed task, across all runs. */
export function completedTrainingDates(
  tasks: Task[],
  dayplanDates: Map<string, string>
): Set<string> {
  const dates = new Set<string>();
  for (const t of tasks) {
    if (t.completed === 1) {
      const d = dayplanDates.get(t.dayplanId);
      if (d) dates.add(d);
    }
  }
  return dates;
}

export type StatsRow = {
  moduleId: string;
  moduleName: string;
  targetAbility: string;
  totalMinutes: number;
  totalSessions: number;
  completedSessions: number;
  evidenceLevel: string;
};

export function aggregateStats(history: Awaited<ReturnType<typeof getAllHistory>>): StatsRow[] {
  const byModule = new Map<string, typeof history["tasks"]>();
  for (const t of history.tasks) {
    const list = byModule.get(t.planModuleId) ?? [];
    list.push(t);
    byModule.set(t.planModuleId, list);
  }
  return history.modules
    .map((m) => {
      const list = byModule.get(m.id) ?? [];
      const completed = list.filter((t) => t.completed === 1);
      return {
        moduleId: m.id,
        moduleName: m.name,
        targetAbility: m.targetAbility,
        evidenceLevel: m.evidenceLevel,
        totalMinutes: list.reduce((s, t) => s + (t.completed === 1 ? (t.actualMinutes ?? t.scheduledMinutes) : 0), 0),
        totalSessions: list.length,
        completedSessions: completed.length,
      };
    })
    .sort((a, b) => b.totalMinutes - a.totalMinutes);
}