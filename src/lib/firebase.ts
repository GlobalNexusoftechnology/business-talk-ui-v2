/**
 * Firebase app + Cloud Messaging initialisation.
 *
 * All config values are read from environment variables so they stay
 * out of source control.  Add a .env.local with:
 *
 *   NEXT_PUBLIC_FIREBASE_API_KEY=...
 *   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
 *   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
 *   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
 *   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
 *   NEXT_PUBLIC_FIREBASE_APP_ID=...
 *   NEXT_PUBLIC_FIREBASE_VAPID_KEY=...
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getMessaging, type Messaging } from 'firebase/messaging';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
};

export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? '';

/** Returns the singleton Firebase app (safe to call multiple times). */
export const getFirebaseApp = (): FirebaseApp => {
  if (getApps().length) return getApps()[0];
  return initializeApp(firebaseConfig);
};

/**
 * Returns a Firebase Messaging instance.
 * Only available in browser contexts — returns null on SSR.
 */
export const getFirebaseMessaging = (): Messaging | null => {
  if (typeof window === 'undefined') return null;
  // FCM requires `messagingSenderId` to be present
  if (!firebaseConfig.messagingSenderId) return null;
  try {
    return getMessaging(getFirebaseApp());
  } catch {
    return null;
  }
};
