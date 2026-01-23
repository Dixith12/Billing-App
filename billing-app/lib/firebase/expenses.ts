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
} from "firebase/firestore"
import { db } from "../firebase"

export interface Expense {
  id: string
  name: string
  amount: number
  date: string  // YYYY-MM-DD
  createdAt?: Timestamp
}

const expensesRef = collection(db, "expenses")

export const addExpense = async (data: Omit<Expense, "id" | "createdAt">): Promise<Expense> => {
  const docRef = await addDoc(expensesRef, {
    ...data,
    createdAt: Timestamp.now(),
  })

  return {
    id: docRef.id,
    ...data,
    createdAt: Timestamp.now(),
  }
}

export const getExpenses = async (): Promise<Expense[]> => {
  const q = query(expensesRef, orderBy("createdAt", "desc"))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Expense, "id">),
  }))
}

export const updateExpense = async (id: string, data: Partial<Omit<Expense, "id" | "createdAt">>): Promise<void> => {
  const expenseDoc = doc(db, "expenses", id)
  await updateDoc(expenseDoc, data)
}

export const deleteExpense = async (id: string): Promise<void> => {
  const expenseDoc = doc(db, "expenses", id)
  await deleteDoc(expenseDoc)
}