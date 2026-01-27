'use client'

import { useMemo } from 'react'
import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { TransactionsTable } from '@/components/dashboard/transactions-table'
import { SummaryCards } from '@/components/dashboard/summary-cards'  // make sure path is correct
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/app-context'
import { Menu, Plus } from 'lucide-react'
import Link from 'next/link'
import { useDashboard } from './hooks/useDashboard'

export default function DashboardPage() {
  const { invoices, getTotalSales } = useApp()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Use the new hook for table logic
  const dashboardHook = useDashboard(invoices)

const totals = useMemo(() => {
  // Use filteredInvoices from the dashboard hook — this already has all filters applied
  const filtered = dashboardHook.filteredInvoices

  const totalSales = filtered.reduce((sum, inv) => sum + inv.netAmount, 0)

  const totalPaid = filtered.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0)

  const totalPending = filtered.reduce((sum, inv) => {
    const remaining = inv.netAmount - (inv.paidAmount || 0)
    return sum + (remaining > 0 ? remaining : 0)
  }, 0)

  return { totalSales, totalPaid, totalPending }
}, [dashboardHook.filteredInvoices])  // ← Important: depend on filteredInvoices

  return (
    <div className="flex min-h-screen bg-muted/30">

      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-30 flex items-center h-16 px-4 bg-background border-b lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-muted rounded"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <div className="p-6 space-y-8">
          {/* Title + Create button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">Sales Overview</h1>
            </div>
          </div>

          {/* Summary Cards – now with all 3 values */}
          <SummaryCards
            totalSales={totals.totalSales}
            totalPaid={totals.totalPaid}
            totalPending={totals.totalPending}
          />

          {/* Transactions Table */}
          <TransactionsTable invoices={invoices} {...dashboardHook} />
        </div>
      </main>
    </div>
  )
}