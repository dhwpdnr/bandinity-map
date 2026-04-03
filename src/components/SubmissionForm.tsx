"use client";

import { useState } from "react";
import type { Place } from "@/types/place";
import type { PlaceSubmissionType } from "@/types/submission";
import { BUTTON_PRIMARY, INPUT_BASE, LABEL_BASE } from "@/lib/ui";

interface SubmissionFormProps {
  places: Place[];
  initialSubmissionType: PlaceSubmissionType;
  initialTargetPlaceId?: string;
  action: (formData: FormData) => void | Promise<void>;
}

export function SubmissionForm({
  places,
  initialSubmissionType,
  initialTargetPlaceId,
  action,
}: SubmissionFormProps) {
  const [submissionType, setSubmissionType] =
    useState<PlaceSubmissionType>(initialSubmissionType);
  const [selectedPlaceId, setSelectedPlaceId] = useState(initialTargetPlaceId ?? "");

  const requiresTarget = submissionType !== "create";
  const labelClass = LABEL_BASE;
  const inputClass = INPUT_BASE;

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className={labelClass}>
            제보 유형
          </span>
          <select
            name="submissionType"
            value={submissionType}
            onChange={(event) =>
              setSubmissionType(event.target.value as PlaceSubmissionType)
            }
            className={inputClass}
          >
            <option value="create">새 장소 제보</option>
            <option value="edit">기존 정보 수정</option>
            <option value="availability_update">가용성 업데이트</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className={labelClass}>
            대상 장소
          </span>
          <select
            name="targetPlaceId"
            value={selectedPlaceId}
            onChange={(event) => setSelectedPlaceId(event.target.value)}
            disabled={!requiresTarget}
            className={`${inputClass} disabled:opacity-50`}
          >
            <option value="">선택 안 함</option>
            {places.map((place) => (
              <option key={place.id} value={place.id}>
                {place.name} · {place.region}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className={labelClass}>
            제보자 이름 *
          </span>
          <input
            name="submitterName"
            required
            placeholder="닉네임 또는 이름"
            className={inputClass}
          />
        </label>

        <label className="space-y-2">
          <span className={labelClass}>
            연락처
          </span>
          <input
            name="submitterContact"
            placeholder="이메일 또는 연락 가능한 SNS"
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className={labelClass}>
            장소 유형
          </span>
          <select
            name="placeType"
            defaultValue="venue"
            className={inputClass}
          >
            <option value="venue">공연장</option>
            <option value="studio">합주실</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className={labelClass}>
            지역
          </span>
          <input
            name="region"
            placeholder="예: 홍대, 강남, 성수"
            className={inputClass}
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className={labelClass}>
          장소 이름
        </span>
        <input
          name="name"
          placeholder="장소 이름"
          className={inputClass}
        />
      </label>

      <label className="space-y-2">
        <span className={labelClass}>
          주소
        </span>
        <input
          name="address"
          placeholder="도로명 또는 지번 주소"
          className={inputClass}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className={labelClass}>
            위도
          </span>
          <input
            name="lat"
            inputMode="decimal"
            placeholder="37.5665"
            className={inputClass}
          />
        </label>
        <label className="space-y-2">
          <span className={labelClass}>
            경도
          </span>
          <input
            name="lng"
            inputMode="decimal"
            placeholder="126.9780"
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className={labelClass}>
            예약 링크
          </span>
          <input
            name="bookingLink"
            placeholder="https://..."
            className={inputClass}
          />
        </label>
        <label className="space-y-2">
          <span className={labelClass}>
            대표 이미지 URL
          </span>
          <input
            name="imageUrl"
            placeholder="https://..."
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className={labelClass}>
            연락처
          </span>
          <input
            name="phone"
            placeholder="전화번호 또는 DM 링크"
            className={inputClass}
          />
        </label>
        <label className="space-y-2">
          <span className={labelClass}>
            가격 정보
          </span>
          <textarea
            name="priceInfo"
            rows={3}
            placeholder="예: 평일 6시간 40만원"
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className={labelClass}>
            장비 정보
          </span>
          <textarea
            name="equipment"
            rows={4}
            placeholder="앰프, 드럼, PA 등"
            className={inputClass}
          />
        </label>
        <label className="space-y-2">
          <span className={labelClass}>
            설명
          </span>
          <textarea
            name="description"
            rows={4}
            placeholder="분위기, 수용 인원, 운영 메모"
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className={labelClass}>
            태그
          </span>
          <textarea
            name="tags"
            rows={3}
            placeholder="쉼표 또는 줄바꿈으로 구분"
            className={inputClass}
          />
        </label>
        <label className="space-y-2">
          <span className={labelClass}>
            참고 링크
          </span>
          <textarea
            name="sourceLinks"
            rows={3}
            placeholder="한 줄에 하나씩, `라벨|URL` 형식 또는 URL만 입력"
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className={labelClass}>
            예약 가능 날짜
          </span>
          <textarea
            name="openDates"
            rows={4}
            placeholder="YYYY-MM-DD 형식, 쉼표 또는 줄바꿈 구분"
            className={inputClass}
          />
        </label>
        <label className="space-y-2">
          <span className={labelClass}>
            예약된 날짜
          </span>
          <textarea
            name="bookedDates"
            rows={4}
            placeholder="YYYY-MM-DD 형식"
            className={inputClass}
          />
        </label>
        <label className="space-y-2">
          <span className={labelClass}>
            문의 필요 날짜
          </span>
          <textarea
            name="inquiryDates"
            rows={4}
            placeholder="YYYY-MM-DD 형식"
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className={labelClass}>
            가용성 소스 유형
          </span>
          <select
            name="availabilitySourceType"
            defaultValue="manual"
            className={inputClass}
          >
            <option value="manual">수동</option>
            <option value="calendar">공개 캘린더</option>
            <option value="booking">예약 페이지</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className={labelClass}>
            가용성 소스 URL
          </span>
          <input
            name="availabilitySourceUrl"
            placeholder="공개 캘린더(.ics) 또는 예약 페이지 URL"
            className={inputClass}
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className={labelClass}>
          상세 설명 / 수정 요청
        </span>
        <textarea
          name="message"
          rows={5}
          placeholder="확인한 출처, 수정 이유, 참고할 내용을 자유롭게 적어 주세요."
          className={inputClass}
        />
      </label>

      <div className="rounded-[20px] border border-white/10 bg-[rgba(16,21,30,0.86)] px-4 py-4 text-sm leading-6 text-zinc-300">
        모든 공개 입력은 바로 반영되지 않고 관리자 승인 후 반영됩니다. 출처 링크와 날짜 형식을 함께 남길수록
        승인 속도가 빨라집니다.
      </div>

      <button
        type="submit"
        className={`${BUTTON_PRIMARY} w-full`}
      >
        제보 등록
      </button>
    </form>
  );
}
