"use client";

type Point = { week: number; min: number; max: number };

const W = 720;
const H = 220;
const PAD = { l: 40, r: 16, t: 16, b: 28 };

export function GainChart({ series, planMax }: { series: Point[]; planMax: number }) {
  if (series.length < 2) {
    return <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft">Train a few days to draw the curve.</p>;
  }

  const maxVal = Math.max(planMax, ...series.map((s) => s.max));
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const x = (week: number) => PAD.l + ((week - 1) / (series.length - 1)) * innerW;
  const y = (v: number) => PAD.t + innerH - (v / (maxVal || 1)) * innerH;

  const minPath = series.map((s, i) => `${i === 0 ? "M" : "L"}${x(s.week)},${y(s.min)}`).join(" ");
  const maxPath = series.map((s, i) => `${i === 0 ? "M" : "L"}${x(s.week)},${y(s.max)}`).join(" ");
  const areaPath = `${maxPath} L${x(series[series.length - 1].week)},${y(0)} L${x(series[0].week)},${y(0)} Z`;

  const last = series[series.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Cumulative estimated IQ gain by week">
      <defs>
        <linearGradient id="gain-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="gain-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#22d3ee" stopOpacity="0.28" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
        <filter id="gain-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const yy = PAD.t + innerH - t * innerH;
        return (
          <line key={t} x1={PAD.l} y1={yy} x2={PAD.l + innerW} y2={yy} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        );
      })}
      <line x1={PAD.l} y1={PAD.t + innerH} x2={PAD.l + innerW} y2={PAD.t + innerH} stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />

      {/* plan ceiling */}
      <line
        x1={PAD.l}
        y1={y(planMax)}
        x2={PAD.l + innerW}
        y2={y(planMax)}
        stroke="#a78bfa"
        strokeOpacity="0.7"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      <text x={PAD.l + innerW - 2} y={y(planMax) - 6} textAnchor="end" fontSize="11" fontFamily="var(--font-mono)" fill="#a78bfa">
        CEILING +{planMax}
      </text>

      <path d={areaPath} fill="url(#gain-fill)" />
      <path d={minPath} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="3 4" />
      <path d={maxPath} fill="none" stroke="url(#gain-line)" strokeWidth="2.5" strokeLinecap="round" filter="url(#gain-glow)" />

      {series.map((s) => (
        <circle key={s.week} cx={x(s.week)} cy={y(s.max)} r="3" fill="#04060d" stroke="#22d3ee" strokeWidth="2" />
      ))}

      <text
        x={x(last.week)}
        y={y(last.max) - 12}
        textAnchor="end"
        fontSize="22"
        fontWeight="700"
        fontFamily="var(--font-display)"
        fill="url(#gain-line)"
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
