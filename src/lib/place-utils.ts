import type {
  AvailabilityStatus,
  ExternalLink,
  Place,
  PlaceInput,
  PlaceType,
  VerificationStatus,
} from "@/types/place";
import type { SubmissionDraft } from "@/types/submission";
import { normalizeDateList } from "@/lib/dates";

const verificationPriority: Record<VerificationStatus, number> = {
  verified: 0,
  community: 1,
  unverified: 2,
};

const availabilityPriority: Record<AvailabilityStatus, number> = {
  open: 0,
  inquiry: 1,
  booked: 2,
  unknown: 3,
};

function normalizeString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

export function normalizePlaceIdentityText(value: unknown): string {
  return (normalizeString(value) ?? "")
    .toLocaleLowerCase("ko")
    .replace(/[(){}\[\].,·/\\_-]+/g, " ")
    .replace(/\s+/g, "")
    .trim();
}

export function getPlaceIdentityKey(place: {
  name?: string;
  address?: string;
}): string | null {
  const name = normalizePlaceIdentityText(place.name);
  const address = normalizePlaceIdentityText(place.address);

  if (!name || !address) {
    return null;
  }

  return `${name}::${address}`;
}

export function hasSamePlaceIdentity(
  left: { name?: string; address?: string },
  right: { name?: string; address?: string }
): boolean {
  const leftKey = getPlaceIdentityKey(left);
  const rightKey = getPlaceIdentityKey(right);

  return Boolean(leftKey && rightKey && leftKey === rightKey);
}

function normalizeTags(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return Array.from(
    new Set(
      values
        .map((value) => normalizeString(value))
        .filter((value): value is string => Boolean(value))
    )
  ).sort((a, b) => a.localeCompare(b, "ko"));
}

function omitUndefinedFields<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)
  ) as T;
}

export function normalizeExternalLinks(values: unknown): ExternalLink[] {
  if (!Array.isArray(values)) return [];

  return values
    .map((value) => {
      if (!value || typeof value !== "object") return null;
      const label = normalizeString((value as ExternalLink).label);
      const url = normalizeString((value as ExternalLink).url);

      if (!url) return null;

      return {
        label: label ?? "참고 링크",
        url,
      } satisfies ExternalLink;
    })
    .filter((value): value is ExternalLink => Boolean(value));
}

function normalizeIsoString(value: unknown): string | undefined {
  if (!value) return undefined;

  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "seconds" in value &&
    typeof (value as { seconds: unknown }).seconds === "number"
  ) {
    return new Date((value as { seconds: number }).seconds * 1000).toISOString();
  }

  return undefined;
}

export function normalizeLegacyOrPlaceDocument(
  id: string,
  raw: Record<string, unknown>,
  isLegacy = false
): Place {
  const link = normalizeString(raw.link);
  const bookingLink = normalizeString(raw.bookingLink) ?? link;
  const sourceLinks = normalizeExternalLinks(raw.sourceLinks);

  if (link && !sourceLinks.some((item) => item.url === link)) {
    sourceLinks.push({
      label: isLegacy ? "기존 링크" : "공식 링크",
      url: link,
    });
  }

  return {
    id,
    name: normalizeString(raw.name) ?? "이름 미정",
    placeType:
      raw.placeType === "studio" || raw.placeType === "venue"
        ? raw.placeType
        : "venue",
    region: normalizeString(raw.region) ?? "미분류",
    address: normalizeString(raw.address) ?? "",
    lat: typeof raw.lat === "number" ? raw.lat : 37.5665,
    lng: typeof raw.lng === "number" ? raw.lng : 126.978,
    description: normalizeString(raw.description),
    phone: normalizeString(raw.phone),
    priceInfo: normalizeString(raw.priceInfo),
    equipment: normalizeString(raw.equipment),
    imageUrl: normalizeString(raw.imageUrl),
    photos: Array.isArray(raw.photos)
      ? raw.photos.filter((item): item is string => typeof item === "string")
      : [],
    bookingLink,
    tags: normalizeTags(raw.tags),
    openDates: normalizeDateList(raw.openDates),
    bookedDates: normalizeDateList(raw.bookedDates),
    inquiryDates: normalizeDateList(raw.inquiryDates),
    availabilityMode:
      raw.availabilityMode === "hybrid" ||
      raw.availabilityMode === "external" ||
      raw.availabilityMode === "manual"
        ? raw.availabilityMode
        : "manual",
    availabilitySourceType:
      raw.availabilitySourceType === "calendar" ||
      raw.availabilitySourceType === "booking" ||
      raw.availabilitySourceType === "manual"
        ? raw.availabilitySourceType
        : "manual",
    availabilitySourceUrl: normalizeString(raw.availabilitySourceUrl),
    availabilityLastSyncedAt: normalizeIsoString(raw.availabilityLastSyncedAt),
    verificationStatus:
      raw.verificationStatus === "verified" ||
      raw.verificationStatus === "unverified" ||
      raw.verificationStatus === "community"
        ? raw.verificationStatus
        : isLegacy
          ? "community"
          : "unverified",
    lastVerifiedAt: normalizeIsoString(raw.lastVerifiedAt),
    lastUpdatedAt:
      normalizeIsoString(raw.lastUpdatedAt) ??
      normalizeIsoString(raw.updatedAt) ??
      normalizeIsoString(raw.createdAt),
    createdAt: normalizeIsoString(raw.createdAt),
    sourceLinks,
    isLegacy,
  };
}

export function getAvailabilityStatus(
  place: Place,
  selectedDate?: string
): AvailabilityStatus {
  if (!selectedDate) {
    return "unknown";
  }

  if (place.openDates.includes(selectedDate)) return "open";
  if (place.inquiryDates.includes(selectedDate)) return "inquiry";
  if (place.bookedDates.includes(selectedDate)) return "booked";
  return "unknown";
}

