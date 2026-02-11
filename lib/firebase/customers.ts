// lib/firebase/customers.ts

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
  DocumentData,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

export interface Customer {
  id: string;
  name: string;
  companyName?: string;
  gstin?: string;
  phone: string;
  address: string;
  state: string;
  openingBalance?: number; // positive = debit (customer owes), negative = credit (you owe)
  createdAt?: Timestamp;
}

const customersRef = collection(db, "customers");

const isPhoneExists = async (
  phone: string,
  excludeId?: string
): Promise<boolean> => {
  const q = query(customersRef, where("phone", "==", phone));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return false;

  // If updating, allow same document
  if (excludeId) {
    return snapshot.docs.some((doc) => doc.id !== excludeId);
  }

  return true;
};

// Helper: removes undefined fields (Firestore hates undefined)
function removeUndefinedFields<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  ) as Partial<T>;
}

export const addCustomer = async (
  data: Omit<Customer, "id" | "createdAt">
): Promise<Customer> => {
  const now = Timestamp.now();

  // 🔒 CHECK DUPLICATE PHONE
  const phoneExists = await isPhoneExists(data.phone);
  if (phoneExists) {
    throw new Error("CUSTOMER_PHONE_EXISTS");
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
    const docRef = await addDoc(customersRef, safeData);

    return {
      id: docRef.id,
      ...preparedData,
    };
  } catch (err) {
    console.error("Failed to add customer:", err);
    throw err;
  }
};


export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const q = query(customersRef, orderBy("name"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((snap) => {
      const data = snap.data() as Omit<Customer, "id">;
      return {
        id: snap.id,
        ...data,
        // Ensure openingBalance is number (in case of null from firestore)
        openingBalance: typeof data.openingBalance === "number" ? data.openingBalance : undefined,
      };
    });
  } catch (err) {
    console.error("Failed to fetch customers:", err);
    throw err;
  }
};

export const updateCustomer = async (
  id: string,
  data: Partial<Omit<Customer, "id" | "createdAt">>
): Promise<void> => {
  const customerDoc = doc(db, "customers", id);

  // 🔒 If phone is being updated, check uniqueness
  if (data.phone) {
    const phoneExists = await isPhoneExists(data.phone, id);
    if (phoneExists) {
      throw new Error("CUSTOMER_PHONE_EXISTS");
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
    await updateDoc(customerDoc, safeUpdates);
  } catch (err) {
    console.error(`Failed to update customer ${id}:`, err);
    throw err;
  }
};


export const deleteCustomer = async (id: string): Promise<void> => {
  const customerDoc = doc(db, "customers", id);
  try {
    await deleteDoc(customerDoc);
  } catch (err) {
    console.error(`Failed to delete customer ${id}:`, err);
    throw err;
  }
};