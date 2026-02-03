import {
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
  getDocs,
  getDoc,
  query,
  orderBy,
  doc,
  updateDoc,
  runTransaction,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { cleanUndefined } from "../utils/invoiceUtil";

export interface InvoiceProduct {
  name: string;
  quantity: number;

  measurementType: "height_width" | "kg" | "unit";
  height?: string;
  width?: string;
  kg?: string;
  units?: string;
  hsnCode?:string;

  wasteEnabled: boolean;
  wasteHeight?: string;
  wasteWidth?: string;
  wasteKg?: string;
  wasteUnits?: string;
  wasteAmount?: number;

  discount: string;
  discountType: "%" | "₹";
  total: number;
  grossTotal?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: number;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerGstin?: string;
  billingAddress: string;
  placeOfSupply?: string;
  products: InvoiceProduct[];

  subtotal: number;
  discount: number;
  cgst: number;
  sgst: number;
  igst: number;
  netAmount: number;

  paidAmount: number;
  status: "pending" | "paid" | "cancelled" | "partially paid";
  mode: "cash" | "upi" | "card";

  createdAt?: Timestamp | null;
  invoiceDate?: Timestamp;
  dueDate?: Timestamp;
  updatedAt?: Timestamp;
}

// Input type from UI (accepts Date objects)
export type CreateInvoiceInput = Omit<
  Invoice,
  | "id"
  | "invoiceNumber"
  | "status"
  | "mode"
  | "paidAmount"
  | "createdAt"
  | "updatedAt"
  | "invoiceDate"
  | "dueDate"
> & {
  invoiceDate?: Date;
  dueDate?: Date;
  placeOfSupply?:String,
};

const invoiceRef = collection(db, "invoices");

export const addInvoice = async (input: CreateInvoiceInput) => {
  const nextNumber = await getNextInvoiceNumber();

  const now = new Date();

  // Handle invoiceDate: current time if today, else midnight
  let finalInvoiceDate: Timestamp | undefined;
  if (input.invoiceDate) {
    const date = new Date(input.invoiceDate);
    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

    if (!isToday) {
      date.setHours(0, 0, 0, 0);
    }
    finalInvoiceDate = Timestamp.fromDate(date);
  }

  // Handle dueDate: same logic
  let finalDueDate: Timestamp | undefined;
  if (input.dueDate) {
    const date = new Date(input.dueDate);
    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

    if (!isToday) {
      date.setHours(0, 0, 0, 0);
    }
    finalDueDate = Timestamp.fromDate(date);
  }

  const safeInvoice = cleanUndefined({
    ...input,
    products: input.products.map((product) => ({
      ...product,
      wasteAmount: product.wasteEnabled ? (product.wasteAmount ?? 0) : undefined,
    })),
    invoiceDate: finalInvoiceDate,
    dueDate: finalDueDate,
  });

  if (!finalInvoiceDate) {
  finalInvoiceDate = Timestamp.fromDate(new Date());
}


  const docRef = await addDoc(invoiceRef, {
    ...safeInvoice,
    invoiceNumber: nextNumber,
    status: "pending",
    mode: "cash",
    paidAmount: 0,
    invoiceDate:finalInvoiceDate,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    invoiceNumber: nextNumber,
    ...safeInvoice,
    paidAmount: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
};

export const getInvoices = async (): Promise<Invoice[]> => {
  const q = query(invoiceRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((snap) => {
    const data = snap.data() as Omit<Invoice, "id">;
    return {
      ...data,
      id: snap.id,
      products: data.products.map(normalizeInvoiceProduct),
    };
  });
};

export const getInvoiceById = async (id: string): Promise<Invoice | null> => {
  const snap = await getDoc(doc(db, "invoices", id));

  if (!snap.exists()) return null;

  const data = snap.data() as Omit<Invoice, "id">;

  return {
    ...data,
    id: snap.id,
    products: data.products.map(normalizeInvoiceProduct),
  };
};

export const updateInvoice = async (
  id: string,
  updates: Partial<CreateInvoiceInput>,
): Promise<void> => {
  const docRef = doc(db, "invoices", id);

  const now = new Date();
  let safeUpdates: any = { ...updates };

  if (updates.invoiceDate) {
    const date = new Date(updates.invoiceDate);
    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

    if (!isToday) date.setHours(0, 0, 0, 0);
    safeUpdates.invoiceDate = Timestamp.fromDate(date);
  }

  if (updates.dueDate) {
    const date = new Date(updates.dueDate);
    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

    if (!isToday) date.setHours(0, 0, 0, 0);
    safeUpdates.dueDate = Timestamp.fromDate(date);
  }

  const cleanUpdates = cleanUndefined({
    ...safeUpdates,
    products: updates.products?.map((p) => ({
      ...p,
      wasteAmount: p.wasteEnabled ? (p.wasteAmount ?? 0) : undefined,
    })),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(docRef, cleanUpdates);
};

export const deleteInvoice = async (invoiceId: string): Promise<void> => {
  const invoiceDocRef = doc(db, "invoices", invoiceId);
  await deleteDoc(invoiceDocRef);
};

export const recordInvoicePayment = async (
  invoiceId: string,
  payment: {
    amount: number;
    mode: Invoice["mode"];
    paymentDate?: string | Date;
  },
) => {
  if (payment.amount <= 0) {
    throw new Error("Payment amount must be greater than zero");
  }

  const invoiceRef = doc(db, "invoices", invoiceId);

  return await runTransaction(db, async (transaction) => {
    const invoiceSnap = await transaction.get(invoiceRef);

    if (!invoiceSnap.exists()) {
      throw new Error("Invoice not found");
    }

    const data = invoiceSnap.data() as Invoice;

    const currentPaid = data.paidAmount || 0;
    const total = data.netAmount;

    const newPaid = currentPaid + payment.amount;
    const remaining = total - newPaid;

    let newStatus: Invoice["status"];

    if (newPaid >= total) {
      newStatus = "paid";
    } else if (newPaid > 0) {
      newStatus = "partially paid";
    } else {
      newStatus = "pending";
    }

    transaction.update(invoiceRef, {
      paidAmount: newPaid,
      status: newStatus,
      mode: payment.mode,
      updatedAt: serverTimestamp(),
    });

    return {
      newPaidAmount: newPaid,
      newStatus,
      remaining,
    };
  });
};

const countersRef = doc(db, "counters", "invoiceNumber");

export const getNextInvoiceNumber = async (): Promise<number> => {
  return await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(countersRef);

    let newNumber = 1;

    if (counterSnap.exists()) {
      const data = counterSnap.data();
      const current = data?.current ?? 0;
      newNumber = current + 1;
    }

    transaction.set(countersRef, { current: newNumber }, { merge: true });

    return newNumber;
  });
};

function normalizeInvoiceProduct(p: InvoiceProduct): InvoiceProduct {
  return {
    ...p,
    height: p.height ?? "",
    width: p.width ?? "",
    kg: p.kg ?? "",
    units: p.units ?? "",
    wasteEnabled: p.wasteEnabled ?? false,
    wasteHeight: p.wasteHeight ?? "",
    wasteWidth: p.wasteWidth ?? "",
    wasteKg: p.wasteKg ?? "",
    wasteUnits: p.wasteUnits ?? "",
    wasteAmount: p.wasteAmount ?? 0,
    discount: p.discount ?? "",
    discountType: p.discountType ?? "%",
    total: p.total ?? 0,
    grossTotal: p.grossTotal ?? 0,
  };
}