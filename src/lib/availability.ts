import "server-only";

import type { AvailabilitySourceType, Place } from "@/types/place";
import { normalizeDateList } from "@/lib/dates";

export interface AvailabilitySyncResult {
  openDates: string[];
  bookedDates: string[];
  inquiryDates: string[];
  syncedAt: string;
}

interface AvailabilityProvider {
  supports(place: Place): boolean;
  sync(place: Place): Promise<AvailabilitySyncResult>;
}

async function syncFromIcs(place: Place): Promise<AvailabilitySyncResult> {
  if (!place.availabilitySourceUrl) {
    throw new Error("공개 캘린더 URL이 없습니다.");
  }

  const response = await fetch(place.availabilitySourceUrl, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`캘린더를 불러오지 못했습니다. (${response.status})`);
  }

  const text = await response.text();
  const bookedDates = Array.from(
    new Set(
      [...text.matchAll(/DTSTART(?:;VALUE=DATE)?:([0-9]{8})/g)].map((match) => {
        const raw = match[1]!;
        return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
      })
    )
  ).sort();

  return {
    openDates: [],
    bookedDates: normalizeDateList(bookedDates),
    inquiryDates: [],
    syncedAt: new Date().toISOString(),
  };
}

const providers: AvailabilityProvider[] = [
  {
    supports(place) {
      return (
        place.availabilitySourceType === "calendar" &&
        Boolean(place.availabilitySourceUrl?.toLowerCase().endsWith(".ics"))
      );
    },
    sync: syncFromIcs,
  },
];

export function canSyncAvailability(sourceType: AvailabilitySourceType): boolean {
  return sourceType === "calendar";
}

export async function syncPlaceAvailability(place: Place) {
  const provider = providers.find((item) => item.supports(place));

  if (!provider) {
    throw new Error(
      "현재 자동 동기화는 공개 .ics 캘린더 URL이 연결된 장소만 지원합니다."
    );
  }

  return provider.sync(place);
}
