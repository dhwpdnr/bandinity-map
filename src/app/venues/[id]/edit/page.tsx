import Link from "next/link";
import { notFound } from "next/navigation";
import { updateVenueAction } from "@/app/actions";
import { SiteHeader } from "@/components/SiteHeader";
import { VenueForm } from "@/components/VenueForm";
import { getPlaceById } from "@/lib/places";

interface LegacyVenueEditPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LegacyVenueEditPage({
  params,
  searchParams,
}: LegacyVenueEditPageProps) {
  const { id } = await params;
  const place = await getPlaceById(id);
  if (!place) {
    notFound();
  }

  const query = await searchParams;
  const error = Array.isArray(query.error) ? query.error[0] : query.error;

  return (
    <main className="min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      <SiteHeader className="border-b border-zinc-200/80 bg-white/85 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80" containerClassName="max-w-6xl" />
      <div className="mx-auto max-w-6xl space-y-4 px-3 py-5 md:px-4 md:py-6">
        <div>
          <Link
            href={`/places/${place.id}`}
            aria-label="상세 페이지로 돌아가기"
            className="inline-flex h-8 w-8 items-center justify-center text-lg text-zinc-500 transition hover:text-primary-700 dark:text-zinc-400 dark:hover:text-primary-300"
          >
            ←
          </Link>
        </div>

        <section className="rounded-[32px] border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-6">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            장소 정보 수정
          </h1>

          {error && (
            <div className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
              {error === "missing-required"
                ? "이름, 지역, 주소는 필수입니다."
                : error === "address-search-required"
                  ? "주소를 수정했다면 검색 버튼으로 위치를 다시 확인해 주세요."
                : decodeURIComponent(error)}
            </div>
          )}

          <div className="mt-6">
            <VenueForm
              action={updateVenueAction}
              initialPlace={place}
              submitLabel="수정 사항 저장"
              cancelHref={`/places/${place.id}`}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
