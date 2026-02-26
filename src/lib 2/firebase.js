import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { VENUES_COLLECTION } from './venueSchema';

// Your web app's Firebase configuration
// Replace with your actual config from Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/**
 * 공연장 문서: 필드 정의는 src/lib/venueSchema.js 참고
 */
export async function getVenues() {
  try {
    const venuesCol = collection(db, VENUES_COLLECTION);
    const snapshot = await getDocs(venuesCol);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn('Firebase getVenues failed (check config):', e?.message);
    return [];
  }
};

/**
 * 새 공연장 추가. name, location 만 필수.
 */
export async function addVenue(data) {
  const payload = {
    name: data.name?.trim() || '',
    location: data.location?.trim() || '',
    ...(data.lat != null && data.lat !== '' && { lat: Number(data.lat) }),
    ...(data.lng != null && data.lng !== '' && { lng: Number(data.lng) }),
    ...(data.naverMapUrl?.trim() && { naverMapUrl: data.naverMapUrl.trim() }),
    ...(Array.isArray(data.images) && data.images.length > 0 && { images: data.images }),
    ...(data.capacity != null && data.capacity !== '' && { capacity: Number(data.capacity) }),
    ...(data.type?.trim() && { type: data.type.trim() }),
    ...(Array.isArray(data.equipment) && { equipment: data.equipment }),
    ...(data.overview?.trim() && { overview: data.overview.trim() }),
    ...(data.tips?.trim() && { tips: data.tips.trim() }),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, VENUES_COLLECTION), payload);
  return { id: ref.id, ...payload };
}

/**
 * 공연장 수정. 변경된 필드만 넘겨도 됨.
 */
export async function updateVenue(id, data) {
  const ref = doc(db, VENUES_COLLECTION, id);
  const payload = { updatedAt: serverTimestamp() };
  if (data.name !== undefined) payload.name = String(data.name).trim();
  if (data.location !== undefined) payload.location = String(data.location).trim();
  if (data.lat !== undefined) payload.lat = data.lat === '' ? null : Number(data.lat);
  if (data.lng !== undefined) payload.lng = data.lng === '' ? null : Number(data.lng);
  if (data.naverMapUrl !== undefined) payload.naverMapUrl = data.naverMapUrl?.trim() || null;
  if (data.images !== undefined) payload.images = Array.isArray(data.images) ? data.images : [];
  if (data.capacity !== undefined) payload.capacity = data.capacity === '' ? null : Number(data.capacity);
  if (data.type !== undefined) payload.type = data.type?.trim() || null;
  if (data.equipment !== undefined) payload.equipment = Array.isArray(data.equipment) ? data.equipment : [];
  if (data.overview !== undefined) payload.overview = data.overview?.trim() || null;
  if (data.tips !== undefined) payload.tips = data.tips?.trim() || null;
  await updateDoc(ref, payload);
  return { id, ...payload };
}
