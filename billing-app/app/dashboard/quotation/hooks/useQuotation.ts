'use client'

import { useState, useEffect } from 'react'
import {
  addQuotation,
  getQuotations,
  updateQuotation,
  deleteQuotation,
  convertQuotationToInvoice,
} from '@/lib/firebase/quotations'
import type { Quotation } from '@/lib/firebase/quotations'

export function useQuotation() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchQuotations() {
      try {
        setLoading(true)
        const data = await getQuotations()
        setQuotations(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load quotations')
      } finally {
        setLoading(false)
      }
    }
    fetchQuotations()
  }, [])

type NewQuotation = Omit<
  Quotation,
  'id' | 'quotationNumber' | 'createdAt' | 'updatedAt'
> & {
  quotationDate: Date
}

const addNewQuotation = async (data: NewQuotation) => {
    try {
      const newQuotation = await addQuotation(data)
      setQuotations(prev => [newQuotation, ...prev])
      return { success: true, quotation: newQuotation }
    } catch (err: any) {
      setError(err.message)
      return { success: false, message: err.message }
    }
  }

  const editQuotation = async (
    id: string,
    data: Partial<Omit<Quotation, 'id' | 'quotationNumber' | 'createdAt'>>,
  ) => {
    try {
      await updateQuotation(id, data)
      setQuotations(prev =>
        prev.map(q => (q.id === id ? { ...q, ...data } : q))
      )
      return { success: true }
    } catch (err: any) {
      setError(err.message)
      return { success: false, message: err.message }
    }
  }

  const removeQuotation = async (id: string) => {
    try {
      await deleteQuotation(id)
      setQuotations(prev => prev.filter(q => q.id !== id))
      return { success: true }
    } catch (err: any) {
      setError(err.message)
      return { success: false, message: err.message }
    }
  }

  const convertToInvoice = async (id: string) => {
    try {
      await convertQuotationToInvoice(id)
      setQuotations(prev => prev.filter(q => q.id !== id))
      return { success: true }
    } catch (err: any) {
      setError(err.message)
      return { success: false, message: err.message }
    }
  }

  return {
    quotations,
    loading,
    error,
    addQuotation: addNewQuotation,
    updateQuotation: editQuotation,
    deleteQuotation: removeQuotation,
    convertToInvoice,
  }
}