"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings, ShieldCheck, UserRound, Users } from "lucide-react";

const icons = {
  home: Home,
  patients: UserRound,
  team: Users,
  activity: ShieldCheck,
  settings: Settings,
} as const;

export type NavItem = { href: string; label: string; icon: keyof typeof icons };

function isActive(pathname: string, href: string) {
  return href === "/app" ? pathname === "/app" : pathname.startsWith(href);
}

export function SideNav({ items, label }: { items: NavItem[]; label: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="mt-6 flex flex-col gap-1">
      {items.map((item) => {
        const Icon = icons[item.icon];
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex h-12 items-center gap-3 rounded-control px-3 text-base font-medium transition-colors ${
              active ? "bg-primary-soft text-primary-ink" : "text-ink-soft hover:bg-canvas hover:text-ink"
            }`}
          >
            <Icon size={20} aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function BottomNav({ items, label }: { items: NavItem[]; label: string }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label={label}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto flex max-w-md">
        {items.map((item) => {
          const Icon = icons[item.icon];
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[13px] font-medium transition-colors ${
                  active ? "text-primary" : "text-ink-faint"
                }`}
              >
                <span
                  className={`flex h-8 w-14 items-center justify-center rounded-full transition-colors ${
                    active ? "bg-primary-soft" : ""
                  }`}
                >
                  <Icon size={22} aria-hidden="true" />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
