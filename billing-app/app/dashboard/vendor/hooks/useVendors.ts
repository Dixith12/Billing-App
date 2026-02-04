// app/dashboard/vendor/hooks/useVendors.ts
"use client";

import { useState, useEffect } from "react";
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
} from "firebase/firestore";
import { db } from "@/lib/firebase"; // adjust path if needed
import { toast } from "sonner";

// ── Vendor Interface ──────────────────────────────────────────────
export interface Vendor {
  id: string;
  name: string;
  companyName?: string;
  gstin?: string;
  phone: string;
  address: string;
  state: string;
  openingBalance?: number; // positive = debit (vendor owes us), negative = credit (we owe vendor)
  createdAt?: Timestamp;
}

const vendorsRef = collection(db, "vendors");

// ── Firebase CRUD Helpers ─────────────────────────────────────────
const addVendor = async (
  data: Omit<Vendor, "id" | "createdAt">
): Promise<Vendor> => {
  const now = Timestamp.now();

  const safeData = {
    ...data,
    openingBalance: data.openingBalance !== undefined ? Number(data.openingBalance) : undefined,
    createdAt: now,
  };

  // Remove undefined fields (Firestore doesn't allow undefined)
  const cleanData = Object.fromEntries(
    Object.entries(safeData).filter(([_, v]) => v !== undefined)
  );

  const docRef = await addDoc(vendorsRef, cleanData);

  return {
    id: docRef.id,
    ...safeData,
  };
};

const getVendors = async (): Promise<Vendor[]> => {
  const q = query(vendorsRef, orderBy("name"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((snap) => ({
    id: snap.id,
    ...(snap.data() as Omit<Vendor, "id">),
  }));
};

const updateVendor = async (
  id: string,
  data: Partial<Omit<Vendor, "id" | "createdAt">>
): Promise<void> => {
  const vendorDoc = doc(db, "vendors", id);
  const safeUpdates = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  );
  await updateDoc(vendorDoc, safeUpdates);
};

const deleteVendor = async (id: string): Promise<void> => {
  const vendorDoc = doc(db, "vendors", id);
  await deleteDoc(vendorDoc);
};

// ── Main Hook: useVendors ─────────────────────────────────────────
export function useVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load vendors on mount
  const fetchVendors = async () => {
  try {
    setLoading(true);
    const data = await getVendors();
    setVendors(data);
  } catch (err: any) {
    setError(err.message || "Failed to load vendors");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchVendors();
}, []);


  // ── CRUD Handlers ───────────────────────────────────────────────
  const handleAddVendor = async (
    data: Omit<Vendor, "id" | "createdAt">
  ): Promise<Vendor> => {
    try {
      const newVendor = await addVendor(data);
      setVendors((prev) => [...prev, newVendor]);
      return newVendor;
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to add vendor", { description: err.message });
      throw err;
    }
  };

  const handleUpdateVendor = async (
    id: string,
    data: Partial<Omit<Vendor, "id" | "createdAt">>
  ): Promise<boolean> => {
    try {
      await updateVendor(id, data);
      setVendors((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...data } : v))
      );
      toast.success("Vendor updated");
      return true;
    } catch (err: any) {
      setError(err.message);
      toast.error("Update failed");
      return false;
    }
  };

  const handleDeleteVendor = async (id: string) => {
    try {
      await deleteVendor(id);
      setVendors((prev) => prev.filter((v) => v.id !== id));
      toast.success("Vendor deleted");
    } catch (err: any) {
      setError(err.message);
      toast.error("Delete failed");
    }
  };

  // ── Form Hook Logic (embedded) ───────────────────────────────────
  const useVendorForm = (
    onSuccess: () => void,
    initialVendor?: Vendor | null
  ) => {
    const [form, setForm] = useState({
      name: "",
      companyName: "",
      gstin: "",
      phone: "",
      address: "",
      state: "",
      openingBalanceType: "debit" as "debit" | "credit",
      openingBalanceAmount: "",
    });

    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
      if (initialVendor) {
        const bal = initialVendor.openingBalance ?? 0;
        setForm({
          name: initialVendor.name,
          companyName: initialVendor.companyName || "",
          gstin: initialVendor.gstin || "",
          phone: initialVendor.phone,
          address: initialVendor.address,
          state: initialVendor.state || "",
          openingBalanceType: bal >= 0 ? "debit" : "credit",
          openingBalanceAmount: Math.abs(bal).toString() || "",
        });
      }
    }, [initialVendor]);

    const updateField = (field: keyof typeof form, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setFormError(null);
    };

    const setBalanceType = (type: "debit" | "credit") => {
      setForm((prev) => ({ ...prev, openingBalanceType: type }));
    };

    const submit = async (): Promise<boolean> => {
      if (
        !form.name.trim() ||
        !form.phone.trim() ||
        !form.address.trim() ||
        !form.state.trim()
      ) {
        setFormError("Required fields are missing");
        return false;
      }

      setIsSubmitting(true);
      setFormError(null);

      try {
        const submitData: Omit<Vendor, "id" | "createdAt"> = {
          name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          state: form.state.trim(),
        };

        if (form.companyName.trim()) submitData.companyName = form.companyName.trim();
        if (form.gstin.trim()) submitData.gstin = form.gstin.trim();

        const amount = Number(form.openingBalanceAmount) || 0;
        if (amount > 0) {
          submitData.openingBalance =
            form.openingBalanceType === "debit" ? amount : -amount;
        }

        if (initialVendor?.id) {
          // Update mode
          await handleUpdateVendor(initialVendor.id, submitData);
        } else {
          // Add mode
          await handleAddVendor(submitData);
        }

        onSuccess();
        resetForm();
        return true;
      } catch (err: any) {
        setFormError(err.message || "Operation failed");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    };

    const resetForm = () => {
      setForm({
        name: "",
        companyName: "",
        gstin: "",
        phone: "",
        address: "",
        state: "",
        openingBalanceType: "debit",
        openingBalanceAmount: "",
      });
      setFormError(null);
    };

    return {
      form,
      updateField,
      setBalanceType,
      submit,
      formError,
      isSubmitting,
      resetForm,
    };
  };

  return {
    vendors,
    loading,
    error,
    addVendor: handleAddVendor,
    updateVendor: handleUpdateVendor,
    deleteVendor: handleDeleteVendor,
    refreshVendors:fetchVendors,
    useVendorForm, // ← use this in your modal / form component
  };
}