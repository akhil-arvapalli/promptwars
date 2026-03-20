import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDocs,
  type DocumentData,
} from 'firebase/firestore'
import { db } from './firebase'
import type { GeminiFloodAnalysis } from './gemini'

export interface FloodReport {
  uid: string
  reporterEmail: string
  imageUrl: string | null
  audioUrl: string | null
  transcript: string
  textDescription: string
  geminiResult: GeminiFloodAnalysis
  createdAt: ReturnType<typeof serverTimestamp>
}

const COLLECTION = 'flood_reports'

/** Save a new analysis report â€” returns the document ID */
export async function saveFloodReport(
  report: Omit<FloodReport, 'createdAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...report,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

/** Fetch the 10 most recent community reports */
export async function getRecentReports(): Promise<DocumentData[]> {
  const q = query(
    collection(db, COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(10)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}