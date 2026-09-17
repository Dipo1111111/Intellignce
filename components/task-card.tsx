"use client";

import { useState, useOptimistic, useTransition, useRef } from "react";
import { completeTaskAction } from "@/lib/actions";

type TaskCardProps = {
  taskId: string;
  moduleName: string;
  targetAbility: string;
  scheduledMinutes: number;
  url: string;
  completed: boolean;
  actualMinutes: number | null;
  notes: string | null;
  isToday: boolean;
  onSaved?: () => void;
};

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TaskCard({
  taskId,
  moduleName,
  targetAbility,
  scheduledMinutes,
  url,
  completed,
  actualMinutes,
  notes,
  isToday,
  onSaved,
}: TaskCardProps) {
  const [minutes, setMinutes] = useState(actualMinutes ?? null);
  const [notesValue, setNotesValue] = useState(notes ?? "");
  const [err, setErr] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [optimistic, commitOptimistic] = useOptimistic(completed === true);
  const formRef = useRef<HTMLFormElement>(null);

  function save(patch: { completed?: boolean; actualMinutes?: number | null; notes?: string | null }) {
    commitOptimistic(patch.completed ?? optimistic);
    startTransition(async () => {
      const res = await completeTaskAction({
        taskId,
        completed: patch.completed ?? optimistic,
        actualMinutes: patch.actualMinutes !== undefined ? patch.actualMinutes : minutes,
        notes: patch.notes !== undefined ? patch.notes : notesValue,
      });
      if (res && "error" in res) setErr(res.error as string);
      else {
        setErr(null);
        onSaved?.();
      }
    });
  }

  const done = optimistic;

  return (
    <div
      className={`card flex flex-col gap-4 p-5 transition-colors md:p-6 ${done ? "bg-[#f2f4f7]" : ""}`}
      data-done={done}
    >
      <div className="flex items-start gap-4">
        <button
          type="button"
          aria-label={done ? "Mark as not done" : "Log this block as done"}
          onClick={() => save({ completed: !done })}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 font-display text-lg font-bold transition-all ${
            done
              ? "lap-snap border-accent bg-accent text-white"
              : "border-line-strong bg-paper2 text-transparent hover:border-accent hover:text-accent-ink"
          }`}
        >
          <CheckIcon />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className={`font-display text-[26px] font-semibold uppercase leading-none tracking-wide ${done ? "text-ink-soft line-through decoration-accent/60" : ""}`}>
              {moduleName}
            </h3>
            <span className="microlabel">
              {scheduledMinutes} min · <span className="which">scheduled</span>
            </span>
          </div>
          <p className="microlabel mt-1.5">
            Ability {targetAbility} ·{" "}
            <a className="text-accent-ink underline decoration-accent/40 underline-offset-4 hover:text-ink" href={url} target="_blank" rel="noopener noreferrer">
              Open trainer
            </a>
          </p>
        </div>
      </div>

      {isToday && (
        <form
          ref={formRef}
          action={async (fd) => {
            const mins = fd.get("minutes") === "" || fd.get("minutes") == null ? null : Number(fd.get("minutes"));
            const note = (fd.get("notes") as string) ?? "";
            save({ actualMinutes: mins, notes: note, completed: done });
          }}
          className="grid grid-cols-1 gap-3 border-t border-line pt-4 sm:grid-cols-[140px_1fr_auto]"
        >
          <label className="label flex flex-col gap-1.5">
            Actual min
            <input
              className="field"
              type="number"
              name="minutes"
              min={0}
              max={720}
              value={minutes ?? ""}
              placeholder={String(scheduledMinutes)}
              onChange={(e) => setMinutes(e.target.value === "" ? null : Number(e.target.value))}
            />
          </label>
          <label className="label flex flex-col gap-1.5">
            Notes
            <input
              className="field"
              name="notes"
              value={notesValue}
              placeholder="e.g. reached 3-back"
              onChange={(e) => setNotesValue(e.target.value)}
            />
          </label>
          <button className="btn btn-ghost self-end" type="submit">
            Save
          </button>
        </form>
      )}
      {err && <p className="microlabel text-warn">{err}</p>}
    </div>
  );
}
