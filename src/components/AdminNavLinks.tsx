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
                ? "bg-white/8 text-zinc-100"
                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
            }`}
          >
            <span
              aria-hidden
              className={
                isActive
                  ? "text-primary-300"
                  : "text-zinc-500"
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
