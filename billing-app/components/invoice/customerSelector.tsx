'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, X, UserPlus, CheckCircle2, MapPin, Phone, FileText, Building, IndianRupee, AlertCircle } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Customer } from '@/lib/firebase/customers'
import { useState } from 'react'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
] as const

interface CustomerSelectorProps {
  customerSearch: string
  setCustomerSearch: (v: string) => void
  filteredCustomers: Customer[]
  selectedCustomer: Customer | null
  setSelectedCustomer: (c: Customer | null) => void
  isAddCustomerOpen: boolean
  setIsAddCustomerOpen: (v: boolean) => void
  newCustomer: {
    name: string
    companyName: string
    gstin: string
    phone: string
    address: string
    state: string
    openingBalanceType: 'debit' | 'credit'
    openingBalanceAmount: string
  }
  setNewCustomer: (v: any) => void
  addNewCustomer: () => Promise<boolean>
}

export function CustomerSelector(props: CustomerSelectorProps) {
  const {
    customerSearch,
    setCustomerSearch,
    filteredCustomers,
    selectedCustomer,
    setSelectedCustomer,
    isAddCustomerOpen,
    setIsAddCustomerOpen,
    newCustomer,
    setNewCustomer,
    addNewCustomer,
  } = props

  const [formError, setFormError] = useState<string | null>(null)

  const validateForm = () => {
    if (!newCustomer.name.trim()) return "Customer Name is required"
    if (!newCustomer.phone.trim()) return "Phone Number is required"
    if (!newCustomer.state.trim()) return "State is required"
    if (!newCustomer.address.trim()) return "Billing Address is required"
    return null
  }

  const handleSave = async () => {
    const error = validateForm()
    if (error) {
      setFormError(error)
      return
    }
    setFormError(null)
    const success = await addNewCustomer()
    if (success) {
      setIsAddCustomerOpen(false)
    }
  }

  return (
    <section className="space-y-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur-lg opacity-30"></div>
            <div className="relative p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-md">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-slate-800">
            Customer Details
          </h2>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-indigo-200 hover:bg-indigo-50 text-indigo-700"
          onClick={() => setIsAddCustomerOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add New Customer
        </Button>
      </div>

      {/* Search + Selected Customer */}
      <div className="space-y-4">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300 pointer-events-none"></div>
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-5 w-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            <Input
              placeholder="Search customers by name, phone or GSTIN..."
              className="pl-10 border-slate-300 focus:border-indigo-400 focus:ring-indigo-200 bg-slate-50/50"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
          </div>

          {customerSearch && filteredCustomers.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-auto">
              {filteredCustomers.map((c) => (
                <button
                  key={c.id}
                  className="w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors flex flex-col border-b border-slate-100 last:border-none"
                  onClick={() => {
                    setSelectedCustomer(c)
                    setCustomerSearch('')
                  }}
                >
                  <span className="font-medium text-slate-900">{c.name}</span>
                  <span className="text-sm text-slate-500">
                    {c.phone && <span>{c.phone} • </span>}
                    GSTIN: {c.gstin || '—'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedCustomer && (
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <UserPlus className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <div className="font-medium text-slate-900">{selectedCustomer.name}</div>
                <div className="text-xs text-slate-600">
                  {selectedCustomer.phone || 'No phone'} • GSTIN: {selectedCustomer.gstin || '—'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedCustomer(null)}
              className="text-slate-500 hover:text-red-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* ── Add New Customer Sheet ─────────────────────────────────────────────── */}
      <Sheet open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
        <SheetContent className="sm:max-w-md bg-white border-slate-200 flex flex-col p-0">
          {/* Fixed Header */}
          <div className="px-6 pt-6 pb-4 border-b border-slate-200 shrink-0">
            <SheetHeader>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur-lg opacity-30"></div>
                  <div className="relative p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-md">
                    <UserPlus className="h-5 w-5 text-white" />
                  </div>
                </div>
                <SheetTitle className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
                  Add New Customer
                </SheetTitle>
              </div>
            </SheetHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-8 scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-500">
            <div className="space-y-6">
              {/* Name - required */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <UserPlus className="h-4 w-4 text-indigo-600" />
                  Customer Name <span className="text-red-500 text-xs">*</span>
                </Label>
                <Input
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="Full name or company contact name"
                  className="border-slate-300 focus:border-indigo-400 focus:ring-indigo-200"
                />
              </div>

              {/* Company Name - optional */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Building className="h-4 w-4 text-blue-600" />
                  Company Name <span className="text-xs text-slate-500">(optional)</span>
                </Label>
                <Input
                  value={newCustomer.companyName}
                  onChange={(e) => setNewCustomer({ ...newCustomer, companyName: e.target.value })}
                  placeholder="Company / Firm name"
                  className="border-slate-300 focus:border-blue-400 focus:ring-blue-200"
                />
              </div>

              {/* GSTIN - optional */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-purple-600" />
                  GSTIN <span className="text-xs text-slate-500">(optional)</span>
                </Label>
                <Input
                  value={newCustomer.gstin}
                  onChange={(e) => setNewCustomer({ ...newCustomer, gstin: e.target.value })}
                  placeholder="15-digit GST number"
                  className="border-slate-300 focus:border-purple-400 focus:ring-purple-200"
                />
              </div>

              {/* Phone - required */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-emerald-600" />
                  Phone Number <span className="text-red-500 text-xs">*</span>
                </Label>
                <Input
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="10-digit mobile number"
                  className="border-slate-300 focus:border-emerald-400 focus:ring-emerald-200"
                />
              </div>

              {/* State - required */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-amber-600" />
                  State <span className="text-red-500 text-xs">*</span>
                </Label>
                <Select
                  value={newCustomer.state}
                  onValueChange={(val) => setNewCustomer({ ...newCustomer, state: val })}
                >
                  <SelectTrigger className="border-slate-300 focus:border-amber-400">
                    <SelectValue placeholder="Select state / UT" />
                  </SelectTrigger>
                  <SelectContent className='bg-white'>
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Address - required */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-amber-600" />
                  Billing Address <span className="text-red-500 text-xs">*</span>
                </Label>
                <Input
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  placeholder="Street, area, city, PIN code..."
                  className="border-slate-300 focus:border-amber-400 focus:ring-amber-200"
                />
              </div>

              {/* Opening Balance - optional */}
              <div className="space-y-4 pt-6 border-t border-slate-200">
                <Label className="text-sm font-medium text-slate-700">
                  Opening Balance <span className="text-xs text-slate-500">(optional)</span>
                </Label>

                {/* Vertical radio buttons */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      id="debit-sheet"
                      name="balanceType-sheet"
                      checked={newCustomer.openingBalanceType === 'debit'}
                      onChange={() => setNewCustomer({ ...newCustomer, openingBalanceType: 'debit' })}
                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                    />
                    <label htmlFor="debit-sheet" className="text-sm text-slate-700 cursor-pointer">
                      Debit (customer owes us)
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      id="credit-sheet"
                      name="balanceType-sheet"
                      checked={newCustomer.openingBalanceType === 'credit'}
                      onChange={() => setNewCustomer({ ...newCustomer, openingBalanceType: 'credit' })}
                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                    />
                    <label htmlFor="credit-sheet" className="text-sm text-slate-700 cursor-pointer">
                      Credit (we owe customer)
                    </label>
                  </div>
                </div>

                {/* Amount input below radios */}
                <div className="flex items-center gap-3 pl-8">
                  <IndianRupee className="h-5 w-5 text-slate-600" />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newCustomer.openingBalanceAmount}
                    onChange={(e) => setNewCustomer({ ...newCustomer, openingBalanceAmount: e.target.value })}
                    placeholder="0.00"
                    className="w-40 border-slate-300 focus:border-rose-400 focus:ring-rose-200"
                  />
                </div>
              </div>

              {/* Form error message */}
              {formError && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200 mt-4">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="px-6 py-5 border-t border-slate-200 shrink-0 bg-white">
            <SheetFooter className="gap-3 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsAddCustomerOpen(false)}
                className="border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Save Customer
              </Button>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  )
}