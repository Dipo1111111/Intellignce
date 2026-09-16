import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { asc, eq, inArray } from "drizzle-orm";
import { dayplans, planModules, plans, tasks, userPlans, users } from "@/lib/schema";
import { generateDaysForUserPlan } from "@/lib/domain/scheduler";
import { cert } from "./helpers";

const EMAIL = "smoke@test.int";
const PASSWORD = "testtest1234";

async function main() {
  // Fresh user each run.
  const existing = await db.select().from(users).where(eq(users.email, EMAIL)).get();
  let userId: string;
  if (existing) {
    userId = existing.id;
    const runs = await db.select().from(userPlans).where(eq(userPlans.userId, userId));
    if (runs.length) {
      console.log("smoke user already set up — cleaning.");
      const dpRows = await db
        .select()
        .from(dayplans)
        .where(inArray(dayplans.userPlanId, runs.map((r) => r.id)));
      if (dpRows.length) {
        const taskIds = await db
          .select()
          .from(tasks)
          .where(inArray(tasks.dayplanId, dpRows.map((d) => d.id)));
        if (taskIds.length)
          await db
            .delete(tasks)
            .where(inArray(tasks.id, taskIds.map((t) => t.id)));
      }
      if (dpRows.length)
        await db.delete(dayplans).where(inArray(dayplans.id, dpRows.map((d) => d.id)));
      await db.delete(userPlans).where(eq(userPlans.userId, userId));
    }
  } else {
    const hash = await bcrypt.hash(PASSWORD, 12);
    userId = crypto.randomUUID();
    await db.insert(users).values({
      id: userId,
      email: EMAIL,
      passwordHash: hash,
      timezone: "Europe/London",
    });
  }

  const plan = (await db.select().from(plans))[0];
  const modules = await db
    .select()
    .from(planModules)
    .where(eq(planModules.planId, plan.id))
    .orderBy(asc(planModules.sortOrder));

  const startDate = "2026-09-14"; // a Monday
  const userPlanId = crypto.randomUUID();
  await db.insert(userPlans).values({
    id: userPlanId,
    userId,
    planId: plan.id,
    startDate,
    status: "active",
  });

  const gen = await generateDaysForUserPlan(plan, modules, userPlanId, startDate);
  console.log(
    `generated: ${gen.dayplans.length} dayplans, ${gen.tasks.length} tasks`
  );

  // Complete the first 3 training days fully.
  const dps = await db
    .select()
    .from(dayplans)
    .where(eq(dayplans.userPlanId, userPlanId))
    .orderBy(asc(dayplans.date))
    .limit(3);
  let done = 0;
  for (const dp of dps) {
    const dayTasks = await db.select().from(tasks).where(eq(tasks.dayplanId, dp.id));
    for (const t of dayTasks) {
      await db
        .update(tasks)
        .set({ completed: 1, completedAt: dp.date + "T18:00:00.000Z", actualMinutes: t.scheduledMinutes })
        .where(eq(tasks.id, t.id));
      done += 1;
    }
  }
  console.log(`completed ${done} tasks across 3 days (${dps.map((d) => d.date).join(", ")})`);

  // Idempotency check: re-run generation → should add nothing.
  const rerun = await generateDaysForUserPlan(plan, modules, userPlanId, startDate);
  console.log(`idempotent rerun: ${rerun.dayplans.length} dayplans, ${rerun.tasks.length} tasks (expect 0,0)`);

  const counts = await db
    .select({ dayplans: dayplans.date, tasks: tasks.id, userId: users.id })
    .from(users)
    .leftJoin(userPlans, eq(userPlans.userId, users.id))
    .leftJoin(dayplans, eq(dayplans.userPlanId, userPlans.id))
    .leftJoin(tasks, eq(tasks.dayplanId, dayplans.id))
    .where(eq(users.email, EMAIL));
  console.log(`db rows for smoke user: ${counts.length} task joins`);
  cert(gen.dayplans.length > 0, "dayplans generated");
  cert(gen.tasks.length > 0, "tasks generated");
  cert(rerun.dayplans.length === 0 && rerun.tasks.length === 0, "idempotent");
  cert(done > 0, "completions recorded");
  console.log("SMOKE SETUP OK");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });