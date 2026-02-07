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
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { cleanUndefined } from "@/lib/utils/invoiceUtil";

export interface PurchaseProduct {
  name: string;
  quantity: number;
  measurementType: "height_width" | "kg" | "unit";

  height?: string;
  width?: string;
  kg?: string;
  units?: string;

  pricePerHeight?: number;
  pricePerWidth?: number;
  pricePerKg?: number;
  pricePerUnit?: number;

  discount?: string; // ADD
  discountType?: "%" | "₹"; // ADD

  total: number; // netTotal
  grossTotal: number;
}

export interface Purchase {
  id: string;
  purchaseNumber: number;

  vendorId: string;
  vendorName: string;
  vendorPhone?: string;
  vendorGstin?: string;
  vendorState?: string;
  billingAddress?: string;

  products: PurchaseProduct[];

  subtotal: number;
  discount?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  netAmount: number;
  totalGross?: number;

  // NEW (mirror invoice)
  paidAmount: number;
  status: "pending" | "partially_paid" | "paid";
  mode?: "cash" | "upi" | "card";

  purchaseDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CreatePurchaseInput = Omit<
  Purchase,
  | "id"
  | "purchaseNumber"
  | "createdAt"
  | "updatedAt"
  | "paidAmount"
  | "status"
  | "mode"
> & {
  purchaseDate?: Date;
};

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
    transaction.set(
      purchaseCounterRef,
      { current: newNumber },
      { merge: true },
    );
    return newNumber;
  });
};

export const addPurchase = async (
  data: CreatePurchaseInput,
): Promise<Purchase> => {
  const nextNumber = await getNextPurchaseNumber();
  const now = Timestamp.now();

  const safeData = cleanUndefined({
    ...data,
    purchaseNumber: nextNumber,
    vendorState: data.vendorState?.trim(),
  });

  const payload = {
    ...safeData,

    purchaseNumber: nextNumber,

    // DEFAULT FINANCIAL STATE
    status: "pending" as const,
    paidAmount: 0,
    mode: "cash" as const,

    totalGross: data.totalGross ?? data.netAmount,

    purchaseDate: data.purchaseDate
      ? Timestamp.fromDate(new Date(data.purchaseDate))
      : now,

    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(purchasesRef, payload);

  return {
    id: docRef.id,

    ...safeData,

    purchaseNumber: nextNumber,

    // financial defaults
    status: "pending",
    paidAmount: 0,
    mode: "cash",

    totalGross: payload.totalGross,

    purchaseDate:
      payload.purchaseDate instanceof Timestamp
        ? payload.purchaseDate.toDate()
        : undefined,

    createdAt: now.toDate(),
    updatedAt: now.toDate(),
  };
};

export const recordPurchasePayment = async (
  purchaseId: string,
  payment: {
    amount: number;
    mode: "cash" | "upi" | "card";
  },
) => {
  if (payment.amount <= 0) {
    throw new Error("Payment amount must be greater than zero");
  }

  const purchaseRef = doc(db, "purchases", purchaseId);

  return await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(purchaseRef);

    if (!snap.exists()) {
      throw new Error("Purchase not found");
    }

    const data = snap.data() as Purchase;

    const currentPaid = data.paidAmount || 0;
    const total = data.totalGross ?? data.netAmount;

    const newPaid = Number((currentPaid + payment.amount).toFixed(2));
    const remaining = Number((total - newPaid).toFixed(2));

    let newStatus: Purchase["status"];

    if (newPaid >= total || remaining <= 0) {
      newStatus = "paid";
    } else if (newPaid > 0) {
      newStatus = "partially_paid";
    } else {
      newStatus = "pending";
    }

    transaction.update(purchaseRef, {
      paidAmount: newPaid,
      status: newStatus,
      mode: payment.mode,
      updatedAt: Timestamp.now(),
    });

    return {
      newPaidAmount: newPaid,
      newStatus,
      remaining,
    };
  });
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
          : typeof data.purchaseDate?.seconds === "number"
            ? new Date(data.purchaseDate.seconds * 1000) // IMPORTANT
            : data.purchaseDate instanceof Date
              ? data.purchaseDate
              : undefined,
    };
  });
};

export const updatePurchase = async (
  id: string,
  data: Partial<
    Omit<Purchase, "id" | "purchaseNumber" | "createdAt" | "updatedAt">
  >,
): Promise<void> => {
  const purchaseDoc = doc(db, "purchases", id);

  const safeUpdates = cleanUndefined({
    ...data,

    // FIX: ALWAYS store purchaseDate as Timestamp
    ...(data.purchaseDate && {
      purchaseDate: Timestamp.fromDate(new Date(data.purchaseDate)),
    }),

    updatedAt: Timestamp.now(),

    ...(data.vendorState && { vendorState: data.vendorState.trim() }),
  });

  await updateDoc(purchaseDoc, safeUpdates);
};

export const deletePurchase = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "purchases", id));
};

export async function getPurchaseById(id: string): Promise<Purchase | null> {
  const ref = doc(db, "purchases", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const data = snap.data() as Omit<Purchase, "id">;

  return {
    id: snap.id,
    ...data,

    purchaseDate:
      data.purchaseDate instanceof Timestamp
        ? data.purchaseDate.toDate()
        : data.purchaseDate instanceof Date
          ? data.purchaseDate
          : undefined,

    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : data.createdAt,

    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate()
        : data.updatedAt,
  };
}
