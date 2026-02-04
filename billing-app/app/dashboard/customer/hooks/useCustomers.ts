// app/customers/hooks/useCustomers.ts
"use client";

import { useState, useEffect } from "react";
import {
  Customer,
  getCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/lib/firebase/customers";
import { toast } from "sonner";

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load customers on mount
  useEffect(() => {
    async function fetchCustomers() {
      try {
        setLoading(true);
        const data = await getCustomers();
        setCustomers(data);
      } catch (err: any) {
        setError(err.message || "Failed to load customers");
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  const refreshCustomers = async () => {
  try {
    setLoading(true);
    const data = await getCustomers();
    setCustomers(data);
  } catch (err: any) {
    setError(err.message || "Failed to refresh customers");
  } finally {
    setLoading(false);
  }
};


  const handleAddCustomer = async (
    data: Omit<Customer, "id" | "createdAt">,
  ): Promise<Customer> => {
    try {
      const newCust = await addCustomer(data);
      setCustomers((prev) => [...prev, newCust]);
      return newCust; // ✅ IMPORTANT
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const handleUpdateCustomer = async (
    id: string,
    data: Partial<Omit<Customer, "id" | "createdAt">>,
  ): Promise<boolean> => {
    try {
      await updateCustomer(id, data);
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c)),
      );
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  return {
  customers,
  loading,
  error,
  addCustomer: handleAddCustomer,
  updateCustomer: handleUpdateCustomer,
  deleteCustomer: handleDeleteCustomer,
  refreshCustomers, // 👈 ADD THIS LINE
};

}

export function useAddCustomerForm(
  addCustomer: (data: Omit<Customer, "id" | "createdAt">) => Promise<Customer>,
  onSuccess: () => void,
) {
  const [form, setForm] = useState({
    name: "",
    companyName: "",
    gstin: "",
    phone: "",
    address: "",
    state: "",
    openingBalanceType: "debit" as "debit" | "credit",
    openingBalanceAmount: "", // string from input
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
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
      setError("Required fields are missing");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const submitData: Omit<Customer, "id" | "createdAt"> = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        state: form.state.trim(),
      };

      // Only add optional fields if they have real content
      if (form.companyName.trim()) {
        submitData.companyName = form.companyName.trim();
      }
      if (form.gstin.trim()) {
        submitData.gstin = form.gstin.trim();
      }

      // Opening balance (your existing logic)
      const amount = Number(form.openingBalanceAmount) || 0;
      if (amount > 0) {
        submitData.openingBalance =
          form.openingBalanceType === "debit" ? amount : -amount;
      }

      await addCustomer(submitData);
      onSuccess();
      reset();
      return true;
    } catch (err: any) {
      console.error("Add failed:", err);
      setError(err.message || "Failed to add customer");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
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
    setError(null);
  };

  return {
    form,
    updateField,
    setBalanceType, // ← expose this for radio
    submit,
    error,
    isLoading,
    reset,
  };
}

// Same for edit form
export function useEditCustomerForm(
  updateCustomer: (
    id: string,
    data: Partial<Omit<Customer, "id" | "createdAt">>,
  ) => Promise<boolean>,
  initial: Customer | null,
  onSuccess: () => void,
) {
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

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  

  useEffect(() => {
    if (initial) {
      const bal = initial.openingBalance ?? 0;
      setForm({
        name: initial.name,
        companyName: initial.companyName || "",
        gstin: initial.gstin || "",
        phone: initial.phone,
        address: initial.address,
        state: initial.state || "",
        openingBalanceType: bal >= 0 ? "debit" : "credit",
        openingBalanceAmount: Math.abs(bal).toString() || "",
      });
    }
  }, [initial]);
  

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const setBalanceType = (type: "debit" | "credit") => {
    setForm((prev) => ({ ...prev, openingBalanceType: type }));
  };

  const submit = async (): Promise<boolean> => {
    if (!initial?.id) {
      setError("No customer selected");
      return false;
    }

    if (!form.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!form.phone.trim()) {
      setError("Phone is required");
      return false;
    }
    if (!form.address.trim()) {
      setError("Address is required");
      return false;
    }

    setIsLoading(true); // ← FIXED: Start loading here!
    setError(null);

    try {
      const submitData: Partial<Omit<Customer, "id" | "createdAt">> = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      };
      if (form.companyName?.trim()) {
        submitData.companyName = form.companyName.trim();
      }
      if (form.gstin?.trim()) {
        submitData.gstin = form.gstin.trim();
      }
      if (form.state?.trim()) {
        submitData.state = form.state.trim();
      }

      // Opening balance logic – must be here!
      const amount = Number(form.openingBalanceAmount) || 0;
      if (amount > 0) {
        submitData.openingBalance =
          form.openingBalanceType === "debit" ? amount : -amount;
      } else {
        submitData.openingBalance = 0; // or undefined if you want to remove field
      }

      console.log("Updating customer with:", submitData); // ← Debug log

      await updateCustomer(initial.id, submitData);
      onSuccess();
      return true;
    } catch (err: any) {
      const msg = err.message || "Failed to update customer";
      setError(msg);
      toast.error("Update failed", { description: msg });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  

  return {
    form,
    updateField,
    setBalanceType,
    submit,
    error,
    isLoading,
  };
}
