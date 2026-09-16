"use client";

type Point = { week: number; min: number; max: number };

const W = 720;
const H = 220;
const PAD = { l: 40, r: 16, t: 16, b: 28 };

export function GainChart({ series, planMax }: { series: Point[]; planMax: number }) {
  if (series.length < 2) {
    return <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft">TRAIN A FEW DAYS TO DRAW THE CURVE.</p>;
  }

  const maxVal = Math.max(planMax, ...series.map((s) => s.max));
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const x = (week: number) => PAD.l + ((week - 1) / (series.length - 1)) * innerW;
  const y = (v: number) => PAD.t + innerH - (v / (maxVal || 1)) * innerH;

  const minPath = series.map((s, i) => `${i === 0 ? "M" : "L"}${x(s.week)},${y(s.min)}`).join(" ");
  const maxPath = series.map((s, i) => `${i === 0 ? "M" : "L"}${x(s.week)},${y(s.max)}`).join(" ");

  const last = series[series.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Cumulative estimated IQ gain by week">
      <line x1={PAD.l} y1={PAD.t + innerH} x2={PAD.l + innerW} y2={PAD.t + innerH} stroke="var(--color-ink)" strokeWidth="2" />
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const yy = PAD.t + innerH - t * innerH;
        return (
          <line key={t} x1={PAD.l} y1={yy} x2={PAD.l + innerW} y2={yy} stroke="var(--color-line)" strokeWidth="1" />
        );
      })}

      {/* plan ceiling */}
      <line
        x1={PAD.l}
        y1={y(planMax)}
        x2={PAD.l + innerW}
        y2={y(planMax)}
        stroke="var(--color-accent)"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      <text x={PAD.l + innerW - 2} y={y(planMax) - 5} textAnchor="end" fontSize="11" fontFamily="var(--font-mono)" fill="var(--color-accent)">
        PLAN CEILING +{planMax}
      </text>

      <path d={minPath} fill="none" stroke="var(--color-rail)" strokeWidth="2" />
      <path d={maxPath} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" />

      {series.map((s) => (
        <circle key={s.week} cx={x(s.week)} cy={y(s.max)} r="3" fill="var(--color-accent)" />
      ))}

      <text
        x={x(last.week)}
        y={y(last.max) - 10}
        textAnchor="end"
        fontSize="20"
        fontWeight="700"
        fontFamily="var(--font-grotesk)"
        fill="var(--color-ink)"
      >
        +{last.max.toFixed(1)}
      </text>

      {[0, 1, 2, 3, 4].map((i) => {
        const week = 1 + Math.floor(((series.length - 1) * i) / 4);
        return (
          <text key={i} x={x(week)} y={H - 8} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--color-ink-soft)">
            W{week}
          </text>
        );
      })}
    </svg>
  );
}