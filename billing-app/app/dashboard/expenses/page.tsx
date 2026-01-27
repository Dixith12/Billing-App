'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, ArrowLeft, Filter } from 'lucide-react'
import { ExpenseModal } from '@/components/expenses/expense-modal'
import { ExpenseList } from '@/components/expenses/expense-list'
import { SummaryCard } from '@/components/expenses/summary-card'
import { useExpenses } from '@/app/dashboard/expenses/hooks/useExpenses'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Expense } from '@/lib/firebase/expenses'

export default function ExpensesPage() {
  const { expenses, addExpense, updateExpense, deleteExpense, totals } = useExpenses()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  // NEW: Date filter states (same as dashboard)
  const [datePreset, setDatePreset] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')

  const handleOpenModal = (expense?: Expense) => {
    setEditingExpense(expense || null)
    setIsModalOpen(true)
  }

  const clearDateFilter = () => {
    setDatePreset(null)
    setDateFrom('')
    setDateTo('')
  }

  // NEW: Filtered expenses based on date
  const filteredExpenses = useMemo(() => {
    let result = expenses

    if (datePreset || dateFrom || dateTo) {
      result = result.filter((exp) => {
        const expDate = new Date(exp.date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (datePreset) {
          switch (datePreset) {
            case 'today':
              return expDate.toDateString() === today.toDateString()
            case 'yesterday': {
              const yesterday = new Date(today)
              yesterday.setDate(yesterday.getDate() - 1)
              return expDate.toDateString() === yesterday.toDateString()
            }
            case 'thisMonth':
              return expDate.getMonth() === today.getMonth() && expDate.getFullYear() === today.getFullYear()
            case 'last30days': {
              const last30 = new Date(today)
              last30.setDate(last30.getDate() - 30)
              return expDate >= last30
            }
            default:
              return true
          }
        } else if (dateFrom || dateTo) {
          const from = dateFrom ? new Date(dateFrom) : null
          const to = dateTo ? new Date(dateTo) : null

          if (from) from.setHours(0, 0, 0, 0)
          if (to) to.setHours(23, 59, 59, 999)

          return (!from || expDate >= from) && (!to || expDate <= to)
        }

        return true
      })
    }

    return result
  }, [expenses, datePreset, dateFrom, dateTo])

  // Use filtered total for summary card
  const filteredTotal = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center h-16 px-4 bg-background border-b">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </header>

      {/* Content */}
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Expense Tracker</h1>
          <Button
            onClick={() => handleOpenModal()}
            className="gap-3 bg-black text-white"
          >
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        </div>

        {/* Summary Card – uses filtered total */}
        <SummaryCard totalExpenses={filteredTotal} />

        {/* NEW: Date Filter (in header area or above list) */}
        <div className="flex justify-end">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                Date
                <Filter
                  className={cn(
                    'h-3 w-3',
                    datePreset || dateFrom || dateTo ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 bg-white" align="end">
              <div className="space-y-4">
                <div className="font-medium text-sm">Filter by Date</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'All', value: null },
                    { label: 'Today', value: 'today' },
                    { label: 'Yesterday', value: 'yesterday' },
                    { label: 'This Month', value: 'thisMonth' },
                    { label: 'Last 30 days', value: 'last30days' },
                  ].map((item) => (
                    <Button
                      key={item.value ?? 'all'}
                      variant={datePreset === item.value ? 'default' : 'outline'}
                      size="sm"
                      className="transition-none"
                      onClick={() => {
                        setDatePreset(item.value)
                        if (item.value) {
                          setDateFrom('')
                          setDateTo('')
                        }
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Custom range</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">From</label>
                      <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => {
                          setDateFrom(e.target.value)
                          setDatePreset(null)
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">To</label>
                      <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => {
                          setDateTo(e.target.value)
                          setDatePreset(null)
                        }}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={clearDateFilter}
                >
                  Clear Date Filter
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Expense List – pass filteredExpenses if you want list to filter too */}
        <ExpenseList 
          expenses={filteredExpenses}  // ← you can change to filteredExpenses if you want list to filter
          onEdit={handleOpenModal} 
          onDelete={deleteExpense} 
        />
      </div>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingExpense}
        onSave={(data) => {
          if (editingExpense) {
            updateExpense(editingExpense.id, data)
          } else {
            addExpense(data)
          }
          setIsModalOpen(false)
          setEditingExpense(null)
        }}
      />
    </div>
  )
}