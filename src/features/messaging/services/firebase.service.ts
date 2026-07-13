import { type App, cert, getApps, initializeApp } from "firebase-admin/app";
import { readFileSync } from "node:fs";

import { config } from "@/config.ts";
import { logger } from "@/lib/logger.ts";

let firebaseApp: App | undefined;

export function getFirebaseApp(): App | undefined {
  return firebaseApp ?? getApps()[0];
}

export function initializeFirebase(): void {
  if (getApps().length > 0) {
    firebaseApp = getApps()[0];
    return;
  }

  if (!config.firebase.credentialsPath) {
    logger.warn(
      "GOOGLE_APPLICATION_CREDENTIALS not set, Firebase will not be initialized."
    );
    return;
  }

  try {
    const credentials = JSON.parse(
      readFileSync(config.firebase.credentialsPath, "utf8")
    ) as Record<string, string>;
    firebaseApp = initializeApp({ credential: cert(credentials) });
    logger.info("Firebase initialized.");
  } catch (error) {
    logger.warn("Failed to initialize Firebase.", error);
  }
}

export function isFirebaseInitialized(): boolean {
  return getApps().length > 0;
}
