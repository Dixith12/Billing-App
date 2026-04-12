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
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import type { InvoiceProduct } from "@/lib/firebase/invoices";
import { getNextInvoiceNumber } from "@/lib/firebase/invoices";
import { cleanUndefined } from "@/lib/utils/invoiceUtil";

/* ─────────────────────────────────────────────────────────────── */
/* TYPES */
/* ─────────────────────────────────────────────────────────────── */

export interface Quotation {
  id: string;
  quotationNumber: number;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerGstin?: string;
  placeOfSupply?: string;
  billingAddress?: string;

  products: InvoiceProduct[];

  subtotal: number;
  discount: number;
  cgst: number;
  sgst: number;
  igst: number;
  netAmount: number;
  totalGross?: number;
  gstEnabled?: boolean;

  quotationDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/* ─────────────────────────────────────────────────────────────── */
/* REFERENCES */
/* ─────────────────────────────────────────────────────────────── */

const quotationsRef = collection(db, "quotations");
const quotationCounterRef = doc(db, "counters", "quotationNumber");

/* ─────────────────────────────────────────────────────────────── */
/* QUOTATION NUMBER */
/* ─────────────────────────────────────────────────────────────── */

export const getNextQuotationNumber = async (): Promise<number> => {
  return await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(quotationCounterRef);
    const current = snap.exists() ? (snap.data()?.current ?? 0) : 0;
    const next = current + 1;

    transaction.set(quotationCounterRef, { current: next }, { merge: true });

    return next;
  });
};

/* ─────────────────────────────────────────────────────────────── */
/* CREATE */
/* ─────────────────────────────────────────────────────────────── */

export const addQuotation = async (
  data: Omit<Quotation, "id" | "quotationNumber" | "createdAt" | "updatedAt">,
): Promise<Quotation> => {
  const quotationNumber = await getNextQuotationNumber();
  const now = Timestamp.now();

  const safeData = cleanUndefined({
    ...data,
    quotationNumber,
  });

  const payload = {
    ...safeData,
    gstEnabled: data.gstEnabled ?? true,
    totalGross: data.totalGross ?? data.netAmount,
    quotationDate: data.quotationDate
      ? Timestamp.fromDate(data.quotationDate)
      : now,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(quotationsRef, payload);

  return {
    id: docRef.id,
    ...safeData,
    quotationNumber,
    quotationDate: data.quotationDate ?? now.toDate(),
    createdAt: now.toDate(),
    updatedAt: now.toDate(),
  };
};

/* ─────────────────────────────────────────────────────────────── */
/* FETCH (🔥 FIXED UPDATED DATE HERE) */
/* ─────────────────────────────────────────────────────────────── */

export const getQuotations = async (): Promise<Quotation[]> => {
  const q = query(quotationsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((snap) => {
    const data = snap.data();

    const quotationDate =
      data.quotationDate instanceof Timestamp
        ? data.quotationDate.toDate()
        : typeof data.quotationDate?.seconds === "number"
          ? new Date(data.quotationDate.seconds * 1000) // FIX
          : data.quotationDate instanceof Date
            ? data.quotationDate
            : undefined;

    return {
      id: snap.id,

      quotationNumber: data.quotationNumber,
      customerId: data.customerId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerGstin: data.customerGstin,
      placeOfSupply: data.placeOfSupply,
      billingAddress: data.billingAddress,

      products: data.products ?? [],

      subtotal: data.subtotal ?? 0,
      discount: data.discount ?? 0,
      cgst: data.cgst ?? 0,
      sgst: data.sgst ?? 0,
      igst: data.igst ?? 0,
      netAmount: data.netAmount ?? 0,
      totalGross: data.totalGross ?? data.netAmount ?? 0,
      gstEnabled: data.gstEnabled ?? true,

      quotationDate,

      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : data.createdAt instanceof Date
            ? data.createdAt
            : undefined,

      // THIS FIXES "-"
      updatedAt:
        data.updatedAt instanceof Timestamp
          ? data.updatedAt.toDate()
          : data.updatedAt instanceof Date
            ? data.updatedAt
            : undefined,
    };
  });
};

export const getQuotationById = async (id: string) => {
  const ref = doc(db, "quotations", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const data = snap.data();

  const quotationDate =
    data.quotationDate instanceof Timestamp
      ? data.quotationDate.toDate()
      : typeof data.quotationDate?.seconds === "number"
        ? new Date(data.quotationDate.seconds * 1000)
        : data.quotationDate instanceof Date
          ? data.quotationDate
          : undefined;

  return {
    id: snap.id,

    quotationNumber: data.quotationNumber,
    customerId: data.customerId,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    customerGstin: data.customerGstin,
    placeOfSupply: data.placeOfSupply,
    billingAddress: data.billingAddress,

    products: data.products ?? [],

    subtotal: data.subtotal ?? 0,
    discount: data.discount ?? 0,
    cgst: data.cgst ?? 0,
    sgst: data.sgst ?? 0,
    igst: data.igst ?? 0,
    netAmount: data.netAmount ?? 0,
    totalGross: data.totalGross ?? data.netAmount ?? 0,
    gstEnabled: data.gstEnabled ?? true,

    quotationDate,

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
  };
};

/* ─────────────────────────────────────────────────────────────── */
/* UPDATE */
/* ─────────────────────────────────────────────────────────────── */

export const updateQuotation = async (
  id: string,
  data: Partial<Omit<Quotation, "id" | "createdAt" | "quotationNumber">>,
): Promise<void> => {
  const quotationDoc = doc(db, "quotations", id);

  const safeUpdates = cleanUndefined({
    ...data,
    quotationDate:
      data.quotationDate instanceof Date
        ? Timestamp.fromDate(data.quotationDate)
        : data.quotationDate,
    updatedAt: Timestamp.now(), // REQUIRED
  });

  await updateDoc(quotationDoc, safeUpdates);
};

/* ─────────────────────────────────────────────────────────────── */
/* DELETE */
/* ─────────────────────────────────────────────────────────────── */

export const deleteQuotation = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "quotations", id));
};

/* ─────────────────────────────────────────────────────────────── */
/* CONVERT TO INVOICE */
/* ─────────────────────────────────────────────────────────────── */

export const convertQuotationToInvoice = async (
  quotationId: string,
): Promise<string> => {
  return await runTransaction(db, async (transaction) => {
    const quotationDoc = doc(db, "quotations", quotationId);
    const snap = await transaction.get(quotationDoc);

    if (!snap.exists()) {
      throw new Error("Quotation not found");
    }

    const data = snap.data() as any;
    const invoiceNumber = await getNextInvoiceNumber();
    const invoicesRef = collection(db, "invoices");
    const now = Timestamp.now();

    const quotationTimestamp =
  data.quotationDate instanceof Timestamp
    ? data.quotationDate
    : data.quotationDate instanceof Date
      ? Timestamp.fromDate(data.quotationDate)
      : typeof data.quotationDate?.seconds === "number"
        ? new Timestamp(
            data.quotationDate.seconds,
            data.quotationDate.nanoseconds ?? 0
          )
        : now;

    const safeData = cleanUndefined({
      ...data,

      // IMPORTANT FIX
      invoiceDate:quotationTimestamp,

      invoiceNumber,
      status: "pending",
      mode: "cash",
      paidAmount: 0,
      createdAt: now,
      updatedAt: now,

      // ❌ optional but recommended: remove quotation-only field
      quotationDate: undefined,
    });

    const newInvoiceRef = await addDoc(invoicesRef, safeData);

    transaction.delete(quotationDoc);

    return newInvoiceRef.id;
  });
};
