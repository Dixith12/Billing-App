"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from "recharts";
import {
  IndianRupee,
  PieChart as PieChartIcon,
  TrendingDown,
} from "lucide-react";
import { useState, useCallback } from "react";

interface Props {
  data: {
    category: string;
    amount: number;
  }[];
}

const COLORS = [
  "#6366f1", // indigo
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f97316", // orange
  "#06b6d4", // cyan
  "#64748b", // slate
  "#a78bfa", // violet-400
  "#34d399", // emerald-400
  "#fbbf24", // amber-400
  "#f87171", // red-400
  "#c084fc", // purple-400
  "#fb923c", // orange-400
  "#60a5fa", // blue-400
  "#4ade80", // green-400
];

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.35;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return percent > 0.055 ? (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
      className="drop-shadow-md pointer-events-none"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

// ────────────────────────────────────────────────
// Custom active shape (optional — nicer hover effect)
// ────────────────────────────────────────────────
const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    midAngle,
    percent,
  } = props;

  // label position (same logic as renderCustomizedLabel)
  const radius = innerRadius + (outerRadius - innerRadius) * 0.35;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <g>
      {/* main expanded slice */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.9}
      />

      {/* soft outer glow */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 25}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.18}
      />

      {/* 🔥 KEEP PERCENTAGE ON HOVER */}
      {percent > 0.055 && (
        <text
          x={x}
          y={y}
          fill="white"
          textAnchor={x > cx ? "start" : "end"}
          dominantBaseline="central"
          fontSize={11}
          fontWeight={600}
          className="drop-shadow-md pointer-events-none"
        >
          {(percent * 100).toFixed(0)}%
        </text>
      )}
    </g>
  );
};


const CustomTooltip = ({
  active,
  payload,
  coordinate,
  total,
  viewBox,
}: {
  active?: boolean;
  payload?: any[];
  coordinate?: { x: number; y: number };
  total: number;
  viewBox?: any;
}) => {
  if (!active || !payload || !payload.length || !coordinate) return null;

  const entry = payload[0];
  const name = entry.name || entry.payload?.category || "Unknown";
  const value = Number(entry.value) || 0;
  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
  // 🔥 FIX: derive solid color from slice index (works with gradients)
const sliceIndex = entry.payload?.index ?? 0;
const color = COLORS[sliceIndex % COLORS.length];


  // Try to position tooltip outside the pie
  let tooltipX = coordinate.x + 50;
  let tooltipY = coordinate.y - 60;

  // Basic boundary awareness (you can make this more sophisticated)
  if (viewBox) {
    const { width, height } = viewBox;
    if (tooltipX + 220 > width) tooltipX = coordinate.x - 240;
    if (tooltipY < 40) tooltipY = coordinate.y + 30;
  }

  return (
    <div
      className="bg-white border border-slate-200 shadow-xl rounded-xl p-4 min-w-[180px] pointer-events-none"
      style={{
        position: "absolute",
        left: tooltipX,
        top: tooltipY,
        transform: "translate(0, -50%)",
        zIndex: 100,
      }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="h-5 w-5 rounded-md shadow"
          style={{ backgroundColor: color }}
        />
        <p className="font-semibold text-slate-800 truncate max-w-[140px]">
          {name}
        </p>
      </div>

      <div className="flex items-center justify-between gap-6 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-50 rounded-md">
            <IndianRupee className="h-4 w-4 text-slate-600" />
          </div>
          <span className="font-bold text-lg text-slate-900">
            ₹{value.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="px-3 py-1 bg-indigo-50 rounded-lg">
          <span className="font-bold text-indigo-700">{percentage}%</span>
        </div>
      </div>
    </div>
  );
};

export function ExpenseBreakdownCard({ data }: Props) {

  const total = data.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const hasData = data.length > 0 && total > 0;

  const validData = data
    .map((item) => ({
      category: item.category,
      amount: Number(item.amount),
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const topCategory = validData.length > 0 ? validData[0] : null;
  const topPercent = topCategory
    ? ((topCategory.amount / total) * 100).toFixed(0)
    : "0";

  return (
    <div className="group rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white to-purple-50/20 p-6 shadow hover:shadow-xl hover:border-purple-200 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-1">
          <h3 className="font-bold text-xl text-slate-800 flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg shadow-purple-200/50 group-hover:scale-110 transition-transform">
              <PieChartIcon className="h-5 w-5 text-white" />
            </div>
            Expense Breakdown
          </h3>
          {hasData && (
            <p className="text-sm text-slate-500 ml-14">
              Total spending:{" "}
              <span className="font-bold text-slate-700">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </p>
          )}
        </div>

        <div className="text-right space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100/70 rounded-full">
            <TrendingDown className="h-3.5 w-3.5 text-purple-700" />
            <span className="text-xs font-semibold text-purple-800">
              Current period
            </span>
          </div>
          {topCategory && (
            <div className="text-xs font-medium text-slate-600">
              Top: <span className="font-semibold">{topCategory.category}</span> (
              {topPercent}%)
            </div>
          )}
        </div>
      </div>

      {hasData ? (
        <>
          <div className="h-72 sm:h-80 mb-6 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {COLORS.map((color, i) => (
                    <linearGradient
                      key={`grad-${i}`}
                      id={`grad-${i}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={color} stopOpacity={1} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.85} />
                    </linearGradient>
                  ))}
                </defs>

                <Pie
                  data={validData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={108}
                  innerRadius={64}
                  dataKey="amount"
                  nameKey="category"
                  isAnimationActive={true}
                  animationDuration={900}
                  paddingAngle={2}
                  stroke="#ffffff"
                  strokeWidth={1.5}
                  activeShape={renderActiveShape}
              
                >
                  {validData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#grad-${index % COLORS.length})`}
                      className="transition-opacity duration-200 hover:opacity-90"
                    />
                  ))}
                </Pie>

                <Tooltip
                  cursor={{ fill: "transparent" }}
                  content={
                    <CustomTooltip total={total} viewBox={undefined} />
                  }
                  // wrapperStyle={{ outline: "none" }}
                />
              </PieChart>
            </ResponsiveContainer>

            
          </div>

          {/* Legend */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Categories
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {validData.map((item, index) => {
                const percent = ((item.amount / total) * 100).toFixed(1);
                const color = COLORS[index % COLORS.length];

                return (
                  <div
                    key={item.category}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-100 bg-white/60 hover:bg-slate-50 hover:border-slate-200 transition-all"
                  >
                    <div
                      className="h-9 w-1.5 rounded-full flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {item.category}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs">
                        <span className="font-medium text-slate-600">
                          ₹{Number(item.amount).toLocaleString("en-IN")}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="font-semibold text-indigo-600">
                          {percent}%
                        </span>
                      </div>
                    </div>
                    <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${percent}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="h-72 flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-slate-50 to-slate-100/60 rounded-2xl border-2 border-dashed border-slate-200">
          <div className="p-5 bg-white rounded-2xl shadow mb-4">
            <PieChartIcon className="h-14 w-14 text-slate-300" />
          </div>
          <p className="text-lg font-semibold text-slate-500">
            No expenses yet
          </p>
          <p className="text-sm mt-2 text-center max-w-xs text-slate-400">
            Add your first expense to see the breakdown
          </p>
        </div>
      )}
    </div>
  );
}