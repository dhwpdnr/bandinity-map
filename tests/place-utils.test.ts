import test from "node:test";
import assert from "node:assert/strict";
import {
  getAvailabilityStatus,
  getPlaceIdentityKey,
  hasSamePlaceIdentity,
  normalizeLegacyOrPlaceDocument,
  sortPlacesByIntent,
} from "@/lib/place-utils";
import type { Place } from "@/types/place";

function createPlace(overrides: Partial<Place>): Place {
  return {
    id: overrides.id ?? "place-1",
    name: overrides.name ?? "테스트 장소",
    placeType: overrides.placeType ?? "venue",
    region: overrides.region ?? "홍대",
    address: overrides.address ?? "서울 마포구",
    lat: overrides.lat ?? 37.5,
    lng: overrides.lng ?? 126.9,
    tags: overrides.tags ?? [],
    openDates: overrides.openDates ?? [],
    bookedDates: overrides.bookedDates ?? [],
    inquiryDates: overrides.inquiryDates ?? [],
    availabilityMode: overrides.availabilityMode ?? "manual",
    availabilitySourceType: overrides.availabilitySourceType ?? "manual",
    verificationStatus: overrides.verificationStatus ?? "community",
    sourceLinks: overrides.sourceLinks ?? [],
    photos: overrides.photos ?? [],
    lastVerifiedAt: overrides.lastVerifiedAt,
    lastUpdatedAt: overrides.lastUpdatedAt,
    createdAt: overrides.createdAt,
    description: overrides.description,
    phone: overrides.phone,
    priceInfo: overrides.priceInfo,
    equipment: overrides.equipment,
    imageUrl: overrides.imageUrl,
    bookingLink: overrides.bookingLink,
    availabilitySourceUrl: overrides.availabilitySourceUrl,
    availabilityLastSyncedAt: overrides.availabilityLastSyncedAt,
  };
}

test("getAvailabilityStatus prioritizes explicit date buckets", () => {
  const place = createPlace({
    openDates: ["2026-03-09"],
    inquiryDates: ["2026-03-10"],
    bookedDates: ["2026-03-11"],
  });

  assert.equal(getAvailabilityStatus(place, "2026-03-09"), "open");
  assert.equal(getAvailabilityStatus(place, "2026-03-10"), "inquiry");
  assert.equal(getAvailabilityStatus(place, "2026-03-11"), "booked");
  assert.equal(getAvailabilityStatus(place, "2026-03-12"), "unknown");
});

test("sortPlacesByIntent ranks availability then verification then recency", () => {
  const places = [
    createPlace({
      id: "booked",
      bookedDates: ["2026-03-09"],
      verificationStatus: "verified",
    }),
    createPlace({
      id: "open-community",
      openDates: ["2026-03-09"],
      verificationStatus: "community",
      lastUpdatedAt: "2026-03-10T00:00:00.000Z",
    }),
    createPlace({
      id: "open-verified",
      openDates: ["2026-03-09"],
      verificationStatus: "verified",
      lastUpdatedAt: "2026-03-08T00:00:00.000Z",
    }),
  ];

  assert.deepEqual(
    sortPlacesByIntent(places, "2026-03-09").map((place) => place.id),
    ["open-verified", "open-community", "booked"]
  );
});

test("normalizeLegacyOrPlaceDocument maps legacy venue link into booking/source fields", () => {
  const place = normalizeLegacyOrPlaceDocument(
    "legacy-1",
    {
      name: "레거시 공연장",
      region: "홍대",
      address: "서울",
      lat: 37.5,
      lng: 126.9,
      link: "https://example.com",
    },
    true
  );

  assert.equal(place.placeType, "venue");
  assert.equal(place.bookingLink, "https://example.com");
  assert.equal(place.sourceLinks[0]?.url, "https://example.com");
  assert.equal(place.verificationStatus, "community");
});

test("getPlaceIdentityKey normalizes whitespace and punctuation", () => {
  assert.equal(
    getPlaceIdentityKey({
      name: " 클럽케이서울-라운지 ",
      address: "서울시 강남구 선릉로 524",
    }),
    getPlaceIdentityKey({
      name: "클럽케이서울 라운지",
      address: "서울시 강남구 선릉로524",
    })
  );
});

test("hasSamePlaceIdentity detects duplicates by normalized name and address", () => {
  assert.equal(
    hasSamePlaceIdentity(
      {
        name: "MGM",
        address: "서울특별시 송파구 방이동 23-2",
      },
      {
        name: "  mgm ",
        address: "서울특별시 송파구 방이동23-2",
      }
    ),
    true
  );

  assert.equal(
    hasSamePlaceIdentity(
      {
        name: "MGM",
        address: "서울특별시 송파구 방이동 23-2",
      },
      {
        name: "MGM",
        address: "서울특별시 송파구 방이동 23-3",
      }
    ),
    false
  );
});
