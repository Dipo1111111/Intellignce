export const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type Weekday = (typeof WEEKDAYS)[number];

/** Monday-first index: mon=0 … sun=6 */
export function weekdayIndex(date: Date): number {
  return (date.getUTCDay() + 6) % 7;
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDays(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toISODate(d);
}

/** Monday of the ISO week containing `iso` (Monday-first week). */
export function mondayOf(iso: string): string {
  const d = parseISO(iso);
  d.setUTCDate(d.getUTCDate() - weekdayIndex(d));
  return toISODate(d);
}

export function dayOfWeek(iso: string): Weekday {
  return WEEKDAYS[weekdayIndex(parseISO(iso))];
}

/** Add `weeks` days: 1 = next Monday relative to the given week start. */
export function weekStart(planStart: string, week: number): string {
  return addDays(planStart, (week - 1) * 7);
}

export function daysBetween(a: string, b: string): number {
  const da = parseISO(a);
  const db = parseISO(b);
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

/** Today's date (YYYY-MM-DD) in the given IANA timezone. */
export function todayInTimeZone(timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return parts;
}

/** British-style weekday label, e.g. "Tue 17 SEP". */
export function prettyDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date
    .toLocaleDateString("en-GB", {
      timeZone: "UTC",
      weekday: "short",
      day: "2-digit",
      month: "short",
    })
    .toUpperCase();
}