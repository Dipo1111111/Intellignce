import Link from "next/link";
import { NavRail } from "@/components/nav-rail";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-6 md:px-8 md:pt-8">
      <div className="mb-6 md:mb-10">
        <div className="flex items-center justify-between gap-4">
          <Link className="font-display text-[22px] font-bold uppercase tracking-wide" href="/today">
            Intellgnce
          </Link>
          <span className="chip">
            <span className="pulse-dot" aria-hidden />
            Program of record · 08 wks
          </span>
        </div>
        <div className="mt-4 border-y border-line">
          <NavRail />
        </div>
      </div>

      <main className="float-in">{children}</main>

      <footer className="hrule mt-14 flex flex-col gap-2 pt-5 md:flex-row md:items-center md:justify-between">
        <span className="label">Intellgnce · Scientific stalwarts</span>
        <span className="microlabel">© 2026 · Local-first</span>
      </footer>
    </div>
  );
}
