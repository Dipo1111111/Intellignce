import Link from "next/link";

const modules = [
  { index: "M.01", name: "Dual N-Back", ability: "WORKING MEMORY", dose: "25 MIN × 5/WK" },
  { index: "M.02", name: "Matrix Reasoning", ability: "FLUID REASONING", dose: "35 MIN × 4/WK" },
  { index: "M.03", name: "Learning Sprint", ability: "MIXED", dose: "45 MIN × 5/WK" },
  { index: "M.04", name: "Processing Speed", ability: "SPEED", dose: "07 MIN × 4/WK" },
  { index: "M.05", name: "Logic Puzzles", ability: "SUPPORT", dose: "15 MIN × 4/WK" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-6 md:px-8 md:pt-8">
        <header className="flex items-center justify-between gap-4 pb-6">
          <span className="text-lg font-bold tracking-tight">
            INTELLG<span className="text-accent">NCE</span>
          </span>
          <span className="flex items-center gap-4">
            <span className="chip hidden sm:inline-flex">
              <b className="text-ink">A PROGRAM OF RECORD</b>· 08 WKS
            </span>
            <Link className="btn btn-accent" href="/today">
              ENTER →
            </Link>
          </span>
        </header>

        <section className="border-2 border-ink p-8 md:p-12">
          <p className="microlabel">{"// "}COGNITIVE TRAINING, SCHEDULED</p>
          <h1 className="mt-3 text-5xl font-bold leading-[0.95] tracking-[-0.02em] md:text-7xl">
            MEASURED
            <br />
            INTELLIGENCE<span className="text-accent">.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-soft">
            INTELLGNCE is a planner, tracker, and structured path for scientifically
            supported cognitive training. Pick the Core plan and it generates every
            day of the next eight weeks — training happens off-site, this is the
            scheduler and ledger.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Link className="btn btn-accent" href="/today">
              START TRAINING →
            </Link>
            <Link className="btn btn-ghost" href="/science">
              READ THE SCIENCE
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
            <span>
              <b className="text-accent">+4 → +7</b> EST. IQ GAIN
            </span>
            <span>
              <b className="text-accent">08</b> WEEKS
            </span>
            <span>
              <b className="text-accent">05</b> MODULES
            </span>
          </div>
        </section>

        <section className="mt-10">
          <p className="microlabel">{"// "}FIG.00 — THE PRESCRIPTION</p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.02em] md:text-4xl">
            FIVE MODULES<span className="text-accent">.</span> ONE DOSE<span className="text-accent">.</span>
          </h2>
          <div className="mt-6 border border-line">
            {modules.map((m) => (
              <div
                key={m.index}
                className="grid grid-cols-2 items-baseline gap-2 border-b border-line px-5 py-3 last:border-b-0 md:grid-cols-[80px_1fr_160px_160px] md:px-6"
              >
                <span className="microlabel">{m.index}</span>
                <span className="text-[14px] font-semibold">{m.name}</span>
                <span className="microlabel">ABILITY {m.ability}</span>
                <span className="microlabel">{m.dose}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              n: "01",
              t: "PICK THE CORE PLAN",
              b: "One program of record: eight weeks, expected range stated up front, no guesswork about what to do each day.",
            },
            {
              n: "02",
              t: "TRAIN OFF-SITE, LOG HERE",
              b: "Do the work on dedicated training sites. Check off tasks, log minutes and notes — the ledger keeps the dose honest.",
            },
            {
              n: "03",
              t: "WATCH THE ESTIMATE",
              b: "Completed dose converts into an estimated IQ-gain range, with streaks, history, and a calendar grid of the run.",
            },
          ].map((s) => (
            <div key={s.n} className="card p-5">
              <p className="microlabel">STEP {s.n}</p>
              <h3 className="mt-2 text-lg font-bold tracking-tight">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.b}</p>
            </div>
          ))}
        </section>

        <section className="card-tint mt-10 p-8 text-center md:p-10">
          <p className="microlabel">{"// "}NO ACCOUNT · NO LOGIN · JUST TRAIN</p>
          <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-ink-soft">
            Your program lives in this browser session. Open today&apos;s checklist
            and start the first block.
          </p>
          <Link className="btn btn-accent mt-6" href="/today">
            OPEN TODAY&apos;S CHECKLIST →
          </Link>
        </section>

        <footer className="hrule mt-14 flex flex-col gap-2 pt-5 md:flex-row md:items-center md:justify-between">
          <span className="microlabel">
            INTELLGNCE — A PROGRAM OF RECORD · <b className="text-accent">SCIENTIFIC STALWARTS.</b>
          </span>
          <span className="microlabel">© 2026 · LOCAL-FIRST</span>
        </footer>
      </div>
    </div>
  );
}
