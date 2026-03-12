import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminMainPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          대시보드
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          제보 검토, 장소 관리를 위한 메뉴를 선택하세요.
        </p>
        <ul className="mt-6 space-y-2">
          <li>
            <Link
              href="/admin/submissions"
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            >
              제보 검토
              <span className="text-zinc-400 dark:text-zinc-500">→</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
