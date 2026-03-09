import type { Place } from "@/types/place";

interface AdminPlaceEditorProps {
  place: Place;
  saveAction: (formData: FormData) => void | Promise<void>;
  syncAction: (formData: FormData) => void | Promise<void>;
}

function serializeLinks(place: Place) {
  return place.sourceLinks.map((link) => `${link.label}|${link.url}`).join("\n");
}

export function AdminPlaceEditor({
  place,
  saveAction,
  syncAction,
}: AdminPlaceEditorProps) {
  return (
    <div className="space-y-5">
      <form action={saveAction} className="space-y-5">
        <input type="hidden" name="placeId" value={place.id} />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              장소 이름
            </span>
            <input
              name="name"
              defaultValue={place.name}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              장소 유형
            </span>
            <select
              name="placeType"
              defaultValue={place.placeType}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="venue">공연장</option>
              <option value="studio">합주실</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              지역
            </span>
            <input
              name="region"
              defaultValue={place.region}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              검증 상태
            </span>
            <select
              name="verificationStatus"
              defaultValue={place.verificationStatus}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="unverified">미검증</option>
              <option value="community">커뮤니티 제보</option>
              <option value="verified">검증 완료</option>
            </select>
          </label>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            주소
          </span>
          <input
            name="address"
            defaultValue={place.address}
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              위도
            </span>
            <input
              name="lat"
              defaultValue={place.lat}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              경도
            </span>
            <input
              name="lng"
              defaultValue={place.lng}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            예약 링크
            </span>
            <input
              name="bookingLink"
              defaultValue={place.bookingLink}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              대표 이미지 URL
            </span>
            <input
              name="imageUrl"
              defaultValue={place.imageUrl}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              연락처
            </span>
            <input
              name="phone"
              defaultValue={place.phone}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              설명
            </span>
            <textarea
              name="description"
              rows={3}
              defaultValue={place.description}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              가격 정보
            </span>
            <textarea
              name="priceInfo"
              rows={4}
              defaultValue={place.priceInfo}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              장비 정보
            </span>
            <textarea
              name="equipment"
              rows={4}
              defaultValue={place.equipment}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              가용성 소스 유형
            </span>
            <select
              name="availabilitySourceType"
              defaultValue={place.availabilitySourceType}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="manual">수동</option>
              <option value="calendar">공개 캘린더</option>
              <option value="booking">예약 페이지</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              가용성 소스 URL
            </span>
            <input
              name="availabilitySourceUrl"
              defaultValue={place.availabilitySourceUrl}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              예약 가능 날짜
            </span>
            <textarea
              name="openDates"
              rows={5}
              defaultValue={place.openDates.join("\n")}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              예약됨
            </span>
            <textarea
              name="bookedDates"
              rows={5}
              defaultValue={place.bookedDates.join("\n")}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              문의 필요
            </span>
            <textarea
              name="inquiryDates"
              rows={5}
              defaultValue={place.inquiryDates.join("\n")}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              태그
            </span>
            <textarea
              name="tags"
              rows={4}
              defaultValue={place.tags.join("\n")}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              출처 링크
            </span>
            <textarea
              name="sourceLinks"
              rows={4}
              defaultValue={serializeLinks(place)}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
        </div>

        <button
          type="submit"
          className="rounded-[8px] bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
        >
          장소 저장
        </button>
      </form>

      <form action={syncAction}>
        <input type="hidden" name="placeId" value={place.id} />
        <button
          type="submit"
          className="rounded-[8px] border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:border-primary-300 hover:text-primary-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-primary-700 dark:hover:text-primary-300"
        >
          공개 .ics 캘린더 동기화 실행
        </button>
      </form>
    </div>
  );
}
