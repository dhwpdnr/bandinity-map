import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { hasPublicFirestoreConfig, publicEnv } from "@/lib/public-env";

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;

if (hasPublicFirestoreConfig()) {
  appInstance = getApps().length
    ? getApps()[0]!
    : initializeApp(publicEnv.firebaseConfig);
  dbInstance = getFirestore(appInstance);
}

export const app = appInstance;
export const db = dbInstance;
