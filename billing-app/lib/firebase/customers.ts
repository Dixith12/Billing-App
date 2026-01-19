import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore"
import { db } from "../firebase"

export interface Customer {
  id: string
  name: string
  gstin?: string
  phone: string
  address: string
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
