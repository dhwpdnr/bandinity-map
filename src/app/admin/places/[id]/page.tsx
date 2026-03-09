import Link from "next/link";
import { notFound } from "next/navigation";
import { saveAdminPlaceAction, syncAdminPlaceAction } from "@/app/actions";
import { AdminPlaceEditor } from "@/components/AdminPlaceEditor";
import { SiteHeader } from "@/components/SiteHeader";
import { requireAdminSession } from "@/lib/admin-auth";
import { getAdminPlace } from "@/lib/admin-place-service";

export const dynamic = "force-dynamic";

interface AdminPlacePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminPlacePage({
  params,
  searchParams,
}: AdminPlacePageProps) {
  await requireAdminSession();

  const { id } = await params;
  const place = await getAdminPlace(id);
  const query = await searchParams;
  const success = Array.isArray(query.success) ? query.success[0] : query.success;
  const error = Array.isArray(query.error) ? query.error[0] : query.error;

  if (!place) {
    notFound();
  }

  return (
    <main className="min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      <SiteHeader className="border-b border-zinc-200/80 bg-white/85 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80" containerClassName="max-w-6xl" />
      <div className="mx-auto max-w-5xl space-y-5 px-4 py-6 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin/submissions"
            className="text-sm text-zinc-500 transition hover:text-primary-700 dark:text-zinc-400 dark:hover:text-primary-300"
          >
            ← 제보 검토
          </Link>
          <Link
            href={`/places/${place.id}`}
            className="text-sm font-medium text-zinc-600 transition hover:text-primary-700 dark:text-zinc-300 dark:hover:text-primary-300"
          >
            공개 상세 보기
          </Link>
        </div>

        <section className="rounded-[32px] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-400">
            Admin Editor
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {place.name}
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            기본 정보, 날짜 단위 가용성, 출처 링크, 공개 캘린더 동기화를 여기서 관리합니다.
          </p>

          {success && (
            <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
              {success === "sync" ? "가용성 동기화를 실행했습니다." : "장소를 저장했습니다."}
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
              {decodeURIComponent(error)}
            </div>
          )}

          <div className="mt-6">
            <AdminPlaceEditor
              place={place}
              saveAction={saveAdminPlaceAction}
              syncAction={syncAdminPlaceAction}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
