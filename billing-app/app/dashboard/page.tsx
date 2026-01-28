'use client'

import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { TransactionsTable } from '@/components/dashboard/transactions-table'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { useApp } from '@/lib/app-context'
import { Plus, BarChart3, Sparkles, CheckCircle2, Calendar } from 'lucide-react'
import { useDashboard } from './hooks/useDashboard'
import Link from 'next/link'

export default function DashboardPage() {
  const { invoices } = useApp()
  const dashboardHook = useDashboard(invoices)

  const totals = useMemo(() => {
    const filtered = dashboardHook.filteredInvoices

    const totalSales = filtered.reduce((sum, inv) => sum + inv.netAmount, 0)
    const totalPaid = filtered.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0)
    const totalPending = filtered.reduce((sum, inv) => {
      const remaining = inv.netAmount - (inv.paidAmount || 0)
      return sum + (remaining > 0 ? remaining : 0)
    }, 0)

    return { totalSales, totalPaid, totalPending }
  }, [dashboardHook.filteredInvoices])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Decorative background blobs – indigo/purple/pink theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-gradient-to-br from-pink-500/10 to-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative p-6 lg:p-8 space-y-10 max-w-[1400px] mx-auto">
        {/* Floating Hero Card – same premium style as Quotations / Expenses */}
        <div className="relative">
          {/* Glow background */}
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-2xl"></div>

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 lg:p-8 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur-lg opacity-40"></div>
                  <div className="relative p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                    <BarChart3 className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 bg-clip-text text-transparent tracking-tight">
                    Sales Overview
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">
                    Track invoices, payments and business performance
                  </p>
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-2 text-sm pl-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-slate-600">
                  All data synced and active
                </span>
              </div>
            </div>

            {/* Create Invoice Button */}
            <Link href="/dashboard/invoice">
              <Button
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-8"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-semibold">Create Invoice</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Financial Summary Section */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
            <h2 className="text-lg font-semibold text-slate-700">
              Financial Summary
            </h2>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <SummaryCards
              totalSales={totals.totalSales}
              totalPaid={totals.totalPaid}
              totalPending={totals.totalPending}
            />
          </div>
        </div>

        {/* Recent Transactions Section */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
            <h2 className="text-lg font-semibold text-slate-700">
              Recent Transactions
            </h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <TransactionsTable invoices={invoices} {...dashboardHook} />
          </div>
        </div>

        {/* Footer Status */}
        <div className="pt-8 pb-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-gradient-to-r from-indigo-100/80 to-purple-100/80 border border-indigo-200/60 rounded-xl">
            <div className="flex items-center gap-3 text-sm text-indigo-900">
              <CheckCircle2 className="h-5 w-5 text-indigo-600 flex-shrink-0" />
              <span className="font-medium">
                Showing {dashboardHook.filteredInvoices.length} transaction{dashboardHook.filteredInvoices.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-xs text-indigo-700" suppressHydrationWarning>
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}