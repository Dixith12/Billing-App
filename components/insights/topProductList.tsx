"use client";

interface Props {
  data: {
    name: string;
    revenue: number;
    quantitySold: number;
  }[];
}

export function TopProductsCard({ data }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="font-semibold text-slate-800 mb-4">
        Top 5 Products
      </h3>

      <div className="space-y-4">
        {data.map((p, i) => (
          <div
            key={p.name}
            className="flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-slate-800">
                {i + 1}. {p.name}
              </p>
              <p className="text-xs text-slate-500">
                Qty sold: {p.quantitySold}
              </p>
            </div>

            <p className="font-semibold">
              ₹{p.revenue.toLocaleString("en-IN")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
