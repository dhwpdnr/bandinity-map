"use client";

import { useEffect, useRef, useState } from "react";
import { useKakaoLoader } from "react-kakao-maps-sdk";
import { publicEnv } from "@/lib/public-env";

interface VenueAddressFieldProps {
  initialAddress?: string;
  initialLat?: number;
  initialLng?: number;
}

function normalizeAddress(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function VenueAddressField({
  initialAddress = "",
  initialLat,
  initialLng,
}: VenueAddressFieldProps) {
  const [loading, error] = useKakaoLoader({
    appkey: publicEnv.kakaoAppKey,
    libraries: ["services"],
  });
  const [address, setAddress] = useState(initialAddress);
  const [lat, setLat] = useState(initialLat?.toString() ?? "");
  const [lng, setLng] = useState(initialLng?.toString() ?? "");
  const [resolvedAddress, setResolvedAddress] = useState(
    initialAddress && initialLat && initialLng ? normalizeAddress(initialAddress) : ""
  );
  const [status, setStatus] = useState<{
    kind: "idle" | "success" | "error";
    message: string;
  }>({
    kind: "idle",
    message: "",
  });
  const [isSearching, setIsSearching] = useState(false);
  const geocoderRef = useRef<kakao.maps.services.Geocoder | null>(null);

  useEffect(() => {
    if (loading || error || typeof window === "undefined") {
      return;
    }

    if (window.kakao?.maps?.services) {
      geocoderRef.current = new window.kakao.maps.services.Geocoder();
    }
  }, [loading, error]);

  const normalizedCurrentAddress = normalizeAddress(address);
  const isResolved = Boolean(
    normalizedCurrentAddress &&
      resolvedAddress &&
      normalizedCurrentAddress === resolvedAddress &&
      lat &&
      lng
  );

  function handleAddressChange(nextAddress: string) {
    setAddress(nextAddress);

    if (normalizeAddress(nextAddress) === resolvedAddress) {
      setStatus({
        kind: "success",
        message: "주소 확인 완료",
      });
      return;
    }

    setStatus({
      kind: "error",
      message: nextAddress.trim() ? "주소 확인이 필요합니다." : "",
    });
  }

  function handleAddressSearch() {
    const geocoder = geocoderRef.current;

    if (!normalizedCurrentAddress) {
      setStatus({
        kind: "error",
        message: "주소 확인이 필요합니다.",
      });
      return;
    }

    if (!geocoder || typeof window === "undefined") {
      setStatus({
        kind: "error",
        message: "주소 확인이 필요합니다.",
      });
      return;
    }

    setIsSearching(true);
    setStatus({ kind: "idle", message: "" });

    geocoder.addressSearch(normalizedCurrentAddress, (results, searchStatus) => {
      setIsSearching(false);

      if (
        searchStatus !== window.kakao.maps.services.Status.OK ||
        !results ||
        results.length === 0
      ) {
        setStatus({
          kind: "error",
          message: "주소를 다시 확인해 주세요.",
        });
        return;
      }

      const firstResult = results[0];
      setLat(firstResult.y);
      setLng(firstResult.x);
      setResolvedAddress(normalizedCurrentAddress);
      setStatus({
        kind: "success",
        message: "주소 확인 완료",
      });
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          name="address"
          required
          value={address}
          onChange={(event) => handleAddressChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleAddressSearch();
            }
          }}
          placeholder="도로명 또는 지번 주소"
          className="min-w-0 flex-1 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="button"
          onClick={handleAddressSearch}
          disabled={isSearching || loading}
          className="shrink-0 rounded-[8px] border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:border-primary-300 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-primary-700 dark:hover:text-primary-300"
        >
          {isSearching ? "검색 중" : "주소 검색"}
        </button>
      </div>

      <input type="hidden" name="lat" value={lat} />
      <input type="hidden" name="lng" value={lng} />
      <input type="hidden" name="addressResolved" value={isResolved ? "1" : "0"} />

      {status.message && (
        <p
          className={`text-sm ${
            status.kind === "error"
              ? "text-rose-600 dark:text-rose-300"
              : status.kind === "success"
                ? "text-emerald-600 dark:text-emerald-300"
                : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          {status.message}
        </p>
      )}
    </div>
  );
}
