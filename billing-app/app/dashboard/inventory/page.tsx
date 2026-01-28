'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AddInventoryModal } from '@/components/inventory/add-inventory-modal'
import { InventoryList } from '@/components/inventory/inventory-list'
import { useInventory } from './hooks/useInventory'
import { Plus, Package, Sparkles, CheckCircle2 } from 'lucide-react'

export default function InventoryPage() {
  const { inventoryItems } = useInventory()
  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false)

  const totalItems = inventoryItems.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Decorative background elements – same subtle style as GST/Customers */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative p-6 lg:p-8 space-y-10 max-w-[1400px] mx-auto">
        {/* Floating Hero Card – exact same structure as GST & Customers */}
        <div className="relative">
          {/* Glow background */}
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 rounded-2xl blur-2xl"></div>

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 lg:p-8 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl blur-lg opacity-40"></div>
                  <div className="relative p-3 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl shadow-lg">
                    <Package className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-700 via-orange-700 to-yellow-700 bg-clip-text text-transparent tracking-tight">
                    Inventory
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">
                    Manage your stock, items and inventory levels
                  </p>
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-2 text-sm pl-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-slate-600">
                  System configured and active
                </span>
              </div>
            </div>

            {/* Add Item Button */}
            <Button
              onClick={() => setIsAddInventoryOpen(true)}
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 hover:from-amber-700 hover:via-orange-700 hover:to-yellow-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-8"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold">Add Item</span>
            </Button>
          </div>
        </div>

        {/* All Inventory Items Section */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full"></div>
            <h2 className="text-lg font-semibold text-slate-700">
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

        {/* Footer Status – consistent across pages */}
        <div className="pt-8 pb-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-gradient-to-r from-amber-100/80 to-orange-100/80 border border-amber-200/60 rounded-xl">
            <div className="flex items-center gap-3 text-sm text-amber-900">
              <CheckCircle2 className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <span className="font-medium">
                You have {totalItems} item{totalItems !== 1 ? 's' : ''} in your inventory
              </span>
            </div>
            <div className="text-xs text-amber-700" suppressHydrationWarning>
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <AddInventoryModal
        isOpen={isAddInventoryOpen}
        onClose={() => setIsAddInventoryOpen(false)}
      />
    </div>
  )
}