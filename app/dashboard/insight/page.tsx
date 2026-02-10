"use client";

import { useState } from "react";
import { BarChart3, Calendar, Sparkles, TrendingUp } from "lucide-react";

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
  });

  const hasData = invoices.length > 0 || expenses.length > 0 || purchases.length > 0;

  // Format month for display
  const getMonthLabel = () => {
    return selectedMonth.toLocaleDateString("en-IN", { 
      month: "long", 
      year: "numeric" 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 space-y-8">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Title Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
                  Business Insights
                </h1>
                <p className="text-sm text-slate-600 mt-0.5 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                  Track performance, expenses and profitability
                </p>
              </div>
            </div>
          </div>

          {/* Month Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-700">
                {getMonthLabel()}
              </span>
            </div>

            {/* <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
              <input
                type="month"
                value={`${selectedMonth.getFullYear()}-${String(
                  selectedMonth.getMonth() + 1,
                ).padStart(2, "0")}`}
                onChange={(e) => {
                  const [year, month] = e.target.value.split("-");
                  setSelectedMonth(new Date(Number(year), Number(month) - 1));
                }}
                className="relative border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all cursor-pointer hover:border-indigo-200"
              />
            </div> */}
          </div>
        </div>

        {hasData ? (
          <>
            {/* ================= KPI CARDS ================= */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <InsightKpiCards
  totalSales={kpis.totalSales}
  prevSales={kpis.prevSales}

  totalExpenses={kpis.totalExpenses}
  prevExpenses={kpis.prevExpenses}

  totalPurchase={kpis.totalPurchase}
  prevPurchase={kpis.prevPurchase}

  netProfit={kpis.netProfit}
  prevProfit={kpis.prevProfit}
/>

            </section>

            {/* ================= CHARTS SECTION ================= */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <SalesTrendCard data={salesTrend} />
              <ExpenseBreakdownCard data={expenseBreakdown} />
            </section>

            {/* ================= TOP PRODUCTS ================= */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <TopProductsCard data={topProducts} />
            </section>
          </>
        ) : (
          /* ================= EMPTY STATE ================= */
          <div className="relative mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 via-white to-blue-100/30 rounded-3xl blur-2xl" />
            
            <div className="relative text-center py-20 lg:py-32 px-6 border-2 border-dashed border-slate-200 rounded-3xl bg-white/80 backdrop-blur-sm">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg">
                <BarChart3 className="h-10 w-10 text-slate-400" />
              </div>

              {/* Text */}
              <h3 className="text-2xl font-bold text-slate-700 mb-3">
                No Data Available Yet
              </h3>
              <p className="text-slate-500 max-w-md mx-auto mb-8">
                Start creating invoices, recording expenses, or tracking purchases to unlock powerful insights about your business performance.
              </p>

              {/* Action cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📊</span>
                  </div>
                  <p className="font-semibold text-sm text-slate-700">Create Invoices</p>
                  <p className="text-xs text-slate-500 mt-1">Track your sales</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-100">
                  <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">💰</span>
                  </div>
                  <p className="font-semibold text-sm text-slate-700">Log Expenses</p>
                  <p className="text-xs text-slate-500 mt-1">Monitor spending</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-100">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🛒</span>
                  </div>
                  <p className="font-semibold text-sm text-slate-700">Add Purchases</p>
                  <p className="text-xs text-slate-500 mt-1">Manage inventory</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}