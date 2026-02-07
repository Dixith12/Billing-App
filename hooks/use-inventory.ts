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
    if (!data.name?.trim()) {
      console.warn('Cannot add inventory item without name')
      return
    }

    const cleanData = {
      ...data,
      hsnCode:
        typeof data.hsnCode === 'string'
          ? data.hsnCode.trim() || null
          : null,
    }

    addInventoryItem(cleanData)
  }

  const updateItem = (
    id: string,
    data: Partial<Omit<InventoryItem, 'id' | 'createdAt'>>
  ) => {
    if ('name' in data && !data.name?.trim()) {
      console.warn('Cannot update inventory with empty name')
      return
    }

    const cleanData = {
      ...data,
      ...(data.hsnCode !== undefined && {
        hsnCode:
          typeof data.hsnCode === 'string'
            ? data.hsnCode.trim() || null
            : null,
      }),
    }

    updateInventoryItem(
      id,
      cleanData as Partial<Omit<InventoryItem, 'id' | 'createdAt'>>
    )
  }

  return {
    inventoryItems,
    addItem,
    updateItem,
    deleteItem: deleteInventoryItem,
  }
}
