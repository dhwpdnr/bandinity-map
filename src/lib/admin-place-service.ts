import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { syncPlaceAvailability } from "@/lib/availability";
import { getPlaceById } from "@/lib/places";
import { applyDraftToPlace } from "@/lib/places";
import type { Place } from "@/types/place";
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
