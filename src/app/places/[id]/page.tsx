import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { CollapsibleInfoSection } from "@/components/CollapsibleInfoSection";
import { OneTimeCoachBubble } from "@/components/OneTimeCoachBubble";
import { PlaceMap } from "@/components/PlaceMap";
import { PlaceReviewsReadOnly } from "@/components/PlaceReviewsReadOnly";
import { SiteHeader } from "@/components/SiteHeader";
import { CARD_PADDING, HEADER_PADDING, PAGE_BG_GRADIENT, PAGE_MAX_WIDTH, PAGE_PADDING } from "@/lib/layout";
import { hasPublicFirestoreConfig } from "@/lib/public-env";
import { getPlaceById } from "@/lib/places";
import { getPlaceReviews } from "@/lib/reviews";

export const dynamic = "force-dynamic";

interface PlaceDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <section className={CARD_PADDING}>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
        {label}
      </p>
      <div className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-zinc-700 dark:text-zinc-200">
        {value}
      </div>
    </section>
  );
}

export default async function PlaceDetailPage({
  params,
  searchParams,
}: PlaceDetailPageProps) {
  if (!hasPublicFirestoreConfig()) {
    return (
      <main className={`flex ${PAGE_BG_GRADIENT} items-center justify-center py-12`}>
        <div className={`mx-auto w-full ${PAGE_MAX_WIDTH} ${HEADER_PADDING}`}>
          <div className={`${CARD_RADIUS} border border-zinc-200 bg-white text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${CARD_PADDING}`}>
            Firebase 설정 후 상세 페이지를 확인할 수 있습니다.
          </div>
        </div>
      </main>
    );
  }

  const { id } = await params;
  const query = await searchParams;
  const place = await getPlaceById(id);

  if (!place) {
    notFound();
  }

  const media = Array.from(
    new Set(
      [place.imageUrl, ...(place.photos ?? [])].filter(
        (value): value is string => Boolean(value)
      )
    )
  );
  const reviews = await getPlaceReviews(id);
  const success = readParam(query, "success");
  const review = readParam(query, "review");
  const reviewError = readParam(query, "reviewError");
  const editHref = `/venues/${place.id}/edit`;
  const imageEditHref = `${editHref}#image-url`;
  const coverImage = media[0] ?? null;
  const galleryMedia = media.filter((imageUrl) => imageUrl !== coverImage);

  return (
    <div className={PAGE_BG_GRADIENT}>
      <SiteHeader className="sticky top-0 z-20 border-b border-white/60 bg-white/80 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/75" containerClassName={PAGE_MAX_WIDTH} />

      <main className={`mx-auto space-y-3 ${PAGE_MAX_WIDTH} ${PAGE_PADDING}`}>
        {(success || review || reviewError) && (
          <div className="space-y-3">
            {success && (
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                {success === "update-requested"
                  ? "수정 요청이 접수되었습니다. 검토 후 반영됩니다."
                  : success === "created"
                    ? "장소가 등록되었습니다."
                    : "장소 정보가 저장되었습니다."}
              </div>
            )}
            {review && (
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                리뷰가 등록되었습니다.
              </div>
            )}
            {reviewError && (
              <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                {decodeURIComponent(reviewError)}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 py-0.5">
          <Link
            href="/"
            aria-label="뒤로가기"
            className="inline-flex h-6 w-6 items-center justify-center text-base text-zinc-500 transition hover:text-primary-700 dark:text-zinc-400 dark:hover:text-primary-300"
          >
            ←
          </Link>
          <OneTimeCoachBubble
            storageKey="coach:edit-venue:v1"
            message="잘못된 정보가 있으면 수정해 주세요"
          >
            <Link
              href={editHref}
              className="inline-flex items-center rounded-[8px] border border-zinc-300/80 px-2.5 py-1 text-[11px] font-medium text-zinc-600 transition hover:border-primary-300 hover:text-primary-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-primary-700 dark:hover:text-primary-300"
            >
              정보 수정
            </Link>
          </OneTimeCoachBubble>
        </div>

        <section className="overflow-hidden rounded-[32px] border border-zinc-200 bg-white shadow-[0_30px_90px_-56px_rgba(15,23,42,0.6)] dark:border-zinc-800 dark:bg-zinc-900">
          {coverImage ? (
            <div className="relative aspect-[16/8] w-full overflow-hidden border-b border-zinc-200/80 bg-zinc-100 dark:border-zinc-800/80 dark:bg-zinc-900">
              <Image
                src={coverImage}
                alt={place.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 960px"
                unoptimized
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/42 via-black/10 to-transparent" />
            </div>
          ) : (
            <Link
              href={imageEditHref}
              className="flex aspect-[16/8] w-full items-center justify-center border-b border-zinc-200/80 bg-[linear-gradient(135deg,rgba(243,244,246,0.95),rgba(228,231,235,0.92))] px-6 text-center transition hover:bg-[linear-gradient(135deg,rgba(235,238,242,0.98),rgba(220,225,231,0.95))] dark:border-zinc-800/80 dark:bg-[linear-gradient(135deg,rgba(21,24,32,0.96),rgba(13,16,22,0.98))] dark:hover:bg-[linear-gradient(135deg,rgba(28,32,42,0.98),rgba(17,20,28,1))]"
            >
              <div>
                <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  대표 사진이 아직 없습니다
                </p>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  눌러서 사진을 추가해 주세요
                </p>
              </div>
            </Link>
          )}

          <div className={`border-b border-zinc-200/80 dark:border-zinc-800/80 ${CARD_PADDING}`}>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-[2.2rem]">
              {place.name}
            </h1>
          </div>

          <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
            <DetailRow label="지역" value={place.region} />
            <DetailRow label="주소" value={place.address} />
            <DetailRow
              label="연락처"
              value={place.phone || "아직 등록되지 않았습니다."}
            />
            <DetailRow
              label="예약/홈페이지 링크"
              value={
                place.bookingLink ? (
                  <Link
                    href={place.bookingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-500 transition hover:text-primary-400"
                  >
                    {place.bookingLink}
                  </Link>
                ) : (
                  "아직 등록되지 않았습니다."
                )
              }
            />
            <DetailRow
              label="가격 정보"
              value={place.priceInfo || "아직 등록되지 않았습니다."}
            />
            <CollapsibleInfoSection
              title="장비 정보"
              content={place.equipment}
              emptyText="아직 등록되지 않았습니다."
            />

            <section className={CARD_PADDING}>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
                사진 갤러리
              </p>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                <Link
                  href={imageEditHref}
                  className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-[16px] border border-dashed border-zinc-300 bg-[linear-gradient(180deg,rgba(249,250,251,0.92),rgba(241,245,249,0.88))] text-center text-zinc-500 transition hover:border-primary-300 hover:text-primary-700 dark:border-zinc-700 dark:bg-[linear-gradient(180deg,rgba(22,25,32,0.95),rgba(16,18,25,0.98))] dark:text-zinc-400 dark:hover:border-primary-700 dark:hover:text-primary-300 sm:h-28 sm:w-28"
                >
                  <span className="text-3xl leading-none">+</span>
                  <span className="mt-2 text-xs font-medium sm:text-sm">사진 추가</span>
                </Link>

                {galleryMedia.length > 0 ? (
                  galleryMedia.map((imageUrl) => (
                    <Link
                      key={imageUrl}
                      href={imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[16px] bg-zinc-100 dark:bg-zinc-800 sm:h-28 sm:w-28"
                    >
                      <Image
                        src={imageUrl}
                        alt={place.name}
                        fill
                        className="object-cover"
                        sizes="112px"
                        unoptimized
                      />
                    </Link>
                  ))
                ) : null}
              </div>
            </section>

            <PlaceReviewsReadOnly
              venueId={place.id}
              reviews={reviews}
              embedded
            />

            <section className={CARD_PADDING}>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
                위치 지도
              </p>
              <div className="mt-3 h-[260px] sm:h-[320px]">
                <PlaceMap
                  places={[place]}
                  selectedId={place.id}
                  selectedFocusOffset="centered"
                  showSelectedOverlay={false}
                />
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
