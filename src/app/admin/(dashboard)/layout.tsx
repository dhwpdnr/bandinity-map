import Link from "next/link";
import { logoutAdminAction } from "@/app/actions";
import { AdminNavLinks } from "@/components/AdminNavLinks";
import { requireAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSession();

  return (
    <div className="flex min-h-dvh bg-zinc-100 dark:bg-zinc-950">
      <aside className="flex w-56 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex h-14 items-center border-b border-zinc-200 px-4 dark:border-zinc-800">
          <Link
            href="/admin"
            className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
          >
            관리자
          </Link>
        </div>
        <AdminNavLinks />
        <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            공개 홈 →
          </Link>
          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              로그아웃
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
