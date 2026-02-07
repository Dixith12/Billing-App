"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Expense,
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
} from "@/lib/firebase/expenses";

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch expenses on mount
  useEffect(() => {
    async function fetchExpenses() {
      try {
        setLoading(true);
        const data = await getExpenses();
        setExpenses(data);
      } catch (err: any) {
        setError(err.message || "Failed to load expenses");
        console.error("Error fetching expenses:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchExpenses();
  }, []);

  const addNewExpense = async (
    data: Omit<Expense, "id" | "createdAt" | "updatedAt">,
  ): Promise<boolean> => {
    try {
      const newExpense = await addExpense(data);
      setExpenses((prev) => [newExpense, ...prev]);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to add expense");
      console.error("Add expense error:", err);
      return false;
    }
  };

  const editExpense = async (
    id: string,
    data: Partial<Omit<Expense, "id" | "createdAt" | "updatedAt">>,
  ): Promise<boolean> => {
    try {
      await updateExpense(id, data);

      setExpenses((prev) =>
        prev.map((exp) =>
          exp.id === id ? ({ ...exp, ...data } as Expense) : exp,
        ),
      );
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to update expense");
      console.error("Update expense error:", err);
      return false;
    }
  };

  const removeExpense = async (id: string): Promise<void> => {
    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete expense");
      console.error("Delete expense error:", err);
    }
  };

  function calculateTotalWithGst(exp: Expense): number {
    const taxable = Number(exp.amount) || 0;

    if (!exp.gstApplicable) return taxable;

    const isKarnataka = (exp.state || "").toLowerCase() === "karnataka";

    let gstPercent = 0;

    if (isKarnataka) {
      gstPercent =
        (Number(exp.cgstPercent) || 0) + (Number(exp.sgstPercent) || 0);
    } else {
      gstPercent = Number(exp.igstPercent) || 0;
    }

    return taxable + (taxable * gstPercent) / 100;
  }

  // Computed totals (can be extended later with GST calculations)
  const totals = useMemo(() => {
    const totalWithoutGst = expenses.reduce(
      (sum, exp) => sum + (Number(exp.amount) || 0),
      0,
    );

    const totalWithGst = expenses.reduce(
      (sum, exp) => sum + calculateTotalWithGst(exp),
      0,
    );

    return {
      totalWithoutGst, // optional (for future reports)
      totalWithGst, // THIS is what SummaryCard should use
      count: expenses.length,
    };
  }, [expenses]);

  return {
    expenses,
    loading,
    error,
    addExpense: addNewExpense,
    updateExpense: editExpense,
    deleteExpense: removeExpense,
    totals,
  };
}
