// lib/firebase/expenses.ts
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
  deleteField
} from "firebase/firestore";
import { db } from "../firebase";

export interface Expense {
  id: string;
  name: string;
  category: string;
  state: string;
  gstApplicable: boolean;       // ← NEW - required
  cgstPercent?: number;         // only when gstApplicable && Karnataka
  sgstPercent?: number;         // only when gstApplicable && Karnataka
  igstPercent?: number;         // only when gstApplicable && not Karnataka
  quantity: number;
  amount: number;
  date: string;                 // YYYY-MM-DD
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const expensesRef = collection(db, "expenses");

function cleanObject<T extends object>(obj: Partial<T>): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined && value !== null)
  ) as Partial<T>;
}

export const addExpense = async (
  data: Omit<Expense, "id" | "createdAt" | "updatedAt">
): Promise<Expense> => {
  const now = Timestamp.now();

  const isKarnataka = (data.state || "").toLowerCase() === "karnataka";

  // Base fields - always present
  const baseData = {
    name: (data.name || "").trim(),
    category: data.category || "",
    state: data.state || "",
    gstApplicable: !!data.gstApplicable,
    quantity: Number(data.quantity ?? 1),
    amount: Number(data.amount),
    date: data.date || "",
    createdAt: now,
    updatedAt: now,
  };

  const finalData: any = { ...baseData };

  // Handle GST fields conditionally
  if (data.gstApplicable === true) {
    if (isKarnataka) {
      if (data.cgstPercent !== undefined) {
        finalData.cgstPercent = Number(data.cgstPercent);
      }
      if (data.sgstPercent !== undefined) {
        finalData.sgstPercent = Number(data.sgstPercent);
      }
      // optional: explicitly null out IGST
      finalData.igstPercent = null;
    } else {
      if (data.igstPercent !== undefined) {
        finalData.igstPercent = Number(data.igstPercent);
      }
      // optional: explicitly null out CGST/SGST
      finalData.cgstPercent = null;
      finalData.sgstPercent = null;
    }
  } else {
    // When GST is not applicable → clear all GST fields
    finalData.cgstPercent = null;
    finalData.sgstPercent = null;
    finalData.igstPercent = null;
  }

  const safeData = cleanObject(finalData);

  const docRef = await addDoc(expensesRef, safeData);

  return {
    id: docRef.id,
    ...safeData,
    gstApplicable: baseData.gstApplicable, // ensure boolean
  } as Expense;
};

export const getExpenses = async (): Promise<Expense[]> => {
  const q = query(expensesRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((snap) => {
    const data = snap.data() as Omit<Expense, "id">;

    return {
      id: snap.id,
      ...data,
      gstApplicable: !!data.gstApplicable, // ensure boolean even if corrupted
      quantity: Number(data.quantity ?? 1),
      amount: Number(data.amount ?? 0),
      date: data.date || "",
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt : undefined,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : undefined,
    } as Expense;
  });
};

export const updateExpense = async (
  id: string,
  updates: Partial<Omit<Expense, "id" | "createdAt" | "updatedAt">>
): Promise<void> => {
  const expenseDoc = doc(db, "expenses", id);

  const isKarnataka = (updates.state || "").toLowerCase() === "karnataka";

  const finalUpdates: any = {
    updatedAt: Timestamp.now(),
  };

  // Copy provided fields
  if ("name" in updates) finalUpdates.name = (updates.name || "").trim();
  if ("category" in updates) finalUpdates.category = updates.category;
  if ("state" in updates) finalUpdates.state = updates.state;
  if ("quantity" in updates) finalUpdates.quantity = Number(updates.quantity);
  if ("amount" in updates) finalUpdates.amount = Number(updates.amount);
  if ("date" in updates) finalUpdates.date = updates.date;

 // 🔥 FINAL GST NORMALIZATION LOGIC (CORRECT)
const gstOn =
  "gstApplicable" in updates ? !!updates.gstApplicable : undefined;

if (gstOn === false) {
  // GST turned OFF → remove all GST fields
  finalUpdates.gstApplicable = false;
  finalUpdates.cgstPercent = deleteField();
  finalUpdates.sgstPercent = deleteField();
  finalUpdates.igstPercent = deleteField();
}

if (gstOn === true) {
  finalUpdates.gstApplicable = true;

  if (isKarnataka) {
    finalUpdates.cgstPercent =
      updates.cgstPercent != null
        ? Number(updates.cgstPercent)
        : deleteField();

    finalUpdates.sgstPercent =
      updates.sgstPercent != null
        ? Number(updates.sgstPercent)
        : deleteField();

    // 🚨 MUST REMOVE IGST
    finalUpdates.igstPercent = deleteField();
  } else {
    finalUpdates.igstPercent =
      updates.igstPercent != null
        ? Number(updates.igstPercent)
        : deleteField();

    // 🚨 MUST REMOVE CGST + SGST
    finalUpdates.cgstPercent = deleteField();
    finalUpdates.sgstPercent = deleteField();
  }
}



  // If state changed but gstApplicable not provided → we don't auto-change GST status
  // (modal should always send gstApplicable when state changes)

  const safeUpdates = cleanObject(finalUpdates);

  if (Object.keys(safeUpdates).length > 0) {
    await updateDoc(expenseDoc, safeUpdates);
  }
};

export const deleteExpense = async (id: string): Promise<void> => {
  const expenseDoc = doc(db, "expenses", id);
  await deleteDoc(expenseDoc);
};