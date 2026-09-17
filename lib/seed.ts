import { getDb, persistDb } from "@/lib/db";
import { planModules, plans } from "@/lib/schema";

export const CORE_PLAN_ID = "core-8wk";

const corePlan = {
  id: CORE_PLAN_ID,
  name: "+5 IQ in 8 weeks (Core)",
  description:
    "The primary path. Eight weeks of dual n-back, matrix reasoning, structured learning, a processing-speed block and daily logic — measured, consistent, and capped honestly at +4 to +7 IQ.",
  durationWeeks: 8,
  expectedIqGainMin: 4,
  expectedIqGainMax: 7,
  coreWeekdays: JSON.stringify(["mon", "tue", "wed", "thu", "fri"]),
  restWeekdays: JSON.stringify(["sun"]),
  isActive: 1,
};

const coreModules = [
  {
    id: "dual-nback",
    planId: CORE_PLAN_ID,
    name: "Dual N-Back",
    targetAbility: "WM",
    minutesPerSession: 25,
    sessionsPerWeek: 5,
    startWeek: 1,
    endWeek: 8,
    expectedIqContributionMin: 2,
    expectedIqContributionMax: 4,
    primaryUrl: "https://dualnback.com/",
    backupUrl: "https://brainscale.net/brain-training/dual-n-back/",
    evidenceLevel: "strong",
    sortOrder: 1,
  },
  {
    id: "matrix-reasoning",
    planId: CORE_PLAN_ID,
    name: "Matrix Reasoning",
    targetAbility: "Gf",
    minutesPerSession: 35,
    sessionsPerWeek: 4,
    startWeek: 1,
    endWeek: 8,
    expectedIqContributionMin: 2,
    expectedIqContributionMax: 4,
    primaryUrl: "https://matrixreasoningtest.com/questions",
    backupUrl: "https://iqniva.com/practice/matrix-reasoning/",
    evidenceLevel: "strong",
    sortOrder: 2,
  },
  {
    id: "learning-sprint",
    planId: CORE_PLAN_ID,
    name: "Learning Sprint (Programming)",
    targetAbility: "Mixed",
    minutesPerSession: 45,
    sessionsPerWeek: 5,
    startWeek: 1,
    endWeek: 8,
    expectedIqContributionMin: 1,
    expectedIqContributionMax: 3,
    primaryUrl: "https://www.freecodecamp.org/learn",
    backupUrl: "https://www.theodinproject.com/",
    evidenceLevel: "strong",
    sortOrder: 3,
  },
  {
    id: "processing-speed",
    planId: CORE_PLAN_ID,
    name: "Processing Speed",
    targetAbility: "Speed",
    minutesPerSession: 7,
    sessionsPerWeek: 4,
    startWeek: 3,
    endWeek: 6,
    expectedIqContributionMin: 0.5,
    expectedIqContributionMax: 2,
    primaryUrl: "https://field-vision.vercel.app/",
    backupUrl: "https://seniorhelp.ro/en/cognitive-games/ufov",
    evidenceLevel: "moderate",
    sortOrder: 4,
  },
  {
    id: "logic-puzzles",
    planId: CORE_PLAN_ID,
    name: "Logic Puzzles (Support)",
    targetAbility: "Mixed",
    minutesPerSession: 15,
    sessionsPerWeek: 4,
    startWeek: 1,
    endWeek: 8,
    expectedIqContributionMin: 0,
    expectedIqContributionMax: 1,
    primaryUrl: "https://mindloftdaily.com/logic-puzzles",
    backupUrl: "https://logicgridpuzzles.com/",
    evidenceLevel: "supportive",
    sortOrder: 5,
  },
];

// Self-bootstrapping: ensures the Core plan exists. Called on every
// load via getDefaultUser so fresh databases work with zero setup. Idempotent.
export async function ensureCorePlan(): Promise<void> {
  const db = await getDb();
  const existing = await db.select({ id: plans.id }).from(plans);
  if (existing.some((p) => p.id === CORE_PLAN_ID)) return;
  await db.insert(plans).values(corePlan);
  for (const m of coreModules) {
    await db.insert(planModules).values(m);
  }
  persistDb();
}
