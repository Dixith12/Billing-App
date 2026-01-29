'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, X, UserPlus, CheckCircle2, MapPin, Phone, FileText } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import type { Customer } from '@/lib/firebase/customers'

interface CustomerSelectorProps {
  customerSearch: string
  setCustomerSearch: (v: string) => void
  filteredCustomers: Customer[]
  selectedCustomer: Customer | null
  setSelectedCustomer: (c: Customer | null) => void
  isAddCustomerOpen: boolean
  setIsAddCustomerOpen: (v: boolean) => void
  newCustomer: { name: string; gstin: string; phone: string; address: string }
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
        {/* Search Input with glow */}
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

          {/* Dropdown results */}
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

        {/* Selected Customer Tag */}
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

      {/* Add New Customer Sheet – premium style */}
      <Sheet open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
        <SheetContent className="sm:max-w-md bg-white border-slate-200">
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

          <div className="space-y-6 py-6 mx-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <UserPlus className="h-4 w-4 text-indigo-600" />
                Customer Name <span className="text-red-500 text-xs">*</span>
              </Label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300 pointer-events-none"></div>
                <Input
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="Full name or company name"
                  className="border-slate-300 focus:border-indigo-400 focus:ring-indigo-200"
                />
              </div>
            </div>

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

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-amber-600" />
                Billing Address
              </Label>
              <Input
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                placeholder="Street, city, state, PIN code..."
                className="border-slate-300 focus:border-amber-400 focus:ring-amber-200"
              />
            </div>
          </div>

          <SheetFooter className="gap-3 pt-6 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => setIsAddCustomerOpen(false)}
              className="border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={addNewCustomer}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Save Customer
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </section>
  )
}