import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
  type DocumentData,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { VenueReview } from "@/types/review";

function serialize(data: DocumentData): DocumentData {
  const result: DocumentData = {};
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (val && typeof val === "object" && "seconds" in val && "nanoseconds" in val) {
      result[key] = { seconds: (val as Timestamp).seconds, nanoseconds: (val as Timestamp).nanoseconds };
    } else {
      result[key] = val;
    }
  }
  return result;
}

/** 해당 공연장 리뷰 목록 조회 (최신순) */
export async function getVenueReviews(venueId: string): Promise<VenueReview[]> {
  if (!db) return [];
  const ref = collection(db, "venues", venueId, "reviews");
  const q = query(ref, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...serialize(d.data()) } as VenueReview));
}

/** 리뷰 작성 */
export async function addVenueReview(venueId: string, text: string): Promise<string> {
  if (!db) throw new Error("Firebase가 초기화되지 않았습니다.");
  const ref = collection(db, "venues", venueId, "reviews");
  const docRef = await addDoc(ref, {
    venueId,
    text: text.trim(),
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
