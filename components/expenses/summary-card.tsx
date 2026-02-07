"use client";

import { Card } from "@/components/ui/card";
import { ReceiptIndianRupee, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  totalExpenses: number;
}

export function SummaryCard({ totalExpenses }: SummaryCardProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);

  const isZero = totalExpenses === 0;

  return (
    <Card className="p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Total Expenses
          </p>
          <p className="text-sm text-slate-600">All time</p>
        </div>

        <div
          className={cn(
            "p-3 rounded-xl",
            isZero
              ? "bg-emerald-100 text-emerald-600"
              : "bg-orange-100 text-orange-600",
          )}
        >
          <ReceiptIndianRupee className="h-5 w-5" />
        </div>
      </div>

      {/* Amount */}
      <div className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
        {formatCurrency(totalExpenses)}
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 text-sm">
        {isZero ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-emerald-700 font-medium">
              No expenses recorded
            </span>
          </>
        ) : (
          <>
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <span className="text-orange-700 font-medium">
              Business outflow recorded
            </span>
          </>
        )}
      </div>
    </Card>
  );
}
