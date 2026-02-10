"use client";

import { useMemo } from "react";
import type { Invoice } from "@/lib/firebase/invoices";
import type { Expense } from "@/lib/firebase/expenses";
import type { Purchase } from "@/lib/firebase/purchase";

/* -------------------- HELPERS -------------------- */

function formatMonth(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });
}

const isBetween = (date: Date, start: Date, end: Date) =>
  date >= start && date <= end;

function safeParseDate(raw: any): Date | null {
  if (!raw) return null;

  // ── Firestore Timestamp as plain object (most common when coming from hooks/serialization)
  if (
    raw &&
    typeof raw === "object" &&
    typeof raw.seconds === "number" &&
    (typeof raw.nanoseconds === "number" || raw.nanoseconds == null)
  ) {
    const seconds = raw.seconds;
    const nanos = raw.nanoseconds ?? 0;
    const ms = seconds * 1000 + Math.floor(nanos / 1_000_000);
    const date = new Date(ms);
    return isNaN(date.getTime()) ? null : date;
  }

  // ── Real Firestore Timestamp object (if .toDate exists)
  if (raw?.toDate && typeof raw.toDate === "function") {
    const d = raw.toDate();
    return isNaN(d.getTime()) ? null : d;
  }

  // ── ISO string or other standard string
  if (typeof raw === "string") {
    const date = new Date(raw.trim());
    if (!isNaN(date.getTime())) return date;

    // Fallback: try common dd/mm/yyyy, mm-dd-yyyy, etc.
    const parts = raw.split(/[-/T ]/);
    if (parts.length >= 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      } else if (parts[2].length === 4) {
        // DD/MM/YYYY or DD-MM-YYYY
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
    }
  }

  // ── Number (milliseconds or seconds)
  if (typeof raw === "number") {
    const ms = raw < 1_000_000_000_000 ? raw * 1000 : raw;
    const d = new Date(ms);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}



/* -------------------- TYPES -------------------- */

interface UseInsightsInput {
  invoices: Invoice[];
  expenses: Expense[];
  purchases: Purchase[];
}

export function useInsights({
  invoices,
  expenses,
  purchases,
}: UseInsightsInput) {
  return useMemo(() => {
    /* ===================== HELPERS ===================== */
    const toFixedNumber = (value: number) => Number(value.toFixed(2));

    /* ===================== KPI CALCULATIONS ===================== */

    const totalSales = toFixedNumber(
      invoices.reduce((sum, inv) => sum + Number(inv.netAmount || 0), 0)
    );

    const totalExpenses = toFixedNumber(
      expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0)
    );

    const totalPurchase = toFixedNumber(
      purchases.reduce((sum, pur) => sum + Number(pur.netAmount || 0), 0)
    );

    const netProfit = toFixedNumber(totalSales - totalExpenses - totalPurchase);

/* ===================== PREVIOUS MONTH KPI CALCULATIONS ===================== */

const now = new Date();


// Last month range
const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

// ---- Previous Sales ----
let prevSales = 0;

invoices.forEach(inv => {
  const date = safeParseDate(inv.invoiceDate ?? inv.createdAt);
  if (!date) return;

  if (isBetween(date, startOfLastMonth, endOfLastMonth)) {
    prevSales += Number(inv.netAmount || 0);
  }
});

prevSales = toFixedNumber(prevSales);

// ---- Previous Expenses ----
let prevExpenses = 0;

expenses.forEach(exp => {
  const date = safeParseDate(exp.createdAt);
  if (!date) return;

  if (isBetween(date, startOfLastMonth, endOfLastMonth)) {
    prevExpenses += Number(exp.amount || 0);
  }
});

prevExpenses = toFixedNumber(prevExpenses);

// ---- Previous Purchases ----
let prevPurchase = 0;

purchases.forEach(pur => {
  const date = safeParseDate(pur.createdAt);
  if (!date) return;

  if (isBetween(date, startOfLastMonth, endOfLastMonth)) {
    prevPurchase += Number(pur.netAmount || 0);
  }
});

prevPurchase = toFixedNumber(prevPurchase);

// ---- Previous Net Profit ----
const prevProfit = toFixedNumber(
  prevSales - prevExpenses - prevPurchase
);



    /* ===================== SALES TREND – LAST 6 MONTHS ===================== */

    const today = new Date();
    const monthKeys: string[] = [];

    // Generate last 6 months (oldest to newest)
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      monthKeys.push(formatMonth(d));
    }
    monthKeys.reverse(); // Sep → Feb order


    const salesTrendMap = new Map<string, number>();
    monthKeys.forEach(key => salesTrendMap.set(key, 0));

  
    let matched = 0;
    let skipped = 0;

    invoices.forEach((inv, idx) => {
      const rawDate = inv.invoiceDate ?? inv.createdAt ?? null;
      const date = safeParseDate(rawDate);

      if (!date) {
        skipped++;
        return;
      }

      const monthKey = formatMonth(date);
      const amount = Number(inv.netAmount || 0);

      console.log(
        `[${idx + 1}] ${monthKey.padEnd(12)} | amount: ${amount.toFixed(2)} | id: ${inv.id || "?"}`
      );

      if (salesTrendMap.has(monthKey)) {
        const current = salesTrendMap.get(monthKey) || 0;
        salesTrendMap.set(monthKey, toFixedNumber(current + amount));
        matched++;
      } else {
        console.log(`       └─ outside range`);
      }
    });

    const salesTrend = monthKeys.map(month => ({
      month,
      amount: salesTrendMap.get(month) || 0,
    }));


    /* ===================== EXPENSE BREAKDOWN ===================== */

    const expenseMap = new Map<string, number>();

    expenses.forEach((exp) => {
      const key = exp.category || "Other";
      const current = expenseMap.get(key) || 0;
      expenseMap.set(key, toFixedNumber(current + Number(exp.amount || 0)));
    });

    const expenseBreakdown = Array.from(expenseMap, ([category, amount]) => ({
      category,
      amount,
    }));

    /* ===================== TOP PRODUCTS ===================== */

    const productMap = new Map<
      string,
      { revenue: number; quantity: number }
    >();

    invoices.forEach((inv) => {
      inv.products?.forEach((p) => {
        const name = p.name?.trim() || "Unnamed";
        const existing = productMap.get(name) || { revenue: 0, quantity: 0 };

        productMap.set(name, {
          revenue: toFixedNumber(existing.revenue + Number(p.total || 0)),
          quantity: existing.quantity + Number(p.quantity || 0),
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

    return {
      kpis: {
  totalSales,
  prevSales,

  totalExpenses,
  prevExpenses,

  totalPurchase,
  prevPurchase,

  netProfit,
  prevProfit,
},

      salesTrend,
      expenseBreakdown,
      topProducts,
    };
  }, [invoices, expenses, purchases]);
}