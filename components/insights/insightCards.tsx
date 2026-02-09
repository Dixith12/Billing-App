"use client";

import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  totalSales: number;
  totalExpenses: number;
  totalPurchase: number;
  netProfit: number;
}

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export function InsightKpiCards({
  totalSales,
  totalExpenses,
  totalPurchase,
  netProfit,
}: Props) {
  const profitPositive = netProfit >= 0;

  const cards = [
    {
      label: "Total Sales",
      value: totalSales,
      icon: IndianRupee,
      bg: "from-indigo-50 to-indigo-100",
      iconBg: "bg-indigo-600",
    },
    {
      label: "Expenses",
      value: totalExpenses,
      icon: Wallet,
      bg: "from-rose-50 to-rose-100",
      iconBg: "bg-rose-600",
    },
    {
      label: "Purchase",
      value: totalPurchase,
      icon: ShoppingCart,
      bg: "from-amber-50 to-amber-100",
      iconBg: "bg-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className={cn(
              "rounded-2xl p-5 border border-slate-200 bg-gradient-to-br",
              c.bg
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">
                {c.label}
              </p>
              <div
                className={cn(
                  "p-2 rounded-xl text-white shadow",
                  c.iconBg
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <p className="mt-4 text-2xl font-bold text-slate-900">
              {formatINR(c.value)}
            </p>
          </div>
        );
      })}

      {/* NET PROFIT CARD */}
      <div
        className={cn(
          "rounded-2xl p-5 border bg-gradient-to-br",
          profitPositive
            ? "from-emerald-50 to-emerald-100 border-emerald-200"
            : "from-red-50 to-red-100 border-red-200"
        )}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-600">
            Net Profit
          </p>
          <div
            className={cn(
              "p-2 rounded-xl text-white shadow",
              profitPositive ? "bg-emerald-600" : "bg-red-600"
            )}
          >
            {profitPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
          </div>
        </div>

        <p
          className={cn(
            "mt-4 text-2xl font-bold",
            profitPositive
              ? "text-emerald-700"
              : "text-red-700"
          )}
        >
          {formatINR(netProfit)}
        </p>
      </div>
    </div>
  );
}
