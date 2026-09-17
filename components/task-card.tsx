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
};

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
    });
  }

  const done = optimistic;

  return (
    <div
      className={`card group flex flex-col gap-4 p-5 transition-all duration-300 md:p-6 ${
        done ? "opacity-60 saturate-50" : "hover:border-line-strong hover:shadow-[0_24px_70px_-30px_rgba(34,211,238,0.35)]"
      }`}
      data-done={done}
    >
      <div className="flex items-start gap-4">
        <button
          type="button"
          aria-label={done ? "Mark as not done" : "Mark as done"}
          onClick={() => save({ completed: !done })}
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[15px] transition-all duration-200 ${
            done
              ? "border-transparent bg-gradient-to-br from-cyan-300 to-violet-400 text-[#03252c] shadow-[0_0_20px_-2px_rgba(34,211,238,0.9)]"
              : "border-line-strong text-transparent hover:border-cyan-300/70 hover:shadow-[0_0_16px_-2px_rgba(34,211,238,0.6)]"
          }`}
        >
          ✓
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3
              className={`font-display text-[17px] font-semibold leading-tight tracking-tight ${
                done ? "text-ink-soft line-through decoration-cyan-300/60" : ""
              }`}
            >
              {moduleName}
            </h3>
            <span className="microlabel">
              {scheduledMinutes} MIN · <span className="which">SCHEDULED</span>
            </span>
          </div>
          <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft">
            ABILITY {targetAbility} ·{" "}
            <a
              className="text-accent underline decoration-cyan-300/40 underline-offset-4 transition-colors hover:text-ink"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open trainer →
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
          <label className="microlabel flex flex-col gap-1.5">
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
          <label className="microlabel flex flex-col gap-1.5">
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
      {err && <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-warn">{err}</p>}
    </div>
  );
}
