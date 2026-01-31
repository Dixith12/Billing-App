// app/vendors/components/add-vendor-modal.tsx
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
  Building2,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Briefcase,
  Landmark,
  IndianRupee,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVendors } from '@/app/dashboard/vendor/hooks/useVendors'
import { INDIAN_STATES_AND_UTS } from '@/lib/utils/india'
import { toast } from 'sonner'

interface AddVendorModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddVendorModal({ isOpen, onClose }: AddVendorModalProps) {
  const { useVendorForm } = useVendors()

  const {
    form,
    updateField,
    setBalanceType,
    submit,
    formError: error,
    isSubmitting: isLoading,
    resetForm,
  } = useVendorForm(() => {
    resetForm()
    onClose()
    toast.success("Vendor created successfully", {
      description: "New vendor has been added to your list.",
      duration: 4000,
    })
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await submit()
    if (!success) {
      // Error is already handled inside the hook
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white border-slate-200 max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-5 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-sm">
              <Building2 className="h-7 w-7 text-white" strokeWidth={2.2} />
            </div>

            <div>
              <DialogTitle className="text-2xl font-bold text-slate-800">
                Add New Vendor
              </DialogTitle>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                Enter vendor details below
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Error display */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 mx-1">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <div className="max-h-[70vh] overflow-y-auto px-1 py-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vendor Name */}
            <div className="space-y-2">
              <Label
                htmlFor="vendorName"
                className="text-sm font-medium text-slate-700 flex items-center gap-2"
              >
                <Building2 className="h-4 w-4 text-indigo-600" />
                Vendor Name <span className="text-red-500 text-xs">*</span>
              </Label>
              <Input
                id="vendorName"
                placeholder="Vendor / Supplier name"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
                className="border-slate-300 focus:border-indigo-400 focus:ring-indigo-200 h-11"
              />
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <Label
                htmlFor="companyName"
                className="text-sm font-medium text-slate-700 flex items-center gap-2"
              >
                <Briefcase className="h-4 w-4 text-blue-600" />
                Company Name <span className="text-xs text-slate-500">(optional)</span>
              </Label>
              <Input
                id="companyName"
                placeholder="Company / Firm name"
                value={form.companyName || ''}
                onChange={(e) => updateField('companyName', e.target.value)}
                className="border-slate-300 focus:border-blue-400 focus:ring-blue-200 h-11"
              />
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
              <Input
                id="phone"
                type="tel"
                placeholder="10-digit mobile / landline"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                required
                className="border-slate-300 focus:border-emerald-400 focus:ring-emerald-200 h-11"
              />
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
              <Input
                id="gstin"
                placeholder="15-digit GST number (if applicable)"
                value={form.gstin || ''}
                onChange={(e) => updateField('gstin', e.target.value)}
                className="border-slate-300 focus:border-violet-400 focus:ring-violet-200 h-11"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label
                htmlFor="address"
                className="text-sm font-medium text-slate-700 flex items-center gap-2"
              >
                <MapPin className="h-4 w-4 text-amber-600" />
                Address <span className="text-red-500 text-xs">*</span>
              </Label>
              <Textarea
                id="address"
                placeholder="Street, area, city, PIN code..."
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                required
                className="border-slate-300 focus:border-amber-400 focus:ring-amber-200 min-h-[100px] resize-none"
              />
            </div>

            {/* State Dropdown */}
            <div className="space-y-2">
              <Label
                htmlFor="state"
                className="text-sm font-medium text-slate-700 flex items-center gap-2"
              >
                <Landmark className="h-4 w-4 text-purple-600" />
                State / UT <span className="text-xs text-slate-500">(optional)</span>
              </Label>
              <select
                id="state"
                value={form.state || ''}
                onChange={(e) => updateField('state', e.target.value)}
                className={cn(
                  "w-full h-11 px-4 py-2.5 border border-slate-300 rounded-lg",
                  "focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none",
                  "bg-white text-slate-900 shadow-sm transition-all duration-200",
                  "hover:border-purple-400 hover:shadow-md"
                )}
              >
                <option value="">Select state / union territory</option>
                {INDIAN_STATES_AND_UTS.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* Opening Balance */}
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/40 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-rose-600" />
                Opening Balance
              </h3>

              <div className="space-y-5">
                <div className="flex items-center gap-10">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      id="debit-vendor"
                      name="balanceType-vendor"
                      checked={form.openingBalanceType === 'debit'}
                      onChange={() => setBalanceType('debit')}
                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <Label htmlFor="debit-vendor" className="text-sm cursor-pointer">
                      Debit
                    </Label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      id="credit-vendor"
                      name="balanceType-vendor"
                      checked={form.openingBalanceType === 'credit'}
                      onChange={() => setBalanceType('credit')}
                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <Label htmlFor="credit-vendor" className="text-sm cursor-pointer">
                      Credit
                    </Label>
                  </div>
                </div>

                {/* Input + small message card */}
                <div className="space-y-3">
                  <div className="relative flex items-center border border-slate-300 rounded-lg h-11 overflow-hidden focus-within:border-rose-400 focus-within:ring-rose-200 shadow-sm">
                    <span className="px-4 text-slate-600 font-medium bg-slate-100">₹</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={form.openingBalanceAmount}
                      onChange={(e) => updateField('openingBalanceAmount', e.target.value)}
                      className="border-0 focus:ring-0 h-full rounded-none bg-transparent px-3"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Small status message */}
                  {form.openingBalanceAmount && Number(form.openingBalanceAmount) > 0 && (
                    <div
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
                        form.openingBalanceType === 'debit'
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-green-50 text-green-700 border border-green-200"
                      )}
                    >
                      <IndianRupee className="h-3.5 w-3.5" />
                      {form.openingBalanceType === 'debit'
                        ? 'Vendor pays you'
                        : 'You pay the vendor'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-3 pt-6 border-t border-slate-200 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-slate-300 hover:bg-slate-50 min-w-[110px]"
                disabled={isLoading}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px] shadow-sm",
                  isLoading && "opacity-70 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Saving...</span>
                  </div>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Save Vendor
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}