// app/inventory/hooks/useInventory.ts
'use client'

import { useApp } from '@/lib/app-context'
import { InventoryItem } from '@/lib/types'
import { calculateTotalPrice } from '@/lib/utils/inventory'   // ← moved

export function useInventory() {
  const {
    inventoryItems,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
  } = useApp()

  const addItem = (data: {
    name: string
    height: number
    width: number
    pricePerHeight: number
    pricePerWidth: number
  }) => {
    // minimal guard or you can move validation to form hook
    if (!data.name) return
    addInventoryItem(data)
  }

  const updateItem = (id: string, data: {
    name: string
    height: number
    width: number
    pricePerHeight: number
    pricePerWidth: number
  }) => {
    updateInventoryItem(id, data)
  }

  return {
    inventoryItems,
    addItem,
    updateItem,
    deleteItem: deleteInventoryItem      // ← still useful, but pure now
  }
}