import Link from "next/link";
import { getPlaces } from "@/lib/places";
import { getPlaceTypeLabel } from "@/lib/place-utils";
import type { Place } from "@/types/place";

export const dynamic = "force-dynamic";

interface AdminPlacesListPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminPlacesListPage({
  searchParams,
}: AdminPlacesListPageProps) {
  const places = await getPlaces();
  const params = await searchParams;
  const success = Array.isArray(params.success) ? params.success[0] : params.success;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <div className="p-4 md:p-5">
      <div className="w-full space-y-6">
        <section className="rounded-[20px] border border-white/10 bg-[rgba(11,14,20,0.92)] p-6 shadow-[0_14px_36px_-28px_rgba(0,0,0,0.74)]">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            공연장 목록
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            등록된 전체 공연장·합주실을 확인하고 수정할 수 있습니다.
          </p>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            총 {places.length}곳
          </p>

          {success === "deleted" && (
            <div className="mt-5 rounded-[14px] bg-emerald-500/12 px-4 py-3 text-sm text-emerald-300">
              공연장을 삭제했습니다.
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-[14px] bg-rose-500/12 px-4 py-3 text-sm text-rose-300">
              {decodeURIComponent(error)}
            </div>
          )}

          <div className="mt-6">
            {places.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-white/14 bg-[rgba(16,21,30,0.72)] p-6 text-center text-sm text-zinc-400">
                등록된 공연장이 없습니다.
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                        <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                          이름
                        </th>
                        <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                          유형
                        </th>
                        <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
                          지역
                        </th>
                        <th className="hidden px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300 md:table-cell">
                          주소
                        </th>
                        <th className="w-0 px-4 py-3 text-right" aria-label="관리">
                          작업
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {places.map((place) => (
                        <AdminPlaceRow key={place.id} place={place} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function AdminPlaceRow({ place }: { place: Place }) {
  return (
    <tr className="bg-white transition hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/50">
      <td className="px-4 py-3">
        <Link
          href={`/admin/places/${place.id}`}
          className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-primary-500 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-primary-400"
        >
          {place.name}
        </Link>
      </td>
      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
        {getPlaceTypeLabel(place.placeType)}
      </td>
      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
        {place.region || "-"}
      </td>
      <td className="hidden px-4 py-3 text-zinc-600 dark:text-zinc-400 md:table-cell">
        <span className="line-clamp-1" title={place.address}>
          {place.address || "-"}
        </span>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          <Link
            href={`/admin/places/${place.id}`}
            className="inline-flex items-center rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            수정
          </Link>
          <Link
            href={`/places/${place.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            보기
          </Link>
        </div>
      </td>
    </tr>
  );
}
