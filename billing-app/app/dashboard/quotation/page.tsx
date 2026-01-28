'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { QuotationTable } from '@/components/quotation/quotation-table'
import { useQuotation } from '@/app/dashboard/quotation/hooks/useQuotation'
import { Plus, FileText, Sparkles, CheckCircle2 } from 'lucide-react'
import { Quotation } from '@/lib/firebase/quotations'

export default function QuotationPage() {
  const { quotations, deleteQuotation, convertToInvoice } = useQuotation()
  const router = useRouter()

  const handleCreateQuotation = () => {
    router.push('/dashboard/invoice?type=quotation')
  }

  const handleEditQuotation = (quotation: Quotation) => {
    router.push(`/dashboard/invoice?type=quotation&edit=${quotation.id}`)
  }

  const totalQuotations = quotations.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Decorative background blobs – blue/indigo/purple theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative p-6 lg:p-8 space-y-10 max-w-[1400px] mx-auto">
        {/* Floating Hero Card – same premium style as GST / Customers / Inventory */}
        <div className="relative">
          {/* Glow background */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-2xl blur-2xl"></div>

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 lg:p-8 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl blur-lg opacity-40"></div>
                  <div className="relative p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent tracking-tight">
                    Quotations
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">
                    Create, manage and convert quotations to invoices
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

            {/* Create Quotation Button */}
            <Button
              onClick={handleCreateQuotation}
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-8"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold">Create Quotation</span>
            </Button>
          </div>
        </div>

        {/* All Quotations Section */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
            <h2 className="text-lg font-semibold text-slate-700">
              All Quotations
            </h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <QuotationTable
              quotations={quotations}
              onEdit={handleEditQuotation}
              onDelete={deleteQuotation}
              onConvertToInvoice={convertToInvoice}
            />
          </div>
        </div>

        {/* Footer Status */}
        <div className="pt-8 pb-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 border border-blue-200/60 rounded-xl">
            <div className="flex items-center gap-3 text-sm text-blue-900">
              <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <span className="font-medium">
                You have {totalQuotations} quotation{totalQuotations !== 1 ? 's' : ''} in your system
              </span>
            </div>
            <div className="text-xs text-blue-700" suppressHydrationWarning>
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}