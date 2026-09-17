import Link from "next/link";

const modules = [
  { index: "M.01", name: "Dual N-Back", ability: "Working memory", dose: "25 MIN × 5/WK" },
  { index: "M.02", name: "Matrix Reasoning", ability: "Fluid reasoning", dose: "35 MIN × 4/WK" },
  { index: "M.03", name: "Learning Sprint", ability: "Mixed", dose: "45 MIN × 5/WK" },
  { index: "M.04", name: "Processing Speed", ability: "Speed", dose: "07 MIN × 4/WK" },
  { index: "M.05", name: "Logic Puzzles", ability: "Support", dose: "15 MIN × 4/WK" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-6 md:px-8 md:pt-8">
        <header className="float-in flex items-center justify-between gap-4 pb-8">
          <span className="font-display text-[22px] font-bold uppercase tracking-wide">
            Intellgnce
          </span>
          <span className="flex items-center gap-3">
            <span className="chip hidden sm:inline-flex">
              <span className="pulse-dot" aria-hidden />
              Program of record · 08 wks
            </span>
            <Link className="btn btn-accent" href="/today">
              Enter
            </Link>
          </span>
        </header>

        <section className="float-in grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-end" style={{ animationDelay: "80ms" }}>
          <div>
            <h1 className="font-display text-6xl font-bold uppercase leading-[0.95] tracking-tight md:text-8xl">
              Eight weeks.
              <br />
              Every day scheduled.
            </h1>
            <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-ink-soft md:text-lg">
              INTELLGNCE writes all 56 days of a cognitive training program in
              advance, then keeps the ledger as you train. The work happens on
              dedicated trainer sites — this is the plan on the wall and the
              stopwatch on the desk.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link className="btn btn-accent" href="/today">
                Start training
              </Link>
              <Link className="btn btn-ghost" href="/science">
                Read the method
              </Link>
            </div>
          </div>
          <div className="card p-6">
            <p className="label">Core program · splits</p>
            <p className="split-num mt-2 text-6xl">
              +4<span className="text-ink-soft">–</span>+7 <span className="font-sans text-base font-semibold tracking-normal text-ink-soft">IQ est.</span>
            </p>
            <dl className="mt-5 space-y-0 border-t border-line">
              {[
                ["Duration", "08 weeks · 56 days"],
                ["Sessions", "5 modules · ~2 hrs/day max"],
                ["Evidence", "Strong → supportive, labeled"],
                ["Account", "None needed"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 last:border-b-0">
                  <dt className="label">{k}</dt>
                  <dd className="microlabel text-right text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="mt-14 md:mt-20">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight md:text-4xl">
              The prescription
            </h2>
            <p className="microlabel">05 modules · fixed doses</p>
          </div>
          <div className="card mt-5 overflow-hidden">
            {modules.map((m) => (
              <div
                key={m.index}
                className="grid grid-cols-[52px_1fr_auto] items-center gap-3 border-b border-line px-5 py-4 last:border-b-0 md:grid-cols-[64px_1fr_180px_170px] md:px-6"
              >
                <span className="split-num text-xl text-ink-soft">{m.index}</span>
                <span>
                  <span className="block text-[16px] font-semibold tracking-tight">{m.name}</span>
                  <span className="label mt-0.5 block text-[10px]">{m.ability}</span>
                </span>
                <span className="microlabel hidden text-ink md:block">{m.ability}</span>
                <span className="microlabel text-right">{m.dose}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card-tint mt-10 p-8 md:p-10">
          <div className="grid gap-8 md:grid-cols-[1fr_1fr_auto] md:items-center">
            <div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight md:text-3xl">
                No account. No login.
              </h2>
              <p className="mt-2 max-w-md text-[15px] leading-relaxed text-ink-soft">
                Open today&apos;s sheet and start the first block. Your program
                lives here, ready when you are.
              </p>
            </div>
            <p className="microlabel hidden max-w-[220px] leading-relaxed md:block">
              Estimates are ranges from logged dose, capped at the plan promise.
              Ranges, not guarantees.
            </p>
            <Link className="btn btn-accent justify-self-start md:justify-self-end" href="/today">
              Today&apos;s sheet
            </Link>
          </div>
        </section>

        <footer className="hrule mt-14 flex flex-col gap-2 pt-5 md:flex-row md:items-center md:justify-between">
          <span className="label">Intellgnce · Scientific stalwarts</span>
          <span className="microlabel">© 2026 · Local-first</span>
        </footer>
      </div>
    </div>
  );
}
