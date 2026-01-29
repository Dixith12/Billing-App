'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Trash2, Ruler, Weight, Package } from 'lucide-react'
import type { BilledProduct } from '@/app/dashboard/invoice/hooks/useCreateInvoice'

interface BilledProductsTableProps {
  products: BilledProduct[]
  onUpdate: (
    id: string,
    field: keyof BilledProduct,
    value: string | number | boolean,
  ) => void
  onRemove: (id: string) => void
}

export function BilledProductsTable({
  products,
  onUpdate,
  onRemove,
}: BilledProductsTableProps) {
  if (products.length === 0) return null

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Product
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Quantity
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Measurements
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Discount
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                Waste
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700 pr-8">
                Total
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {products.map((p, index) => (
              <React.Fragment key={p.id}>
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{p.name}</div>
                  </td>

                  <td className="px-6 py-4">
                    <Input
                      type="number"
                      value={p.quantity}
                      onChange={(e) =>
                        onUpdate(p.id, 'quantity', parseInt(e.target.value) || 1)
                      }
                      min={1}
                      className="w-24 border-slate-300 focus:border-indigo-400 focus:ring-indigo-200"
                    />
                  </td>

                  <td className="px-6 py-4">
                    {renderMeasurementInputs(p, onUpdate)}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={p.discount}
                        onChange={(e) =>
                          onUpdate(p.id, 'discount', e.target.value)
                        }
                        min={0}
                        step="any"
                        className="w-20 border-slate-300 focus:border-indigo-400 focus:ring-indigo-200"
                      />
                      <Select
                        value={p.discountType}
                        onValueChange={(v: '%' | '₹') =>
                          onUpdate(p.id, 'discountType', v)
                        }
                      >
                        <SelectTrigger className="w-16 border-slate-300 focus:border-indigo-400">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200">
                          <SelectItem value="%">%</SelectItem>
                          <SelectItem value="₹">₹</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <Switch
                      checked={p.wasteEnabled ?? false}
                      onCheckedChange={(checked) =>
                        onUpdate(p.id, 'wasteEnabled', checked)
                      }
                      className="data-[state=checked]:bg-indigo-600 data-[state=unchecked]:bg-slate-200 [&>span]:bg-white"
                    />
                  </td>

                  <td className="px-6 py-4 text-right pr-8">
                    <span className="font-semibold text-emerald-700">
                      ₹{p.grossTotal.toFixed(2)}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(p.id)}
                      className="text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>

                {/* Waste row (inside the same product block) */}
                {p.wasteEnabled && (
                  <tr className="bg-slate-100 border-t border-slate-100">
                    <td
                      className="px-6 py-4 font-medium text-slate-600"
                      colSpan={2}
                    >
                      Waste for {p.name} :
                    </td>
                    <td className="px-6 py-4">
                      {renderWasteInputs(p, onUpdate)}
                    </td>
                    <td className="px-6 py-4" colSpan={4} />
                  </tr>
                )}

                {/* Separator border after each product (except the last one) */}
                {index < products.length - 1 && (

                  // {!p.wasteEnabled && index < products.length - 1 && (      this one is for no border good looking
                  <tr>
                    <td colSpan={7}>
<div className="h-0.5 bg-slate-400" />                   </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Helper: Measurement inputs with icons & premium style
function renderMeasurementInputs(
  p: BilledProduct,
  onUpdate: (
    id: string,
    field: keyof BilledProduct,
    value: string | number,
  ) => void,
) {
  switch (p.measurementType) {
    case 'height_width':
      return (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">H: </span>
            <Input
              type="number"
              placeholder="Height"
              value={p.height ?? ''}
              onChange={(e) => onUpdate(p.id, 'height', e.target.value)}
              className="w-24 border-slate-300 focus:border-indigo-400 focus:ring-indigo-200"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">W: </span>
            <Input
              type="number"
              placeholder="Width"
              value={p.width ?? ''}
              onChange={(e) => onUpdate(p.id, 'width', e.target.value)}
              className="w-24 border-slate-300 focus:border-indigo-400 focus:ring-indigo-200"
            />
          </div>
        </div>
      )

    case 'kg':
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">KG: </span>
          <Input
            type="number"
            placeholder="Kg"
            value={p.kg ?? ''}
            onChange={(e) => onUpdate(p.id, 'kg', e.target.value)}
            className="w-24 border-slate-300 focus:border-indigo-400 focus:ring-indigo-200"
          />
        </div>
      )

    case 'unit':
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Unit: </span>
          <Input
            type="number"
            placeholder="Units"
            value={p.units ?? ''}
            onChange={(e) => onUpdate(p.id, 'units', e.target.value)}
            className="w-24 border-slate-300 focus:border-indigo-400 focus:ring-indigo-200"
          />
        </div>
      )

    default:
      return <span className="text-slate-400">—</span>
  }
}

// Helper: Waste inputs with premium style
function renderWasteInputs(
  p: BilledProduct,
  onUpdate: (
    id: string,
    field: keyof BilledProduct,
    value: string | number,
  ) => void,
) {
  let measurements

  switch (p.measurementType) {
    case 'height_width':
      measurements = (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground ">H: </span>
            <Input
              placeholder="Waste Height"
              value={p.wasteHeight ?? ''}
              onChange={(e) => onUpdate(p.id, 'wasteHeight', e.target.value)}
              className="w-30 border-slate-300 focus:border-purple-400 focus:ring-purple-200"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">W: </span>
            <Input
              placeholder="Waste Width"
              value={p.wasteWidth ?? ''}
              onChange={(e) => onUpdate(p.id, 'wasteWidth', e.target.value)}
              className="w-30 border-slate-300 focus:border-purple-400 focus:ring-purple-200"
            />
          </div>
        </div>
      )
      break

    case 'kg':
      measurements = (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">KG: </span>
          <Input
            placeholder="Waste Kg"
            value={p.wasteKg ?? ''}
            onChange={(e) => onUpdate(p.id, 'wasteKg', e.target.value)}
            className="w-24 border-slate-300 focus:border-purple-400 focus:ring-purple-200"
          />
        </div>
      )
      break

    case 'unit':
      measurements = (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Unit: </span>
          <Input
            placeholder="Waste Units"
            value={p.wasteUnits ?? ''}
            onChange={(e) => onUpdate(p.id, 'wasteUnits', e.target.value)}
            className="w-25.5 border-slate-300 focus:border-purple-400 focus:ring-purple-200"
          />
        </div>
      )
      break

    default:
      measurements = <span className="text-slate-400">—</span>
  }

  return (
    <div className="flex items-center gap-4">
      {measurements}
      <Input
        placeholder="Waste Amount"
        value={p.wasteAmount ?? ''}
        onChange={(e) => onUpdate(p.id, 'wasteAmount', e.target.value)}
        className="w-32 border-slate-300 focus:border-purple-400 focus:ring-purple-200"
      />
    </div>
  )
}