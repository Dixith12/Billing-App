'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AddCustomerModal } from '@/components/customers/add-customer-modal'
import { CustomerList } from '@/components/customers/customer-list'
import { useCustomers } from '@/app/dashboard/customer/hooks/useCustomers'
import { Plus, Users, Sparkles, CheckCircle2 } from 'lucide-react'

export default function CustomersPage() {
  const { customers } = useCustomers()
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)

  const totalCustomers = customers.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Decorative background elements – subtle, same as GST page */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-rose-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-gradient-to-br from-fuchsia-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative p-6 lg:p-8 space-y-10 max-w-[1400px] mx-auto">
        {/* Floating Hero Card – exact same structure as GST Settings */}
        <div className="relative">
          {/* Glow background */}
          <div className="absolute -inset-4 bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-fuchsia-500/10 rounded-2xl blur-2xl"></div>

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 lg:p-8 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl blur-lg opacity-40"></div>
                  <div className="relative p-3 bg-gradient-to-br from-rose-600 to-pink-600 rounded-xl shadow-lg">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-rose-700 via-pink-700 to-fuchsia-700 bg-clip-text text-transparent tracking-tight">
                    Customers
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">
                    Manage your customer records and contacts
                  </p>
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-2 text-sm pl-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-slate-600">
                  System configured and active
                </span>
              </div>
            </div>

            {/* Add Customer Button */}
            <Button
              onClick={() => setIsAddCustomerOpen(true)}
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 hover:from-rose-700 hover:via-pink-700 hover:to-fuchsia-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-8"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold">Add Customer</span>
            </Button>
          </div>
        </div>

        {/* All Customers Section */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-rose-600 to-pink-600 rounded-full"></div>
            <h2 className="text-lg font-semibold text-slate-700">
              All Customers
            </h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {customers.length === 0 ? (
              <div className="py-20 px-6 text-center space-y-6">
                <div className="mx-auto w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center">
                  <Users className="h-10 w-10 text-rose-600" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-slate-800">
                    No customers yet
                  </h3>
                  <p className="text-slate-600 max-w-md mx-auto">
                    Start building your customer list by adding your first contact
                  </p>
                </div>
                <Button
                  onClick={() => setIsAddCustomerOpen(true)}
                  className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white px-8"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Customer
                </Button>
              </div>
            ) : (
              <CustomerList items={customers} />
            )}
          </div>
        </div>

        {/* Optional Footer Status – same as GST */}
        <div className="pt-8 pb-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-gradient-to-r from-rose-100/80 to-pink-100/80 border border-rose-200/60 rounded-xl">
            <div className="flex items-center gap-3 text-sm text-rose-900">
              <CheckCircle2 className="h-5 w-5 text-rose-600 flex-shrink-0" />
              <span className="font-medium">
                You have {totalCustomers} customer{totalCustomers !== 1 ? 's' : ''} in your system
              </span>
            </div>
            <div className="text-xs text-rose-700" suppressHydrationWarning>
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
      />
    </div>
  )
}