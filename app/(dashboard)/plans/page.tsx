import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getActiveUserPlan, getPlans } from "@/lib/data";
import { OnboardingForm } from "@/components/onboarding-form";

export default async function PlansPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [plans, active] = await Promise.all([getPlans(), getActiveUserPlan(session.user.id)]);

  return (
    <div>
      <p className="microlabel">{"// "}FIG.00 — PROGRAM SELECT</p>
      <h1 className="mt-2 text-4xl font-bold tracking-[-0.02em] md:text-5xl">
        CHOOSE THE PATH<span className="text-accent">.</span>
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
        A plan is a program of record: duration, expected range, and the exact prescription
        that runs each day. Switching abandons the current run but never its history.
      </p>

      <div className="mt-8 flex flex-col gap-8">
        {plans.map(({ plan, modules }, i) => (
          <section key={plan.id} className="border border-line">
            <div className="border-b border-line p-5 md:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="microlabel">
                    PLAN {String(i + 1).padStart(2, "0")} / {String(plans.length).padStart(2, "0")}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold tracking-[-0.01em] md:text-3xl">{plan.name}</h2>
                </div>
                <p className="font-mono text-[12px] uppercase tracking-[0.12em]">
                  <span className="text-accent">+{plan.expectedIqGainMin}</span>
                  {" → "}
                  <span className="text-accent">+{plan.expectedIqGainMax}</span> IQ · {plan.durationWeeks} WEEKS
                </p>
              </div>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">{plan.description}</p>
            </div>

            <div className="border-b border-line">
              {modules.map((m) => (
                <div
                  key={m.id}
                  className="grid grid-cols-2 items-baseline gap-2 border-b border-line px-5 py-3 last:border-b-0 md:grid-cols-[1fr_110px_110px_140px] md:px-6"
                >
                  <div>
                    <span className="text-[14px] font-semibold">{m.name}</span>
                    <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
                      ABILITY {m.targetAbility} · WK {m.startWeek}–{m.endWeek}
                    </span>
                  </div>
                  <span className="microlabel">{m.minutesPerSession} MIN × {m.sessionsPerWeek}/WK</span>
                  <span className="microlabel">
                    <span className="which">+{m.expectedIqContributionMin}→+{m.expectedIqContributionMax}</span>
                  </span>
                  <span className="microlabel hidden md:block">
                    EVIDENCE: {m.evidenceLevel.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-5 md:p-6">
              <OnboardingForm
                planId={plan.id}
                durationWeeks={plan.durationWeeks}
                alreadyOn={active?.plan.id !== plan.id ? active?.plan.name ?? null : null}
              />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}