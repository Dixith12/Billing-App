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
import {
  User,
  Phone,
  FileText,
  MapPin,
  Package,
  IndianRupee,
  Percent,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Quotation } from '@/lib/firebase/quotations'
import type { InvoiceProduct } from '@/lib/firebase/invoices'
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
  const [cgst, setCgst] = useState(initialData?.cgst || 9)
  const [sgst, setSgst] = useState(initialData?.sgst || 9)
  const [netAmount, setNetAmount] = useState(initialData?.netAmount || 0)

  const [error, setError] = useState<string | null>(null)

  const isEdit = !!initialData

  // Recalculate totals
  useEffect(() => {
    const newSubtotal = products.reduce((sum, p) => sum + (p.total || 0), 0)
    setSubtotal(newSubtotal)

    const taxRate = (cgst + sgst) / 100
    const taxAmount = newSubtotal * taxRate
    const newNet = newSubtotal + taxAmount - discount
    setNetAmount(newNet)
  }, [products, discount, cgst, sgst])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!customerName.trim()) {
      setError('Customer name is required')
      return
    }
    if (products.length === 0) {
      setError('Add at least one product')
      return
    }

    const data: Omit<Quotation, 'id' | 'quotationNumber' | 'createdAt'> = {
      customerId: initialData?.customerId || '',
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

  const addProduct = () => {
    setProducts([
      ...products,
      {
        name: 'New Product',
        quantity: 1,
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
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-slate-200">
        <DialogHeader className="pb-5 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-40"></div>
              <div className="relative p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl">
                <FileText className="h-7 w-7 text-white" strokeWidth={2.2} />
              </div>
            </div>

            <div>
              <DialogTitle className="text-2xl font-bold text-slate-800">
                {isEdit ? 'Edit Quotation' : 'Create New Quotation'}
              </DialogTitle>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                {isEdit ? 'Update quotation details' : 'Enter quotation information below'}
              </p>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Customer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <User className="h-4 w-4 text-indigo-600" />
                Customer Name <span className="text-red-500 text-xs">*</span>
              </Label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300 pointer-events-none"></div>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full name or company name"
                  required
                  className="border-slate-300 focus:border-indigo-400 focus:ring-indigo-200 h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-600" />
                Phone Number <span className="text-red-500 text-xs">*</span>
              </Label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300 pointer-events-none"></div>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  required
                  className="border-slate-300 focus:border-emerald-400 focus:ring-emerald-200 h-11"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <FileText className="h-4 w-4 text-violet-600" />
                GSTIN <span className="text-xs text-slate-500">(optional)</span>
              </Label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300 pointer-events-none"></div>
                <Input
                  value={customerGstin}
                  onChange={(e) => setCustomerGstin(e.target.value)}
                  placeholder="15-digit GST number (if applicable)"
                  className="border-slate-300 focus:border-violet-400 focus:ring-violet-200 h-11"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-600" />
                Billing Address
              </Label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300 pointer-events-none"></div>
                <Textarea
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  placeholder="Street, area, city, state, PIN code..."
                  className="border-slate-300 focus:border-amber-400 focus:ring-amber-200 min-h-[100px] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-600" />
                Products & Services
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addProduct}
                className="border-indigo-200 hover:bg-indigo-50 text-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            {/* Simple product rows – expand later with full table */}
            <div className="space-y-3">
              {products.map((product, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1 space-y-2">
                    <Label className="text-sm text-slate-600">Product Name</Label>
                    <Input
                      value={product.name}
                      onChange={(e) => {
                        const newProducts = [...products]
                        newProducts[index].name = e.target.value
                        setProducts(newProducts)
                      }}
                      placeholder="Product / Service name"
                    />
                  </div>

                  <div className="w-full sm:w-24 space-y-2">
                    <Label className="text-sm text-slate-600">Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      value={product.quantity}
                      onChange={(e) => {
                        const newProducts = [...products]
                        newProducts[index].quantity = Number(e.target.value)
                        setProducts(newProducts)
                      }}
                    />
                  </div>

                  {/* Add more fields: height, width, discount, etc. when ready */}
                </div>
              ))}
            </div>
          </div>

          {/* Totals Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 pt-6 border-t border-slate-200">
            <div className="space-y-1">
              <Label className="text-sm text-slate-600">Subtotal</Label>
              <div className="text-xl font-bold text-slate-800">
                {formatCurrency(subtotal)}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-sm text-slate-600">Discount</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="h-10"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-sm text-slate-600">CGST (%)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={cgst}
                onChange={(e) => setCgst(Number(e.target.value))}
                className="h-10"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-sm text-slate-600">SGST (%)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={sgst}
                onChange={(e) => setSgst(Number(e.target.value))}
                className="h-10"
              />
            </div>

            <div className="md:col-span-4 pt-4">
              <div className="flex items-center justify-between bg-emerald-50/70 p-5 rounded-xl border border-emerald-100">
                <span className="text-lg font-semibold text-emerald-800">Net Amount</span>
                <span className="text-3xl font-bold text-emerald-700">
                  {formatCurrency(netAmount)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-6 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-300 hover:bg-slate-50 min-w-[110px]"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[160px] shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {isEdit ? 'Update Quotation' : 'Save Quotation'}
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