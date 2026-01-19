'use client'

import React from "react"

import { Card } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

interface SummaryCardsProps {
  totalSales: number
}

export function SummaryCards({ totalSales }: SummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4">
        <div className="text-sm text-muted-foreground mb-1">Sales</div>
        <div className="text-xl font-semibold">{formatCurrency(totalSales)}</div>
        <div className="text-xs text-muted-foreground mt-1">Showing data for This Year</div>
      </Card>

      <Card className="p-4">
        <div className="text-sm text-muted-foreground mb-1">Purchases</div>
        <div className="text-xl font-semibold">{formatCurrency(230823)}</div>
        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <Package className="h-3 w-3" />
          Select Project
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-muted-foreground">Expenses</span>
          <div className="flex items-center text-emerald-600 text-xs">
            <TrendingUp className="h-3 w-3" />
            <span>84.29%</span>
          </div>
        </div>
        <div className="text-xl font-semibold">{formatCurrency(96897)}</div>
      </Card>
    </div>
  )
}

function Package(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <path d="M3.29 7L12 12l8.71-5M12 22V12" />
    </svg>
  )
}
