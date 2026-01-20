// app/inventory/hooks/useAddInventoryForm.ts
'use client'

import { useState } from 'react'
import { useInventory } from './useInventory'

export function useAddInventoryForm(onSuccess?: () => void) {
  const { addItem } = useInventory()

  const [form, setForm] = useState({
    name: '',
    height: 1,
    width: 1,
    pricePerHeight: '',
    pricePerWidth: '',
  })

  const [error, setError] = useState<string | null>(null)

  const updateField = (field: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  const reset = () => {
    setForm({
      name: '',
      height: 1,
      width: 1,
      pricePerHeight: '',
      pricePerWidth: '',
    })
    setError(null)
  }

  const submit = () => {
    if (!form.name.trim()) {
      setError('Inventory name is required')
      return false
    }
    if (!form.pricePerHeight.trim()) {
      setError('Price per height is required')
      return false
    }
    if (!form.pricePerWidth.trim()) {
      setError('Price per width is required')
      return false
    }

    // Convert strings → numbers before sending
    addItem({
      name: form.name.trim(),
      height: form.height,
      width: form.width,
      pricePerHeight: Number(form.pricePerHeight),
      pricePerWidth: Number(form.pricePerWidth),
    })

    reset()
    onSuccess?.()
    return true
  }

  return {
    form,
    updateField,
    submit,
    error,
    reset,
  }
}