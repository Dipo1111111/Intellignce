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
    <form action={submit} className="card-tint space-y-4 p-5 md:p-6">
{alreadyOn && (
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent">
          {"//"} Currently on “{alreadyOn}”. Starting this plan abandons it — every completed
          minute stays in your history and counts toward progress.
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        <label className="microlabel flex flex-col gap-1.5">
          START DATE (MONDAY)
          <input name="startDate" type="date" defaultValue={defaultStart} className="field" required />
        </label>
        <label className="microlabel flex flex-col gap-1.5">
          BASELINE IQ (OPTIONAL)
          <input name="baselineIq" type="number" min={50} max={200} className="field" placeholder="—" />
        </label>
        <label className="microlabel flex flex-col gap-1.5">
          TARGET IQ (OPTIONAL)
          <input name="targetIq" type="number" min={50} max={200} className="field" placeholder="—" />
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="microlabel">
          TIMEZONE: <b>{timezone}</b> — {durationWeeks} WEEKS GENERATED UP FRONT
        </p>
        <button className="btn btn-accent" type="submit" disabled={pending}>
          {pending ? "GENERATING…" : "COMMIT TO THIS PROGRAM →"}
        </button>
      </div>
      {error && (
        <p className="border border-accent/40 bg-paper2 px-3 py-2 font-mono text-[11px] uppercase tracking-wide text-accent">
          {error}
        </p>
      )}
    </form>
  );
}