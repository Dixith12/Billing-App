// components/BilledProductsTable.tsx  (or wherever it is)
'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2 } from 'lucide-react'
import type { BilledProduct } from '@/app/invoice/hooks/useCreateInvoice'

interface BilledProductsTableProps {
  products: BilledProduct[]
  onUpdate: (id: string, field: keyof BilledProduct, value: string | number) => void
  onRemove: (id: string) => void
}

export function BilledProductsTable({ products, onUpdate, onRemove }: BilledProductsTableProps) {
  if (products.length === 0) return null

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Product Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Quantity</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Height</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Width</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Discount</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Total</th>
              <th className="px-4 py-3 text-center text-sm font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <span className="font-medium">{p.name}</span>
                </td>
                <td className="px-4 py-3">
                  <Input
                    type="number"
                    value={p.quantity}
                    onChange={(e) => onUpdate(p.id, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-20"
                    min={1}
                  />
                </td>
                <td className="px-4 py-3">
                  <Input
                    type="text"
                    value={p.height}
                    onChange={(e) => onUpdate(p.id, 'height', e.target.value)}
                    className="w-24"
                  />
                </td>
                <td className="px-4 py-3">
                  <Input
                    type="text"
                    value={p.width}
                    onChange={(e) => onUpdate(p.id, 'width', e.target.value)}
                    className="w-24"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={p.discount}
                      onChange={(e) => onUpdate(p.id, 'discount', e.target.value)}
                      className="w-20"
                      min={0}
                      step="any"
                    />
                    <Select
                      value={p.discountType}
                      onValueChange={(v: '%' | '₹') => onUpdate(p.id, 'discountType', v)}
                    >
                      <SelectTrigger className="w-16">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="%">%</SelectItem>
                        <SelectItem value="₹">₹</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-semibold">₹{p.total.toFixed(2)}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <Button variant="ghost" size="icon" onClick={() => onRemove(p.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}