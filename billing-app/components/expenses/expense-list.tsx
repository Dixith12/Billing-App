'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ReceiptIndianRupee,
  Pencil,
  Trash2,
  CalendarDays,
  AlertCircle,
  Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Expense } from '@/lib/firebase/expenses'
import { exportExpensesToExcel } from '@/lib/utils/exportExpensesToExcel'

interface ExpenseListProps {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

export function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredExpenses = expenses.filter(
    (exp) =>
      exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.amount.toString().includes(searchQuery) ||
      exp.date.includes(searchQuery) ||
      (exp.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exp.state || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return '—'
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    })
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50/70 rounded-xl border border-slate-200">
        <ReceiptIndianRupee className="mx-auto h-12 w-12 text-slate-400 mb-4" />
        <p className="text-lg font-medium text-slate-700">No expenses recorded yet</p>
        <p className="text-sm text-slate-500 mt-2">
          Click "Add Expense" to start tracking your business spending
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 ml-3 mt-3 mr-3 mb-3">
      {/* Search + Export */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative max-w-md w-full">
          <Input
            placeholder="Search by name, amount, date, category or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-slate-300 focus:border-indigo-400 focus:ring-indigo-200"
          />
          <ReceiptIndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        </div>

        <Button
          variant="outline"
          size="sm"
          className={cn(
            "group relative overflow-hidden border-purple-300 hover:border-purple-500 transition-all duration-300 shadow-sm hover:shadow-md",
            filteredExpenses.length > 0 ? "bg-gradient-to-r from-purple-50 to-pink-50" : ""
          )}
          onClick={() => exportExpensesToExcel(filteredExpenses, 'Expense_Register.xlsx')}
          disabled={filteredExpenses.length === 0}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md pointer-events-none"></div>
          <Download className="h-4 w-4 mr-2 text-purple-600 group-hover:text-purple-700" />
          <span className="font-medium text-purple-700 group-hover:text-purple-800">
            Export Excel
          </span>
        </Button>
      </div>

      {/* Simple Table (only basic columns) */}
      <div className="border border-slate-300 rounded-xl overflow-hidden shadow-sm bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 border-b border-slate-200">
              <TableHead className="font-semibold text-slate-700">Expense Name</TableHead>
              <TableHead className="font-semibold text-slate-700">Amount</TableHead>
              <TableHead className="font-semibold text-slate-700">Date</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredExpenses.map((expense, idx) => (
              <TableRow
                key={`${expense.id}-${idx}`}  // Safe unique key
                className={cn(
                  "hover:bg-slate-50/70 transition-colors",
                  idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                )}
              >
                <TableCell className="font-medium text-slate-900">
                  {expense.name || '-'}
                </TableCell>

                <TableCell>
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 border-emerald-200 px-2.5 py-0.5 font-medium"
                  >
                    {formatCurrency(expense.amount)}
                  </Badge>
                </TableCell>

                <TableCell className="text-slate-700">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-violet-600" />
                    {formatDate(expense.date)}
                  </div>
                </TableCell>

                <TableCell className="text-right pr-6">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                      onClick={() => onEdit(expense)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onDelete(expense.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}