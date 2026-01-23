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
import type { Expense } from '@/lib/firebase/expenses'
import { useState } from 'react'

interface ExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  initialData: Expense | null
  onSave: (data: Omit<Expense, 'id' | 'createdAt'>) => void
}

export function ExpenseModal({ isOpen, onClose, initialData, onSave }: ExpenseModalProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [amount, setAmount] = useState(initialData?.amount.toString() || '')
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0])
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amountNum = parseFloat(amount)

    if (!name.trim()) {
      setError('Bill name is required')
      return
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Valid amount is required')
      return
    }
    if (!date) {
      setError('Date is required')
      return
    }

    onSave({ name, amount: amountNum, date })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
        </DialogHeader>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Bill Name</Label>
            <Input
              id="name"
              placeholder="Enter bill name, e.g., Electricity Bill"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-black text-white">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}