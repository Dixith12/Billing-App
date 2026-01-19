import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "../firebase"
import { Timestamp } from "firebase/firestore"
import { getDocs, query, orderBy } from "firebase/firestore"
import { doc, updateDoc } from "firebase/firestore"


export interface InvoiceProduct {
  name: string
  quantity: number
  height: string
  width: string
  discount: string
  discountType: "%" | "₹"
  total: number
}

export interface Invoice {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  customerGstin?: string
  billingAddress: string
  products: InvoiceProduct[]
  subtotal: number
  discount: number
  cgst: number
  sgst: number
  netAmount: number
  status: "pending" | "paid" | "cancelled" | "partially paid"
    mode: "cash" | "upi" | "card"

  createdAt?: Timestamp | null
}


const invoiceRef = collection(db, "invoices")

export const addInvoice = async (
  invoice: Omit<Invoice, "id" | "status" | "createdAt" | "mode">
)=> {
  await addDoc(invoiceRef, {
    ...invoice,
    status: "pending", 
    mode:"cash"     ,      // ✅ ALWAYS pending
    createdAt: serverTimestamp(), // ✅ server time
  })
}

export const getInvoices = async (): Promise<Invoice[]> => {
  const q = query(invoiceRef, orderBy("createdAt", "desc"))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => ({
  id: doc.id,
  ...(doc.data() as Omit<Invoice, "id">),
}))

}

export const updateInvoicePayment = async (
  id: string,
  data: {
    status: Invoice["status"]
    mode: Invoice["mode"]
  }
) => {
  const ref = doc(db, "invoices", id)
  await updateDoc(ref, data)
}


