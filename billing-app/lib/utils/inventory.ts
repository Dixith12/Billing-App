// lib/utils/inventory.ts
import { InventoryItem } from '@/lib/types'

export function calculateTotalPrice(item: InventoryItem): number {
  return item.height * item.pricePerHeight + item.width * item.pricePerWidth
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount)
}