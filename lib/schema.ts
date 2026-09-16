import { sqliteTable, text, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  timezone: text("timezone").notNull().default("UTC"),
  baselineIq: integer("baseline_iq"),
  targetIq: integer("target_iq"),
  createdAt: text("created_at").notNull().default("strftime('%Y-%m-%dT%H:%M:%fZ','now')"),
});

export const plans = sqliteTable("plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  durationWeeks: integer("duration_weeks").notNull(),
  expectedIqGainMin: real("expected_iq_gain_min").notNull(),
  expectedIqGainMax: real("expected_iq_gain_max").notNull(),
  coreWeekdays: text("core_weekdays").notNull(), // JSON array, e.g. ["mon","tue","wed","thu","fri"]
  restWeekdays: text("rest_weekdays").notNull(), // JSON array, e.g. ["sun"]
  isActive: integer("is_active").notNull().default(1),
});

export const planModules = sqliteTable("plan_modules", {
  id: text("id").primaryKey(),
  planId: text("plan_id")
    .notNull()
    .references(() => plans.id),
  name: text("name").notNull(),
  targetAbility: text("target_ability").notNull(), // WM | Gf | Speed | Mixed
  minutesPerSession: integer("minutes_per_session").notNull(),
  sessionsPerWeek: integer("sessions_per_week").notNull(),
  startWeek: integer("start_week").notNull(),
  endWeek: integer("end_week").notNull(),
  expectedIqContributionMin: real("expected_iq_contribution_min").notNull(),
  expectedIqContributionMax: real("expected_iq_contribution_max").notNull(),
  primaryUrl: text("primary_url").notNull(),
  backupUrl: text("backup_url"),
  evidenceLevel: text("evidence_level").notNull(), // strong | moderate | supportive
  sortOrder: integer("sort_order").notNull().default(0),
});

export const userPlans = sqliteTable("user_plans", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  planId: text("plan_id")
    .notNull()
    .references(() => plans.id),
  startDate: text("start_date").notNull(), // ISO date, Monday of week 1
  status: text("status").notNull().default("active"), // active | completed | abandoned
  createdAt: text("created_at").notNull().default("strftime('%Y-%m-%dT%H:%M:%fZ','now')"),
});

export const dayplans = sqliteTable(
  "dayplans",
  {
    id: text("id").primaryKey(),
    userPlanId: text("user_plan_id")
      .notNull()
      .references(() => userPlans.id),
    date: text("date").notNull(),
    isRestDay: integer("is_rest_day").notNull().default(0),
  },
  (t) => [uniqueIndex("dayplans_userplan_date").on(t.userPlanId, t.date)]
);

export const tasks = sqliteTable(
  "tasks",
  {
    id: text("id").primaryKey(),
    dayplanId: text("dayplan_id")
      .notNull()
      .references(() => dayplans.id),
    planModuleId: text("plan_module_id")
      .notNull()
      .references(() => planModules.id),
    scheduledMinutes: integer("scheduled_minutes").notNull(),
    url: text("url").notNull(),
    completed: integer("completed").notNull().default(0),
    actualMinutes: integer("actual_minutes"),
    notes: text("notes"),
    completedAt: text("completed_at"),
  },
  (t) => [uniqueIndex("tasks_dayplan_module").on(t.dayplanId, t.planModuleId)]
);

export const iqTestScores = sqliteTable("iq_test_scores", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  testDate: text("test_date").notNull(),
  score: real("score").notNull(),
  source: text("source"),
  createdAt: text("created_at").notNull().default("strftime('%Y-%m-%dT%H:%M:%fZ','now')"),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Plan = typeof plans.$inferSelect;
export type PlanModule = typeof planModules.$inferSelect;
export type UserPlan = typeof userPlans.$inferSelect;
export type DayPlan = typeof dayplans.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;
export type NewPlanModule = typeof planModules.$inferInsert;
export type NewUserPlan = typeof userPlans.$inferInsert;
export type NewDayplan = typeof dayplans.$inferInsert;
export type NewTask = typeof tasks.$inferInsert;