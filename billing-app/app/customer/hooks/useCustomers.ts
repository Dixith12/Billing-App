// app/customers/hooks/useCustomers.ts
'use client'

import { useState, useEffect } from 'react'
import { Customer, getCustomers, addCustomer, updateCustomer, deleteCustomer } from '@/lib/firebase/customers'

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load customers on mount
  useEffect(() => {
    async function fetchCustomers() {
      try {
        setLoading(true)
        const data = await getCustomers()
        setCustomers(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load customers')
      } finally {
        setLoading(false)
      }
    }
    fetchCustomers()
  }, [])

  const handleAddCustomer = async (data: Omit<Customer, 'id' | 'createdAt'>) => {
    try {
      const newCust = await addCustomer(data)
      setCustomers((prev) => [...prev, newCust])
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    }
  }

  const handleUpdateCustomer = async (id: string, data: Partial<Omit<Customer, 'id' | 'createdAt'>>) => {
    try {
      await updateCustomer(id, data)
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c))
      )
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    }
  }

  const handleDeleteCustomer = async (id: string) => {
    try {
      await deleteCustomer(id)
      setCustomers((prev) => prev.filter((c) => c.id !== id))
    } catch (err: any) {
      setError(err.message)
    }
  }

  return {
    customers,
    loading,
    error,
    addCustomer: handleAddCustomer,
    updateCustomer: handleUpdateCustomer,
    deleteCustomer: handleDeleteCustomer,
  }
}

// Reuse same form logic but with real firebase functions
// app/customers/hooks/useCustomers.ts

// ... other imports

export function useAddCustomerForm(onSuccess: () => void) {
  const { addCustomer } = useCustomers()
  const [form, setForm] = useState({
    name: '',
    gstin: '',
    phone: '',
    address: '',
  })
  const [error, setError] = useState<string | null>(null)

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  // Explicitly type submit to return boolean
  const submit = async (): Promise<boolean> => {
    if (!form.name.trim()) {
      setError('Name is required')
      return false
    }
    if (!form.phone.trim()) {
      setError('Phone is required')
      return false
    }
    if (!form.address.trim()) {
      setError('Address is required')
      return false
    }

    try {
      await addCustomer(form)
      onSuccess()
      reset()
      return true
    } catch (err: any) {
      setError(err.message || 'Failed to add customer')
      return false
    }
  }

  const reset = () => {
    setForm({ name: '', gstin: '', phone: '', address: '' })
    setError(null)
  }

  return { form, updateField, submit, error, reset }
}

// Same for edit form
export function useEditCustomerForm(
  initial: Customer | null,
  onSuccess: () => void
) {
  const { updateCustomer } = useCustomers()
  const [form, setForm] = useState({
    name: '',
    gstin: '',
    phone: '',
    address: '',
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        gstin: initial.gstin || '',
        phone: initial.phone,
        address: initial.address,
      })
    }
  }, [initial])

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const submit = async (): Promise<boolean> => {
    if (!initial?.id) {
      setError('No customer selected')
      return false
    }

    if (!form.name.trim()) {
      setError('Name is required')
      return false
    }
    if (!form.phone.trim()) {
      setError('Phone is required')
      return false
    }
    if (!form.address.trim()) {
      setError('Address is required')
      return false
    }

    try {
      await updateCustomer(initial.id, form)
      onSuccess()
      return true
    } catch (err: any) {
      setError(err.message || 'Failed to update customer')
      return false
    }
  }

  return { form, updateField, submit, error }
}