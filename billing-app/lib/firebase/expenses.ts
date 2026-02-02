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
} from "firebase/firestore";
import { db } from "../firebase";

export interface Expense {
  id: string;
  name: string;
  category: string;           // e.g. "Office Supplies", "Rent (Office/Warehouse)", etc.
  state: string;              // e.g. "Karnataka", "Maharashtra", "Tamil Nadu"
  cgstPercent?: number;       // only for Karnataka
  sgstPercent?: number;       // only for Karnataka
  igstPercent?: number;       // only for other states
  quantity: number;           // default 1 if not provided
  amount: number;             // total amount before GST (or including, depending on your logic)
  date: string;               // YYYY-MM-DD
  createdAt?: Timestamp;
  updatedAt?: Timestamp;      // optional, good practice
}

const expensesRef = collection(db, "expenses");

function removeUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  ) as T;
}

export const addExpense = async (
  data: Omit<Expense, "id" | "createdAt" | "updatedAt">
): Promise<Expense> => {
  const now = Timestamp.now();

  const rawData = {
    ...data,
    quantity: data.quantity ?? 1,
    cgstPercent: data.cgstPercent !== undefined ? Number(data.cgstPercent) : undefined,
    sgstPercent: data.sgstPercent !== undefined ? Number(data.sgstPercent) : undefined,
    igstPercent: data.igstPercent !== undefined ? Number(data.igstPercent) : undefined,
    createdAt: now,
    updatedAt: now,
  };

  const safeData = removeUndefined(rawData);

  const docRef = await addDoc(expensesRef, safeData);

  return {
    id: docRef.id,
    ...(safeData as Omit<Expense, "id">),
  };
};


export const getExpenses = async (): Promise<Expense[]> => {
  const q = query(expensesRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((snap) => {
    const data = snap.data() as Omit<Expense, "id">;

    return {
      id: snap.id,
      ...data,
      // Optional: convert Timestamp back to string if needed in UI
      date: data.date, // already string (YYYY-MM-DD)
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt : undefined,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : undefined,
    };
  });
};

export const updateExpense = async (
  id: string,
  data: Partial<Omit<Expense, "id" | "createdAt" | "updatedAt">>
): Promise<void> => {
  const expenseDoc = doc(db, "expenses", id);

  const rawUpdates = {
    ...data,
    quantity: data.quantity !== undefined ? Number(data.quantity) : undefined,
    cgstPercent: data.cgstPercent !== undefined ? Number(data.cgstPercent) : undefined,
    sgstPercent: data.sgstPercent !== undefined ? Number(data.sgstPercent) : undefined,
    igstPercent: data.igstPercent !== undefined ? Number(data.igstPercent) : undefined,
    updatedAt: Timestamp.now(),
  };

  const safeUpdates = removeUndefined(rawUpdates);

  await updateDoc(expenseDoc, safeUpdates);
};


export const deleteExpense = async (id: string): Promise<void> => {
  const expenseDoc = doc(db, "expenses", id);
  await deleteDoc(expenseDoc);
};