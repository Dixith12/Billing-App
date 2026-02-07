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
} from "firebase/firestore";

import { db } from "@/lib/firebase";

// Updated interface with HSN Code
export interface InventoryItem {
  id: string;
  name: string;
  measurementType: "height_width" | "kg" | "unit";
  height?: number;
  width?: number;
  kg?: number;
  units?: number;
  pricePerHeight?: number;
  pricePerWidth?: number;
  pricePerKg?: number;
  pricePerUnit?: number;
  hsnCode?: string | null; // ← NEW FIELD (optional)
  createdAt?: any; // Timestamp or Date
  // Add any other fields you already have...
}

const inventoryRef = collection(db, "inventory");

// 🔥 LIST (realtime)
export function listenInventory(callback: (items: InventoryItem[]) => void) {
  const q = query(inventoryRef, orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    console.log("📦 Firestore snapshot:", snapshot.docs.length);
    const items: InventoryItem[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<InventoryItem, "id">),
    }));
    callback(items);
  });
}

// ➕ ADD
export async function addInventory(
  item: Omit<InventoryItem, "id" | "createdAt">,
) {
  console.log("🚀 addInventory CALLED", item);

  const safeItem = {
    ...item,
    hsnCode: item.hsnCode ? item.hsnCode.trim() : null, // clean up HSN
    createdAt: serverTimestamp(),
  };

  await addDoc(inventoryRef, safeItem);

  console.log("Firestore write finished");
}

// ✏️ UPDATE
export async function updateInventory(
  id: string,
  data: Partial<Omit<InventoryItem, "id" | "createdAt">>,
) {
  const updateData = {
    ...data,
    // Clean HSN on update too
    ...(data.hsnCode !== undefined && {
      hsnCode:
        typeof data.hsnCode === "string" ? data.hsnCode.trim() || null : null,
    }),
  };

  await updateDoc(doc(db, "inventory", id), updateData);
}

// 🗑 DELETE
export async function deleteInventory(id: string) {
  await deleteDoc(doc(db, "inventory", id));
}
