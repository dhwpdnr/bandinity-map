import Link from "next/link";
import { notFound } from "next/navigation";
import { updateVenueAction } from "@/app/actions";
import { SiteHeader } from "@/components/SiteHeader";
import { VenueForm } from "@/components/VenueForm";
import { CARD_PADDING, CARD_RADIUS, PAGE_BG_GRADIENT, PAGE_MAX_WIDTH, PAGE_PADDING } from "@/lib/layout";
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
    <main className={PAGE_BG_GRADIENT}>
      <SiteHeader className="border-b border-zinc-200/80 bg-white/85 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80" containerClassName={PAGE_MAX_WIDTH} />
      <div className={`mx-auto space-y-4 ${PAGE_MAX_WIDTH} ${PAGE_PADDING}`}>
        <div>
          <Link
            href={`/places/${place.id}`}
            aria-label="상세 페이지로 돌아가기"
            className="inline-flex h-8 w-8 items-center justify-center text-lg text-zinc-500 transition hover:text-primary-700 dark:text-zinc-400 dark:hover:text-primary-300"
          >
            ←
          </Link>
        </div>

        <section className={`${CARD_RADIUS} border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${CARD_PADDING}`}>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            장소 정보 수정
          </h1>

          {error && (
            <div className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
              {error === "missing-required"
                ? "이름, 지역, 주소는 필수입니다."
                : error === "address-search-required"
                  ? "주소를 수정했다면 검색 버튼으로 위치를 다시 확인해 주세요."
                  : error === "no-changes"
                    ? "변경된 내용이 없습니다."
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
