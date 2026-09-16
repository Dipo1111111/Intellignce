"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { and, asc, eq } from "drizzle-orm";
import { auth, signIn } from "@/lib/auth";
import { db } from "@/lib/db";
import { iqTestScores, planModules, plans, tasks, userPlans, users, dayplans } from "@/lib/schema";
import { generateDaysForUserPlan } from "@/lib/domain/scheduler";
import { mondayOf } from "@/lib/domain/date";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Use at least 8 characters."),
  timezone: z.string().min(1).default("UTC"),
});

export async function registerAction(input: { email: string; password: string; timezone?: string }) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { email, password, timezone } = parsed.data;

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .get();
  if (existing) {
    return { error: "An account with this email already exists. Sign in instead." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.insert(users).values({
    id: crypto.randomUUID(),
    email: email.toLowerCase(),
    passwordHash,
    timezone,
  });

  await signIn("credentials", { email: email.toLowerCase(), password, redirectTo: "/" });
  redirect("/");
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function loginAction(input: { email: string; password: string }) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }
  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirectTo: "/",
    });
  } catch (e) {
    const err = e as Error;
    if (
      err.message?.includes("NEXT_REDIRECT") ||
      (err.cause as { name?: string } | undefined)?.name === "NEXT_REDIRECT"
    ) {
      throw e;
    }
    return { error: "Email or password is incorrect." };
  }
  redirect("/");
}

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
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

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
    .where(and(eq(userPlans.userId, session.user.id), eq(userPlans.status, "active")));

  const userPlanId = crypto.randomUUID();
  await db.insert(userPlans).values({
    id: userPlanId,
    userId: session.user.id,
    planId,
    startDate,
    status: "active",
  });

  await generateDaysForUserPlan(plan, modules, userPlanId, startDate);

  await db.update(users).set({ timezone, baselineIq, targetIq }).where(eq(users.id, session.user.id));

  if (baselineIq) {
    await db.insert(iqTestScores).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      testDate: startDate,
      score: baselineIq,
      source: "baseline",
    });
  }

  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/progress");
  redirect("/");
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
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

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
    .where(and(eq(userPlans.id, dayplan.userPlanId), eq(userPlans.userId, session.user.id)))
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

  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/progress");
  return { ok: true, completed };
}