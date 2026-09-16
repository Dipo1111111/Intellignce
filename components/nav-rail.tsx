"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Today", index: "01" },
  { href: "/progress", label: "Progress", index: "02" },
  { href: "/calendar", label: "Calendar", index: "03" },
  { href: "/science", label: "Science", index: "04" },
  { href: "/plans", label: "Plans", index: "05" },
] as const;

export function NavRail() {
  const pathname = usePathname();
  return (
    <nav className="font-mono text-[11px] tracking-[0.14em] uppercase">
      <ul className="flex flex-wrap gap-x-6 gap-y-2 md:block md:space-y-1">
        {links.map((l) => {
          const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`group flex items-baseline gap-2 py-1.5 ${
                  active ? "text-accent" : "text-ink-soft hover:text-ink"
                }`}
              >
                {active && <span className="inline-block h-2 w-2 bg-accent" aria-hidden />}
                {!active && <span className="inline-block h-2 w-2 border border-rail" aria-hidden />}
                <span className="opacity-60">{l.index}</span>
                <span className={active ? "" : ""}>{l.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}