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
  Briefcase,
  Landmark,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAddCustomerForm,useCustomers } from '@/app/dashboard/customer/hooks/useCustomers'
import { INDIAN_STATES_AND_UTS } from '@/lib/utils/india'
import { toast } from 'sonner'

interface AddCustomerModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddCustomerModal({ isOpen, onClose }: AddCustomerModalProps) {
    const { addCustomer } = useCustomers()

  const { 
  form, 
  updateField, 
  setBalanceType, 
  submit, 
  error, 
  reset,
  isLoading
} = useAddCustomerForm(
  addCustomer,   // ✅ PASS addCustomer HERE
  () => {
    reset()
    onClose()
    toast.success("Customer created successfully", {
      description: "New customer has been added to your list.",
      duration: 4000,
    })
  }
)


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await submit()
    if (!success) {
      // Error toast is already handled in the hook
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white border-slate-200 max-h-[90vh] overflow-hidden">
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
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 mx-1">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Scrollable form content */}
        <div className="max-h-[70vh] overflow-y-auto px-1 py-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
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

            {/* Company Name */}
            <div className="space-y-2">
              <Label
                htmlFor="companyName"
                className="text-sm font-medium text-slate-700 flex items-center gap-2"
              >
                <Briefcase className="h-4 w-4 text-blue-600" />
                Company Name <span className="text-xs text-slate-500">(optional)</span>
              </Label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300 pointer-events-none" />
                <Input
                  id="companyName"
                  placeholder="Company / Business name"
                  value={form.companyName || ''}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  className="relative border-slate-300 focus:border-blue-400 focus:ring-blue-200 h-11"
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
                  placeholder="Street, area, city, PIN code..."
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  required
                  className="relative border-slate-300 focus:border-amber-400 focus:ring-amber-200 min-h-[100px] resize-none"
                />
              </div>
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
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300 pointer-events-none" />
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
            </div>

            {/* Optional Details – Opening Balance */}
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/40 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                Optional Details
              </h3>

              <div className="space-y-5">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700">
                    Opening Balance
                  </Label>

                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="debit"
                        name="balanceType"
                        checked={form.openingBalanceType === 'debit'}
                        onChange={() => setBalanceType('debit')}
                        className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                      />
                      <Label htmlFor="debit" className="text-sm text-slate-700 cursor-pointer">
                        Debit
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="credit"
                        name="balanceType"
                        checked={form.openingBalanceType === 'credit'}
                        onChange={() => setBalanceType('credit')}
                        className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                      />
                      <Label htmlFor="credit" className="text-sm text-slate-700 cursor-pointer">
                        Credit
                      </Label>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300 pointer-events-none" />
                    <div className="relative flex items-center border border-slate-300 rounded-lg focus-within:border-rose-400 focus-within:ring-rose-200 overflow-hidden h-11 shadow-sm">
                      <span className="px-4 text-slate-600 font-medium">₹</span>
                      <Input
                        type="number"
                        placeholder={
                          form.openingBalanceType === 'debit'
                            ? 'Enter Debit Amount'
                            : 'Enter Credit Amount'
                        }
                        value={form.openingBalanceAmount}
                        onChange={(e) => updateField('openingBalanceAmount', e.target.value)}
                        className="border-0 focus:ring-0 h-full rounded-none bg-transparent"
                        min="0"
                        step="0.01"
                      />
                      <span
                        className={cn(
                          'px-4 text-sm font-medium whitespace-nowrap',
                          form.openingBalanceType === 'debit' ? 'text-red-600' : 'text-green-600'
                        )}
                      >
                        {form.openingBalanceType === 'debit'
                          ? 'Customer pays you'
                          : 'You pay the customer'}
                      </span>
                    </div>
                  </div>
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
                    Save Customer
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