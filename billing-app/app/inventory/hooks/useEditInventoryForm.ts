// app/inventory/hooks/useEditInventoryForm.ts
'use client'

import { useEffect, useState } from 'react'
import { useInventory } from './useInventory'
import type { InventoryItem } from '@/lib/types'

export function useEditInventoryForm(
  item: InventoryItem | null,
  onSuccess?: () => void
) {
  const { updateItem } = useInventory()

  const [form, setForm] = useState({
    name: '',
    height: 1,
    width: 1,
    pricePerHeight: '',
    pricePerWidth: '',
  })

  const [error, setError] = useState<string | null>(null)

  // Sync form when the item to edit changes
  useEffect(() => {
    if (item) {
      setForm({
        name: item.name,
        height: item.height,
        width: item.width,
        pricePerHeight: item.pricePerHeight.toString(),
        pricePerWidth: item.pricePerWidth.toString(),
      })
      setError(null)
    }
  }, [item])

  const updateField = (field: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  const submit = () => {
    if (!item) return false

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

    updateItem(item.id, {
      name: form.name.trim(),
      height: form.height,
      width: form.width,
      pricePerHeight: Number(form.pricePerHeight),
      pricePerWidth: Number(form.pricePerWidth),
    })

    onSuccess?.()
    return true
  }

  return {
    form,
    updateField,
    submit,
    error,
  }
}