export function getAvailabilityStatusLabel(status: AvailabilityStatus): string {
  switch (status) {
    case "open":
      return "예약 가능";
    case "inquiry":
      return "문의 필요";
    case "booked":
      return "예약됨";
    default:
      return "정보 없음";
  }
}

export function getPlaceTypeLabel(placeType: PlaceType): string {
  return placeType === "studio" ? "합주실" : "공연장";
}

export function getVerificationLabel(status: VerificationStatus): string {
  switch (status) {
    case "verified":
      return "검증 완료";
    case "community":
      return "커뮤니티 제보";
    default:
      return "미검증";
  }
}

export function sortPlacesByIntent(places: Place[], selectedDate: string): Place[] {
  return [...places].sort((a, b) => {
    const availabilityDiff =
      availabilityPriority[getAvailabilityStatus(a, selectedDate)] -
      availabilityPriority[getAvailabilityStatus(b, selectedDate)];
    if (availabilityDiff !== 0) return availabilityDiff;

    const verificationDiff =
      verificationPriority[a.verificationStatus] -
      verificationPriority[b.verificationStatus];
    if (verificationDiff !== 0) return verificationDiff;

    const verifiedAtA = a.lastVerifiedAt ?? "";
    const verifiedAtB = b.lastVerifiedAt ?? "";
    if (verifiedAtA !== verifiedAtB) return verifiedAtB.localeCompare(verifiedAtA);

    const updatedAtA = a.lastUpdatedAt ?? "";
    const updatedAtB = b.lastUpdatedAt ?? "";
    if (updatedAtA !== updatedAtB) return updatedAtB.localeCompare(updatedAtA);

    return a.name.localeCompare(b.name, "ko");
  });
}

export function getRegionsByCount(places: Place[]): string[] {
  const count: Record<string, number> = {};

  for (const place of places) {
    count[place.region] = (count[place.region] ?? 0) + 1;
  }

  return Object.entries(count)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko"))
    .map(([region]) => region);
}

export function getAllTags(places: Place[]): string[] {
  return Array.from(new Set(places.flatMap((place) => place.tags))).sort((a, b) =>
    a.localeCompare(b, "ko")
  );
}

export function normalizeSubmissionDraft(draft: SubmissionDraft): SubmissionDraft {
  return {
    ...draft,
    name: normalizeString(draft.name),
    region: normalizeString(draft.region),
    address: normalizeString(draft.address),
    description: normalizeString(draft.description),
    phone: normalizeString(draft.phone),
    priceInfo: normalizeString(draft.priceInfo),
    equipment: normalizeString(draft.equipment),
    imageUrl: normalizeString(draft.imageUrl),
    bookingLink: normalizeString(draft.bookingLink),
    availabilitySourceUrl: normalizeString(draft.availabilitySourceUrl),
    tags: normalizeTags(draft.tags),
    openDates: normalizeDateList(draft.openDates),
    bookedDates: normalizeDateList(draft.bookedDates),
    inquiryDates: normalizeDateList(draft.inquiryDates),
    sourceLinks: normalizeExternalLinks(draft.sourceLinks),
  };
}

export function makePlaceInputFromDraft(
  base: Place | null,
  draft: SubmissionDraft
): PlaceInput {
  const normalizedDraft = normalizeSubmissionDraft(draft);

  return omitUndefinedFields({
    name: normalizedDraft.name ?? base?.name ?? "이름 미정",
    placeType: normalizedDraft.placeType ?? base?.placeType ?? "venue",
    region: normalizedDraft.region ?? base?.region ?? "미분류",
    address: normalizedDraft.address ?? base?.address ?? "",
    lat: normalizedDraft.lat ?? base?.lat ?? 37.5665,
    lng: normalizedDraft.lng ?? base?.lng ?? 126.978,
    description: normalizedDraft.description ?? base?.description,
    phone: normalizedDraft.phone ?? base?.phone,
    priceInfo: normalizedDraft.priceInfo ?? base?.priceInfo,
    equipment: normalizedDraft.equipment ?? base?.equipment,
    imageUrl: normalizedDraft.imageUrl ?? base?.imageUrl,
    photos: base?.photos ?? [],
    bookingLink: normalizedDraft.bookingLink ?? base?.bookingLink,
    tags: normalizedDraft.tags ?? base?.tags ?? [],
    openDates: normalizedDraft.openDates ?? base?.openDates ?? [],
    bookedDates: normalizedDraft.bookedDates ?? base?.bookedDates ?? [],
    inquiryDates: normalizedDraft.inquiryDates ?? base?.inquiryDates ?? [],
    availabilityMode:
      base?.availabilityMode ??
      (normalizedDraft.availabilitySourceType && normalizedDraft.availabilitySourceType !== "manual"
        ? "hybrid"
        : "manual"),
    availabilitySourceType:
      normalizedDraft.availabilitySourceType ??
      base?.availabilitySourceType ??
      "manual",
    availabilitySourceUrl:
      normalizedDraft.availabilitySourceUrl ?? base?.availabilitySourceUrl,
    availabilityLastSyncedAt: base?.availabilityLastSyncedAt,
    verificationStatus:
      normalizedDraft.verificationStatus ??
      base?.verificationStatus ??
      "community",
    lastVerifiedAt: base?.lastVerifiedAt,
    lastUpdatedAt: new Date().toISOString(),
    createdAt: base?.createdAt ?? new Date().toISOString(),
    sourceLinks: normalizedDraft.sourceLinks ?? base?.sourceLinks ?? [],
  });
}
