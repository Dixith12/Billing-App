'use client'

import { Card } from '@/components/ui/card'
import {
  ReceiptIndianRupee,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SummaryCardProps {
  totalExpenses: number
}

export function SummaryCard({ totalExpenses }: SummaryCardProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount)

  const isZero = totalExpenses === 0

  return (
    <Card
      className={cn(
        "group relative p-6 shadow-md hover:shadow-2xl border overflow-hidden",
        "transition-all duration-500 ease-out hover:scale-[1.02] hover:-translate-y-1",
        isZero
          ? "border-emerald-200/60 bg-gradient-to-br from-white via-white to-emerald-50/40"
          : "border-orange-200/60 bg-gradient-to-br from-white via-white to-orange-50/40"
      )}
    >
      {/* Hover overlay gradient */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700",
          isZero
            ? "bg-gradient-to-br from-emerald-500/8 via-transparent to-green-500/5"
            : "bg-gradient-to-br from-orange-500/8 via-transparent to-amber-500/5"
        )}
      />

      {/* Animated glow border on hover */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700",
          isZero
            ? "bg-gradient-to-r from-emerald-500/25 via-green-500/25 to-teal-500/25"
            : "bg-gradient-to-r from-orange-500/25 via-amber-500/25 to-red-500/25"
        )}
      />

      <div className="relative z-10">
        {/* Header row with icon */}
        <div className="flex items-center justify-between mb-5">
          <div className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
            Total Expenses
          </div>

          <div className="relative">
            {/* Icon background glow */}
            <div
              className={cn(
                "absolute inset-0 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500",
                isZero ? "bg-emerald-500" : "bg-orange-500"
              )}
            />

            <div
              className={cn(
                "relative p-3.5 rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300",
                isZero
                  ? "bg-gradient-to-br from-emerald-500 to-green-600"
                  : "bg-gradient-to-br from-orange-500 to-amber-600"
              )}
            >
              <ReceiptIndianRupee className="h-6 w-6 text-white" strokeWidth={2.2} />
            </div>
          </div>
        </div>

        {/* Amount – gradient text */}
        <div
          className={cn(
            "text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent mb-4 group-hover:scale-101 transition-transform duration-300",
            isZero
              ? "bg-gradient-to-r from-emerald-700 via-green-700 to-teal-700"
              : "bg-gradient-to-r from-orange-700 via-amber-700 to-red-700"
          )}
        >
          {formatCurrency(totalExpenses)}
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2.5 mb-5">
          {isZero ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-200/70">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">
                No expenses yet
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100/80 border border-orange-200/70 animate-pulse">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-xs font-semibold text-orange-700">
                Business outflow
              </span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-slate-100/80 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-1500 ease-out",
              isZero
                ? "bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 w-full"
                : "bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 w-[92%]"
            )}
          />
        </div>

        {/* Subtle footer text */}
        <div className="mt-4 text-xs text-slate-500 flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 opacity-70" />
          <span>All time • Updated now</span>
        </div>
      </div>
    </Card>
  )
}