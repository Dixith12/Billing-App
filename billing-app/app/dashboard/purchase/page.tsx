'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PurchaseTable } from '@/components/purchase/purchase-table'
import { usePurchases } from '@/app/dashboard/purchase/hooks/usePurchase'
import { Plus, ShoppingCart, Sparkles, CheckCircle2, Loader2 } from 'lucide-react'

export default function PurchasePage() {
  const { purchases, loading, error, deletePurchase } = usePurchases()
  const router = useRouter()

  const handleCreatePurchase = () => {
    router.push('/dashboard/invoice?type=purchase')
  }

  const handleEditPurchase = (purchase: any) => {
    router.push(`/dashboard/invoice?type=purchase&edit=${purchase.id}`)
  }

  const totalPurchases = purchases.length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="text-slate-600">Loading purchases...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-600 text-lg font-medium mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Decorative background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-gradient-to-br from-teal-500/10 to-green-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative p-6 lg:p-8 space-y-10 max-w-[1400px] mx-auto">
        {/* Hero Card */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-2xl blur-2xl"></div>

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 lg:p-8 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl blur-lg opacity-40"></div>
                  <div className="relative p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg">
                    <ShoppingCart className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-700 via-emerald-700 to-teal-700 bg-clip-text text-transparent tracking-tight">
                    Purchases
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">
                    Record and manage purchases from vendors
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm pl-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-slate-600">
                  System active • {totalPurchases} purchase{totalPurchases !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <Button
              onClick={handleCreatePurchase}
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-8"
            >
              <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold">New Purchase</span>
            </Button>
          </div>
        </div>

        {/* Purchase Table */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full"></div>
            <h2 className="text-lg font-semibold text-slate-700">
              All Purchases
            </h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <PurchaseTable
              purchases={purchases}
              onEdit={handleEditPurchase}
              onDelete={deletePurchase}
              // Add onViewInvoice or other actions if needed later
            />
          </div>
        </div>
      </div>
    </div>
  )
}