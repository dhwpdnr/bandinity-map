import { addDoc, collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { VenueReview } from "@/types/review";

function normalizeReview(
  id: string,
  raw: Record<string, unknown>
): VenueReview {
  const createdAt =
    typeof raw.createdAt === "string"
      ? raw.createdAt
      : raw.createdAt &&
          typeof raw.createdAt === "object" &&
          "seconds" in raw.createdAt &&
          typeof (raw.createdAt as { seconds: unknown }).seconds === "number"
        ? new Date(
            (raw.createdAt as { seconds: number }).seconds * 1000
          ).toISOString()
        : undefined;

  return {
    id,
    venueId: typeof raw.venueId === "string" ? raw.venueId : "",
    text: typeof raw.text === "string" ? raw.text : "",
    createdAt,
  };
}

async function readReviews(
  collectionName: "venues",
  placeId: string
): Promise<VenueReview[]> {
  if (!db) return [];
  const snapshot = await getDocs(
    query(
      collection(db, collectionName, placeId, "reviews"),
      orderBy("createdAt", "desc")
    )
  );

  return snapshot.docs.map((item) =>
    normalizeReview(item.id, item.data() as Record<string, unknown>)
  );
}

export async function getPlaceReviews(placeId: string): Promise<VenueReview[]> {
  return readReviews("venues", placeId);
}

export async function createVenueReview(venueId: string, text: string): Promise<string> {
  if (!db) {
    throw new Error("Firebase가 설정되지 않았습니다.");
  }

  const normalizedText = text.trim();
  if (!normalizedText) {
    throw new Error("리뷰 내용을 입력해 주세요.");
  }

  const docRef = await addDoc(collection(db, "venues", venueId, "reviews"), {
    venueId,
    text: normalizedText,
    createdAt: new Date().toISOString(),
  });

  return docRef.id;
}
