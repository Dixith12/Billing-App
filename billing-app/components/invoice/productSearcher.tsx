'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus } from 'lucide-react'
import type { InventoryItem } from '@/lib/types'
import { formatINR } from '@/lib/utils/inventory'   // ← import this (you already have it)

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
    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for existing products"
          className="pl-10 bg-blue-50/50"
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
        />

        {productSearch && filteredInventory.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredInventory.map((item) => (
              <button
                key={item.id}
                className="w-full px-4 py-2 text-left hover:bg-muted flex justify-between items-center"
                onClick={() => onAddProduct(item)}
              >
                <span className="font-medium">{item.name}</span>
                <span className="text-sm text-muted-foreground">
                  {getPriceDisplay(item)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <Button
        className="bg-blue-600 hover:bg-blue-700 text-white"
        onClick={() => {
          if (filteredInventory.length > 0) onAddProduct(filteredInventory[0])
        }}
        disabled={!productSearch || filteredInventory.length === 0}
      >
        <Plus className="h-4 w-4 mr-1" />
        Add to Bill
      </Button>
    </div>
  )
}