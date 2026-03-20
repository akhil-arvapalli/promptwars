import { initializeApp, getApps, getApp } from 'firebase/app'
import { getStorage } from 'firebase/storage'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}

// Singleton pattern â€” safe for Next.js hot-reload
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const storage = getStorage(app)
export const db      = getFirestore(app)

/**
 * Returns a lightweight guest identity for no-auth mode.
 */
export function getGuestIdentity(): { uid: string; email: string } {
  const rand = Math.random().toString(36).slice(2, 10)
  return {
    uid: `guest_${rand}`,
    email: `guest_${rand}@jalpath.local`,
  }
}