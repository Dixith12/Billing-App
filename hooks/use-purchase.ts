"use client";

import { useState, useEffect } from "react";
import {
  addPurchase,
  getPurchases,
  updatePurchase,
  deletePurchase,
} from "@/lib/firebase/purchase";
import type { Purchase } from "@/lib/firebase/purchase";

export function usePurchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // MOVE THIS OUT
  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const data = await getPurchases();
      setPurchases(data);
    } catch (err: any) {
      setError(err.message || "Failed to load purchases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const addNewPurchase = async (
    data: Omit<Purchase, "id" | "purchaseNumber" | "createdAt">,
  ) => {
    try {
      const newPurchase = await addPurchase(data);
      setPurchases((prev) => [newPurchase, ...prev]);
      return { success: true, purchase: newPurchase };
    } catch (err: any) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const editPurchase = async (
    id: string,
    data: Partial<Omit<Purchase, "id" | "purchaseNumber" | "createdAt">>,
  ) => {
    try {
      await updatePurchase(id, data);
      setPurchases((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...data } : p)),
      );
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const removePurchase = async (id: string): Promise<void> => {
    try {
      await deletePurchase(id);
      setPurchases((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete purchase");
      throw err;
    }
  };

  return {
    purchases,
    loading,
    error,

    addPurchase: addNewPurchase,
    updatePurchase: editPurchase,
    deletePurchase: removePurchase,

    refetch: fetchPurchases, // THIS IS THE KEY
  };
}
