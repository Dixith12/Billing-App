import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "../firebase"
import { Timestamp } from "firebase/firestore"
import { getDocs, getDoc,query, orderBy , doc, updateDoc, runTransaction, deleteDoc} from "firebase/firestore"
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
  invoiceNumber: number
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
  paidAmount:number,
  status: "pending" | "paid" | "cancelled" | "partially paid"
    mode: "cash" | "upi" | "card"

  createdAt?: Timestamp | null
}


const invoiceRef = collection(db, "invoices")

export const addInvoice = async (
  invoice: Omit<Invoice, "id" | "invoiceNumber" | "status" | "createdAt" | "mode" | "paidAmount">
) => {
  const nextNumber = await getNextInvoiceNumber()

  const docRef = await addDoc(invoiceRef, {
    ...invoice,
    invoiceNumber: nextNumber,
    status: "pending",
    mode: "cash",               // default – will be overwritten on first payment
    paidAmount: 0,              // ← important
    createdAt: serverTimestamp(),
  })

  return {
    id: docRef.id,
    invoiceNumber: nextNumber,
    ...invoice,
    paidAmount: 0,
  }
}

export const getInvoices = async (): Promise<Invoice[]> => {
  const q = query(invoiceRef, orderBy("createdAt", "desc"))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Invoice, "id">),
  }))
}

export const recordInvoicePayment = async (
  invoiceId: string,
  payment: {
    amount: number              // the amount being paid now
    mode: Invoice["mode"]
    paymentDate?: string | Date // optional – you can store it if needed
  }
) => {
  if (payment.amount <= 0) {
    throw new Error("Payment amount must be greater than zero")
  }

  const invoiceRef = doc(db, "invoices", invoiceId)

  return await runTransaction(db, async (transaction) => {
    const invoiceSnap = await transaction.get(invoiceRef)

    if (!invoiceSnap.exists()) {
      throw new Error("Invoice not found")
    }

    const data = invoiceSnap.data() as Invoice

    const currentPaid = data.paidAmount || 0
    const total = data.netAmount

    const newPaid = currentPaid + payment.amount
    const remaining = total - newPaid

    let newStatus: Invoice["status"]

    if (newPaid >= total) {
      newStatus = "paid"
    } else if (newPaid > 0) {
      newStatus = "partially paid"
    } else {
      newStatus = "pending"
    }

    // You can decide whether to:
    // A) Always overwrite mode with the latest payment (most common for display)
    // B) Keep original mode and use payments[] array instead

    transaction.update(invoiceRef, {
      paidAmount: newPaid,
      status: newStatus,
      mode: payment.mode,           // ← last payment mode
      // Optional: lastPaymentDate: serverTimestamp() or Timestamp.fromDate(new Date(payment.paymentDate))
      // payments: arrayUnion({ ... })  ← if you want history
    })

    return {
      newPaidAmount: newPaid,
      newStatus,
      remaining,
    }
  })
}


// ── Get next sequential number atomically ────────────────────────────────
const countersRef = doc(db, "counters", "invoiceNumber")

export const getNextInvoiceNumber = async (): Promise<number> => {
  return await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(countersRef)

    let newNumber = 1

    if (counterSnap.exists()) {
      const data = counterSnap.data()
      const current = data?.current ?? 0
      newNumber = current + 1
    }

    // Set / update the counter
    transaction.set(countersRef, { current: newNumber }, { merge: true })

    return newNumber
  })
}


// ── Fetch single invoice by ID ─────────────────────────────────────────────
export const getInvoiceById = async (id: string): Promise<Invoice | null> => {
  const docRef = doc(db, "invoices", id);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    return null;
  }

  return {
    id: snap.id,
    ...snap.data(),
  } as Invoice;
};

export const updateInvoice = async (
  id: string,
  updates: Partial<Omit<Invoice, 'id' | 'createdAt' | 'paidAmount' | 'status' | 'mode'>>
): Promise<void> => {
  const docRef = doc(db, "invoices", id);

  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),   // optional but recommended
  });
};


// ── Add this new function ────────────────────────────────────────────────
export const deleteInvoice = async (invoiceId: string): Promise<void> => {
  const invoiceDocRef = doc(db, "invoices", invoiceId);
  
  // Optional: you can add extra safety checks
  // e.g. check if status === "pending" only, or never delete "paid" invoices, etc.
  
  await deleteDoc(invoiceDocRef);
};