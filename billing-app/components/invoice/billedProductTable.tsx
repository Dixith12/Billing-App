"use client";

import React from "react"; // ← Explicit import for React.Fragment
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
import type { BilledProduct } from "@/app/dashboard/invoice/hooks/useCreateInvoice";

interface BilledProductsTableProps {
  products: BilledProduct[];
  onUpdate: (
    id: string,
    field: keyof BilledProduct,
    value: string | number | boolean,
  ) => void;
  onRemove: (id: string) => void;
}

export function BilledProductsTable({
  products,
  onUpdate,
  onRemove,
}: BilledProductsTableProps) {
  if (products.length === 0) return null;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Product Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Quantity
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Measurements
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Discount
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Waste Management
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium">
                Total
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-0">
            {products.map((p) => (
              <React.Fragment key={p.id}>
                <tr>
                  <td className="px-4 py-3">
                    <span className="font-medium">{p.name}</span>
                  </td>
                  <td className="px-4 py-3">
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
                      className="w-20"
                      min={1}
                    />
                  </td>
                  <td className="px-4 py-3">
                    {renderMeasurementInputs(p, onUpdate)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={p.discount}
                        onChange={(e) =>
                          onUpdate(p.id, "discount", e.target.value)
                        }
                        className="w-20"
                        min={0}
                        step="any"
                      />
                      <Select
                        value={p.discountType}
                        onValueChange={(v: "%" | "₹") =>
                          onUpdate(p.id, "discountType", v)
                        }
                      >
                        <SelectTrigger className="w-16">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="%">%</SelectItem>
                          <SelectItem value="₹">₹</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Switch
                      checked={p.wasteEnabled ?? false}
                      onCheckedChange={(checked) =>
                        onUpdate(p.id, "wasteEnabled", checked)
                      }
                      className="
                            data-[state=checked]:bg-blue-600
data-[state=unchecked]:bg-muted
[&>span]:bg-white
[&>span]:data-[state=unchecked]:bg-gray-600data-[state=checked]:bg-blue-600
data-[state=checked]:border-blue-600


data-[state=unchecked]:bg-gray-100
data-[state=unchecked]:border
data-[state=unchecked]:border-gray-300


[&>span]:bg-white
[&>span]:data-[state=unchecked]:bg-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold">
                      ₹{p.grossTotal.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(p.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>

                {/* Waste row - conditional inside fragment, no extra whitespace */}
                {p.wasteEnabled && (
                  <tr className="bg-muted/20 border-b border-border">
                    <td
                      className="px-4 py-3 font-medium text-muted-foreground"
                      colSpan={2}
                    >
                      Waste for {p.name}
                    </td>
                    <td className="px-4 py-3">
                      {renderWasteInputs(p, onUpdate)}
                    </td>
                    <td className="px-4 py-3" colSpan={4} />
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

// Helper functions (unchanged from your version)
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
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Height"
            value={p.height ?? ""}
            onChange={(e) => onUpdate(p.id, "height", e.target.value)}
            className="w-24"
          />
          <Input
            type="number"
            placeholder="Width"
            value={p.width ?? ""}
            onChange={(e) => onUpdate(p.id, "width", e.target.value)}
            className="w-24"
          />
        </div>
      );
    case "kg":
      return (
        <Input
          type="number"
          placeholder="Kg"
          value={p.kg ?? ""}
          onChange={(e) => onUpdate(p.id, "kg", e.target.value)}
          className="w-24"
        />
      );
    case "unit":
      return (
        <Input
          type="number"
          placeholder="Units"
          value={p.units ?? ""}
          onChange={(e) => onUpdate(p.id, "units", e.target.value)}
          className="w-24"
        />
      );
    default:
      return <span>—</span>;
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
        <div className="flex gap-2">
          <Input
            placeholder="Waste Height"
            value={p.wasteHeight ?? ""}
            onChange={(e) => onUpdate(p.id, "wasteHeight", e.target.value)}
            className="w-24"
          />
          <Input
            placeholder="Waste Width"
            value={p.wasteWidth ?? ""}
            onChange={(e) => onUpdate(p.id, "wasteWidth", e.target.value)}
            className="w-24"
          />
        </div>
      );
      break;
    case "kg":
      measurements = (
        <Input
          placeholder="Waste Kg"
          value={p.wasteKg ?? ""}
          onChange={(e) => onUpdate(p.id, "wasteKg", e.target.value)}
          className="w-24"
        />
      );
      break;
    case "unit":
      measurements = (
        <Input
          placeholder="Waste Unit"
          value={p.wasteUnits ?? ""}
          onChange={(e) => onUpdate(p.id, "wasteUnits", e.target.value)}
          className="w-24"
        />
      );
      break;
    default:
      measurements = <span>—</span>;
  }

  return (
    <div className="flex items-center gap-4">
      {measurements}
      <Input
        placeholder="Waste Amount"
        value={p.wasteAmount ?? ""}
        onChange={(e) => onUpdate(p.id, "wasteAmount", e.target.value)}
        className="w-32"
      />
    </div>
  );
}
