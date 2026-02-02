import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase";
import type { InvoiceProduct } from "@/lib/firebase/invoices";
import { cleanUndefined } from "@/lib/utils/invoiceUtil";

export interface Purchase {
  id: string;
  purchaseNumber: number;
  vendorId: string;
  vendorName: string;
  vendorPhone?: string;
  vendorGstin?: string;
  vendorState?: string;
  billingAddress: string;
  products: InvoiceProduct[];
  subtotal: number;
  discount: number;
  cgst: number;
  sgst: number;
  igst: number;
  netAmount: number;
  totalGross?: number; // 👈 ADD THIS


  // ── Added / updated fields for consistency with UI & other documents ──
  purchaseDate?: Date;     // ← UI sends Date, stored as Date in returned object
  createdAt?: Date;
  updatedAt?: Date;
}

const purchasesRef = collection(db, "purchases");
const purchaseCounterRef = doc(db, "counters", "purchaseNumber");

export const getNextPurchaseNumber = async (): Promise<number> => {
  return await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(purchaseCounterRef);
    let newNumber = 1;
    if (counterSnap.exists()) {
      const data = counterSnap.data();
      const current = data?.current ?? 0;
      newNumber = current + 1;
    }
    transaction.set(purchaseCounterRef, { current: newNumber }, { merge: true });
    return newNumber;
  });
};

export const addPurchase = async (
  data: Omit<Purchase, "id" | "purchaseNumber" | "createdAt" | "updatedAt">,
): Promise<Purchase> => {
  const nextNumber = await getNextPurchaseNumber();
  const now = Timestamp.now();

  const safeData = cleanUndefined({
    ...data,
    purchaseNumber: nextNumber,
    vendorState:data.vendorState?.trim()||"Karnataka",
  });

  const payload = {
  ...safeData,
  totalGross: data.totalGross ?? data.netAmount,

  // ✅ SAVE USER-SELECTED PURCHASE DATE
  purchaseDate: data.purchaseDate
    ? Timestamp.fromDate(new Date(data.purchaseDate))
    : now,

  // system metadata
  createdAt: now,
  updatedAt: now,
};



  const docRef = await addDoc(purchasesRef, payload);

  return {
    id: docRef.id,
    ...safeData,
    purchaseNumber: nextNumber,
    createdAt: now.toDate(),
    updatedAt: now.toDate(),
  };
};

export const getPurchases = async (): Promise<Purchase[]> => {
  const q = query(purchasesRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((snap) => {
    const data = snap.data() as any;

    return {
      id: snap.id,
      ...data,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : data.createdAt instanceof Date
          ? data.createdAt
          : undefined,

      updatedAt:
        data.updatedAt instanceof Timestamp
          ? data.updatedAt.toDate()
          : data.updatedAt instanceof Date
          ? data.updatedAt
          : undefined,

      purchaseDate:
        data.purchaseDate instanceof Timestamp
          ? data.purchaseDate.toDate()
          : data.purchaseDate instanceof Date
          ? data.purchaseDate
          : undefined,
    };
  });
};


export const updatePurchase = async (
  id: string,
  data: Partial<Omit<Purchase, "id" | "purchaseNumber" | "createdAt" | "updatedAt">>,
): Promise<void> => {
  const purchaseDoc = doc(db, "purchases", id);
  const safeUpdates = cleanUndefined({
    ...data,
    updatedAt: Timestamp.now(),
    ...(data.vendorState && { vendorState: data.vendorState.trim() }),
  });

  await updateDoc(purchaseDoc, safeUpdates);
};

export const deletePurchase = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "purchases", id));
};