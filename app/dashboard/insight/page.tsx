"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";

import { useApp } from "@/lib/app-context";
import { useInsights } from "@/hooks/use-insight";
import { useExpenses } from "@/hooks/use-expenses";
import { usePurchases } from "@/hooks/use-purchase";


import { InsightKpiCards } from "@/components/insights/insightCards";
import { SalesTrendCard } from "@/components/insights/salesTrendChart";
import { ExpenseBreakdownCard } from "@/components/insights/expensePieChart";
import { TopProductsCard } from "@/components/insights/topProductList";

export default function InsightPage() {
const { invoices } = useApp();
const { expenses } = useExpenses();
const { purchases } = usePurchases();

  // selected month (default = current month)
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const {
    kpis,
    salesTrend,
    expenseBreakdown,
    topProducts,
  } = useInsights({
    invoices,
    expenses,
    purchases,
    selectedMonth,
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-350 mx-auto p-6 lg:p-8 space-y-8">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="flex items-center gap-2 text-lg lg:text-xl font-bold tracking-tight">
              <span className="p-1.5 bg-primary rounded-md">
                <BarChart3 className="h-4 w-4 text-white" />
              </span>
              Business Insights
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Monthly performance, expenses and profit overview
            </p>
          </div>

          {/* Month selector (simple for now) */}
          <input
            type="month"
            value={`${selectedMonth.getFullYear()}-${String(
              selectedMonth.getMonth() + 1,
            ).padStart(2, "0")}`}
            onChange={(e) => {
              const [year, month] = e.target.value.split("-");
              setSelectedMonth(new Date(Number(year), Number(month) - 1));
            }}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-slate-400 focus:ring-slate-400/20"
          />
        </div>

        {/* ================= KPI CARDS ================= */}
        <InsightKpiCards
          totalSales={kpis.totalSales}
          totalExpenses={kpis.totalExpenses}
          totalPurchase={kpis.totalPurchase}
          netProfit={kpis.netProfit}
        />

        {/* ================= CHARTS SECTION ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesTrendCard data={salesTrend} />
          <ExpenseBreakdownCard data={expenseBreakdown} />
        </div>

        {/* ================= TOP PRODUCTS ================= */}
        <TopProductsCard data={topProducts} />

        {/* ================= EMPTY STATE ================= */}
        {invoices.length === 0 && expenses.length === 0 && (
          <div className="text-center py-20 border border-dashed border-slate-300 rounded-xl">
            <p className="font-medium text-slate-700">
              No data available yet
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Create invoices, expenses, or purchases to see insights
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
