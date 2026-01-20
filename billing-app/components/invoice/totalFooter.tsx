'use client'

import { Button } from '@/components/ui/button'

interface TotalsFooterProps {
  itemCount: number
  totalQty: number
  netAmount: number
  onClose: () => void
  onSave: () => void
}

export function TotalsFooter({ itemCount, totalQty, netAmount, onClose, onSave }: TotalsFooterProps) {
  return (
    <div className="border-t bg-muted/30 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Items: {itemCount}, Qty: {totalQty}
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-sm text-muted-foreground">Grand Total: </span>
            <span className="text-xl font-bold">₹{netAmount.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={onSave}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}