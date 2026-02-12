"use client";

import { useState } from "react";
import { BarChart3, Calendar, Filter } from "lucide-react";

import { useApp } from "@/lib/app-context";
import { useInsights } from "@/hooks/use-insight";
import { useExpenses } from "@/hooks/use-expenses";
import { usePurchases } from "@/hooks/use-purchase";

import { InsightKpiCards } from "@/components/insights/insightCards";
import { SalesTrendCard } from "@/components/insights/salesTrendChart";
import { ExpenseBreakdownCard } from "@/components/insights/expensePieChart";
import { TopProductsCard } from "@/components/insights/topProductList";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function InsightPage() {
  const { invoices } = useApp();
  const { expenses } = useExpenses();
  const { purchases } = usePurchases();

  /* ---------------- UI-only date picker state ---------------- */
  const [datePreset, setDatePreset] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const clearDateFilter = () => {
    setDatePreset(null);
    setDateFrom("");
    setDateTo("");
  };

  /* ---------------- Insights (unchanged) ---------------- */
  const {
    kpis,
    salesTrend,
    expenseBreakdown,
    topProducts,
  } = useInsights({
    invoices,
    expenses,
    purchases,
    datePreset,
    dateFrom,
    dateTo,
  });

  const hasData =
    invoices.length > 0 || expenses.length > 0 || purchases.length > 0;

  const getMonthLabel = () => {
    return new Date().toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 space-y-8">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Title */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
                Business Insights
              </h1>
            </div>
          </div>

          {/* Month + Date Filter */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Month display */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-700">
                {getMonthLabel()}
              </span>
            </div>

            {/* Date Filter UI */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "border-slate-300",
                    (datePreset || dateFrom || dateTo) &&
                      "border-primary text-primary"
                  )}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Date Filter
                </Button>
              </PopoverTrigger>

              <PopoverContent
                align="end"
                className="w-96 p-6 bg-white border border-slate-200 rounded-xl"
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold">Filter by Date</h3>
                  </div>

                  {/* Presets */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "All", value: null },
                      { label: "Today", value: "today" },
                      { label: "Yesterday", value: "yesterday" },
                      { label: "This Month", value: "thisMonth" },
                      { label: "Last 30 days", value: "last30days" },
                    ].map((item) => (
                      <Button
                        key={item.label}
                        size="sm"
                        variant={
                          datePreset === item.value ? "default" : "outline"
                        }
                        onClick={() => {
                          setDatePreset(item.value);
                          setDateFrom("");
                          setDateTo("");
                        }}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>

                  {/* Custom range */}
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => {
                          setDateFrom(e.target.value);
                          setDatePreset(null);
                        }}
                      />
                      <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => {
                          setDateTo(e.target.value);
                          setDatePreset(null);
                        }}
                      />
                    </div>
                  </div>

                  {(datePreset || dateFrom || dateTo) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearDateFilter}
                      className="w-full text-red-600 border-red-200"
                    >
                      Clear Filter
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {hasData && (
          <>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SalesTrendCard data={salesTrend} />
              <ExpenseBreakdownCard data={expenseBreakdown} />
            </div>

            <TopProductsCard data={topProducts} />
          </>
        )}
      </div>
    </div>
  );
}
