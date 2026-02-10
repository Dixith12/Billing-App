"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
} from "recharts";
import { IndianRupee, TrendingUp, Calendar } from "lucide-react";

interface Props {
  data: {
    month: string;
    amount: number;
  }[];
}

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const amt = payload[0].value;
    return (
      <div className="bg-gradient-to-br from-white to-slate-50 border border-indigo-100 shadow-xl rounded-xl p-4 text-sm backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-3.5 w-3.5 text-indigo-500" />
          <p className="font-semibold text-slate-700">{label}</p>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <div className="p-1.5 bg-indigo-50 rounded-lg">
            <IndianRupee className="h-4 w-4 text-indigo-600" />
          </div>
          <span className="font-bold text-lg text-indigo-700">
            {formatINR(amt)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = (props: any) => {
  const { payload } = props;
  return (
    <div className="flex items-center justify-center gap-6 pt-4">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              entry.value === "Sales"
                ? "bg-indigo-500"
                : "border-2 border-indigo-600"
            }`}
          />
          <span className="text-xs font-medium text-slate-600">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export function SalesTrendCard({ data }: Props) {
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.month);
    const dateB = new Date(b.month);
    return dateA.getTime() - dateB.getTime();
  });

  const hasData = data.some((d) => d.amount > 0);

  // Calculate growth percentage
  const calculateGrowth = () => {
    if (sortedData.length < 2) return null;
    const lastMonth = sortedData[sortedData.length - 1].amount;
    const prevMonth = sortedData[sortedData.length - 2].amount;
    if (prevMonth === 0) return null;
    const growth = ((lastMonth - prevMonth) / prevMonth) * 100;
    return growth;
  };

  const growth = calculateGrowth();

  return (
    <div className="group rounded-3xl border border-slate-200/60 bg-gradient-to-br from-white via-white to-indigo-50/30 p-6 shadow-sm hover:shadow-lg hover:border-indigo-200/60 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-1">
          <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2.5">
  <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-md shadow-indigo-200 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            Sales Trend
          </h3>
          <p className="text-sm text-slate-500 ml-11">
            Performance over time
          </p>
        </div>

        <div className="text-right space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-full">
            <Calendar className="h-3.5 w-3.5 text-indigo-600" />
            <span className="text-xs text-indigo-700 font-semibold">
              Last 6 months
            </span>
          </div>
  
        </div>
      </div>

      {/* Chart */}
      {hasData ? (
        <div className="h-80 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={sortedData}
              margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
            >
              {/* Gradient definitions */}
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
                opacity={0.5}
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 13, fill: "#64748b", fontWeight: 500 }}
                dy={12}
              />

              <YAxis
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
                dx={-5}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  fill: "rgba(99, 102, 241, 0.06)",
                  radius: 8,
                }}
              />

              {/* Bar Chart with gradient */}
              <Bar
                dataKey="amount"
                fill="url(#barGradient)"
                radius={[8, 8, 0, 0]}
                barSize={40}
                name="Sales"
                animationDuration={800}
                animationBegin={0}
              />

              {/* Line Chart with gradient stroke */}
              <Line
                type="monotone"
                dataKey="amount"
                stroke="url(#lineGradient)"
                strokeWidth={3}
                dot={{
                  r: 5,
                  strokeWidth: 3,
                  fill: "#fff",
                  stroke: "#4f46e5",
                }}
                activeDot={{
                  r: 7,
                  stroke: "#4f46e5",
                  strokeWidth: 3,
                  fill: "#fff",
                  className: "drop-shadow-lg",
                }}
                name="Trend"
                animationDuration={1000}
                animationBegin={400}
              />

              <Legend content={<CustomLegend />} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-80 flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border-2 border-dashed border-slate-200">
          <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
            <TrendingUp className="h-12 w-12 text-slate-300" />
          </div>
          <p className="text-lg font-semibold text-slate-500">
            No sales data yet
          </p>
          <p className="text-sm mt-2 text-slate-400">
            Create invoices to see trends
          </p>
        </div>
      )}
    </div>
  );
}