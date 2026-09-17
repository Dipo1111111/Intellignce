import Link from "next/link";
import { NavRail } from "@/components/nav-rail";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-6 md:px-8 md:pt-8">
      <div className="mb-6 flex flex-col gap-5 rounded-3xl border border-line bg-white/[0.03] p-4 backdrop-blur-xl md:mb-10 md:flex-row md:items-center md:justify-between md:p-5">
        <div className="flex items-center gap-3 px-1">
          <Link className="font-display text-lg font-bold tracking-tight" href="/today">
            INTELLG<span className="text-gradient">NCE</span>
          </Link>
          <span className="chip hidden sm:inline-flex">
            <span className="pulse-dot" aria-hidden />
            <b>PROGRAM OF RECORD</b>· 08 WKS
          </span>
        </div>
        <NavRail />
      </div>

      <main className="float-in">{children}</main>

      <footer className="hrule mt-14 flex flex-col gap-2 pt-5 md:flex-row md:items-center md:justify-between">
        <span className="microlabel">
          INTELLGNCE · <b className="text-accent">SCIENTIFIC STALWARTS</b>
        </span>
        <span className="microlabel">© 2026 · LOCAL-FIRST</span>
      </footer>
    </div>
  );
}
