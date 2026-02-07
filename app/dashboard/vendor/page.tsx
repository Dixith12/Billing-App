// app/dashboard/vendor/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddVendorModal } from "@/components/vendor/add-vendor-modal";
import { VendorList } from "@/components/vendor/vendor-list";
import { useVendors } from "@/hooks/use-vendors";
import { Plus, Building2, CheckCircle2 } from "lucide-react";

export default function VendorsPage() {
  const { vendors, refreshVendors, deleteVendor } = useVendors();
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);

  const totalVendors = vendors.length;

  return (
    <div className="min-h-screen bg-white">
      <div className="relative p-6 lg:p-8 space-y-8 max-w-350 mx-auto">
        {/* Header */}
        <div className="relative mb-10">
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="flex items-center gap-2 text-lg lg:text-xl font-bold tracking-tight">
                <div className="p-1.5 bg-primary rounded-md">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                Vendors
              </h1>
              <p className="text-sm text-slate-600">
                Manage your vendor and supplier records
              </p>
            </div>

            {/* Add Vendor Button */}
            <Button
              onClick={() => setIsAddVendorOpen(true)}
              size="lg"
              className="group w-full lg:w-auto px-8"
            >
              <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold">Add Vendor</span>
            </Button>
          </div>
        </div>

        {/* All Vendors Section */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-semibold text-slate-700">All Vendors</h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {vendors.length === 0 ? (
              <div className="py-20 px-6 text-center space-y-6">
                <div className="mx-auto w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-800">
                    No vendors yet
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Start building your vendor list by adding your first
                    supplier
                  </p>
                </div>

                <Button
                  onClick={() => setIsAddVendorOpen(true)}
                  className="px-8"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Vendor
                </Button>
              </div>
            ) : (
              <VendorList
                items={vendors}
                onRefresh={refreshVendors}
                onDelete={deleteVendor}
              />
            )}
          </div>
        </div>

        {/* Footer Status */}
        <div className="pt-8 pb-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-primary/5 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3 text-sm text-slate-800">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              <span className="font-medium">
                You have {totalVendors} vendor
                {totalVendors !== 1 ? "s" : ""} in your system
              </span>
            </div>

            <div className="text-xs text-slate-600" suppressHydrationWarning>
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Add Vendor Modal */}
      <AddVendorModal
        isOpen={isAddVendorOpen}
        onClose={() => setIsAddVendorOpen(false)}
        onSuccess={refreshVendors}
      />
    </div>
  );
}
