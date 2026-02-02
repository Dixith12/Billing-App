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
  id: string;
  name: string;
  measurementType: 'height_width' | 'kg' | 'unit';
  height?: number;
  width?: number;
  pricePerHeight?: number;
  pricePerWidth?: number;
  pricePerKg?: number;
  pricePerUnit?: number;
  createdAt: Date;
}

// ─────────────────────────────────────────────
// Purchase-only draft item (NOT saved to inventory)
// ─────────────────────────────────────────────
export interface PurchaseItemDraft {
  name: string;

  measurementType: 'height_width' | 'kg' | 'unit';

  // height / width
  height?: number;
  width?: number;
  pricePerHeight?: number;
  pricePerWidth?: number;

  // kg
  kg?: number;
  pricePerKg?: number;

  // unit
  units?: number;
  pricePerUnit?: number;
}

// Optional: helper type for form data (if you want stricter typing later)
export type InventoryFormData = Omit<InventoryItem, 'id' | 'createdAt'>;
export type StatusFilter = 'all' | 'paid' | 'pending' | 'partially paid' | 'cancelled' | 'draft'
