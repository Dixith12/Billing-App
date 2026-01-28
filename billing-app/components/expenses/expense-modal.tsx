'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ReceiptIndianRupee,
  IndianRupee,
  CalendarDays,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Expense } from '@/lib/firebase/expenses'
import { useState } from 'react'

interface ExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  initialData: Expense | null
  onSave: (data: Omit<Expense, 'id' | 'createdAt'>) => void
}

export function ExpenseModal({
  isOpen,
  onClose,
  initialData,
  onSave,
}: ExpenseModalProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [amount, setAmount] = useState(initialData?.amount.toString() || '')
  const [date, setDate] = useState(
    initialData?.date
      ? new Date(initialData.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  )
  const [error, setError] = useState<string | null>(null)

  const isEdit = !!initialData

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const amountNum = parseFloat(amount)

    if (!name.trim()) {
      setError('Bill / Expense name is required')
      return
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount greater than zero')
      return
    }
    if (!date) {
      setError('Date is required')
      return
    }

    onSave({ name: name.trim(), amount: amountNum, date })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white border-slate-200">
        <DialogHeader className="pb-5 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-40"></div>
              <div className="relative p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl">
                <ReceiptIndianRupee className="h-7 w-7 text-white" strokeWidth={2.2} />
              </div>
            </div>

            <div>
              <DialogTitle className="text-2xl font-bold text-slate-800">
                {isEdit ? 'Edit Expense' : 'Add New Expense'}
              </DialogTitle>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                {isEdit ? 'Update this expense record' : 'Record a new business expense'}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Bill / Expense Name */}
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <FileText className="h-4 w-4 text-indigo-600" />
              Bill / Expense Name <span className="text-red-500 text-xs">*</span>
            </Label>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300 pointer-events-none"></div>
              <Input
                id="name"
                placeholder="e.g. Electricity Bill, Office Rent, Fuel..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="relative border-slate-300 focus:border-indigo-400 focus:ring-indigo-200 h-11"
              />
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label
              htmlFor="amount"
              className="text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <IndianRupee className="h-4 w-4 text-emerald-600" />
              Amount (₹) <span className="text-red-500 text-xs">*</span>
            </Label>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300 pointer-events-none"></div>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="relative border-slate-300 focus:border-emerald-400 focus:ring-emerald-200 h-11"
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label
              htmlFor="date"
              className="text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <CalendarDays className="h-4 w-4 text-violet-600" />
              Expense Date <span className="text-red-500 text-xs">*</span>
            </Label>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300 pointer-events-none"></div>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="relative border-slate-300 focus:border-violet-400 focus:ring-violet-200 h-11"
              />
            </div>
          </div>

          <DialogFooter className="gap-3 pt-5 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-300 hover:bg-slate-50 min-w-[110px]"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[160px] shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {isEdit ? 'Update Expense' : 'Save Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}