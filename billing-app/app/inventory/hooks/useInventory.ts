'use client'

import { useApp } from '@/lib/app-context'
import { InventoryItem } from '@/lib/types'

export function useInventory() {
  const {
    inventoryItems,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
  } = useApp()

  // ✅ ADD inventory
  const addItem = (formData: {
    name: string
    height: number
    width: number
    pricePerHeight: string
    pricePerWidth: string
  }) => {
    if (!formData.name || !formData.pricePerHeight || !formData.pricePerWidth) {
      return
    }

    addInventoryItem({
      name: formData.name,
      height: formData.height,
      width: formData.width,
      pricePerHeight: Number(formData.pricePerHeight),
      pricePerWidth: Number(formData.pricePerWidth),
    })
  }

  // ✅ UPDATE inventory
  const updateItem = (id: string, formData: any) => {
    updateInventoryItem(id, {
      ...formData,
      pricePerHeight: Number(formData.pricePerHeight),
      pricePerWidth: Number(formData.pricePerWidth),
    })
  }

  // ✅ DELETE inventory
  const deleteItem = (id: string) => {
    deleteInventoryItem(id)
  }

  // ✅ PRICE calculation logic
  const calculateTotalPrice = (item: InventoryItem) => {
    return item.height * item.pricePerHeight + item.width * item.pricePerWidth
  }

  // ✅ CURRENCY formatting logic
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return {
    inventoryItems,
    addItem,
    updateItem,
    deleteItem,
    calculateTotalPrice,
    formatCurrency,
  }
}
