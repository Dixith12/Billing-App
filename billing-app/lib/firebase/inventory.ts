import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '@/lib/firebase'
import { InventoryItem } from '@/lib/types'

const inventoryRef = collection(db, 'inventory')

// 🔥 LIST (realtime)
export function listenInventory(
  callback: (items: InventoryItem[]) => void
) {
  const q = query(inventoryRef, orderBy('createdAt', 'desc'))

  return onSnapshot(q, (snapshot) => {
    console.log('📦 Firestore snapshot:', snapshot.docs.length)
    const items: InventoryItem[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<InventoryItem, 'id'>),
    }))
    callback(items)
  })
}

// ➕ ADD
export async function addInventory(item: any) {
  console.log("🚀 addInventory CALLED", item)

  await addDoc(collection(db, "inventory"), {
    ...item,
    createdAt: serverTimestamp(),
  })

  console.log("✅ Firestore write finished")
}

// ✏️ UPDATE
export async function updateInventory(
  id: string,
  data: Omit<InventoryItem, 'id' | 'createdAt'>
) {
  await updateDoc(doc(db, 'inventory', id), data)
}

// 🗑 DELETE
export async function deleteInventory(id: string) {
  await deleteDoc(doc(db, 'inventory', id))
}
