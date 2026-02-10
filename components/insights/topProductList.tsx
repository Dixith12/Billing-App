"use client";

import { Package, IndianRupee, BarChart3, TrendingUp, Award } from "lucide-react";

interface Props {
  data: {
    name: string;
    revenue: number;
    quantitySold: number;
  }[];
}

export function TopProductsCard({ data }: Props) {
  const sortedData = [...data]
    .filter((item) => item.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const totalRevenue = sortedData.reduce((sum, p) => sum + p.revenue, 0);
  const hasData = sortedData.length > 0;

  // Calculate percentage for progress bars
  const maxRevenue = Math.max(...sortedData.map((p) => p.revenue), 1);

  return (
    <div className="group rounded-3xl border border-slate-200/60 bg-gradient-to-br from-white via-white to-blue-50/30 p-6 shadow-sm hover:shadow-lg hover:border-blue-200/60 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-1">
          <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
              <Award className="h-5 w-5 text-white" />
            </div>
            Top 5 Products
          </h3>
          {hasData && (
            <p className="text-sm text-slate-500 ml-11">
              Combined revenue:{" "}
              <span className="font-bold text-slate-700">
                ₹{totalRevenue.toLocaleString("en-IN")}
              </span>
            </p>
          )}
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full">
          <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
          <span className="text-xs text-blue-700 font-semibold">
            By revenue
          </span>
        </div>
      </div>

      {hasData ? (
        <div className="space-y-3">
          {sortedData.map((product, index) => {
            const percentage =
              totalRevenue > 0 ? (product.revenue / totalRevenue) * 100 : 0;

            const barWidth = (product.revenue / maxRevenue) * 100;

            return (
              <div
                key={product.name}
                className="group/item relative flex flex-col gap-3 rounded-2xl border border-slate-100 bg-gradient-to-r from-white to-slate-50/50 p-4 hover:from-slate-50 hover:to-slate-100/50 hover:border-slate-200 hover:shadow-md transition-all duration-300"
              >
                {/* Top section: Rank + Name + Revenue */}
                <div className="flex items-center gap-3">
                  {/* Simple numbered circle */}
                  <div
                    className={`
                      flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full 
                      font-bold text-base border-2 transition-all duration-300 group-hover/item:scale-110
                      ${
                        index === 0
                          ? "bg-blue-600 border-blue-700 text-white"
                          : index === 1
                          ? "bg-blue-500 border-blue-600 text-white"
                          : index === 2
                          ? "bg-blue-400 border-blue-500 text-white"
                          : "bg-slate-100 border-slate-300 text-slate-700"
                      }
                    `}
                  >
                    {index + 1}
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 group-hover/item:text-blue-700 transition-colors truncate">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded-md">
                            <Package className="h-3 w-3 text-slate-500" />
                            <span className="text-xs font-semibold text-slate-600">
                              {product.quantitySold.toLocaleString()} units
                            </span>
                          </div>
                          <div className="px-2 py-0.5 bg-blue-50 rounded-md">
                            <span className="text-xs font-bold text-blue-700">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Revenue */}
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                          <IndianRupee className="h-4 w-4 text-blue-600" />
                          <span className="font-extrabold text-lg text-slate-800 tabular-nums">
                            {product.revenue.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${barWidth}%` }}
                  />
                  {/* Shimmer effect */}
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                    style={{
                      width: `${barWidth}%`,
                      animation: "shimmer 2s infinite",
                    }}
                  />
                </div>

                {/* Decorative corner accent for top 3 – optional, kept subtle */}
                {index < 3 && (
                  <div
                    className="absolute top-0 right-0 w-16 h-16 opacity-5 rounded-bl-full transition-opacity group-hover/item:opacity-10"
                    style={{
                      background:
                        index === 0
                          ? "#3b82f6"
                          : index === 1
                          ? "#60a5fa"
                          : "#93c5fd",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border-2 border-dashed border-slate-200">
          <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
            <BarChart3 className="h-12 w-12 text-slate-300" />
          </div>
          <p className="text-lg font-semibold text-slate-500">
            No products sold yet
          </p>
          <p className="text-sm mt-2 text-center max-w-xs text-slate-400">
            Create invoices with products to see top performers
          </p>
        </div>
      )}

      {/* Shimmer animation keyframes */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}