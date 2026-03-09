import "server-only";

export const serverEnv = {
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  adminSessionSecret: process.env.ADMIN_SESSION_SECRET ?? "",
  firebaseAdminProjectId:
    process.env.FIREBASE_ADMIN_PROJECT_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
    "",
  firebaseAdminClientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL ?? "",
  firebaseAdminPrivateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "",
};

export function hasAdminCredentials(): boolean {
  return Boolean(
    serverEnv.firebaseAdminProjectId &&
      serverEnv.firebaseAdminClientEmail &&
      serverEnv.firebaseAdminPrivateKey
  );
}

export function hasAdminSessionConfig(): boolean {
  return Boolean(serverEnv.adminPassword && serverEnv.adminSessionSecret);
}

export function getMissingAdminEnvKeys(): string[] {
  const keys: string[] = [];

  if (!serverEnv.adminPassword) keys.push("ADMIN_PASSWORD");
  if (!serverEnv.adminSessionSecret) keys.push("ADMIN_SESSION_SECRET");
  if (!serverEnv.firebaseAdminProjectId)
    keys.push("FIREBASE_ADMIN_PROJECT_ID");
  if (!serverEnv.firebaseAdminClientEmail)
    keys.push("FIREBASE_ADMIN_CLIENT_EMAIL");
  if (!serverEnv.firebaseAdminPrivateKey)
    keys.push("FIREBASE_ADMIN_PRIVATE_KEY");

  return keys;
}
