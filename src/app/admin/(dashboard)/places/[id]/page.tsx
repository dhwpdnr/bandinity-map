import Link from "next/link";
import { notFound } from "next/navigation";
import { saveAdminPlaceAction, syncAdminPlaceAction } from "@/app/actions";
import { AdminPlaceEditor } from "@/components/AdminPlaceEditor";
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
  const { id } = await params;
  const place = await getAdminPlace(id);
  const query = await searchParams;
  const success = Array.isArray(query.success) ? query.success[0] : query.success;
  const error = Array.isArray(query.error) ? query.error[0] : query.error;

  if (!place) {
    notFound();
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/admin/submissions"
            className="text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← 제보 검토
          </Link>
          <span className="text-zinc-300 dark:text-zinc-600">|</span>
          <Link
            href={`/places/${place.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            공개 상세 보기 →
          </Link>
        </div>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            {place.name}
          </h1>
          <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            기본 정보, 날짜 단위 가용성, 출처 링크, 공개 캘린더 동기화를 여기서 관리합니다.
          </p>

          {success && (
            <div className="mt-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
              {success === "sync" ? "가용성 동기화를 실행했습니다." : "장소를 저장했습니다."}
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
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
    </div>
  );
}
