"use client";

interface Props {
  data: {
    month: string;
    amount: number;
  }[];
}

export function SalesTrendCard({ data }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">
          Sales Trend
        </h3>
        <span className="text-xs text-slate-500">
          Last 6 months
        </span>
      </div>

      {/* Placeholder until chart */}
      <div className="space-y-3">
        {data.map((d) => (
          <div
            key={d.month}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-slate-600">{d.month}</span>
            <span className="font-medium">
              ₹{d.amount.toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
