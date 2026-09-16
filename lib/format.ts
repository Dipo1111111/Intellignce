export function formatMinutes(min: number): string {
  if (min >= 600) {
    const h = Math.round(min / 60);
    return `${h}h`;
  }
  return `${Math.round(min)}m`;
}

export function fmt(v: number): string {
  return v.toFixed(1);
}