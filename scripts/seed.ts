import { db } from "@/lib/db";
import { plans, planModules } from "@/lib/schema";

const PLAN_ID = "core-8wk";

const plan = {
  id: PLAN_ID,
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

const modules = [
  {
    id: "dual-nback",
    planId: PLAN_ID,
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
    planId: PLAN_ID,
    name: "Matrix Reasoning",
    targetAbility: "Gf",
    minutesPerSession: 35,
    sessionsPerWeek: 4,
    startWeek: 1,
    endWeek: 8,
    expectedIqContributionMin: 2,
    expectedIqContributionMax: 4,
    primaryUrl: "https://matrixreasoningtest.com/practice-tests/free",
    backupUrl: "https://iqniva.com/practice/matrix-reasoning/",
    evidenceLevel: "strong",
    sortOrder: 2,
  },
  {
    id: "learning-sprint",
    planId: PLAN_ID,
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
    planId: PLAN_ID,
    name: "Processing Speed",
    targetAbility: "Speed",
    minutesPerSession: 7,
    sessionsPerWeek: 4,
    startWeek: 3,
    endWeek: 6,
    expectedIqContributionMin: 0.5,
    expectedIqContributionMax: 2,
    primaryUrl: "https://field-vision.vercel.app/",
    backupUrl: null,
    evidenceLevel: "moderate",
    sortOrder: 4,
  },
  {
    id: "logic-puzzles",
    planId: PLAN_ID,
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

async function main() {
  const existing = await db.select().from(plans);
  if (existing.some((p) => p.id === PLAN_ID)) {
    console.log("Plan already seeded — nothing to do.");
    return;
  }

  await db.insert(plans).values(plan);
  for (const m of modules) {
    await db.insert(planModules).values(m);
  }

  console.log(`Seeded plan "${plan.name}" + ${modules.length} modules.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });