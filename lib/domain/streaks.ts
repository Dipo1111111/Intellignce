import { daysBetween, todayInTimeZone } from "./date";

/**
 * A day counts toward a streak when it has ≥1 completed task.
 * Unfinished days and rest days never break the streak; a streak survives a
 * gap only if the missing day is "today" (still in progress).
 */
export function computeStreaks(
  completedDates: string[],
  timezone: string
): { current: number; longest: number; latestDate: string | null } {
  if (completedDates.length === 0) {
    return { current: 0, longest: 0, latestDate: null };
  }

  const unique = Array.from(new Set(completedDates)).sort();
  const today = todayInTimeZone(timezone);

  // Longest run over all history.
  let longest = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i++) {
    if (daysBetween(unique[i - 1], unique[i]) === 1) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  // Current streak: consecutive days ending today or yesterday.
  let current = 0;
  let idx = unique.length - 1;
  const latest = unique[idx];
  const latestDelta = daysBetween(latest, today);
  if (latestDelta === 0 || latestDelta === 1) {
    current = 1;
    idx -= 1;
    while (idx >= 0 && daysBetween(unique[idx], unique[idx + 1]) === 1) {
      current += 1;
      idx -= 1;
    }
  }

  return { current, longest, latestDate: latest };
}