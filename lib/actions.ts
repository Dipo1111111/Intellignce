"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, asc, eq } from "drizzle-orm";
import { getDefaultUser } from "@/lib/user";
import { db } from "@/lib/db";
import { iqTestScores, planModules, plans, tasks, userPlans, users, dayplans } from "@/lib/schema";
import { generateDaysForUserPlan } from "@/lib/domain/scheduler";
import { mondayOf } from "@/lib/domain/date";

const startPlanSchema = z.object({
  planId: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timezone: z.string().min(1).default("UTC"),
  baselineIq: z.coerce.number().int().min(50).max(200).optional().nullable(),
  targetIq: z.coerce.number().int().min(50).max(200).optional().nullable(),
});

export async function startPlanAction(input: {
  planId: string;
  startDate: string;
  timezone?: string;
  baselineIq?: number | null;
  targetIq?: number | null;
}) {
  const user = await getDefaultUser();
  const userId = user.id;

  const parsed = startPlanSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid plan start." };
  }
  const { planId, timezone, baselineIq, targetIq } = parsed.data;
  const startDate = mondayOf(parsed.data.startDate);

  const plan = await db.select().from(plans).where(eq(plans.id, planId)).get();
  if (!plan) return { error: "Unknown plan." };

  const modules = await db
    .select()
    .from(planModules)
    .where(eq(planModules.planId, planId))
    .orderBy(asc(planModules.sortOrder));

  // A new run supersedes the previous one — history is kept, never deleted.
  await db
    .update(userPlans)
    .set({ status: "abandoned" })
    .where(and(eq(userPlans.userId, userId), eq(userPlans.status, "active")));

  const userPlanId = crypto.randomUUID();
  await db.insert(userPlans).values({
    id: userPlanId,
    userId: userId,
    planId,
    startDate,
    status: "active",
  });

  await generateDaysForUserPlan(plan, modules, userPlanId, startDate);

  await db.update(users).set({ timezone, baselineIq, targetIq }).where(eq(users.id, userId));

  if (baselineIq) {
    await db.insert(iqTestScores).values({
      id: crypto.randomUUID(),
      userId: userId,
      testDate: startDate,
      score: baselineIq,
      source: "baseline",
    });
  }

  revalidatePath("/today");
  revalidatePath("/calendar");
  revalidatePath("/progress");
  redirect("/today");
}

const updateTaskSchema = z.object({
  taskId: z.string().min(1),
  completed: z.boolean().default(false),
  actualMinutes: z.coerce
    .number()
    .int()
    .min(0)
    .max(720)
    .optional()
    .nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export async function completeTaskAction(input: {
  taskId: string;
  completed?: boolean;
  actualMinutes?: number | null;
  notes?: string | null;
}) {
  const user = await getDefaultUser();
  const userId = user.id;

  const parsed = updateTaskSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid update." };
  }
  const { taskId, completed, actualMinutes, notes } = parsed.data;

  const task = await db.select().from(tasks).where(eq(tasks.id, taskId)).get();
  if (!task) return { error: "Task not found." };

  const dayplan = await db.select().from(dayplans).where(eq(dayplans.id, task.dayplanId)).get();
  if (!dayplan) return { error: "Dayplan not found." };

  const run = await db
    .select()
    .from(userPlans)
    .where(and(eq(userPlans.id, dayplan.userPlanId), eq(userPlans.userId, userId)))
    .get();
  if (!run) return { error: "Task does not belong to you." };

  await db
    .update(tasks)
    .set({
      completed: completed ? 1 : 0,
      completedAt: completed ? new Date().toISOString() : null,
      actualMinutes: actualMinutes ?? null,
      notes: notes || null,
    })
    .where(eq(tasks.id, taskId));

  revalidatePath("/today");
  revalidatePath("/calendar");
  revalidatePath("/progress");
  return { ok: true, completed };
}