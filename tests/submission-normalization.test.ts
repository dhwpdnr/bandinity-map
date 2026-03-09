import test from "node:test";
import assert from "node:assert/strict";
import { makePlaceInputFromDraft } from "@/lib/place-utils";
import type { Place } from "@/types/place";

const basePlace: Place = {
  id: "place-1",
  name: "원본",
  placeType: "venue",
  region: "홍대",
  address: "서울 마포구",
  lat: 37.5,
  lng: 126.9,
  tags: ["공연장"],
  openDates: [],
  bookedDates: ["2026-03-10"],
  inquiryDates: [],
  availabilityMode: "manual",
  availabilitySourceType: "manual",
  verificationStatus: "community",
  sourceLinks: [],
  photos: [],
  createdAt: "2026-03-01T00:00:00.000Z",
  lastUpdatedAt: "2026-03-01T00:00:00.000Z",
};

test("makePlaceInputFromDraft overwrites only provided fields", () => {
  const nextPlace = makePlaceInputFromDraft(basePlace, {
    name: "수정본",
    openDates: ["2026-03-09"],
    bookedDates: [],
  });

  assert.equal(nextPlace.name, "수정본");
  assert.deepEqual(nextPlace.openDates, ["2026-03-09"]);
  assert.deepEqual(nextPlace.bookedDates, []);
  assert.equal(nextPlace.address, basePlace.address);
});

test("makePlaceInputFromDraft omits undefined optional fields for firestore", () => {
  const nextPlace = makePlaceInputFromDraft(
    {
      ...basePlace,
      description: undefined,
      phone: undefined,
    },
    {
      name: "수정본",
    }
  );

  assert.equal("description" in nextPlace, false);
  assert.equal("phone" in nextPlace, false);
});
