'use client'

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

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-auto">
        {/* Mobile sidebar toggle header */}
        <header className="sticky top-0 z-30 flex items-center h-16 px-4 bg-background border-b lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-muted rounded"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <div className="p-6 space-y-6">
          {/* Title + Create Invoice button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">Sales</h1>
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <Link href="/invoice">
              <Button
                size="sm"
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="h-4 w-4" />
                Create Invoice
              </Button>
            </Link>
          </div>

          {/* Summary Cards – showing total sales */}
          {/* <SummaryCards totalSales={getTotalSales()} /> */}

          {/* Transactions Table – spread hook props (includes all filters, setters, etc.) */}
          <TransactionsTable invoices={[]} {...dashboardHook} />

        </div>
      </main>
    </div>
  )
}