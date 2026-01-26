'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Quotation} from '@/lib/firebase/quotations'
import type {InvoiceProduct} from '@/lib/firebase/invoices'
import { useEffect, useState } from 'react'

interface QuotationModalProps {
  isOpen: boolean
  onClose: () => void
  initialData: Quotation | null
  onSave: (data: Omit<Quotation, 'id' | 'quotationNumber' | 'createdAt'>) => void
}

export function QuotationModal({ isOpen, onClose, initialData, onSave }: QuotationModalProps) {
  const [customerName, setCustomerName] = useState(initialData?.customerName || '')
  const [customerPhone, setCustomerPhone] = useState(initialData?.customerPhone || '')
  const [customerGstin, setCustomerGstin] = useState(initialData?.customerGstin || '')
  const [billingAddress, setBillingAddress] = useState(initialData?.billingAddress || '')
  const [products, setProducts] = useState<InvoiceProduct[]>(initialData?.products || [])
  const [subtotal, setSubtotal] = useState(initialData?.subtotal || 0)
  const [discount, setDiscount] = useState(initialData?.discount || 0)
  const [cgst, setCgst] = useState(initialData?.cgst || 9)  // default 9%
  const [sgst, setSgst] = useState(initialData?.sgst || 9)  // default 9%
  const [netAmount, setNetAmount] = useState(initialData?.netAmount || 0)

  const [error, setError] = useState<string | null>(null)

  // Recalculate totals when products/discount change (simplified)
  useEffect(() => {
    const newSubtotal = products.reduce((sum, p) => sum + p.total, 0)
    setSubtotal(newSubtotal)

    const tax = (cgst + sgst) / 100
    const newNet = newSubtotal + newSubtotal * tax - discount
    setNetAmount(newNet)
  }, [products, discount, cgst, sgst])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerName.trim()) {
      setError('Customer name is required')
      return
    }
    if (products.length === 0) {
      setError('Add at least one product')
      return
    }

    const data: Omit<Quotation, 'id' | 'quotationNumber' | 'createdAt'> = {
      customerId: initialData?.customerId || '', // You can add customer ID logic later
      customerName,
      customerPhone,
      customerGstin,
      billingAddress,
      products,
      subtotal,
      discount,
      cgst,
      sgst,
      netAmount,
    }

    onSave(data)
    onClose()
  }

  // Placeholder for adding products (expand with real product selector)
  const addProduct = () => {
  setProducts([
    ...products,
    {
      name: 'New Product',
      quantity: 1,

      // REQUIRED by InvoiceProduct
      measurementType: 'height_width',
      height: '0',
      width: '0',

      wasteEnabled: false,

      discount: '0',
      discountType: '%',

      total: 0,
      grossTotal: 0,
    },
  ])
}

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Quotation' : 'Create Quotation'}</DialogTitle>
        </DialogHeader>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone Number *</Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="customerGstin">GSTIN (optional)</Label>
              <Input
                id="customerGstin"
                value={customerGstin}
                onChange={(e) => setCustomerGstin(e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="billingAddress">Billing Address</Label>
              <Textarea
                id="billingAddress"
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Products Section (placeholder – expand with real table) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Products</h3>
              <Button type="button" variant="outline" onClick={addProduct}>
                Add Product
              </Button>
            </div>

            {/* Simple product list – replace with full editable table later */}
            <div className="space-y-2">
              {products.map((product, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <Input
                    placeholder="Product name"
                    value={product.name}
                    onChange={(e) => {
                      const newProducts = [...products]
                      newProducts[index].name = e.target.value
                      setProducts(newProducts)
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="Quantity"
                    value={product.quantity}
                    onChange={(e) => {
                      const newProducts = [...products]
                      newProducts[index].quantity = Number(e.target.value)
                      setProducts(newProducts)
                    }}
                  />
                  {/* ... add height, width, discount, total inputs */}
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t pt-4">
            <div>
              <Label>Subtotal</Label>
              <div className="text-xl font-bold">{formatCurrency(subtotal)}</div>
            </div>
            <div>
              <Label>Discount</Label>
              <Input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>CGST (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={cgst}
                onChange={(e) => setCgst(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>SGST (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={sgst}
                onChange={(e) => setSgst(Number(e.target.value))}
              />
            </div>
            <div className="md:col-span-4">
              <Label className="text-lg">Net Amount</Label>
              <div className="text-2xl font-bold text-emerald-600">
                {formatCurrency(netAmount)}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-black text-white">
              Save Quotation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount)
}