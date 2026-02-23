"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useKakaoLoader } from "react-kakao-maps-sdk";
import { addVenue, updateVenue, getVenues, type VenueInput } from "@/lib/venues";
import { ImageUpload } from "@/components/ImageUpload";
import type { Venue } from "@/types/venue";

const NEW_REGION_VALUE = "__new_region__";

interface VenueFormProps {
  /** 수정 시 기존 데이터 전달, 없으면 신규 추가 */
  initialData?: Venue;
}

const EMPTY: VenueInput = {
  name: "",
  address: "",
  lat: 0,
  lng: 0,
  region: "",
  phone: "",
  priceInfo: "",
  equipment: "",
  imageUrl: "",
  link: "",
  tags: [],
};

export function VenueForm({ initialData }: VenueFormProps) {
  const router = useRouter();
  const [loading] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_APP_KEY ?? "",
    libraries: ["services"],
  });

  const [form, setForm] = useState<VenueInput>(() =>
    initialData
      ? {
          name: initialData.name,
          address: initialData.address,
          lat: initialData.lat,
          lng: initialData.lng,
          region: initialData.region,
          phone: initialData.phone ?? "",
          priceInfo: initialData.priceInfo ?? "",
          equipment: initialData.equipment ?? "",
          imageUrl: initialData.imageUrl ?? "",
          link: initialData.link ?? "",
          tags: initialData.tags ?? [],
        }
      : EMPTY,
  );
  const [tagInput, setTagInput] = useState("");
  const [geocoding, setGeocoding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [coordStatus, setCoordStatus] = useState<"idle" | "ok" | "fail">(
    "idle",
  );
  /** 기존 공연장에서 추출한 지역 목록 + 이번 세션에서 추가한 지역 */
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [regionSelectValue, setRegionSelectValue] = useState<string>("");
  const [newRegionInput, setNewRegionInput] = useState("");
  const [regionsLoading, setRegionsLoading] = useState(true);

  useEffect(() => {
    getVenues()
      .then((venues) => {
        const regions = Array.from(
          new Set(venues.map((v) => v.region).filter(Boolean)),
        ).sort((a, b) => a.localeCompare(b));
        setRegionOptions(regions);
        if (initialData?.region && !regions.includes(initialData.region)) {
          setRegionOptions((prev) =>
            [...prev, initialData!.region].sort((a, b) => a.localeCompare(b)),
          );
        }
        if (initialData?.region) {
          setRegionSelectValue(initialData.region);
        }
      })
      .finally(() => setRegionsLoading(false));
  }, [initialData?.region]);

  /** 폼 region과 셀렉트 동기화 */
  useEffect(() => {
    if (regionSelectValue && regionSelectValue !== NEW_REGION_VALUE) {
      setForm((prev) => ({ ...prev, region: regionSelectValue }));
    }
  }, [regionSelectValue]);

  /** 주소 입력 후 좌표 자동 변환 */
  function geocodeAddress() {
    if (!form.address) return;
    if (loading) {
      setError("카카오 지도 API 로딩 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    // kakao.maps.services 가 준비됐는지 확인
    const kakao = (
      window as unknown as { kakao?: { maps?: { services?: unknown } } }
    ).kakao;
    if (!kakao?.maps?.services) {
      setError(
        "주소 검색 서비스를 불러오지 못했습니다. 카카오 API 키와 도메인 설정을 확인해 주세요.",
      );
      return;
    }

    setGeocoding(true);
    setCoordStatus("idle");
    setError("");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const services = (window as any).kakao.maps.services;
    const geocoder = new services.Geocoder();

    geocoder.addressSearch(
      form.address,
      (result: { y: string; x: string }[], status: string) => {
        setGeocoding(false);
        if (status === services.Status.OK && result[0]) {
          setForm((prev) => ({
            ...prev,
            lat: parseFloat(result[0].y),
            lng: parseFloat(result[0].x),
          }));
          setCoordStatus("ok");
        } else {
          setCoordStatus("fail");
        }
      },
    );
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function addTag() {
    const t = tagInput.trim();
    if (!t || form.tags?.includes(t)) return;
    setForm((prev) => ({ ...prev, tags: [...(prev.tags ?? []), t] }));
    setTagInput("");
  }

  function removeTag(tag: string) {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) ?? [],
    }));
  }

  function addNewRegion() {
    const name = newRegionInput.trim();
    if (!name) return;
    if (regionOptions.includes(name)) {
      setRegionSelectValue(name);
      setNewRegionInput("");
      return;
    }
    const next = [...regionOptions, name].sort((a, b) => a.localeCompare(b));
    setRegionOptions(next);
    setRegionSelectValue(name);
    setForm((prev) => ({ ...prev, region: name }));
    setNewRegionInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.address || !form.region) {
      setError("이름, 주소, 지역은 필수 항목입니다.");
      return;
    }
    if (!form.lat || !form.lng) {
      setError("주소 검색 버튼을 눌러 좌표를 확인해 주세요.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      if (initialData) {
        await updateVenue(initialData.id, form);
        router.push(`/venues/${initialData.id}`);
      } else {
        const id = await addVenue(form);
        router.push(`/venues/${id}`);
      }
      router.refresh();
    } catch (err) {
      setError("저장 중 오류가 발생했습니다. 다시 시도해 주세요.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 이름 */}
      <Field label="공연장 이름" required>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="예) 클럽 FF"
          className={inputCls}
        />
      </Field>

      {/* 지역 */}
      <Field label="지역" required>
        <div className="space-y-2">
          <select
            name="region"
            value={
              regionSelectValue === NEW_REGION_VALUE
                ? NEW_REGION_VALUE
                : form.region || regionSelectValue
            }
            onChange={(e) => {
              const v = e.target.value;
              setRegionSelectValue(v);
              if (v !== NEW_REGION_VALUE) {
                setForm((prev) => ({ ...prev, region: v }));
              } else {
                setForm((prev) => ({ ...prev, region: "" }));
              }
            }}
            disabled={regionsLoading}
            className={inputCls}
          >
            <option value="">
              {regionsLoading ? "지역 목록 불러오는 중…" : "지역 선택"}
            </option>
            {regionOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
            <option value={NEW_REGION_VALUE}>+ 새 지역 추가</option>
          </select>
          {regionSelectValue === NEW_REGION_VALUE && (
            <div className="flex gap-2">
              <input
                value={newRegionInput}
                onChange={(e) => setNewRegionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addNewRegion();
                  }
                }}
                placeholder="예) 서울, 부산, 경기"
                className={inputCls}
                autoFocus
              />
              <button
                type="button"
                onClick={addNewRegion}
                disabled={!newRegionInput.trim()}
                className="shrink-0 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                추가
              </button>
            </div>
          )}
        </div>
      </Field>

      {/* 주소 + 좌표 변환 */}
      <Field label="주소" required>
        <div className="flex gap-2">
          <input
            name="address"
            value={form.address}
            onChange={(e) => {
              handleChange(e);
              setCoordStatus("idle");
            }}
            placeholder="도로명 또는 지번 주소"
            className={`${inputCls} flex-1`}
          />
          <button
            type="button"
            onClick={geocodeAddress}
            disabled={geocoding || loading || !form.address}
            className="shrink-0 rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-700 dark:hover:bg-zinc-600"
          >
            {geocoding ? "검색 중…" : "주소 검색"}
          </button>
        </div>
        {coordStatus === "ok" && (
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
            주소 확인 완료
          </p>
        )}
        {coordStatus === "fail" && (
          <p className="mt-1 text-xs text-red-500">
            주소를 찾을 수 없습니다. 더 정확하게 입력해 주세요.
          </p>
        )}
      </Field>

      {/* 연락처 */}
      <Field label="연락처">
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="02-0000-0000"
          className={inputCls}
        />
      </Field>

      {/* 가격 정보 */}
      <Field label="가격 정보">
        <textarea
          name="priceInfo"
          value={form.priceInfo}
          onChange={handleChange}
          rows={4}
          placeholder={`평일(월~목) : 6시간 50만원\n금,토 : 6시간 70만원\n일 : 6시간 60만원`}
          className={`${inputCls} resize-none whitespace-pre-wrap break-words overflow-auto`}
        />
      </Field>

      {/* 예약/홈페이지 */}
      <Field label="예약 / 홈페이지 URL">
        <input
          name="link"
          value={form.link}
          onChange={handleChange}
          placeholder="https://..."
          className={inputCls}
        />
      </Field>

      {/* 대표 이미지 */}
      <Field label="대표 이미지">
        <ImageUpload
          value={form.imageUrl ?? ""}
          onChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
        />
      </Field>

      {/* 장비 정보 */}
      <Field label="장비 정보">
        <textarea
          name="equipment"
          value={form.equipment}
          onChange={handleChange}
          rows={10}
          placeholder={`이렇게 작성하면 좋아요!\n\n기타\nJCM2000+1960A\n\n베이스\nMarkBass LM 250+104HF\n\n드럼\nDW Design Series 5' + 14"H/ 16",18",20"심벌`}
          className={`${inputCls} resize-none break-words overflow-auto`}
        />
      </Field>

      {/* 태그 */}
      <Field label="태그">
        <div className="flex gap-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="예) 합주실, 라이브홀"
            className={`${inputCls} flex-1`}
          />
          <button
            type="button"
            onClick={addTag}
            className="shrink-0 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            추가
          </button>
        </div>
        {form.tags && form.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {form.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="leading-none opacity-60 hover:opacity-100"
                  aria-label={`${tag} 태그 삭제`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </Field>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-500"
        >
          {submitting ? "저장 중…" : initialData ? "수정 완료" : "공연장 등록"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          취소
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full min-w-0 box-border rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
        {required && <span className="ml-1 text-amber-500">*</span>}
      </label>
      {children}
    </div>
  );
}
