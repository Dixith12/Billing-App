// lib/firebase/customers.ts  (or wherever it lives)

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
} from "firebase/firestore"
import { db } from "../firebase"

export interface Customer {
  id: string
  name: string
  companyName?: string
  gstin?: string
  phone: string
  address: string
  state?: string
  openingBalance?: number          // positive = debit (customer owes), negative = credit (you owe)
  createdAt?: Timestamp
}

const customersRef = collection(db, "customers")

export const addCustomer = async (
  data: Omit<Customer, "id" | "createdAt">
): Promise<Customer> => {
  const now = Timestamp.now()
  
  // Clean data: ensure openingBalance is number or undefined
  const safeData = {
    ...data,
    openingBalance: data.openingBalance ? Number(data.openingBalance) : undefined,
    createdAt: now,
  }

  const docRef = await addDoc(customersRef, safeData)

  return {
    id: docRef.id,
    ...safeData,
  }
}

export const getCustomers = async (): Promise<Customer[]> => {
  const q = query(customersRef, orderBy("name"))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((snap) => ({
    id: snap.id,
    ...(snap.data() as Omit<Customer, "id">),
  }))
}

export const updateCustomer = async (
  id: string,
  data: Partial<Omit<Customer, "id" | "createdAt">>
): Promise<void> => {
  const customerDoc = doc(db, "customers", id)
  // Optional: clean openingBalance if present
  const safeUpdates = {
    ...data,
    ...(data.openingBalance !== undefined && { openingBalance: Number(data.openingBalance) || 0 }),
  }
  await updateDoc(customerDoc, safeUpdates)
}

export const deleteCustomer = async (id: string): Promise<void> => {
  const customerDoc = doc(db, "customers", id)
  await deleteDoc(customerDoc)
}