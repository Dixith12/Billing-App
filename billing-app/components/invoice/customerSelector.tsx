'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, X } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import type { Customer } from '@/lib/firebase/customers' // adjust path

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
    <section className="space-y-4">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-medium">Customer Details</h2>
        <Button
          variant="link"
          className="text-blue-600 p-0 h-auto"
          onClick={() => setIsAddCustomerOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add new Customer
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search your Customers, Company Name, GSTIN..."
          className="pl-10 bg-blue-50/50 border-blue-200"
          value={customerSearch}
          onChange={(e) => setCustomerSearch(e.target.value)}
        />

        {customerSearch && filteredCustomers.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredCustomers.map((c) => (
              <button
                key={c.id}
                className="w-full px-4 py-2 text-left hover:bg-muted flex flex-col"
                onClick={() => {
                  setSelectedCustomer(c)
                  setCustomerSearch('')
                }}
              >
                <span className="font-medium">{c.name}</span>
                <span className="text-sm text-muted-foreground">GSTIN: {c.gstin || '—'}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedCustomer && (
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md">
            <span className="font-medium">{selectedCustomer.name}</span>
            <button onClick={() => setSelectedCustomer(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add Customer Sheet */}
      <Sheet open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
        <SheetContent className="sm:max-w-md p-3">
          <SheetHeader>
            <SheetTitle>Add New Customer</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>GSTIN (optional)</Label>
              <Input
                value={newCustomer.gstin}
                onChange={(e) => setNewCustomer({ ...newCustomer, gstin: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
              />
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setIsAddCustomerOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-black text-white" onClick={addNewCustomer}>
              Save
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </section>
  )
}