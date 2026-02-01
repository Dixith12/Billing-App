// lib/firebase/quotations.ts
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
import type { InvoiceProduct } from "@/lib/firebase/invoices"; // Reuse from invoices
import { getNextInvoiceNumber } from "@/lib/firebase/invoices"; // Reuse invoice number getter
import { cleanUndefined } from "@/lib/utils/invoiceUtil";
export interface Quotation {
  id: string;
  quotationNumber: number;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerGstin?: string;
  billingAddress: string;
  products: InvoiceProduct[];
  subtotal: number;
  discount: number;
  cgst: number;
  sgst: number;
  igst?: number; // 👈 ADD
  netAmount: number;
  totalGross?: number; // 👈 ADD
  quotationDate?: Date; // 👈 ADD
  createdAt?: Date;
  updatedAt?: Date; // 👈 ADD
}

const quotationsRef = collection(db, "quotations");
// Counter for quotation number
const quotationCounterRef = doc(db, "counters", "quotationNumber");
export const getNextQuotationNumber = async (): Promise<number> => {
  return await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(quotationCounterRef);
    let newNumber = 1;
    if (counterSnap.exists()) {
      const data = counterSnap.data();
      const current = data?.current ?? 0;
      newNumber = current + 1;
    }
    transaction.set(
      quotationCounterRef,
      { current: newNumber },
      { merge: true },
    );
    return newNumber;
  });
};
export const addQuotation = async (
  data: Omit<Quotation, "id" | "quotationNumber" | "createdAt" | "updatedAt">,
): Promise<Quotation> => {
  const nextNumber = await getNextQuotationNumber();
  const now = Timestamp.now();

  // ✅ clean ONLY plain JS data
  const safeData = cleanUndefined({
    ...data,
    quotationNumber: nextNumber,
  });

  // ✅ add Timestamp AFTER cleaning
  const payload = {
    ...safeData,
    totalGross: data.totalGross ?? data.netAmount,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(quotationsRef, payload);

  return {
    id: docRef.id,
    ...safeData,
    quotationNumber: nextNumber,
    createdAt: now.toDate(), // UI uses Date
  };
};

export const getQuotations = async (): Promise<Quotation[]> => {
  const q = query(quotationsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  console.log("🔥 Firestore quotations count:", snapshot.size);

  return snapshot.docs.map((snap) => {
    const data = snap.data();

    console.log("📄 Raw quotation doc:", data);

    return {
      id: snap.id,
      ...(data as any),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      quotationDate: data.quotationDate?.toDate(),
    };
  });
};

export const updateQuotation = async (
  id: string,
  data: Partial<Omit<Quotation, "id" | "createdAt" | "quotationNumber">>,
): Promise<void> => {
  const quotationDoc = doc(db, "quotations", id);
  const safeUpdates = cleanUndefined({
    ...data,
    updatedAt: Timestamp.now(), // optional but recommended
  });

  await updateDoc(quotationDoc, safeUpdates);
};
export const deleteQuotation = async (id: string): Promise<void> => {
  const quotationDoc = doc(db, "quotations", id);
  await deleteDoc(quotationDoc);
};

// Convert quotation to invoice
export const convertQuotationToInvoice = async (
  quotationId: string,
): Promise<string> => {
  return await runTransaction(db, async (transaction) => {
    const quotationDoc = doc(db, "quotations", quotationId);
    const quotationSnap = await transaction.get(quotationDoc);
    if (!quotationSnap.exists()) {
      throw new Error("Quotation not found");
    }
    const data = quotationSnap.data() as Quotation;
    const nextInvoiceNumber = await getNextInvoiceNumber(); // From invoices.ts
    const invoicesRef = collection(db, "invoices");
    const now = Timestamp.now();

    const safeData = cleanUndefined({
      ...data,
      invoiceNumber: nextInvoiceNumber,
      status: "pending",
      mode: "cash",
      paidAmount: 0,
    });

    const invoicePayload = {
      ...safeData,
      createdAt: now,
    };

    const newInvoiceRef = await addDoc(invoicesRef, invoicePayload);
    // Delete the quotation
    transaction.delete(quotationDoc);
    return newInvoiceRef.id; // Return new invoice ID if needed
  });
};
