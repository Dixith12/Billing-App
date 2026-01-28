'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { GstEditModal } from '@/components/gst/gst-modal'
import { useGst } from '@/app/dashboard/gst/hooks/useGst'
import {
  Pencil,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Info,
  AlertCircle,
} from 'lucide-react'

export default function GstPage() {
  const { cgst, sgst, updateGst } = useGst()
  const [isEditOpen, setIsEditOpen] = useState(false)

  const totalGst = (cgst + sgst).toFixed(2)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Decorative background elements – same as your original */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative p-6 lg:p-8 space-y-10 max-w-[1200px] mx-auto">
        {/* Floating GST Settings Hero Card – exact match to your UI code */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-green-500/10 rounded-2xl blur-2xl"></div>

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 lg:p-8 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl blur-lg opacity-40"></div>
                  <div className="relative p-3 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl shadow-lg">
                    <TrendingUp className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-700 via-teal-700 to-green-700 bg-clip-text text-transparent tracking-tight">
                    GST Settings
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">
                    Manage your tax rates and compliance settings
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm pl-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-slate-600">
                  System configured and active
                </span>
              </div>
            </div>

            <Button
              onClick={() => setIsEditOpen(true)}
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:via-teal-700 hover:to-green-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-8"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Pencil className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-semibold">Edit Rates</span>
            </Button>
          </div>
        </div>

        {/* Tax Rates Overview – standalone card, same size & style as original */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full"></div>
            <h2 className="text-lg font-semibold text-slate-700">
              Tax Rates Overview
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CGST Card */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl border border-emerald-200/60 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-emerald-600">Central</div>
                      <div className="text-sm font-medium text-slate-600">Central GST</div>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-6xl font-bold text-emerald-700">
                      {cgst}%
                    </div>
                    <p className="text-xs text-slate-500">Applied to all invoices</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SGST Card */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-teal-500/20 to-teal-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl border border-teal-200/60 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-teal-600">State</div>
                      <div className="text-sm font-medium text-slate-600">State GST</div>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-teal-100 to-teal-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-teal-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-6xl font-bold text-teal-700">
                      {sgst}%
                    </div>
                    <p className="text-xs text-slate-500">Applied to all invoices</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total GST Summary – standalone card below */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-white/80 backdrop-blur-xl border border-emerald-200/60 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-600">Combined Rate</div>
                  <div className="text-sm font-medium text-slate-600 mt-1">Total GST Liability</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 mb-2">Effective tax rate</div>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div className="space-y-2">
                  <div className="text-7xl font-bold text-emerald-700">
                    {totalGst}%
                  </div>
                </div>
                <div className="text-right space-y-1 text-sm">
                  <div className="text-slate-600">
                    <span className="text-emerald-600 font-semibold">{cgst}%</span> (CGST)
                  </div>
                  <div className="text-slate-600">
                    <span className="text-teal-600 font-semibold">{sgst}%</span> (SGST)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information & Guidelines */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-teal-600 to-green-600 rounded-full"></div>
            <h2 className="text-lg font-semibold text-slate-700">
              Information & Guidelines
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
              <div className="relative bg-white/80 backdrop-blur-xl border border-blue-200/60 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100">
                      <CheckCircle2 className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-900">Auto-Applied to Invoices</h3>
                    <p className="text-sm text-slate-600">
                      Tax rates are automatically applied to all new invoices created after updating these settings
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* other 3 cards remain the same as before – omitted here for brevity */}
            {/* ... copy from previous response if needed ... */}

            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-white border border-purple-100 rounded-2xl p-7 hover:shadow-lg transition-all">
                <div className="flex gap-5">
                  <div className="h-14 w-14 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <Pencil className="h-7 w-7 text-purple-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-800">Update Anytime</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      You can modify GST rates whenever needed to stay compliant with regulations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-white border border-emerald-100 rounded-2xl p-7 hover:shadow-lg transition-all">
                <div className="flex gap-5">
                  <div className="h-14 w-14 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-7 w-7 text-emerald-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-800">Tax Compliance</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Always verify that your rates match the current GST rules in your jurisdiction.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-white border border-amber-100 rounded-2xl p-7 hover:shadow-lg transition-all">
                <div className="flex gap-5">
                  <div className="h-14 w-14 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Info className="h-7 w-7 text-amber-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-800">Record Keeping</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Every change is logged automatically for audit and compliance documentation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GstEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialCgst={cgst}
        initialSgst={sgst}
        onSave={updateGst}
      />
    </div>
  )
}