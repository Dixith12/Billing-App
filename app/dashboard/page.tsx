"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { TransactionsTable } from "@/components/dashboard/transactions-table";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { useApp } from "@/lib/app-context";
import { Plus, BarChart3, CheckCircle2 } from "lucide-react";
import { useDashboard } from "../../hooks/use-dashboard";
import Link from "next/link";

export default function DashboardPage() {
  const { invoices } = useApp();
  const dashboardHook = useDashboard(invoices);

  const totals = useMemo(() => {
    const filtered = dashboardHook.filteredInvoices;

    const totalSales = filtered.reduce((sum, inv) => sum + inv.netAmount, 0);

    // This is the important change
    const totalPaid = filtered.reduce((sum, inv) => {
      const effectivePaid = Math.min(
        inv.paidAmount || 0, // what was actually paid/recorded
        inv.netAmount, // but never show more than current invoice total
      );
      return sum + effectivePaid;
    }, 0);

    const totalPending = filtered.reduce((sum, inv) => {
      const remaining = inv.netAmount - (inv.paidAmount || 0);
      return sum + (remaining > 0 ? remaining : 0);
    }, 0);

    return { totalSales, totalPaid, totalPending };
  }, [dashboardHook.filteredInvoices]);

  return (
    <div className="min-h-screen bg-white">
      <div className="relative p-6 lg:p-8 space-y-8 max-w-350 mx-auto">
        <div className="relative mb-10">
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-col items-start gap-2">
                <h1 className="flex justify-start items-center gap-2 text-lg lg:text-xl font-bold tracking-tight">
                  <div className="relative p-1.5 bg-primary rounded-md">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  Sales Overview
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Track invoices, payments and business performance
                </p>
              </div>
            </div>

            {/* Create Invoice Button */}
            <Link href="/dashboard/invoice">
              <Button
                size="lg"
                className="group relative overflow-hidden hover:scale-105 px-8 w-full lg:w-auto"
              >
                <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-semibold">Create Invoice</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Financial Summary Section */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-semibold text-slate-700">Financial Summary</h2>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <SummaryCards
              totalSales={totals.totalSales}
              totalPaid={totals.totalPaid}
              totalPending={totals.totalPending}
            />
          </div>
        </div>

        {/* Recent Transactions Section */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-semibold text-slate-700">
              Recent Transactions
            </h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <TransactionsTable invoices={invoices} {...dashboardHook} />
          </div>
        </div>

        {/* Footer Status */}
        <div className="pt-8 pb-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-primary/5 border border-indigo-200/60 rounded-xl">
            <div className="flex items-center gap-3 text-sm text-indigo-900">
              <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0" />
              <span className="font-medium">
                Showing {dashboardHook.filteredInvoices.length} transaction
                {dashboardHook.filteredInvoices.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="text-xs text-indigo-700" suppressHydrationWarning>
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
