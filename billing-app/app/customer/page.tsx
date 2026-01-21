// app/customers/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AddCustomerModal } from '@/components/customers/add-customer-modal'
import { CustomerList } from '@/components/customers/customer-list'
import { useCustomers } from '@/app/customer/hooks/useCustomers'
import { ArrowLeft, Plus } from 'lucide-react'

export default function CustomersPage() {
  const { customers } = useCustomers()
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center h-16 px-4 bg-background border-b">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </header>

      {/* Content */}
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Customers</h1>
        </div>

        {/* Add Button */}
        <div>
          <Button
            onClick={() => setIsAddCustomerOpen(true)}
            className="gap-3 bg-black text-white"
          >
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>

        {/* Customer List */}
        <CustomerList items={customers} />
      </div>

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
      />
    </div>
  )
}