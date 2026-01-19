"use client"

import { Plus, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { useInvoice } from "@/app/invoice/hooks/useInvoice"

export function CustomerSection({
  invoice,
}: {
  invoice: ReturnType<typeof useInvoice>
}) {
  const {
    selectedCustomer,
    customerSearch,
    setCustomerSearch,
    filteredCustomers,
    setSelectedCustomer,
    isAddCustomerOpen,
    setIsAddCustomerOpen,
    newCustomer,
    setNewCustomer,
    addCustomer,
  } = invoice

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-medium">Customer details</h2>
        <Button
          variant="link"
          className="text-blue-600 p-0"
          onClick={() => setIsAddCustomerOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add new Customer
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
        <Input
          className="pl-10 bg-blue-50/50"
          placeholder="Search customer..."
          value={customerSearch}
          onChange={(e) => setCustomerSearch(e.target.value)}
        />

        {customerSearch && filteredCustomers.length > 0 && (
          <div className="absolute z-10 w-full bg-white border rounded-md">
            {filteredCustomers.map((c) => (
              <button
                key={c.id}
                className="w-full px-4 py-2 text-left hover:bg-muted"
                onClick={() => {
                  setSelectedCustomer(c)
                  setCustomerSearch("")
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedCustomer && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded">
          {selectedCustomer.name}
          <X
            className="h-4 w-4 cursor-pointer"
            onClick={() => setSelectedCustomer(null)}
          />
        </div>
      )}

      <Sheet open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add New Customer</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 py-6">
            <div>
              <Label>Name</Label>
              <Input
                value={newCustomer.name}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>GSTIN</Label>
              <Input
                value={newCustomer.gstin}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, gstin: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={newCustomer.phone}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, phone: e.target.value })
                }
              />
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => setIsAddCustomerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addCustomer}>Done</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </section>
  )
}
