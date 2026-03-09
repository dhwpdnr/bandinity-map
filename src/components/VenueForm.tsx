import Link from "next/link";
import type { Place } from "@/types/place";
import { CoverImageUploadField } from "@/components/CoverImageUploadField";
import { VenueAddressField } from "@/components/VenueAddressField";

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
    <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4">
        <h2
          className={`font-semibold text-zinc-900 dark:text-zinc-100 ${
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
    ? "text-[13px] font-medium text-zinc-700 dark:text-zinc-300"
    : "text-sm font-medium text-zinc-700 dark:text-zinc-300";
  const fieldClass = compact
    ? "w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-[13px] outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
    : "w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900";
  const actionTextClass = compact ? "text-[13px]" : "text-sm";

  return (
    <form action={action} className="space-y-5 pb-24">
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
            <select
              name="region"
              required
              defaultValue={initialPlace?.region ?? "홍대"}
              className={fieldClass}
            >
              {resolvedRegionOptions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
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

      <div className="fixed inset-x-4 bottom-4 z-20 md:sticky md:bottom-4 md:inset-x-auto">
        <div className="rounded-[24px] border border-zinc-200 bg-white/96 p-3 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/96">
          <div className="flex justify-end">
            <div className="flex w-full items-stretch justify-end gap-2 sm:w-auto sm:min-w-[360px]">
              <Link
                href={cancelHref}
                className={`inline-flex shrink-0 items-center justify-center rounded-[8px] border border-zinc-200 px-4 py-3 font-medium text-zinc-700 transition hover:border-primary-300 hover:text-primary-700 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-primary-700 dark:hover:text-primary-300 ${actionTextClass}`}
              >
                취소
              </Link>
              <button
                type="submit"
                className={`flex-1 rounded-[8px] bg-primary-400 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-primary-300 ${actionTextClass}`}
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
