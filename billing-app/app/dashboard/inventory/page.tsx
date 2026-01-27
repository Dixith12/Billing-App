"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AddInventoryModal } from "@/components/inventory/add-inventory-modal";
import { InventoryList } from "@/components/inventory/inventory-list";
import { useInventory } from "./hooks/useInventory";
import {
  ArrowLeft,
  Plus,
  Package,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function InventoryPage() {
  const { inventoryItems } = useInventory();
  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false);

  // Quick stats (optional but matches premium feel)
  const totalItems = inventoryItems.length;
  // You can add real low stock / value logic later if needed
  const lowStockCount = 0; // placeholder — implement if you have quantity/reorderLevel

  return (
    <div className="min-h-screen bg-slate-50/70">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between h-16 px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <div className="h-8 w-px bg-slate-200" />
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-sm">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Inventory
                </h1>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setIsAddInventoryOpen(true)}
            className="gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 lg:p-8 max-w-7xl mx-auto space-y-10">
        {/* Inventory List Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-3">
              <div className="h-1.5 w-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full" />
              All Inventory Items
            </h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {inventoryItems.length === 0 ? (
              <div className="py-20 px-6 text-center space-y-6">
                <div className="mx-auto w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
                  <Package className="h-10 w-10 text-amber-600" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-slate-800">
                    Your inventory is empty
                  </h3>
                  <p className="text-slate-600 max-w-md mx-auto">
                    Start building your stock list by adding your first item
                  </p>
                </div>
                <Button
                  onClick={() => setIsAddInventoryOpen(true)}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Item
                </Button>
              </div>
            ) : (
              <InventoryList items={inventoryItems} />
            )}
          </div>
        </div>
      </main>

      {/* Add Modal */}
      <AddInventoryModal
        isOpen={isAddInventoryOpen}
        onClose={() => setIsAddInventoryOpen(false)}
      />
    </div>
  );
}
