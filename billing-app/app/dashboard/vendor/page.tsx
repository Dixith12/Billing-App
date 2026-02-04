// app/dashboard/vendor/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddVendorModal } from "@/components/vendor/add-vendor-modal"; // adjust path
import { VendorList } from "@/components/vendor/vendor-list"; // adjust path
import { useVendors } from "@/app/dashboard/vendor/hooks/useVendors";
import { Plus, Building2, Sparkles, CheckCircle2 } from "lucide-react";

export default function VendorsPage() {
  const { vendors, refreshVendors, deleteVendor} = useVendors();
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);

  const totalVendors = vendors.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Decorative background elements – same style, different colors */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative p-6 lg:p-8 space-y-10 max-w-[1400px] mx-auto">
        {/* Floating Hero Card – identical structure */}
        <div className="relative">
          {/* Glow background */}
          <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/10 via-teal-500/10 to-indigo-500/10 rounded-2xl blur-2xl"></div>

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 lg:p-8 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl blur-lg opacity-40"></div>
                  <div className="relative p-3 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl shadow-lg">
                    <Building2 className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-700 via-teal-700 to-indigo-700 bg-clip-text text-transparent tracking-tight">
                    Vendors
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">
                    Manage your vendor and supplier records
                  </p>
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-2 text-sm pl-1">
                <CheckCircle2 className="h-4 w-4 text-teal-600" />
                <span className="text-slate-600">
                  System configured and active
                </span>
              </div>
            </div>

            {/* Add Vendor Button */}
            <Button
              onClick={() => setIsAddVendorOpen(true)}
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-teal-600 via-cyan-600 to-indigo-600 hover:from-teal-700 hover:via-cyan-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-8"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold">Add Vendor</span>
            </Button>
          </div>
        </div>

        {/* All Vendors Section */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-full"></div>
            <h2 className="text-lg font-semibold text-slate-700">
              All Vendors
            </h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {vendors.length === 0 ? (
              <div className="py-20 px-6 text-center space-y-6">
                <div className="mx-auto w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-teal-600" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-slate-800">
                    No vendors yet
                  </h3>
                  <p className="text-slate-600 max-w-md mx-auto">
                    Start building your vendor list by adding your first
                    supplier
                  </p>
                </div>
                <Button
                  onClick={() => setIsAddVendorOpen(true)}
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-8"
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

        {/* Optional Footer Status – same layout */}
        <div className="pt-8 pb-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-gradient-to-r from-cyan-100/80 to-teal-100/80 border border-cyan-200/60 rounded-xl">
            <div className="flex items-center gap-3 text-sm text-cyan-900">
              <CheckCircle2 className="h-5 w-5 text-teal-600 flex-shrink-0" />
              <span className="font-medium">
                You have {totalVendors} vendor{totalVendors !== 1 ? "s" : ""} in
                your system
              </span>
            </div>
            <div className="text-xs text-cyan-700" suppressHydrationWarning>
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <AddVendorModal
        isOpen={isAddVendorOpen}
        onClose={() => setIsAddVendorOpen(false)}
      />
    </div>
  );
}
