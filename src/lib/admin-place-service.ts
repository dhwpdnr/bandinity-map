import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { syncPlaceAvailability } from "@/lib/availability";
import { getPlaceById } from "@/lib/places";
import { applyDraftToPlace } from "@/lib/places";
import type { Place } from "@/types/place";
import type { VenueReview } from "@/types/review";
import type { PlaceSubmission, SubmissionStatus } from "@/types/submission";

const VENUES_COLLECTION = "venues";
const SUBMISSIONS_COLLECTION = "placeSubmissions";

function assertAdminDb() {
  const adminDb = getAdminDb();
  if (!adminDb) {
    throw new Error(
      "Firebase Admin SDK가 설정되지 않았습니다. 관리자 서비스 계정 환경 변수를 확인해 주세요."
    );
  }

  return adminDb;
}

export async function getAdminPlace(placeId: string): Promise<Place | null> {
  return getPlaceById(placeId);
}

export async function listAdminSubmissions(): Promise<PlaceSubmission[]> {
  const adminDb = assertAdminDb();
  const snapshot = await adminDb
    .collection(SUBMISSIONS_COLLECTION)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((docSnapshot) => ({
    id: docSnapshot.id,
    ...(docSnapshot.data() as Omit<PlaceSubmission, "id">),
  }));
}

export async function saveAdminPlace(place: Place): Promise<void> {
  const adminDb = assertAdminDb();

  await adminDb.collection(VENUES_COLLECTION).doc(place.id).set({
    ...place,
    isLegacy: false,
    lastUpdatedAt: new Date().toISOString(),
  });
}

export async function decideSubmission(
  submissionId: string,
  nextStatus: Extract<SubmissionStatus, "approved" | "rejected">,
  rejectionReason?: string
): Promise<void> {
  const adminDb = assertAdminDb();
  const submissionRef = adminDb.collection(SUBMISSIONS_COLLECTION).doc(submissionId);
  const submissionSnapshot = await submissionRef.get();

  if (!submissionSnapshot.exists) {
    throw new Error("제보를 찾을 수 없습니다.");
  }

  const submission = {
    id: submissionSnapshot.id,
    ...(submissionSnapshot.data() as Omit<PlaceSubmission, "id">),
  } satisfies PlaceSubmission;

  if (nextStatus === "approved") {
    const base = submission.targetPlaceId
      ? await getPlaceById(submission.targetPlaceId)
      : null;

    const nextPlace = applyDraftToPlace(base, submission.draft);
    const placeId = submission.targetPlaceId || submissionId;

    await adminDb.collection(VENUES_COLLECTION).doc(placeId).set({
      ...nextPlace,
      id: placeId,
      lastUpdatedAt: new Date().toISOString(),
      createdAt: base?.createdAt ?? new Date().toISOString(),
      verificationStatus: nextPlace.verificationStatus || "community",
    });
  }

  await submissionRef.update({
    status: nextStatus,
    rejectionReason: rejectionReason?.trim() || null,
    decidedAt: new Date().toISOString(),
    decidedBy: "admin",
    auditTrail: FieldValue.arrayUnion({
      action: nextStatus,
      operator: "admin",
      timestamp: new Date().toISOString(),
    }),
  });
}

export async function syncAvailabilityForAdminPlace(placeId: string): Promise<void> {
  const adminDb = assertAdminDb();
  const place = await getPlaceById(placeId);

  if (!place) {
    throw new Error("장소를 찾을 수 없습니다.");
  }

  const result = await syncPlaceAvailability(place);

  const nextOpenDates =
    place.openDates.length > 0 ? place.openDates : result.openDates;
  const nextBookedDates =
    place.bookedDates.length > 0 ? place.bookedDates : result.bookedDates;
  const nextInquiryDates =
    place.inquiryDates.length > 0 ? place.inquiryDates : result.inquiryDates;

  await adminDb.collection(VENUES_COLLECTION).doc(placeId).set(
    {
      ...place,
      openDates: nextOpenDates,
      bookedDates: nextBookedDates,
      inquiryDates: nextInquiryDates,
      availabilityLastSyncedAt: result.syncedAt,
      lastUpdatedAt: new Date().toISOString(),
      isLegacy: false,
    },
    { merge: true }
  );
}

/** 공연장 문서 및 하위 리뷰 서브컬렉션 삭제 */
export async function deleteAdminPlace(placeId: string): Promise<void> {
  const adminDb = assertAdminDb();

  const venueRef = adminDb.collection(VENUES_COLLECTION).doc(placeId);
  const venueSnap = await venueRef.get();
  if (!venueSnap.exists) {
    throw new Error("장소를 찾을 수 없습니다.");
  }

  const reviewsRef = venueRef.collection("reviews");
  const reviewsSnap = await reviewsRef.get();
  const batch = adminDb.batch();
  reviewsSnap.docs.forEach((doc) => batch.delete(doc.ref));
  batch.delete(venueRef);
  await batch.commit();
}

function normalizeAdminReview(
  id: string,
  venueId: string,
  raw: Record<string, unknown>
): VenueReview {
  const createdAt =
    typeof raw.createdAt === "string"
      ? raw.createdAt
      : raw.createdAt &&
          typeof raw.createdAt === "object" &&
          "toDate" in raw.createdAt &&
          typeof (raw.createdAt as { toDate: () => Date }).toDate === "function"
        ? (raw.createdAt as { toDate: () => Date }).toDate().toISOString()
        : undefined;

  return {
    id,
    venueId,
    text: typeof raw.text === "string" ? raw.text : "",
    createdAt,
  };
}

/** 전체 리뷰 목록 (collection group 쿼리) */
export async function listAdminReviews(): Promise<VenueReview[]> {
  const adminDb = assertAdminDb();

  const snapshot = await adminDb.collectionGroup("reviews").get();

  const reviews: VenueReview[] = [];
  snapshot.docs.forEach((doc) => {
    const path = doc.ref.path;
    const parts = path.split("/");
    const venueIndex = parts.indexOf("venues");
    const venueId =
      venueIndex >= 0 && parts[venueIndex + 1] ? parts[venueIndex + 1] : "";
    reviews.push(
      normalizeAdminReview(doc.id, venueId, doc.data() as Record<string, unknown>)
    );
  });

  reviews.sort((a, b) => {
    const aAt = a.createdAt ?? "";
    const bAt = b.createdAt ?? "";
    return bAt.localeCompare(aAt);
  });

  return reviews;
}

/** 리뷰 한 건 삭제 */
export async function deleteAdminReview(
  venueId: string,
  reviewId: string
): Promise<void> {
  const adminDb = assertAdminDb();

  const reviewRef = adminDb
    .collection(VENUES_COLLECTION)
    .doc(venueId)
    .collection("reviews")
    .doc(reviewId);

  const snap = await reviewRef.get();
  if (!snap.exists) {
    throw new Error("리뷰를 찾을 수 없습니다.");
  }

  await reviewRef.delete();
}
