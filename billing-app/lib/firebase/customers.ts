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
  gstin?: string
  phone: string
  address: string,
  createdAt?:Timestamp
}

const customersRef = collection(db, "customers")

export const addCustomer = async (
  data: Omit<Customer, "id">
): Promise<Customer> => {
  const docRef = await addDoc(customersRef, {
    ...data,
    createdAt: Timestamp.now(),
  })

  return {
    id: docRef.id,
    ...data,
    createdAt:Timestamp.now(),
  }
}

export const getCustomers = async (): Promise<Customer[]> => {
  const q = query(customersRef, orderBy("name"))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Customer, "id">),
  }))
}

// NEW: Update customer
export const updateCustomer = async (
  id: string,
  data: Partial<Omit<Customer, "id" | "createdAt">>
): Promise<void> => {
  const customerDoc = doc(db, "customers", id)
  await updateDoc(customerDoc, data)
}

// NEW: Delete customer
export const deleteCustomer = async (id: string): Promise<void> => {
  const customerDoc = doc(db, "customers", id)
  await deleteDoc(customerDoc)
}