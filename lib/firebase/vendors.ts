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
  where,
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


const isVendorPhoneExists = async (phone: string): Promise<boolean> => {
  const q = query(vendorsRef, where("phone", "==", phone));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

const isVendorPhoneUsedByAnother = async (
  phone: string,
  currentId: string
): Promise<boolean> => {
  const q = query(vendorsRef, where("phone", "==", phone));
  const snapshot = await getDocs(q);

  return snapshot.docs.some((doc) => doc.id !== currentId);
};



export const addVendor = async (
  data: Omit<Vendor, "id" | "createdAt">
): Promise<Vendor> => {
  const now = Timestamp.now();

  const phoneExists = await isVendorPhoneExists(data.phone);
  if (phoneExists) {
    throw new Error("VENDOR_PHONE_EXISTS");
  }

  const preparedData = {
    ...data,
    openingBalance:
      data.openingBalance !== undefined
        ? Number(data.openingBalance)
        : undefined,
    createdAt: now,
  };

  const safeData = removeUndefinedFields(preparedData);

  try {
    const docRef = await addDoc(vendorsRef, safeData);

    return {
      id: docRef.id,
      ...preparedData,
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

  if (data.phone) {
    const phoneExists = await isVendorPhoneUsedByAnother(data.phone, id);
    if (phoneExists) {
      throw new Error("VENDOR_PHONE_EXISTS");
    }
  }

  const preparedUpdates = {
    ...data,
    ...(data.openingBalance !== undefined && {
      openingBalance: Number(data.openingBalance) || 0,
    }),
  };

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