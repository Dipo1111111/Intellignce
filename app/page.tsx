import Link from "next/link";

const modules = [
  { index: "M.01", name: "Dual N-Back", ability: "WORKING MEMORY", dose: "25 MIN × 5/WK" },
  { index: "M.02", name: "Matrix Reasoning", ability: "FLUID REASONING", dose: "35 MIN × 4/WK" },
  { index: "M.03", name: "Learning Sprint", ability: "MIXED", dose: "45 MIN × 5/WK" },
  { index: "M.04", name: "Processing Speed", ability: "SPEED", dose: "07 MIN × 4/WK" },
  { index: "M.05", name: "Logic Puzzles", ability: "SUPPORT", dose: "15 MIN × 4/WK" },
];

const stats = [
  { value: "+4 → +7", label: "EST. IQ GAIN" },
  { value: "08", label: "WEEKS" },
  { value: "05", label: "MODULES" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-6 md:px-8 md:pt-8">
        <header className="float-in flex items-center justify-between gap-4 pb-6">
          <span className="font-display text-lg font-bold tracking-tight">
            INTELLG<span className="text-gradient">NCE</span>
          </span>
          <span className="flex items-center gap-3">
            <span className="chip hidden sm:inline-flex">
              <span className="pulse-dot" aria-hidden />
              SYSTEM ONLINE
            </span>
            <Link className="btn btn-accent" href="/today">
              Enter →
            </Link>
          </span>
        </header>

        <section className="panel-hero float-in p-8 md:p-14" style={{ animationDelay: "80ms" }}>
          <div className="orb orb-drift left-[8%] top-[-60px] h-56 w-56 bg-cyan-400/20" aria-hidden />
          <div
            className="orb orb-drift right-[4%] top-[30%] h-64 w-64 bg-violet-500/20"
            style={{ animationDelay: "-6s" }}
            aria-hidden
          />
          <div className="relative">
            <p className="microlabel">
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-cyan-300 align-middle shadow-[0_0_10px_2px_rgba(34,211,238,0.8)]" aria-hidden />
              COGNITIVE TRAINING · SCHEDULED
            </p>
            <h1 className="mt-4 font-display text-[42px] font-bold leading-[1.02] tracking-tight md:text-7xl">
              Measured
              <br />
              <span className="text-gradient">intelligence.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-soft md:text-base">
              INTELLGNCE is a planner, tracker, and structured path for scientifically
              supported cognitive training. Pick the Core plan and it generates every
              day of the next eight weeks — training happens off-site, this is the
              scheduler and ledger.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link className="btn btn-accent" href="/today">
                Start training →
              </Link>
              <Link className="btn btn-ghost" href="/science">
                Read the science
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-line pt-6">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-2xl font-bold tracking-tight text-gradient md:text-4xl">
                    {s.value}
                  </p>
                  <p className="microlabel mt-1.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12 md:mt-16">
          <p className="microlabel">FIG.00 — THE PRESCRIPTION</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Five modules<span className="text-gradient">.</span> One dose<span className="text-gradient">.</span>
          </h2>
          <div className="card mt-6 overflow-hidden">
            {modules.map((m, i) => (
              <div
                key={m.index}
                className="group grid grid-cols-2 items-center gap-2 border-b border-line px-5 py-4 transition-colors last:border-b-0 hover:bg-white/[0.04] md:grid-cols-[80px_1fr_170px_170px_40px] md:px-6"
              >
                <span className="microlabel">{m.index}</span>
                <span className="text-[15px] font-semibold tracking-tight">
                  {m.name}
                  <span className="ml-2 hidden font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft sm:inline">
                    {m.ability}
                  </span>
                </span>
                <span className="microlabel hidden md:block">{m.ability}</span>
                <span className="microlabel text-right md:text-left">{m.dose}</span>
                <span className="hidden text-right font-mono text-sm text-rail transition-all group-hover:translate-x-1 group-hover:text-accent md:block" aria-hidden>
                  {String(i + 1).padStart(2, "0")} →
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-5 md:mt-16 md:grid-cols-3">
          {[
            {
              n: "01",
              t: "Pick the Core plan",
              b: "One program of record: eight weeks, expected range stated up front, no guesswork about what to do each day.",
            },
            {
              n: "02",
              t: "Train off-site, log here",
              b: "Do the work on dedicated training sites. Check off tasks, log minutes and notes — the ledger keeps the dose honest.",
            },
            {
              n: "03",
              t: "Watch the estimate",
              b: "Completed dose converts into an estimated IQ-gain range, with streaks, history, and a calendar grid of the run.",
            },
          ].map((s) => (
            <div key={s.n} className="card group p-6 transition-transform duration-300 hover:-translate-y-1">
              <p className="font-display text-sm font-bold text-gradient">{s.n}</p>
              <h3 className="mt-3 font-display text-lg font-semibold tracking-tight">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.b}</p>
            </div>
          ))}
        </section>

        <section className="card-tint mt-12 p-8 text-center md:mt-16 md:p-12">
          <p className="microlabel">
            <span className="pulse-dot mr-2 align-middle" aria-hidden />
            NO ACCOUNT · NO LOGIN · JUST TRAIN
          </p>
          <h2 className="mx-auto mt-4 max-w-xl font-display text-2xl font-bold tracking-tight md:text-3xl">
            Your program is one tap away<span className="text-gradient">.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-ink-soft">
            Open today&apos;s checklist and start the first block.
          </p>
          <Link className="btn btn-accent mt-7" href="/today">
            Open today&apos;s checklist →
          </Link>
        </section>

        <footer className="hrule mt-14 flex flex-col gap-2 pt-5 md:flex-row md:items-center md:justify-between">
          <span className="microlabel">
            INTELLGNCE · <b className="text-accent">SCIENTIFIC STALWARTS</b>
          </span>
          <span className="microlabel">© 2026 · LOCAL-FIRST</span>
        </footer>
      </div>
    </div>
  );
}
