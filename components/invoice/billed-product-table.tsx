"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";
import type { BilledProduct } from "@/hooks/use-create-invoice";
import { cn } from "@/lib/utils";

interface BilledProductsTableProps {
  products: BilledProduct[];
  onUpdate: (
    id: string,
    field: keyof BilledProduct,
    value: string | number | boolean,
  ) => void;
  onRemove: (id: string) => void;
  enableWaste: boolean;
}

export function BilledProductsTable({
  products,
  onUpdate,
  onRemove,
  enableWaste,
}: BilledProductsTableProps) {
  if (products.length === 0) return null;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-225">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200">
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 min-w-45">
                Product
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 min-w-55">
                Measurements
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 min-w-25">
                Quantity
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 min-w-40">
                Discount
              </th>
              {enableWaste && (
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 min-w-25">
                  Waste
                </th>
              )}
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700 pr-8 min-w-30">
                Total
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 min-w-20">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {products.map((p, index) => (
              <React.Fragment key={p.id}>
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">
                      {p.name || "Unnamed Item"}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {renderMeasurementInputs(p, onUpdate)}
                  </td>

                  <td className="px-6 py-4">
                    <Input
                      type="number"
                      value={p.quantity}
                      onChange={(e) =>
                        onUpdate(
                          p.id,
                          "quantity",
                          parseInt(e.target.value) || 1,
                        )
                      }
                      onWheel={(e) => e.currentTarget.blur()}
                      min={1}
                      className="w-24 border-slate-300 focus:border-primary selection:bg-slate-300 focus:ring-primary/20"
                    />
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={p.discount}
                        onChange={(e) =>
                          onUpdate(p.id, "discount", e.target.value)
                        }
                        min={0}
                        onWheel={(e) => e.currentTarget.blur()}
                        step="any"
                        className="w-20 border-slate-300 focus:border-primary selection:bg-slate-300 focus:ring-primary/20"
                      />
                      <Select
                        value={p.discountType}
                        onValueChange={(v: "%" | "₹") =>
                          onUpdate(p.id, "discountType", v)
                        }
                      >
                        <SelectTrigger className="w-16 border-slate-300 focus:border-primary focus:ring-primary/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200">
                          <SelectItem value="%">%</SelectItem>
                          <SelectItem value="₹">₹</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </td>

                  {enableWaste && (
                    <td className="px-6 py-4 text-center">
                      <Switch
                        checked={p.wasteEnabled ?? false}
                        onCheckedChange={(checked) =>
                          onUpdate(p.id, "wasteEnabled", checked)
                        }
                        className="transition-colors data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-200 [&>span]:bg-white"
                      />
                    </td>
                  )}

                  <td className="px-6 py-4 text-right pr-8">
                    <span
                      className={cn(
                        "font-semibold",
                        p.grossTotal > 0
                          ? "text-emerald-700"
                          : "text-slate-400",
                      )}
                    >
                      ₹{(p.grossTotal || 0).toFixed(2)}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(p.id)}
                      className="text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>

                {/* Waste row – only shown if enabled */}
                {enableWaste && p.wasteEnabled && (
                  <tr className="bg-slate-50/80 border-t border-slate-100">
                    <td
                      className="px-6 py-4 font-medium text-slate-600"
                      colSpan={1}
                    >
                      Waste for {p.name}:
                    </td>
                    <td className="px-6 py-4">
                      {renderWasteInputs(p, onUpdate)}
                    </td>
                    <td colSpan={enableWaste ? 4 : 5} />
                  </tr>
                )}

                {/* Separator between products */}
                {index < products.length - 1 && (
                  <tr>
                    <td colSpan={enableWaste ? 7 : 6}>
                      <div className="h-px bg-slate-200 my-1" />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderMeasurementInputs(
  p: BilledProduct,
  onUpdate: (
    id: string,
    field: keyof BilledProduct,
    value: string | number,
  ) => void,
) {
  switch (p.measurementType) {
    case "height_width":
      return (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">H:</span>
            <Input
              type="number"
              placeholder="Height"
              value={p.height ?? ""}
              onChange={(e) => onUpdate(p.id, "height", e.target.value)}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-24 border-slate-300 focus:border-primary selection:bg-slate-300 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">W:</span>
            <Input
              type="number"
              placeholder="Width"
              value={p.width ?? ""}
              onChange={(e) => onUpdate(p.id, "width", e.target.value)}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-24 border-slate-300 focus:border-primary selection:bg-slate-300 focus:ring-primary/20"
            />
          </div>
        </div>
      );

    case "kg":
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">Kg:</span>
          <Input
            type="number"
            placeholder="Kg"
            value={p.kg ?? ""}
            onChange={(e) => onUpdate(p.id, "kg", e.target.value)}
            onWheel={(e) => e.currentTarget.blur()}
            className="w-24 border-slate-300 focus:border-primary selection:bg-slate-300 focus:ring-primary/20"
          />
        </div>
      );

    case "unit":
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">Unit:</span>
          <Input
            type="number"
            placeholder="Units"
            value={p.units ?? ""}
            onChange={(e) => onUpdate(p.id, "units", e.target.value)}
            onWheel={(e) => e.currentTarget.blur()}
            className="w-24 border-slate-300 focus:border-primary selection:bg-slate-300 focus:ring-primary/20"
          />
        </div>
      );

    default:
      return <span className="text-slate-400 text-sm">—</span>;
  }
}

function renderWasteInputs(
  p: BilledProduct,
  onUpdate: (
    id: string,
    field: keyof BilledProduct,
    value: string | number,
  ) => void,
) {
  let measurements;

  switch (p.measurementType) {
    case "height_width":
      measurements = (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">H:</span>
            <Input
              placeholder="Waste H"
              value={p.wasteHeight ?? ""}
              onChange={(e) => onUpdate(p.id, "wasteHeight", e.target.value)}
              className="w-24 border-slate-300 focus:border-primary selection:bg-slate-300 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">W:</span>
            <Input
              placeholder="Waste W"
              value={p.wasteWidth ?? ""}
              onChange={(e) => onUpdate(p.id, "wasteWidth", e.target.value)}
              className="w-24 border-slate-300 focus:border-primary selection:bg-slate-300 focus:ring-primary/20"
            />
          </div>
        </div>
      );
      break;

    case "kg":
      measurements = (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">Kg:</span>
          <Input
            placeholder="Waste Kg"
            value={p.wasteKg ?? ""}
            onChange={(e) => onUpdate(p.id, "wasteKg", e.target.value)}
            className="w-24 border-slate-300 focus:border-primary selection:bg-slate-300 focus:ring-primary/20"
          />
        </div>
      );
      break;

    case "unit":
      measurements = (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">Unit:</span>
          <Input
            placeholder="Waste Units"
            value={p.wasteUnits ?? ""}
            onChange={(e) => onUpdate(p.id, "wasteUnits", e.target.value)}
            className="w-24 border-slate-300 focus:border-primary selection:bg-slate-300 focus:ring-primary/20"
          />
        </div>
      );
      break;

    default:
      measurements = <span className="text-slate-400 text-sm">—</span>;
  }

  return (
    <div className="flex items-center gap-4">
      {measurements}
      <Input
        placeholder="Waste ₹"
        value={p.wasteAmount ?? ""}
        onChange={(e) => onUpdate(p.id, "wasteAmount", e.target.value)}
        className="w-32 border-slate-300 focus:border-primary selection:bg-slate-300 focus:ring-primary/20"
      />
    </div>
  );
}
