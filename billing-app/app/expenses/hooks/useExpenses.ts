'use client'

import { useState, useEffect, useMemo } from 'react'
import { Expense,addExpense,getExpenses,updateExpense,deleteExpense } from '@/lib/firebase/expenses'
// import type { Expense } from '@/lib/firebase/expenses'

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch expenses on mount
  useEffect(() => {
    async function fetchExpenses() {
      try {
        setLoading(true)
        const data = await getExpenses()
        setExpenses(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load expenses')
      } finally {
        setLoading(false)
      }
    }
    fetchExpenses()
  }, [])

  const addNewExpense = async (data: Omit<Expense, 'id' | 'createdAt'>) => {
    try {
      const newExpense = await addExpense(data)
      setExpenses(prev => [newExpense, ...prev])
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    }
  }

  const editExpense = async (id: string, data: Partial<Omit<Expense, 'id' | 'createdAt'>>) => {
    try {
      await updateExpense(id, data)
      setExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, ...data } : exp))
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    }
  }

  const removeExpense = async (id: string) => {
    try {
      await deleteExpense(id)
      setExpenses(prev => prev.filter(exp => exp.id !== id))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const totals = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    return { totalExpenses }
  }, [expenses])

  return {
    expenses,
    loading,
    error,
    addExpense: addNewExpense,
    updateExpense: editExpense,
    deleteExpense: removeExpense,
    totals,
  }
}