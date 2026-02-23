import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  type DocumentData,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Venue } from "@/types/venue";

export type VenueInput = Omit<Venue, "id" | "createdAt" | "updatedAt">;

const VENUES_COLLECTION = "venues";

/** Firestore Timestamp 등 직렬화 불가 객체를 plain object로 변환 */
function serialize(data: DocumentData): DocumentData {
  const result: DocumentData = {};
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (val && typeof val === "object" && "seconds" in val && "nanoseconds" in val) {
      // Firestore Timestamp → { seconds, nanoseconds } plain object
      result[key] = { seconds: (val as Timestamp).seconds, nanoseconds: (val as Timestamp).nanoseconds };
    } else {
      result[key] = val;
    }
  }
  return result;
}

/** 공연장 목록 조회 (지역 필터 optional) */
export async function getVenues(region?: string): Promise<Venue[]> {
  if (!db) return [];
  const q = query(collection(db, VENUES_COLLECTION), orderBy("name"));
  const snapshot = await getDocs(q);
  let list = snapshot.docs.map((d) => ({ id: d.id, ...serialize(d.data()) } as Venue));
  if (region) list = list.filter((v) => v.region === region);
  return list;
}

/** 공연장 단건 조회 */
export async function getVenueById(id: string): Promise<Venue | null> {
  if (!db) return null;
  const ref = doc(db, VENUES_COLLECTION, id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...serialize(snapshot.data()) } as Venue;
}

/** 공연장 추가 */
export async function addVenue(data: VenueInput): Promise<string> {
  const ref = await addDoc(collection(db, VENUES_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** 공연장 수정 */
export async function updateVenue(id: string, data: Partial<VenueInput>): Promise<void> {
  const ref = doc(db, VENUES_COLLECTION, id);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
