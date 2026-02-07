// lib/firebase/vendors.ts

import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase"; // adjust path if your firebase init is elsewhere

export interface Vendor {
  id: string;
  name: string;
  companyName?: string;
  gstin?: string;
  phone: string;
  address: string;
  state: string;
  openingBalance?: number;          // positive = debit (vendor owes us), negative = credit (we owe vendor)
  createdAt?: Timestamp;
}

const vendorsRef = collection(db, "vendors");

// Helper to remove undefined fields (Firestore does not allow undefined values)
function removeUndefinedFields<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  ) as Partial<T>;
}

export const addVendor = async (
  data: Omit<Vendor, "id" | "createdAt">
): Promise<Vendor> => {
  const now = Timestamp.now();

  const preparedData = {
    ...data,
    openingBalance: data.openingBalance !== undefined ? Number(data.openingBalance) : undefined,
    createdAt: now,
  };

  // Remove any undefined fields
  const safeData = removeUndefinedFields(preparedData);

  try {
    const docRef = await addDoc(vendorsRef, safeData);

    return {
      id: docRef.id,
      ...preparedData, // return original prepared data (with possible undefined for local state)
    };
  } catch (err) {
    console.error("Failed to add vendor:", err);
    throw err;
  }
};

export const getVendors = async (): Promise<Vendor[]> => {
  try {
    const q = query(vendorsRef, orderBy("name"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((snap) => {
      const data = snap.data() as Omit<Vendor, "id">;
      return {
        id: snap.id,
        ...data,
        // Ensure openingBalance is number (in case of null from Firestore)
        openingBalance: typeof data.openingBalance === "number" ? data.openingBalance : undefined,
      };
    });
  } catch (err) {
    console.error("Failed to fetch vendors:", err);
    throw err;
  }
};

export const updateVendor = async (
  id: string,
  data: Partial<Omit<Vendor, "id" | "createdAt">>
): Promise<void> => {
  const vendorDoc = doc(db, "vendors", id);

  // Clean updates
  const preparedUpdates = {
    ...data,
    ...(data.openingBalance !== undefined && {
      openingBalance: Number(data.openingBalance) || 0,
    }),
  };

  // Remove undefined fields
  const safeUpdates = removeUndefinedFields(preparedUpdates);

  try {
    await updateDoc(vendorDoc, safeUpdates);
  } catch (err) {
    console.error(`Failed to update vendor ${id}:`, err);
    throw err;
  }
};

export const deleteVendor = async (id: string): Promise<void> => {
  const vendorDoc = doc(db, "vendors", id);
  try {
    await deleteDoc(vendorDoc);
  } catch (err) {
    console.error(`Failed to delete vendor ${id}:`, err);
    throw err;
  }
};