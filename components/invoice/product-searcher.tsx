"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import type { InventoryItem } from "@/lib/types";
import { formatINR } from "@/lib/utils/inventory";
import { cn } from "@/lib/utils";

interface ProductSearcherProps {
  productSearch: string;
  setProductSearch: (v: string) => void;
  filteredInventory: InventoryItem[];
  onAddProduct: (item: InventoryItem) => void;
}

export function ProductSearcher({
  productSearch,
  setProductSearch,
  filteredInventory,
  onAddProduct,
}: ProductSearcherProps) {
  const getPriceDisplay = (item: InventoryItem) => {
    switch (item.measurementType) {
      case "height_width": {
        const ph = item.pricePerHeight ?? 0;
        const pw = item.pricePerWidth ?? 0;
        return `Height: ${formatINR(ph)} / Width: ${formatINR(pw)}`;
      }
      case "kg":
        return `${formatINR(item.pricePerKg ?? 0)} / kg`;
      case "unit":
        return `${formatINR(item.pricePerUnit ?? 0)} per unit`;
      default:
        return "—";
    }
  };

  return (
    <div className="relative bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search products by name or code..."
            className="pl-12 border-slate-300 focus:border-primary focus:ring-primary/20 h-11"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
          />
        </div>

        {/* Add Button */}
        <Button
          size="lg"
          disabled={!productSearch || filteredInventory.length === 0}
          className="min-w-40"
          onClick={() => {
            if (filteredInventory.length > 0) {
              onAddProduct(filteredInventory[0]);
            }
          }}
        >
          <Plus className="h-5 w-5 mr-2" />
          <span className="font-semibold">Add to Bill</span>
        </Button>
      </div>

      {/* Search Results Dropdown */}
      {productSearch && filteredInventory.length > 0 && (
        <div className="absolute z-20 w-full mt-3 bg-white border border-slate-200 rounded-xl max-h-72 overflow-auto">
          {filteredInventory.map((item) => (
            <button
              key={item.id}
              className="w-full px-5 py-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between border-b border-slate-100 last:border-none"
              onClick={() => onAddProduct(item)}
            >
              <div className="flex flex-col">
                <span className="font-medium text-slate-900">{item.name}</span>
                <span className="text-xs text-slate-500 mt-0.5">
                  {item.measurementType}
                  {item.hsnCode && (
                    <span className="ml-2 text-slate-400">
                      • HSN: {item.hsnCode}
                    </span>
                  )}
                </span>
              </div>

              <span className="text-sm font-medium text-slate-700">
                {getPriceDisplay(item)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
