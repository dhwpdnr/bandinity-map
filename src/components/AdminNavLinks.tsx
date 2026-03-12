"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/submissions", label: "제보 검토" },
  { href: "/admin/places", label: "공연장 목록" },
  { href: "/admin/reviews", label: "리뷰" },
];

export function AdminNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-0.5 p-3">
      {items.map(({ href, label }) => {
        const isActive =
          href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            }`}
          >
            <span
              aria-hidden
              className={
                isActive
                  ? "text-zinc-600 dark:text-zinc-400"
                  : "text-zinc-400 dark:text-zinc-500"
              }
            >
              {href === "/admin" ? "◉" : "□"}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
