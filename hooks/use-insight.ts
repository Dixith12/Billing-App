"use client";

import { useMemo } from "react";
import { Timestamp } from "firebase/firestore";
import type { Invoice } from "@/lib/firebase/invoices";
import type { Expense } from "@/lib/firebase/expenses";
import type { Purchase } from "@/lib/firebase/purchase";

/* -------------------- HELPERS -------------------- */

// Convert Firestore Timestamp / Date / string → Date
function toDate(
  value?: Timestamp | Date | string | null
): Date | null {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "string") return new Date(value);
  return null;
}

// Check if date belongs to given month
function isSameMonth(date: Date, month: number, year: number) {
  return (
    date.getMonth() === month &&
    date.getFullYear() === year
  );
}

// Format month label (e.g. "Feb 2026")
function formatMonth(date: Date) {
  return date.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });
}

/* -------------------- TYPES -------------------- */

interface UseInsightsInput {
  invoices: Invoice[];
  expenses: Expense[];
  purchases: Purchase[];
  selectedMonth?: Date; // defaults to current month
}

export function useInsights({
  invoices,
  expenses,
  purchases,
  selectedMonth = new Date(),
}: UseInsightsInput) {
  return useMemo(() => {
    const month = selectedMonth.getMonth();
    const year = selectedMonth.getFullYear();

    /* ===================== SALES ===================== */

    const validInvoices = invoices.filter(
      (inv) => inv.status !== "cancelled"
    );

    const monthlyInvoices = validInvoices.filter((inv) => {
      const date = toDate(inv.invoiceDate);
      return date ? isSameMonth(date, month, year) : false;
    });

    const totalSales = monthlyInvoices.reduce(
      (sum, inv) => sum + inv.netAmount,
      0
    );

    /* ===================== EXPENSES ===================== */

    const monthlyExpenses = expenses.filter((exp) => {
      const date = toDate(exp.date);
      return date ? isSameMonth(date, month, year) : false;
    });

    const totalExpenses = monthlyExpenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );

    /* ===================== PURCHASES ===================== */

    const monthlyPurchases = purchases.filter((pur) => {
      const date = toDate(pur.purchaseDate);
      return date ? isSameMonth(date, month, year) : false;
    });

    const totalPurchase = monthlyPurchases.reduce(
      (sum, pur) => sum + pur.netAmount,
      0
    );

    /* ===================== NET PROFIT ===================== */

    const netProfit =
      totalSales - totalExpenses - totalPurchase;

    /* ===================== SALES TREND (LAST 6 MONTHS) ===================== */

    const salesTrendMap = new Map<string, number>();

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      salesTrendMap.set(formatMonth(d), 0);
    }

    validInvoices.forEach((inv) => {
      const date = toDate(inv.invoiceDate);
      if (!date) return;

      const label = formatMonth(date);
      if (salesTrendMap.has(label)) {
        salesTrendMap.set(
          label,
          (salesTrendMap.get(label) || 0) + inv.netAmount
        );
      }
    });

    const salesTrend = Array.from(
      salesTrendMap,
      ([month, amount]) => ({ month, amount })
    );

    /* ===================== EXPENSE BREAKDOWN ===================== */

    const expenseMap = new Map<string, number>();

    monthlyExpenses.forEach((exp) => {
      const key = exp.category || "Other";
      expenseMap.set(
        key,
        (expenseMap.get(key) || 0) + exp.amount
      );
    });

    const expenseBreakdown = Array.from(
      expenseMap,
      ([category, amount]) => ({ category, amount })
    );

    /* ===================== TOP 5 PRODUCTS ===================== */

    const productMap = new Map<
      string,
      { revenue: number; quantity: number }
    >();

    validInvoices.forEach((inv) => {
      inv.products.forEach((p) => {
        const existing = productMap.get(p.name) || {
          revenue: 0,
          quantity: 0,
        };

        productMap.set(p.name, {
          revenue: existing.revenue + p.total,
          quantity: existing.quantity + p.quantity,
        });
      });
    });

    const topProducts = Array.from(productMap.entries())
      .map(([name, data]) => ({
        name,
        revenue: data.revenue,
        quantitySold: data.quantity,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    /* ===================== RETURN ===================== */

    return {
      kpis: {
        totalSales,
        totalExpenses,
        totalPurchase,
        netProfit,
      },
      salesTrend,
      expenseBreakdown,
      topProducts,
    };
  }, [invoices, expenses, purchases, selectedMonth]);
}
