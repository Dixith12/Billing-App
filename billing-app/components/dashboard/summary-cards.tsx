// components/dashboard/summary-cards.tsx
'use client'

import { Card } from '@/components/ui/card'
import { IndianRupee, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SummaryCardsProps {
  totalSales: number
  totalPaid: number
  totalPending: number
}

export function SummaryCards({ totalSales, totalPaid, totalPending }: SummaryCardsProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount)

  const collectionRate = totalSales > 0 ? ((totalPaid / totalSales) * 100).toFixed(1) : '0.0'

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Total Sales */}
      <Card className="p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-muted-foreground">Total Sales</div>
          <IndianRupee className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="text-3xl font-bold">{formatCurrency(totalSales)}</div>
        <div className="text-xs text-muted-foreground mt-2">All invoices issued</div>
      </Card>

      {/* Total Paid */}
      <Card className="p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-muted-foreground">Total Received</div>
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="text-3xl font-bold text-emerald-700">
          {formatCurrency(totalPaid)}
        </div>
        <div className="flex items-center gap-2 text-xs mt-2">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-emerald-600 font-medium">{collectionRate}% collected</span>
        </div>
      </Card>

      {/* Total Pending */}
      <Card className="p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-muted-foreground">Total Due</div>
          <AlertCircle className="h-5 w-5 text-orange-600" />
        </div>
        <div
          className={cn(
            "text-3xl font-bold",
            totalPending === 0 ? "text-emerald-700" : "text-orange-700"
          )}
        >
          {formatCurrency(totalPending)}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          {totalPending === 0 ? 'All payments cleared' : 'Outstanding balance'}
        </div>
      </Card>
    </div>
  )
}