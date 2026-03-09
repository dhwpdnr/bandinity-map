"use client";

import { useState } from "react";
import type { Place } from "@/types/place";
import type { PlaceSubmissionType } from "@/types/submission";

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

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            제보 유형
          </span>
          <select
            name="submissionType"
            value={submissionType}
            onChange={(event) =>
              setSubmissionType(event.target.value as PlaceSubmissionType)
            }
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="create">새 장소 제보</option>
            <option value="edit">기존 정보 수정</option>
            <option value="availability_update">가용성 업데이트</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            대상 장소
          </span>
          <select
            name="targetPlaceId"
            value={selectedPlaceId}
            onChange={(event) => setSelectedPlaceId(event.target.value)}
            disabled={!requiresTarget}
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900"
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
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            제보자 이름 *
          </span>
          <input
            name="submitterName"
            required
            placeholder="닉네임 또는 이름"
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            연락처
          </span>
          <input
            name="submitterContact"
            placeholder="이메일 또는 연락 가능한 SNS"
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            장소 유형
          </span>
          <select
            name="placeType"
            defaultValue="venue"
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="venue">공연장</option>
            <option value="studio">합주실</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            지역
          </span>
          <input
            name="region"
            placeholder="예: 홍대, 강남, 성수"
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          장소 이름
        </span>
        <input
          name="name"
          placeholder="장소 이름"
          className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          주소
        </span>
        <input
          name="address"
          placeholder="도로명 또는 지번 주소"
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
            inputMode="decimal"
            placeholder="37.5665"
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            경도
          </span>
          <input
            name="lng"
            inputMode="decimal"
            placeholder="126.9780"
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
            placeholder="https://..."
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            대표 이미지 URL
          </span>
          <input
            name="imageUrl"
            placeholder="https://..."
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
            placeholder="전화번호 또는 DM 링크"
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            가격 정보
          </span>
          <textarea
            name="priceInfo"
            rows={3}
            placeholder="예: 평일 6시간 40만원"
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            장비 정보
          </span>
          <textarea
            name="equipment"
            rows={4}
            placeholder="앰프, 드럼, PA 등"
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            설명
          </span>
          <textarea
            name="description"
            rows={4}
            placeholder="분위기, 수용 인원, 운영 메모"
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
            rows={3}
            placeholder="쉼표 또는 줄바꿈으로 구분"
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            참고 링크
          </span>
          <textarea
            name="sourceLinks"
            rows={3}
            placeholder="한 줄에 하나씩, `라벨|URL` 형식 또는 URL만 입력"
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
            rows={4}
            placeholder="YYYY-MM-DD 형식, 쉼표 또는 줄바꿈 구분"
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            예약된 날짜
          </span>
          <textarea
            name="bookedDates"
            rows={4}
            placeholder="YYYY-MM-DD 형식"
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            문의 필요 날짜
          </span>
          <textarea
            name="inquiryDates"
            rows={4}
            placeholder="YYYY-MM-DD 형식"
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
            defaultValue="manual"
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
            placeholder="공개 캘린더(.ics) 또는 예약 페이지 URL"
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          상세 설명 / 수정 요청
        </span>
        <textarea
          name="message"
          rows={5}
          placeholder="확인한 출처, 수정 이유, 참고할 내용을 자유롭게 적어 주세요."
          className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <div className="rounded-3xl border border-zinc-200/80 bg-zinc-50/90 px-4 py-4 text-sm leading-6 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
        모든 공개 입력은 바로 반영되지 않고 관리자 승인 후 반영됩니다. 출처 링크와 날짜 형식을 함께 남길수록
        승인 속도가 빨라집니다.
      </div>

      <button
        type="submit"
        className="w-full rounded-[8px] bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
      >
        제보 등록
      </button>
    </form>
  );
}
