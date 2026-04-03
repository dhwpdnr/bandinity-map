import Link from "next/link";
import type { Place } from "@/types/place";
import { CoverImageUploadField } from "@/components/CoverImageUploadField";
import { VenueAddressField } from "@/components/VenueAddressField";
import { VenueRegionField } from "@/components/VenueRegionField";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, CARD_SURFACE, INPUT_BASE, LABEL_BASE } from "@/lib/ui";

interface VenueFormProps {
  action: (formData: FormData) => void | Promise<void>;
  initialPlace?: Place | null;
  submitLabel: string;
  cancelHref: string;
  regionOptions?: string[];
  compact?: boolean;
}

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  compact?: boolean;
}

const REGION_OPTIONS = [
  "홍대",
  "합정",
  "상수",
  "망원",
  "신촌",
  "이태원",
  "성수",
  "건대",
  "강남",
  "잠실",
  "방배",
  "회기",
  "혜화",
  "종로",
  "을지로",
  "문래",
  "기타",
];

function joinLines(values?: string[]) {
  return values?.join(", ") ?? "";
}

function FormSection({ title, children, compact = false }: FormSectionProps) {
  return (
    <section className={CARD_SURFACE}>
      <div className="mb-4">
        <h2
          className={`font-semibold text-zinc-100 ${
            compact ? "text-base" : "text-lg"
          }`}
        >
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export function VenueForm({
  action,
  initialPlace,
  submitLabel,
  cancelHref,
  regionOptions,
  compact = false,
}: VenueFormProps) {
  const resolvedRegionOptions = (() => {
    const source = regionOptions?.length ? regionOptions : REGION_OPTIONS;
    return initialPlace?.region
      ? Array.from(new Set([initialPlace.region, ...source]))
      : source;
  })();
  const fieldLabelClass = compact
    ? "text-[13px] font-medium text-zinc-300"
    : LABEL_BASE;
  const fieldClass = compact
    ? "w-full rounded-[10px] border border-white/14 bg-[rgba(10,14,20,0.94)] px-4 py-3 text-[13px] text-zinc-100 outline-none transition-colors duration-200 placeholder:text-zinc-500 focus:border-primary-400/75"
    : INPUT_BASE;
  const actionTextClass = compact ? "text-[13px]" : "text-sm";

  return (
    <form action={action} className="space-y-5 pb-6 md:pb-24">
      {initialPlace && <input type="hidden" name="venueId" value={initialPlace.id} />}
      <input
        type="hidden"
        name="placeType"
        value={initialPlace?.placeType ?? "venue"}
      />

      <FormSection title="기본 정보" compact={compact}>
        <div className="grid gap-4">
          <label className="space-y-2">
            <span className={fieldLabelClass}>
              공연장 이름 *
            </span>
            <input
              name="name"
              required
              defaultValue={initialPlace?.name ?? ""}
              placeholder="장소 이름"
              className={fieldClass}
            />
          </label>

          <label className="space-y-2">
            <span className={fieldLabelClass}>
              지역 *
            </span>
            <VenueRegionField
              options={resolvedRegionOptions}
              initialRegion={initialPlace?.region ?? resolvedRegionOptions[0]}
              fieldClass={fieldClass}
            />
          </label>

          <label className="space-y-2">
            <span className={fieldLabelClass}>
              주소 *
            </span>
            <VenueAddressField
              initialAddress={initialPlace?.address}
              initialLat={initialPlace?.lat}
              initialLng={initialPlace?.lng}
            />
          </label>
        </div>
      </FormSection>

      <FormSection title="운영 정보" compact={compact}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className={fieldLabelClass}>
              연락처
            </span>
            <input
              name="phone"
              defaultValue={initialPlace?.phone ?? ""}
              placeholder="전화번호 또는 DM 링크"
              className={fieldClass}
            />
          </label>

          <label className="space-y-2">
            <span className={fieldLabelClass}>
              예약/홈페이지 URL
            </span>
            <input
              name="bookingLink"
              defaultValue={initialPlace?.bookingLink ?? ""}
              placeholder="https://..."
              className={fieldClass}
            />
          </label>
        </div>

        <div className="mt-4 space-y-2">
          <span className={fieldLabelClass}>
            대표 이미지
          </span>
          <div id="image-url">
            <CoverImageUploadField initialImageUrl={initialPlace?.imageUrl} />
          </div>
        </div>

        <div className="mt-4 grid gap-4">
          <label className="space-y-2">
            <span className={fieldLabelClass}>
              가격 정보
            </span>
            <textarea
              name="priceInfo"
              rows={6}
              defaultValue={initialPlace?.priceInfo ?? ""}
              placeholder={"평일(월~목) : 6시간 50만원\n금,토 : 6시간 70만원\n일 : 6시간 60만원"}
              className={fieldClass}
            />
          </label>

          <label className="space-y-2">
            <span className={fieldLabelClass}>
              장비 정보
            </span>
            <textarea
              name="equipment"
              rows={6}
              defaultValue={initialPlace?.equipment ?? ""}
              placeholder={"이렇게 작성하면 좋아요!\n\n기타\nJCM2000+1960A\n\n베이스\nMarkBass LM 250+104HF\n\n드럼\nDW Design Series 5' + 14\"H/ 16\",18\",20\"심벌"}
              className={fieldClass}
            />
          </label>

          <label className="space-y-2">
            <span className={fieldLabelClass}>
              태그
            </span>
            <input
              name="tags"
              defaultValue={joinLines(initialPlace?.tags)}
              placeholder="라이브, 대관, 녹음"
              className={fieldClass}
            />
          </label>
        </div>
      </FormSection>

      {/* 모바일: 스크롤 끝에서만 노출되어 필드와 겹치지 않음 */}
      <div className="mt-8 border-t border-white/10 pt-5 md:hidden">
        <div className="flex w-full items-stretch justify-between gap-2">
          <Link
            href={cancelHref}
            className={`${BUTTON_SECONDARY} shrink-0 ${actionTextClass}`}
          >
            취소
          </Link>
          <button
            type="submit"
            className={`${BUTTON_PRIMARY} flex-1 px-5 ${actionTextClass}`}
          >
            {submitLabel}
          </button>
        </div>
      </div>

      {/* 데스크톱: 하단 고정으로 빠른 제출 */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 hidden px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:block">
        <div className="pointer-events-auto mx-auto max-w-6xl">
          <div className="rounded-[20px] border border-white/12 bg-[rgba(11,14,20,0.96)] p-3 shadow-[0_12px_28px_-20px_rgba(0,0,0,0.72)] backdrop-blur">
            <div className="flex w-full items-stretch justify-between gap-2">
              <Link
                href={cancelHref}
                className={`${BUTTON_SECONDARY} shrink-0 ${actionTextClass}`}
              >
                취소
              </Link>
              <button
                type="submit"
                className={`${BUTTON_PRIMARY} flex-1 px-5 ${actionTextClass}`}
              >
                {submitLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
