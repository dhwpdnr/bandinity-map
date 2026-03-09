import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { hasAdminCredentials, serverEnv } from "@/lib/server-env";

let adminDbInstance: ReturnType<typeof getFirestore> | null = null;

export function getAdminDb() {
  if (!hasAdminCredentials()) {
    return null;
  }

  if (!adminDbInstance) {
    const app =
      getApps()[0] ??
      initializeApp({
        credential: cert({
          projectId: serverEnv.firebaseAdminProjectId,
          clientEmail: serverEnv.firebaseAdminClientEmail,
          privateKey: serverEnv.firebaseAdminPrivateKey.replace(/\\n/g, "\n"),
        }),
      });

    adminDbInstance = getFirestore(app);
  }

  return adminDbInstance;
}
