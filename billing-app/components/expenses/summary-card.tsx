'use client'

import { Card } from '@/components/ui/card'

interface SummaryCardProps {
  totalExpenses: number
}

export function SummaryCard({ totalExpenses }: SummaryCardProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount)

  return (
    <Card className="p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-muted-foreground">Total Expenses</div>
      </div>
      <div className="text-3xl font-bold">{formatCurrency(totalExpenses)}</div>
      <div className="text-xs text-muted-foreground mt-2">All time</div>
    </Card>
  )
}