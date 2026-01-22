"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface InvoiceSummaryProps {
  address: string
  onAddressChange: (value: string) => void
  grandTotal: number
  discount: number
  cgst: number
  sgst: number
}


export function InvoiceSummary({
  address,
  onAddressChange,
  grandTotal,
  discount,
  cgst,
  sgst,
}: InvoiceSummaryProps) {
    const taxableAmount = grandTotal - discount
    const netAmount = taxableAmount + cgst + sgst

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border rounded-lg p-4 bg-background">
      {/* Left: Address */}
      <div className="space-y-2">
        <Label>Billing Address</Label>
        <Textarea
          placeholder="Enter billing address"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          className="min-h-[120px]"
        />
      </div>

      {/* Right: Amount summary */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Grand Total</span>
          <span className="font-medium">₹{grandTotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Discount</span>
          <span className="font-medium">₹{discount.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>CGST ({(cgst / taxableAmount * 100).toFixed(1)}%)</span>
          <span className="font-medium">₹{cgst.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>SGST ({(sgst / taxableAmount * 100).toFixed(1)}%)</span>
          <span className="font-medium">₹{sgst.toFixed(2)}</span>
        </div>

        <div className="border-t pt-2 flex justify-between font-semibold text-base">
          <span>Net Amount</span>
          <span>₹{netAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
