import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'
import { v4 as uuid } from 'crypto'

function shortUuid(): string {
  return Math.random().toString(36).substring(2, 10)
}

/**
 * Upload a File/Blob to Firebase Storage under uid-scoped path.
 * Returns the public download URL.
 */
export async function uploadMedia(
  blob: Blob,
  uid: string,
  type: 'image' | 'audio'
): Promise<string> {
  const ext     = type === 'image' ? 'jpg' : 'webm'
  const path    = `reports/${uid}/${type}_${shortUuid()}.${ext}`
  const storageRef = ref(storage, path)

  const metadata = {
    contentType: type === 'image' ? 'image/jpeg' : 'audio/webm',
    customMetadata: { uploadedBy: uid },
  }

  await uploadBytes(storageRef, blob, metadata)
  return getDownloadURL(storageRef)
}