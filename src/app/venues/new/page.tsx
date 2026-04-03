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
      <SiteHeader className="border-b border-white/10 bg-[rgba(7,10,15,0.86)] backdrop-blur-xl" containerClassName={PAGE_MAX_WIDTH} />
      <div className={`mx-auto space-y-3 ${PAGE_MAX_WIDTH} ${PAGE_PADDING}`}>
        <div>
          <Link
            href="/"
            aria-label="뒤로가기"
            className="inline-flex h-8 w-8 items-center justify-center text-lg text-zinc-400 transition hover:text-primary-300"
          >
            ←
          </Link>
        </div>

        <div className="overflow-hidden rounded-[18px] border border-white/8 bg-[linear-gradient(90deg,rgba(16,18,24,0.96),rgba(21,24,31,0.98))] shadow-[0_18px_42px_-28px_rgba(0,0,0,0.85)]">
          <div className="flex">
            <div className="w-1.5 shrink-0 bg-primary-400" />
            <div className="px-4 py-2.5 text-[12px] leading-snug text-zinc-300 sm:px-5 sm:py-3 sm:text-sm sm:leading-6">
              <p>누구나 등록 가능 · 잘못된 정보는 언제든 수정</p>
              <p className="mt-1 text-zinc-400">중복 등록 전 목록에서 동일 공연장 여부를 확인해 주세요.</p>
            </div>
          </div>
        </div>

        <section className={`${CARD_RADIUS} border border-white/10 bg-[rgba(11,14,20,0.92)] shadow-[0_14px_36px_-28px_rgba(0,0,0,0.74)] ${CARD_PADDING}`}>
          <h1 className="text-[1.75rem] font-semibold tracking-tight text-zinc-100 md:text-[1.9rem]">
            새 공연장 등록
          </h1>

          {success === "submitted" && (
            <div className="mt-5 rounded-[20px] bg-emerald-500/12 px-4 py-3 text-sm text-emerald-300">
              등록 요청이 접수되었습니다. 검토 후 반영됩니다.
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-[20px] bg-rose-500/12 px-4 py-3 text-sm text-rose-300">
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
