// lib/types.ts (or wherever you keep shared types)

// ─────────────────────────────────────────────
// Core Inventory Item (saved in Firestore 'inventory')
// ─────────────────────────────────────────────
export interface InventoryItem {
  id: string;
  name: string;
  measurementType: 'height_width' | 'kg' | 'unit';
  height?: number;
  width?: number;
  kg?: number;
  units?: number;
  pricePerHeight?: number;
  pricePerWidth?: number;
  pricePerKg?: number;
  pricePerUnit?: number;
  hsnCode?: string | null;   // ✅ FIXED
  createdAt?: any;
}


// ─────────────────────────────────────────────
// Invoice (sales) – full structure
// ─────────────────────────────────────────────
export interface Invoice {
  id: string;
  amount: number;               // final net amount paid/received
  status: 'paid' | 'pending' | 'partially paid' | 'cancelled' | 'draft';
  mode: 'UPI' | 'Cash' | 'Bank Transfer' | 'Card' | 'Cheque';
  billNo: string;               // e.g. INV-001, PO-123
  customer: {
    name: string;
    phone: string;
    gstin?: string;
    address?: string;
    state?: string;             // used for place of supply / CGST/SGST vs IGST
  };
  createdBy: string;            // UID or name of user who created
  date: Date;                   // invoice/purchase date
  pendingAmount?: number;       // remaining if partially paid

  // GST breakdown (calculated/stored)
  cgst?: number;
  sgst?: number;
  igst?: number;
  totalGst?: number;

  // Optional: items line (if you expand to multi-line invoices later)
  items?: InvoiceItem[];        // see below
}

// Line item inside Invoice (optional for future multi-line support)
export interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  hsnCode?: string;
  taxableAmount: number;
  gstPercent: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  total: number;
}

// ─────────────────────────────────────────────
// Purchase draft item (temporary – not saved in inventory)
// Used only during purchase creation
// ─────────────────────────────────────────────
export interface PurchaseItemDraft {
  name: string;
  measurementType: 'height_width' | 'kg' | 'unit';

  // Height × Width
  height?: number;
  width?: number;
  pricePerHeight?: number;
  pricePerWidth?: number;

  // KG
  kg?: number;
  pricePerKg?: number;

  // Unit
  units?: number;
  pricePerUnit?: number;

  // Optional GST info (if entered during purchase)
  hsnCode?: string;
}

// ─────────────────────────────────────────────
// Helper / Form types (optional, for stricter typing)
// ─────────────────────────────────────────────
export type InventoryFormData = Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>;

export type StatusFilter = 
  | 'all' 
  | 'paid' 
  | 'pending' 
  | 'partially paid' 
  | 'cancelled' 
  | 'draft';

// Optional: GST breakdown type (used in totals/export)
export interface GstBreakdown {
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
  taxableAmount: number;
  totalAmount: number;
}