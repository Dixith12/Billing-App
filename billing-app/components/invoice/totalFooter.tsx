'use client'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface TotalsFooterProps {
  itemCount: number
  totalQty: number
  netAmount: number
  onClose: () => void
  onSave: () => void
  isEditMode?: boolean
  isSaving?: boolean
  isQuotationMode?: boolean
  disabled?: boolean
}

export function TotalsFooter({
  itemCount,
  totalQty,
  netAmount,
  onClose,
  onSave,
  isEditMode = false,
  isSaving = false,
  isQuotationMode = false,
  disabled = false,
}: TotalsFooterProps) {
  const actionLabel = isEditMode ? 'Update' : 'Save'
  const documentType = isQuotationMode ? 'Quotation' : 'Invoice'
  const buttonText = isSaving
    ? `${actionLabel}ing ${documentType}...`
    : `${actionLabel} ${documentType}`

  return (
    <div className="border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Left: Item & Qty summary */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-700 font-medium text-xs">{itemCount}</span>
            </div>
            <div>
              <span className="text-slate-600">Items</span>
              <span className="ml-1 font-medium text-slate-900">{itemCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-purple-700 font-medium text-xs">{totalQty}</span>
            </div>
            <div>
              <span className="text-slate-600">Total Qty</span>
              <span className="ml-1 font-medium text-slate-900">{totalQty}</span>
            </div>
          </div>
        </div>

        {/* Right: Net Amount + Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          {/* Net Amount - highlighted */}
          <div className="text-center sm:text-right">
            <div className="text-sm text-slate-600 mb-1">Net Amount</div>
            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              ₹{netAmount.toFixed(2)}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={onClose}
              className="border-slate-300 hover:bg-slate-50 min-w-[120px]"
              disabled={isSaving}
            >
              Close
            </Button>

            <Button
              size="lg"
              onClick={onSave}
              disabled={isSaving || disabled}
              className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all duration-300 min-w-[180px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {isSaving ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="font-semibold">{buttonText}</span>
                </div>
              ) : (
                <span className="font-semibold">{buttonText}</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}