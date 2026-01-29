'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus } from 'lucide-react'
import type { InventoryItem } from '@/lib/types'
import { formatINR } from '@/lib/utils/inventory'

interface ProductSearcherProps {
  productSearch: string
  setProductSearch: (v: string) => void
  filteredInventory: InventoryItem[]
  onAddProduct: (item: InventoryItem) => void
}

export function ProductSearcher({
  productSearch,
  setProductSearch,
  filteredInventory,
  onAddProduct,
}: ProductSearcherProps) {
  // Helper to show the right price info in the dropdown
  const getPriceDisplay = (item: InventoryItem) => {
    switch (item.measurementType) {
      case 'height_width':
        const ph = item.pricePerHeight ?? 0
        const pw = item.pricePerWidth ?? 0
        return `Height: ${formatINR(ph)} / Width: ${formatINR(pw)}`

      case 'kg':
        return `${formatINR(item.pricePerKg ?? 0)} / kg`

      case 'unit':
        return `${formatINR(item.pricePerUnit ?? 0)} per unit`

      default:
        return '—'
    }
  }

  return (
    <div className="relative group bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Subtle glow on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-0 pointer-events-none"></div>

      <div className="relative flex items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          <Input
            placeholder="Search products by name or code..."
            className="pl-12 border-slate-300 focus:border-indigo-400 focus:ring-indigo-200 h-11 text-base bg-slate-50/50"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
          />
        </div>

        {/* Add Button */}
        <Button
          size="lg"
          disabled={!productSearch || filteredInventory.length === 0}
          className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm hover:shadow-md transition-all duration-300 min-w-[160px]"
          onClick={() => {
            if (filteredInventory.length > 0) onAddProduct(filteredInventory[0])
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-semibold">Add to Bill</span>
        </Button>
      </div>

      {/* Search Results Dropdown */}
      {productSearch && filteredInventory.length > 0 && (
        <div className="absolute z-20 w-full mt-3 bg-white border border-slate-200 rounded-xl shadow-xl max-h-72 overflow-auto">
          {filteredInventory.map((item) => (
            <button
              key={item.id}
              className="w-full px-5 py-3.5 text-left hover:bg-indigo-50/70 transition-colors flex items-center justify-between border-b border-slate-100 last:border-none"
              onClick={() => onAddProduct(item)}
            >
              <div className="flex flex-col">
                <span className="font-medium text-slate-900">{item.name}</span>
                <span className="text-xs text-slate-500 mt-0.5">
                   {item.measurementType}
                </span>
              </div>
              <span className="text-sm font-medium text-emerald-700">
                {getPriceDisplay(item)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}