import { getDefaultUser } from "@/lib/user";
import { getActiveUserPlan, getPlans } from "@/lib/data";
import { OnboardingForm } from "@/components/onboarding-form";

export const dynamic = "force-dynamic";

export default async function PlansPage() {
  const user = await getDefaultUser();

  const [plans, active] = await Promise.all([getPlans(), getActiveUserPlan(user.id)]);

  return (
    <div>
      <h1 className="font-display text-5xl font-bold uppercase leading-[0.9] tracking-tight md:text-6xl">
        Choose the path.
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">
        A plan is a program of record: duration, expected range, and the exact prescription
        that runs each day. Switching abandons the current run but never its history.
      </p>

      <div className="mt-8 flex flex-col gap-6">
        {plans.map(({ plan, modules }, i) => (
          <section key={plan.id} className="card overflow-hidden">
            <div className="border-b border-line p-5 md:p-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="split-num text-lg text-ink-soft">
                    {String(i + 1).padStart(2, "0")} <span className="text-rail">/ {String(plans.length).padStart(2, "0")}</span>
                  </p>
                  <h2 className="mt-1 font-display text-3xl font-semibold uppercase leading-none tracking-tight md:text-4xl">{plan.name}</h2>
                </div>
                <p className="split-num text-2xl">
                  <span className="text-accent-ink">+{plan.expectedIqGainMin}</span>
                  <span className="text-ink-soft">–</span>
                  <span className="text-accent-ink">+{plan.expectedIqGainMax}</span>
                  <span className="ml-1 font-sans text-sm font-semibold text-ink-soft">IQ · {plan.durationWeeks} wks</span>
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
                    <span className="label ml-2 text-[10px]">
                      {m.targetAbility} · wk {m.startWeek}–{m.endWeek}
                    </span>
                  </div>
                  <span className="microlabel">{m.minutesPerSession} min × {m.sessionsPerWeek}/wk</span>
                  <span className="microlabel">
                    <span className="which">+{m.expectedIqContributionMin}–+{m.expectedIqContributionMax}</span>
                  </span>
                  <span className="microlabel hidden md:block">
                    Evidence: {m.evidenceLevel}
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
