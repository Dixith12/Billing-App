"use client";

import { Card } from "@/components/ui/card";
import {
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardsProps {
  totalSales: number;
  totalPaid: number;
  totalPending: number;
}

export function SummaryCards({
  totalSales,
  totalPaid,
  totalPending,
}: SummaryCardsProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);

  const collectionRate =
    totalSales > 0 ? ((totalPaid / totalSales) * 100).toFixed(1) : "0.0";
  const pendingRate =
    totalSales > 0 ? ((totalPending / totalSales) * 100).toFixed(1) : "0.0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Sales */}
      <Card className="group relative p-6 border border-slate-200 rounded-xl transition-all duration-300 hover:-translate-y-0.5 bg-white overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Total Sales
            </div>
            <div className="p-3 rounded-lg bg-primary">
              <IndianRupee className="h-5 w-5 text-white" />
            </div>
          </div>

          <div className="text-3xl md:text-4xl font-bold text-slate-800 mb-1">
            {formatCurrency(totalSales)}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Wallet className="h-3.5 w-3.5 text-slate-400" />
            <span>All invoices issued</span>
          </div>

          {/* Subtle progress bar */}
          <div className="mt-5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
              style={{ width: "85%" }} // static for sales – always looks "full"
            />
          </div>
        </div>
      </Card>

      {/* Total Received / Paid */}
      <Card className="group relative p-6 border border-slate-200 rounded-xl transition-all duration-300 hover:-translate-y-0.5 bg-white overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Total Received
            </div>
            <div className="p-3 rounded-lg bg-primary">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
          </div>

          <div className="text-3xl md:text-4xl font-bold mb-1">
            {formatCurrency(totalPaid)}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">
                {collectionRate}% collected
              </span>
            </div>
          </div>

          <div className="mt-5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(Number(collectionRate), 100)}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Total Pending / Due */}
      <Card className="group relative p-6 border border-slate-200 rounded-xl transition-all duration-300 hover:-translate-y-0.5 bg-white overflow-hidden">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Total Due
            </div>
            <div className="p-3 rounded-lg bg-primary">
              {totalPending === 0 ? (
                <CheckCircle2 className="h-5 w-5 text-white" />
              ) : (
                <AlertCircle className="h-5 w-5 text-white" />
              )}
            </div>
          </div>

          <div
            className={cn(
              "text-3xl md:text-4xl font-bold mb-1",
              totalPending === 0 ? "text-emerald-700" : "text-orange-700",
            )}
          >
            {formatCurrency(totalPending)}
          </div>

          <div className="flex items-center gap-2">
            {totalPending === 0 ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700">
                  All cleared
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-100">
                <TrendingUp className="h-3.5 w-3.5 text-orange-600 rotate-180" />
                <span className="text-xs font-semibold text-orange-700">
                  {pendingRate}% outstanding
                </span>
              </div>
            )}
          </div>

          <div className="mt-5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000 ease-out",
                totalPending === 0 ? "bg-green-600 w-full" : "bg-amber-600",
              )}
              style={{
                width:
                  totalPending === 0
                    ? "100%"
                    : `${Math.min(Number(pendingRate), 100)}%`,
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
