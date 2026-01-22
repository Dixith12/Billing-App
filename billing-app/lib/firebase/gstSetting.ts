import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

const SETTINGS_DOC_ID = 'global' // or 'gst-rates'
const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID)

interface GstSettings {
  cgst: number
  sgst: number
  updatedAt?: any
}

export const getGstRates = async (): Promise<GstSettings | null> => {
  const snap = await getDoc(settingsRef)
  if (!snap.exists()) return null
  return snap.data() as GstSettings
}

export const saveGstRates = async (cgst: number, sgst: number): Promise<void> => {
  await setDoc(settingsRef, {
    cgst,
    sgst,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}