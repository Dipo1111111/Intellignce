import type { Plan, PlanModule, Task, UserPlan } from "@/lib/schema";
import { addDays, mondayOf } from "./date";

export type ModuleRun = {
  module: PlanModule;
  userPlan: BoxedUserPlan;
};

type BoxedUserPlan = Pick<UserPlan, "id" | "startDate">;

/** Kind-of the multi-dimensional factor for exercises. Conservative saturation. */
export const SATURATION_K = 2.3;

export function moduleFullDose(m: PlanModule): number {
  return (
    m.minutesPerSession * m.sessionsPerWeek * (m.endWeek - m.startWeek + 1)
  );
}

/** Minutes that count toward the estimate: actual if logged, else scheduled. */
export function taskEarnedMinutes(t: Task): number {
  return t.actualMinutes ?? t.scheduledMinutes;
}

export function moduleCompletionRatio(m: PlanModule, tasks: Task[]): number {
  const full = moduleFullDose(m);
  if (full <= 0) return 0;
  const earned = tasks
    .filter((t) => t.completed === 1)
    .reduce((sum, t) => sum + taskEarnedMinutes(t), 0);
  return Math.min(1, earned / full);
}

/** Per-module estimated gain: 0 ratio → 0; full adherence → ~90% of the max. */
export function moduleGain(m: PlanModule, ratio: number): { min: number; max: number } {
  const factor = 1 - Math.exp(-SATURATION_K * ratio);
  return {
    min: m.expectedIqContributionMin * factor,
    max: m.expectedIqContributionMax * factor,
  };
}

export type Estimation = {
  totalMin: number;
  totalMax: number;
  perModule: Array<{
    module: PlanModule;
    fullDose: number;
    earnedMinutes: number;
    ratio: number;
    gainMin: number;
    gainMax: number;
  }>;
  completeRatio: number;
};

/** Estimate for one plan run. Totals clamped to the plan's promised ceiling. */
export function estimatePlan(
  plan: Pick<Plan, "expectedIqGainMin" | "expectedIqGainMax">,
  modules: PlanModule[],
  tasksByModule: Map<string, Task[]>
): Estimation {
  const perModule = modules.map((m) => {
    const runTasks = tasksByModule.get(m.id) ?? [];
    const ratio = moduleCompletionRatio(m, runTasks);
    const gain = moduleGain(m, ratio);
    return {
      module: m,
      fullDose: moduleFullDose(m),
      earnedMinutes: runTasks
        .filter((t) => t.completed === 1)
        .reduce((s, t) => s + taskEarnedMinutes(t), 0),
      ratio,
      gainMin: gain.min,
      gainMax: gain.max,
    };
  });

  const rawMin = perModule.reduce((s, m) => s + m.gainMin, 0);
  const rawMax = perModule.reduce((s, m) => s + m.gainMax, 0);

  return {
    totalMin: Math.min(rawMin, plan.expectedIqGainMax),
    totalMax: Math.min(rawMax, plan.expectedIqGainMax),
    perModule,
    completeRatio:
      perModule.reduce((s, m) => s + m.earnedMinutes, 0) /
      perModule.reduce((s, m) => s + m.fullDose, 0),
  };
}

/**
 * Cumulative estimated gain at each week boundary, for the trend chart.
 * Returns points [{ week, date, min, max }] where week N is the end of week N.
 * `dayplanDates` maps a task's dayplanId to its ISO date, so completion counts
 * against the day it was scheduled for, not the moment it was checked off.
 */
export function cumulativeGainSeries(
  plan: Pick<Plan, "expectedIqGainMin" | "expectedIqGainMax" | "durationWeeks">,
  userPlan: BoxedUserPlan,
  modules: PlanModule[],
  tasks: Task[],
  dayplanDates: Map<string, string>
): Array<{ week: number; date: string; min: number; max: number }> {
  const byModule = new Map<string, Task[]>();
  for (const t of tasks) {
    const list = byModule.get(t.planModuleId) ?? [];
    list.push(t);
    byModule.set(t.planModuleId, list);
  }

  const points: Array<{ week: number; date: string; min: number; max: number }> = [];
  for (let w = 1; w <= plan.durationWeeks; w++) {
    const weekEnd = addDays(mondayOf(userPlan.startDate), w * 7 - 1);
    const cutoffTasks = tasks.filter(
      (t) => t.completed === 1 && (dayplanDates.get(t.dayplanId) ?? "") <= weekEnd
    );
    const cutByModule = new Map<string, Task[]>();
    for (const t of cutoffTasks) {
      const list = cutByModule.get(t.planModuleId) ?? [];
      list.push(t);
      cutByModule.set(t.planModuleId, list);
    }
    const est = estimatePlan(plan, modules, cutByModule);
    points.push({ week: w, date: weekEnd, min: est.totalMin, max: est.totalMax });
  }

  return points;
}