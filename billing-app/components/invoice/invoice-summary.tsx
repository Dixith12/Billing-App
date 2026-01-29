'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface InvoiceSummaryProps {
  address: string
  onAddressChange: (value: string) => void
  grandTotal: number
  discount: number
  cgst: number
  sgst: number
  netAmount: number
}

export function InvoiceSummary({
  address,
  onAddressChange,
  grandTotal,
  discount,
  cgst,
  sgst,
  netAmount,
}: InvoiceSummaryProps) {
  const taxableAmount = grandTotal - discount

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Subtle glow wrapper on hover */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300 pointer-events-none"></div>

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          {/* Left: Billing Address */}
          <div className="space-y-4">
            <Label className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-600"></span>
              Billing Address
            </Label>

            <div className="relative">
              <Textarea
                placeholder="Enter full billing address (street, city, state, PIN code...)"
                value={address}
                onChange={(e) => onAddressChange(e.target.value)}
                className="min-h-[140px] resize-none border-slate-300 focus:border-indigo-400 focus:ring-indigo-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Right: Amount Summary */}
          <div className="space-y-5 bg-slate-50/70 rounded-lg p-6 border border-slate-100">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Grand Total</span>
                <span className="font-medium text-slate-900">₹{grandTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Discount</span>
                <span className="font-medium text-orange-700">₹{discount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">
                  CGST ({(cgst / taxableAmount * 100 || 0).toFixed(1)}%)
                </span>
                <span className="font-medium text-slate-900">₹{cgst.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">
                  SGST ({(sgst / taxableAmount * 100 || 0).toFixed(1)}%)
                </span>
                <span className="font-medium text-slate-900">₹{sgst.toFixed(2)}</span>
              </div>
            </div>

            {/* Net Amount – highlighted */}
            <div className="border-t border-slate-200 pt-4 mt-2 flex justify-between items-center">
              <span className="text-lg font-semibold text-slate-900">Net Amount</span>
              <span className="text-xl font-bold text-emerald-700">
                ₹{netAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}