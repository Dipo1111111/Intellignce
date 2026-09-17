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
      <ul className="-mb-px flex flex-wrap gap-x-7 gap-y-1">
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-baseline gap-2 border-b-2 py-3 font-display text-[19px] font-semibold uppercase tracking-wide transition-colors ${
                  active
                    ? "border-accent text-ink"
                    : "border-transparent text-ink-soft hover:border-line-strong hover:text-ink"
                }`}
              >
                <span className={`font-mono text-[11px] ${active ? "text-accent-ink" : "text-rail"}`}>
                  {l.index}
                </span>
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
