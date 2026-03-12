import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  getPlaceIdentityKey,
  makePlaceInputFromDraft,
  normalizeLegacyOrPlaceDocument,
} from "@/lib/place-utils";
import type { Place } from "@/types/place";
import type { SubmissionDraft } from "@/types/submission";

const VENUES_COLLECTION = "venues";
const DUPLICATE_VENUE_ERROR_MESSAGE =
  "이미 같은 이름과 주소의 장소가 등록되어 있습니다.";

async function getCollectionPlaces(
  collectionName: string
): Promise<Place[]> {
  if (!db) {
    return [];
  }

  const snapshot = await getDocs(
    query(collection(db, collectionName), orderBy("name"))
  );

  return snapshot.docs.map((item) =>
    normalizeLegacyOrPlaceDocument(item.id, item.data() as Record<string, unknown>, true)
  );
}

export async function getPlaces(): Promise<Place[]> {
  return getCollectionPlaces(VENUES_COLLECTION);
}

export async function getPlaceById(id: string): Promise<Place | null> {
  if (!db) {
    return null;
  }

  const venueSnapshot = await getDoc(doc(db, VENUES_COLLECTION, id));
  if (venueSnapshot.exists()) {
    return normalizeLegacyOrPlaceDocument(
      venueSnapshot.id,
      venueSnapshot.data() as Record<string, unknown>,
      true
    );
  }

  return null;
}

export async function getPlaceDraftBase(
  targetPlaceId?: string,
  draft?: SubmissionDraft
): Promise<Place | null> {
  const place = targetPlaceId ? await getPlaceById(targetPlaceId) : null;
  if (!place && !draft) {
    return null;
  }

  return place;
}

export function applyDraftToPlace(base: Place | null, draft: SubmissionDraft) {
  return makePlaceInputFromDraft(base, draft);
}

export async function findDuplicateVenue(
  draft: SubmissionDraft,
  excludeId?: string,
  base?: Place | null
): Promise<Place | null> {
  const identityKey = getPlaceIdentityKey(makePlaceInputFromDraft(base ?? null, draft));
  if (!identityKey) {
    return null;
  }

  const places = await getCollectionPlaces(VENUES_COLLECTION);

  return (
    places.find(
      (place) =>
        place.id !== excludeId && getPlaceIdentityKey(place) === identityKey
    ) ?? null
  );
}

export async function createVenueFromDraft(draft: SubmissionDraft): Promise<string> {
  if (!db) {
    throw new Error("Firebase가 설정되지 않았습니다.");
  }

  const duplicate = await findDuplicateVenue(draft);
  if (duplicate) {
    throw new Error(DUPLICATE_VENUE_ERROR_MESSAGE);
  }

  const payload = makePlaceInputFromDraft(null, draft);
  const docRef = await addDoc(collection(db, VENUES_COLLECTION), payload);
  return docRef.id;
}

export async function updateVenueFromDraft(
  venueId: string,
  base: Place,
  draft: SubmissionDraft
) {
  if (!db) {
    throw new Error("Firebase가 설정되지 않았습니다.");
  }

  const duplicate = await findDuplicateVenue(draft, venueId, base);
  if (duplicate) {
    throw new Error(DUPLICATE_VENUE_ERROR_MESSAGE);
  }

  const payload = makePlaceInputFromDraft(base, draft);
  await setDoc(doc(db, VENUES_COLLECTION, venueId), payload, { merge: false });
}
