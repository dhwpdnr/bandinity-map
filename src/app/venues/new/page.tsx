import Link from "next/link";
import { createVenueAction } from "@/app/actions";
import { SiteHeader } from "@/components/SiteHeader";
import { VenueForm } from "@/components/VenueForm";
import { CARD_PADDING, CARD_RADIUS, PAGE_BG_GRADIENT, PAGE_MAX_WIDTH, PAGE_PADDING } from "@/lib/layout";
import { getPlaces } from "@/lib/places";

interface VenueNewPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function VenueNewPage({ searchParams }: VenueNewPageProps) {
  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  const success = Array.isArray(params.success) ? params.success[0] : params.success;
  const places = await getPlaces().catch(() => []);
  const regionOptions = Array.from(
    new Set(places.map((place) => place.region).filter(Boolean))
  ).sort((left, right) => left.localeCompare(right, "ko"));

  return (
    <main className={PAGE_BG_GRADIENT}>
      <SiteHeader className="border-b border-zinc-200/80 bg-white/85 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80" containerClassName={PAGE_MAX_WIDTH} />
      <div className={`mx-auto space-y-3 ${PAGE_MAX_WIDTH} ${PAGE_PADDING}`}>
        <div>
          <Link
            href="/"
            aria-label="뒤로가기"
            className="inline-flex h-8 w-8 items-center justify-center text-lg text-zinc-500 transition hover:text-primary-700 dark:text-zinc-400 dark:hover:text-primary-300"
          >
            ←
          </Link>
        </div>

        <div className="overflow-hidden rounded-[18px] border border-white/8 bg-[linear-gradient(90deg,rgba(16,18,24,0.96),rgba(21,24,31,0.98))] shadow-[0_18px_42px_-28px_rgba(0,0,0,0.85)]">
          <div className="flex">
            <div className="w-1.5 shrink-0 bg-primary-400" />
            <div className="px-4 py-3 text-[13px] leading-6 text-zinc-200 sm:px-5 sm:text-sm">
              누구나 공연장 정보를 등록할 수 있습니다. 잘못된 정보는 언제든 수정할 수 있어요.
              기존에 등록되어 있는 공연장이 아닌지 확인해 주세요.
            </div>
          </div>
        </div>

        <section className={`${CARD_RADIUS} border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${CARD_PADDING}`}>
          <h1 className="text-[1.75rem] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-[1.9rem]">
            새 공연장 등록
          </h1>

          {success === "submitted" && (
            <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
              등록 요청이 접수되었습니다. 검토 후 반영됩니다.
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
              {error === "missing-required"
                ? "이름, 지역, 주소는 필수입니다."
                : error === "address-search-required"
                  ? "주소를 입력한 뒤 검색 버튼으로 위치를 확인해 주세요."
                  : error === "duplicate-venue"
                    ? "이미 같은 이름과 주소의 장소가 등록되어 있습니다."
                    : decodeURIComponent(error)}
            </div>
          )}

          <div className="mt-6">
            <VenueForm
              action={createVenueAction}
              submitLabel="장소 등록하기"
              cancelHref="/"
              regionOptions={regionOptions.length ? regionOptions : ["기타"]}
              compact
            />
          </div>
        </section>
      </div>
    </main>
  );
}
