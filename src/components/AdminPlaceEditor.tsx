import type { Place } from "@/types/place";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, CARD_SURFACE, INPUT_BASE, LABEL_BASE } from "@/lib/ui";

const fieldClass = INPUT_BASE;
const labelClass = LABEL_BASE;

interface AdminPlaceEditorProps {
  place: Place;
  saveAction: (formData: FormData) => void | Promise<void>;
  syncAction: (formData: FormData) => void | Promise<void>;
}

function serializeLinks(place: Place) {
  return place.sourceLinks.map((link) => `${link.label}|${link.url}`).join("\n");
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={CARD_SURFACE}>
      <h2 className="mb-4 text-base font-semibold text-zinc-100">
        {title}
      </h2>
      {children}
    </section>
  );
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

        <FormSection title="기본 정보">
          <div className="grid gap-4">
            <label className="space-y-2">
              <span className={labelClass}>공연장 이름 *</span>
              <input
                name="name"
                required
                defaultValue={place.name}
                placeholder="장소 이름"
                className={fieldClass}
              />
            </label>
            <label className="space-y-2">
              <span className={labelClass}>지역 *</span>
              <input
                name="region"
                required
                defaultValue={place.region}
                placeholder="홍대, 합정, 성수, 기타 등"
                className={fieldClass}
              />
            </label>
            <label className="space-y-2">
              <span className={labelClass}>주소 *</span>
              <input
                name="address"
                required
                defaultValue={place.address}
                placeholder="도로명 또는 지번 주소"
                className={fieldClass}
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className={labelClass}>위도</span>
                <input
                  name="lat"
                  type="number"
                  step="any"
                  defaultValue={place.lat}
                  className={fieldClass}
                />
              </label>
              <label className="space-y-2">
                <span className={labelClass}>경도</span>
                <input
                  name="lng"
                  type="number"
                  step="any"
                  defaultValue={place.lng}
                  className={fieldClass}
                />
              </label>
            </div>
          </div>
        </FormSection>

        <FormSection title="운영 정보">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className={labelClass}>연락처</span>
              <input
                name="phone"
                defaultValue={place.phone ?? ""}
                placeholder="전화번호 또는 DM 링크"
                className={fieldClass}
              />
            </label>
            <label className="space-y-2">
              <span className={labelClass}>예약/홈페이지 URL</span>
              <input
                name="bookingLink"
                defaultValue={place.bookingLink ?? ""}
                placeholder="https://..."
                className={fieldClass}
              />
            </label>
          </div>
          <label className="mt-4 block space-y-2">
            <span className={labelClass}>대표 이미지</span>
            <input
              name="imageUrl"
              defaultValue={place.imageUrl ?? ""}
              placeholder="이미지 URL"
              className={fieldClass}
            />
          </label>
          <div className="mt-4 grid gap-4">
            <label className="space-y-2">
              <span className={labelClass}>가격 정보</span>
              <textarea
                name="priceInfo"
                rows={6}
                defaultValue={place.priceInfo ?? ""}
                placeholder={"평일(월~목) : 6시간 50만원\n금,토 : 6시간 70만원\n일 : 6시간 60만원"}
                className={fieldClass}
              />
            </label>
            <label className="space-y-2">
              <span className={labelClass}>장비 정보</span>
              <textarea
                name="equipment"
                rows={6}
                defaultValue={place.equipment ?? ""}
                placeholder={"이렇게 작성하면 좋아요!\n\n기타, 베이스, 드럼 등"}
                className={fieldClass}
              />
            </label>
            <label className="space-y-2">
              <span className={labelClass}>태그</span>
              <input
                name="tags"
                defaultValue={place.tags.join(", ")}
                placeholder="라이브, 대관, 녹음"
                className={fieldClass}
              />
            </label>
          </div>
        </FormSection>

        <FormSection title="관리자 전용">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className={labelClass}>장소 유형</span>
              <select
                name="placeType"
                defaultValue={place.placeType}
                className={fieldClass}
              >
                <option value="venue">공연장</option>
                <option value="studio">합주실</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className={labelClass}>검증 상태</span>
              <select
                name="verificationStatus"
                defaultValue={place.verificationStatus}
                className={fieldClass}
              >
                <option value="unverified">미검증</option>
                <option value="community">커뮤니티 제보</option>
                <option value="verified">검증 완료</option>
              </select>
            </label>
          </div>
          <label className="mt-4 block space-y-2">
            <span className={labelClass}>설명</span>
            <textarea
              name="description"
              rows={3}
              defaultValue={place.description ?? ""}
              className={fieldClass}
            />
          </label>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className={labelClass}>가용성 소스 유형</span>
              <select
                name="availabilitySourceType"
                defaultValue={place.availabilitySourceType}
                className={fieldClass}
              >
                <option value="manual">수동</option>
                <option value="calendar">공개 캘린더</option>
                <option value="booking">예약 페이지</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className={labelClass}>가용성 소스 URL</span>
              <input
                name="availabilitySourceUrl"
                defaultValue={place.availabilitySourceUrl ?? ""}
                className={fieldClass}
              />
            </label>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="space-y-2">
              <span className={labelClass}>예약 가능 날짜</span>
              <textarea
                name="openDates"
                rows={5}
                defaultValue={place.openDates.join("\n")}
                placeholder="YYYY-MM-DD 한 줄에 하나"
                className={fieldClass}
              />
            </label>
            <label className="space-y-2">
              <span className={labelClass}>예약됨</span>
              <textarea
                name="bookedDates"
                rows={5}
                defaultValue={place.bookedDates.join("\n")}
                className={fieldClass}
              />
            </label>
            <label className="space-y-2">
              <span className={labelClass}>문의 필요</span>
              <textarea
                name="inquiryDates"
                rows={5}
                defaultValue={place.inquiryDates.join("\n")}
                className={fieldClass}
              />
            </label>
          </div>
          <label className="mt-4 block space-y-2">
            <span className={labelClass}>출처 링크</span>
            <textarea
              name="sourceLinks"
              rows={4}
              defaultValue={serializeLinks(place)}
              placeholder="레이블|URL 한 줄에 하나"
              className={fieldClass}
            />
          </label>
        </FormSection>

        <button
          type="submit"
          className={BUTTON_PRIMARY}
        >
          장소 저장
        </button>
      </form>

      <div className="rounded-[20px] border border-white/10 bg-[rgba(11,14,20,0.92)] p-4">
        <form action={syncAction}>
          <input type="hidden" name="placeId" value={place.id} />
          <button
            type="submit"
            className={BUTTON_SECONDARY}
          >
            공개 .ics 캘린더 동기화 실행
          </button>
        </form>
      </div>
    </div>
  );
}
