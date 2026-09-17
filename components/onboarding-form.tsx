"use client";

import { useState } from "react";
import { startPlanAction } from "@/lib/actions";
import { addDays, mondayOf, todayInTimeZone } from "@/lib/domain/date";

type OnboardingFormProps = {
  planId: string;
  durationWeeks: number;
  alreadyOn: string | null;
};

export function OnboardingForm({ planId, durationWeeks, alreadyOn }: OnboardingFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [timezone] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC"
  );
  const defaultStart = (() => {
    try {
      return mondayOf(todayInTimeZone(timezone));
    } catch {
      return addDays(new Date().toISOString().slice(0, 10), 1);
    }
  })();

  async function submit(fd: FormData) {
    setPending(true);
    setError(null);
    const res = await startPlanAction({
      planId,
      startDate: (fd.get("startDate") as string) || defaultStart,
      timezone,
      baselineIq: fd.get("baselineIq") ? Number(fd.get("baselineIq")) : null,
      targetIq: fd.get("targetIq") ? Number(fd.get("targetIq")) : null,
    });
    if (res && "error" in res) {
      setError(res.error as string);
      setPending(false);
    }
  }

  return (
    <form action={submit} className="card-tint space-y-5 p-5 md:p-6">
      {alreadyOn && (
        <p className="rounded-lg border border-line-strong bg-paper2 px-4 py-3 text-sm leading-relaxed text-ink-soft">
          Currently on <b className="text-ink">{alreadyOn}</b>. Starting this plan
          abandons it — every completed minute stays in history and counts.
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        <label className="label flex flex-col gap-1.5">
          Start date · Monday
          <input name="startDate" type="date" defaultValue={defaultStart} className="field" required />
        </label>
        <label className="label flex flex-col gap-1.5">
          Baseline IQ · optional
          <input name="baselineIq" type="number" min={50} max={200} className="field" placeholder="—" />
        </label>
        <label className="label flex flex-col gap-1.5">
          Target IQ · optional
          <input name="targetIq" type="number" min={50} max={200} className="field" placeholder="—" />
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="microlabel">
          Timezone <b>{timezone}</b> · {durationWeeks} weeks generated up front
        </p>
        <button className="btn btn-accent" type="submit" disabled={pending}>
          {pending ? "Generating…" : "Commit to this program"}
        </button>
      </div>
      {error && (
        <p className="rounded-lg border border-warn/50 bg-warn/10 px-4 py-3 text-sm text-warn">
          {error}
        </p>
      )}
    </form>
  );
}