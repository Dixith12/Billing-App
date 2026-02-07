"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddCustomerModal } from "@/components/customers/add-customer-modal";
import { CustomerList } from "@/components/customers/customer-list";
import { useCustomers } from "@/hooks/use-customers";
import { Plus, Users, CheckCircle2 } from "lucide-react";

export default function CustomersPage() {
  const { customers, refreshCustomers } = useCustomers();
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  const totalCustomers = customers.length;

  return (
    <div className="min-h-screen bg-white">
      <div className="relative p-6 lg:p-8 space-y-8 max-w-350 mx-auto">
        {/* Hero Section */}
        <div className="relative mb-10">
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-col items-start gap-2">
                <h1 className="flex justify-start items-center gap-2 text-lg lg:text-xl font-bold tracking-tight">
                  <div className="relative p-2 bg-primary rounded-md">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  Customers
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Manage your customer records and contacts
                </p>
              </div>
            </div>

            {/* Add Customer Button */}
            <Button
              onClick={() => setIsAddCustomerOpen(true)}
              size="lg"
              className="group relative overflow-hidden hover:scale-105 px-8 w-full lg:w-auto"
            >
              <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold">Add Customer</span>
            </Button>
          </div>
        </div>

        {/* All Customers Section */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-semibold text-slate-700">All Customers</h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {customers.length === 0 ? (
              <div className="py-20 px-6 text-center space-y-6">
                <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-slate-800">
                    No customers yet
                  </h3>
                  <p className="text-slate-600 max-w-md mx-auto">
                    Start building your customer list by adding your first
                    contact
                  </p>
                </div>
                <Button
                  onClick={() => setIsAddCustomerOpen(true)}
                  className="px-8"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Customer
                </Button>
              </div>
            ) : (
              <CustomerList items={customers} onRefresh={refreshCustomers} />
            )}
          </div>
        </div>

        {/* Footer Status */}
        <div className="pt-8 pb-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-primary/5 border border-indigo-200/60 rounded-xl">
            <div className="flex items-center gap-3 text-sm text-indigo-900">
              <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0" />
              <span className="font-medium">
                You have {totalCustomers} customer
                {totalCustomers !== 1 ? "s" : ""} in your system
              </span>
            </div>
            <div className="text-xs text-indigo-700" suppressHydrationWarning>
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onSuccess={refreshCustomers}
      />
    </div>
  );
}
