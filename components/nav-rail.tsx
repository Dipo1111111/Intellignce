"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/today", label: "Today", index: "01" },
  { href: "/progress", label: "Progress", index: "02" },
  { href: "/calendar", label: "Calendar", index: "03" },
  { href: "/science", label: "Science", index: "04" },
  { href: "/plans", label: "Plans", index: "05" },
] as const;

export function NavRail() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary">
      <ul className="flex flex-wrap gap-1.5 rounded-full border border-line bg-black/20 p-1.5 backdrop-blur-xl md:gap-1">
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 rounded-full px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-all duration-200 md:px-4 ${
                  active
                    ? "bg-gradient-to-r from-cyan-400 to-cyan-300 font-semibold text-[#03252c] shadow-[0_4px_24px_-6px_rgba(34,211,238,0.8)]"
                    : "text-ink-soft hover:bg-white/[0.06] hover:text-ink"
                }`}
              >
                <span className={active ? "opacity-70" : "opacity-50"}>{l.index}</span>
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
