// app/customers/components/add-customer-modal.tsx
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
  Building2,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAddCustomerForm } from '@/app/dashboard/customer/hooks/useCustomers'

interface AddCustomerModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddCustomerModal({ isOpen, onClose }: AddCustomerModalProps) {
  const { form, updateField, submit, error, reset } = useAddCustomerForm(() => {
    reset()
    onClose()
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await submit()
    if (success) onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white border-slate-200">
        <DialogHeader className="pb-5 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-sm">
              <User className="h-7 w-7 text-white" strokeWidth={2.2} />
            </div>

            <div>
              <DialogTitle className="text-2xl font-bold text-slate-800">
                Add New Customer
              </DialogTitle>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                Enter customer details below
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Error display */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-800">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Customer Name */}
          <div className="space-y-2">
            <Label
              htmlFor="customerName"
              className="text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <User className="h-4 w-4 text-indigo-600" />
              Customer Name <span className="text-red-500 text-xs">*</span>
            </Label>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300 pointer-events-none" />
              <Input
                id="customerName"
                placeholder="Full name or company name"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
                className="relative border-slate-300 focus:border-indigo-400 focus:ring-indigo-200 h-11"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <Phone className="h-4 w-4 text-emerald-600" />
              Phone Number <span className="text-red-500 text-xs">*</span>
            </Label>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300 pointer-events-none" />
              <Input
                id="phone"
                type="tel"
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                required
                className="relative border-slate-300 focus:border-emerald-400 focus:ring-emerald-200 h-11"
              />
            </div>
          </div>

          {/* GSTIN */}
          <div className="space-y-2">
            <Label
              htmlFor="gstin"
              className="text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <FileText className="h-4 w-4 text-violet-600" />
              GSTIN <span className="text-xs text-slate-500">(optional)</span>
            </Label>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300 pointer-events-none" />
              <Input
                id="gstin"
                placeholder="15-digit GST number (if applicable)"
                value={form.gstin || ''}
                onChange={(e) => updateField('gstin', e.target.value)}
                className="relative border-slate-300 focus:border-violet-400 focus:ring-violet-200 h-11"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label
              htmlFor="address"
              className="text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <MapPin className="h-4 w-4 text-amber-600" />
              Full Address <span className="text-red-500 text-xs">*</span>
            </Label>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300 pointer-events-none" />
              <Textarea
                id="address"
                placeholder="Street, area, city, state, PIN code..."
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                required
                className="relative border-slate-300 focus:border-amber-400 focus:ring-amber-200 min-h-[100px] resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-3 pt-5 border-t border-slate-200">
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px] shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Save Customer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}