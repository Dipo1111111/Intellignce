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
    <div className={`card flex flex-col gap-3 p-5 ${done ? "opacity-75" : ""}`} data-done={done}>
      <div className="flex items-start gap-4">
        <button
          type="button"
          aria-label={done ? "Mark as not done" : "Mark as done"}
          onClick={() => save({ completed: !done })}
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border font-mono text-[15px] transition-colors ${
            done
              ? "border-accent bg-accent text-paper"
              : "border-line-strong text-transparent hover:border-accent"
          }`}
        >
          ✓
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className={`text-[19px] font-bold leading-tight ${done ? "line-through decoration-accent" : ""}`}>
              {moduleName}
            </h3>
            <span className="microlabel">{scheduledMinutes} MIN · <span className="which">[SCHEDULED]</span></span>
          </div>
          <p className="mt-1 font-mono text-[11px] tracking-[0.12em] uppercase text-ink-soft">
            ABILITY: {targetAbility} · <a className="text-accent underline underline-offset-2 hover:text-ink" href={url} target="_blank" rel="noopener noreferrer">OPEN TRAINER →</a>
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
          className="grid grid-cols-1 gap-3 border-t border-line pt-3 sm:grid-cols-[150px_1fr_auto]"
        >
          <label className="microlabel flex flex-col gap-1">
            ACTUAL MIN
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
          <label className="microlabel flex flex-col gap-1">
            NOTES
            <input
              className="field"
              name="notes"
              value={notesValue}
              placeholder="e.g. reached 3-back"
              onChange={(e) => setNotesValue(e.target.value)}
            />
          </label>
          <button className="btn btn-ghost self-end" type="submit">SAVE</button>
        </form>
      )}
      {err && <p className="font-mono text-[11px] uppercase text-accent">{err}</p>}
    </div>
  );
}