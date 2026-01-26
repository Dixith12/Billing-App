'use client'

import { useApp } from '@/lib/app-context'
import type { InventoryItem } from '@/lib/types'

export function useInventory() {
  const {
    inventoryItems,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
  } = useApp()

  const addItem = (data: Omit<InventoryItem, 'id' | 'createdAt'>) => {
    if (!data.name?.trim()) return
    addInventoryItem(data)
  }

  // ────────────────────────────────────────────────
  // Option 1 – Recommended (cleanest & type-safe)
  // ────────────────────────────────────────────────
  const updateItem = (
    id: string,
    data: Partial<Omit<InventoryItem, 'id' | 'createdAt'>>
  ) => {
    // We know name is required in Firestore → enforce it here if updating name
    if ('name' in data && !data.name?.trim()) {
      console.warn('Cannot update inventory with empty name')
      return
    }

    // TypeScript needs help — we cast after our own guard
    updateInventoryItem(id, data as Omit<InventoryItem, 'id' | 'createdAt'>)

  }

  return {
    inventoryItems,
    addItem,
    updateItem,
    deleteItem: deleteInventoryItem,
  }
}