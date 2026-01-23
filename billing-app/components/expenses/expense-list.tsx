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
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import type { Expense } from '@/lib/firebase/expenses'

interface ExpenseListProps {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

export function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No expenses yet.</p>
        <p className="text-sm">Click "Add Expense" to add your first expense.</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
          <TableHead>Name</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => (
          <TableRow key={expense.id}>
            <TableCell className="font-medium">{expense.name}</TableCell>
            <TableCell>{formatCurrency(expense.amount)}</TableCell>
            <TableCell>{expense.date}</TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(expense)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
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
  )
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount)
}