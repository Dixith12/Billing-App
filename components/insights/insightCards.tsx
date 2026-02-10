"use client";

import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
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
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(n);

const formatCompactINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

export function InsightKpiCards({
  totalSales,
  totalExpenses,
  totalPurchase,
  netProfit,
}: Props) {
  const profitPositive = netProfit >= 0;

  // You can compute real changes later (from previous period)
  // For now using dummy values – replace with real logic
  const dummyTrends = {
    sales: { value: 8.4, positive: true },
    expenses: { value: 3.2, positive: false },
    purchase: { value: 12.1, positive: false },
    profit: { value: 15.7, positive: profitPositive },
  };

  const cards = [
    {
      label: "Total Sales",
      value: totalSales,
      icon: IndianRupee,
      gradient: "from-indigo-500/10 via-indigo-500/5 to-transparent",
      iconBg: "from-indigo-500 to-indigo-600",
      iconBgHover: "group-hover:shadow-indigo-200",
      border: "border-indigo-100/60 hover:border-indigo-200/80",
      accentColor: "bg-indigo-500",
      trend: dummyTrends.sales,
    },
    {
      label: "Expenses",
      value: totalExpenses,
      icon: Wallet,
      gradient: "from-rose-500/10 via-rose-500/5 to-transparent",
      iconBg: "from-rose-500 to-rose-600",
      iconBgHover: "group-hover:shadow-rose-200",
      border: "border-rose-100/60 hover:border-rose-200/80",
      accentColor: "bg-rose-500",
      trend: dummyTrends.expenses,
    },
    {
      label: "Purchases",
      value: totalPurchase,
      icon: ShoppingCart,
      gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
      iconBg: "from-amber-500 to-amber-600",
      iconBgHover: "group-hover:shadow-amber-200",
      border: "border-amber-100/60 hover:border-amber-200/80",
      accentColor: "bg-amber-500",
      trend: dummyTrends.purchase,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        const isPositive = card.trend.positive;

        return (
          <div
            key={card.label}
            className={cn(
              "group relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1",
              card.border
            )}
          >
            {/* Gradient overlay */}
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-100 transition-opacity",
                card.gradient
              )}
            />

            {/* Animated background blob */}
            <div
              className={cn(
                "absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-20 group-hover:scale-125",
                card.accentColor
              )}
            />

            <div className="relative">
              {/* Header with icon */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                    card.iconBg,
                    card.iconBgHover
                  )}
                >
                  <Icon className="h-6 w-6" strokeWidth={2.5} />
                </div>

                {/* Trend badge */}
                <div
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
                    isPositive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  )}
                >
                  {isPositive ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {card.trend.value.toFixed(1)}%
                </div>
              </div>

              {/* Content */}
              <div>
                <p className="text-sm font-semibold text-slate-500 tracking-wide uppercase">
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                  {formatINR(card.value)}
                </p>

                {/* Bottom trend text */}
                <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <span
                    className={cn(
                      "inline-block w-1.5 h-1.5 rounded-full",
                      isPositive ? "bg-emerald-500" : "bg-rose-500"
                    )}
                  />
                  <span>
                    {isPositive ? "Up" : "Down"} from last month
                  </span>
                </div>
              </div>
            </div>

            {/* Decorative corner accent */}
            <div
              className={cn(
                "absolute bottom-0 right-0 h-20 w-20 translate-x-10 translate-y-10 rounded-full opacity-5 transition-all duration-500 group-hover:opacity-10 group-hover:scale-150",
                card.accentColor
              )}
            />
          </div>
        );
      })}

      {/* Net Profit Card – Special prominence */}
      <div
        className={cn(
          "group relative overflow-hidden rounded-3xl border p-6 shadow-md transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 lg:col-span-1",
          profitPositive
            ? "bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/50 border-emerald-200/80 hover:border-emerald-300"
            : "bg-gradient-to-br from-rose-50/90 via-white to-rose-50/50 border-rose-200/80 hover:border-rose-300"
        )}
      >
        {/* Animated gradient blob */}
        <div
          className={cn(
            "absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-10 blur-3xl transition-all duration-700 group-hover:opacity-25 group-hover:scale-125",
            profitPositive ? "bg-emerald-400" : "bg-rose-400"
          )}
        />

        {/* Decorative rings */}
        <div
          className={cn(
            "absolute -left-12 -bottom-12 h-40 w-40 rounded-full opacity-5 transition-all duration-500 group-hover:opacity-10 group-hover:scale-110",
            profitPositive ? "bg-emerald-400" : "bg-rose-400"
          )}
        />

        <div className="relative">
          {/* Header with icon */}
          <div className="flex items-start justify-between mb-4">
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6",
                profitPositive
                  ? "from-emerald-500 to-emerald-600 group-hover:shadow-emerald-200"
                  : "from-rose-500 to-rose-600 group-hover:shadow-rose-200"
              )}
            >
              {profitPositive ? (
                <TrendingUp className="h-7 w-7" strokeWidth={2.5} />
              ) : (
                <TrendingDown className="h-7 w-7" strokeWidth={2.5} />
              )}
            </div>

            {/* Large trend badge */}
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm",
                profitPositive
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700"
              )}
            >
              {profitPositive ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              {dummyTrends.profit.value.toFixed(1)}%
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-sm font-bold text-slate-600 tracking-wide uppercase flex items-center gap-2">
              Net Profit
              <span
                className={cn(
                  "inline-block w-2 h-2 rounded-full animate-pulse",
                  profitPositive ? "bg-emerald-500" : "bg-rose-500"
                )}
              />
            </p>
            <p
              className={cn(
                "mt-2 text-4xl font-black tracking-tight tabular-nums",
                profitPositive ? "text-emerald-700" : "text-rose-700"
              )}
            >
              {formatINR(netProfit)}
            </p>

            {/* Bottom status */}
            <div className="mt-3 flex items-center gap-2">
              <div
                className={cn(
                  "flex-1 h-1.5 rounded-full overflow-hidden",
                  profitPositive ? "bg-emerald-100" : "bg-rose-100"
                )}
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out",
                    profitPositive ? "bg-emerald-500" : "bg-rose-500"
                  )}
                  style={{ width: `${Math.min(dummyTrends.profit.value * 5, 100)}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                {profitPositive ? "Healthy" : "Review"}
              </span>
            </div>
          </div>
        </div>

        {/* Corner shine effect */}
        <div className="absolute top-0 right-0 h-24 w-24 translate-x-12 -translate-y-12 rounded-full bg-white opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20" />
      </div>
    </div>
  );
}