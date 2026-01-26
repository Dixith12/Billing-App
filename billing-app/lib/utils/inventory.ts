// lib/utils/inventory.ts
import { InventoryItem } from '@/lib/types'

export function calculateTotalPrice(item: InventoryItem): number {
  switch (item.measurementType) {
    case 'height_width':
      return (item.height ?? 1) * (item.pricePerHeight ?? 0) + (item.width ?? 1) * (item.pricePerWidth ?? 0)

    case 'kg':
      return item.pricePerKg ?? 0

    case 'unit':
      return item.pricePerUnit ?? 0

    default:
      return 0
  }
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount)
}