export interface Invoice {
  id: string
  amount: number
  status: 'paid' | 'pending' | 'partially paid' | 'cancelled' | 'draft'
  mode: 'UPI' | 'Cash' | 'Bank Transfer' | 'Card' | 'Cheque'
  billNo: string
  customer: {
    name: string
    phone: string
  }
  createdBy: string
  date: Date
  pendingAmount?: number
}

export interface InventoryItem {
  id: string
  name: string
  height: number
  width: number
  pricePerHeight: number
  pricePerWidth: number
  createdAt: Date
}

export type StatusFilter = 'all' | 'paid' | 'pending' | 'partially paid' | 'cancelled' | 'draft'
