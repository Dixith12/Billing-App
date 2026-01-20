// app/invoice/hooks/useCreateInvoice.ts
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useApp } from '@/lib/app-context'
import { addInvoice } from '@/lib/firebase/invoices'
import { addCustomer, getCustomers } from '@/lib/firebase/customers'
import type { Customer } from '@/lib/firebase/customers'
import type { InventoryItem } from '@/lib/types'

export interface BilledProduct {
  id: string
  name: string
  quantity: number
  height: string
  width: string
  discount: string
  discountType: '%' | '₹'
  total: number          // ← GROSS total = quantity × base price (before discount)
}

export function useCreateInvoice() {
  const { inventoryItems } = useApp()

  // ── Customers ──────────────────────────────────────────────
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    gstin: '',
    phone: '',
    address: '',
  })

  // ── Products ───────────────────────────────────────────────
  const [productSearch, setProductSearch] = useState('')
  const [billedProducts, setBilledProducts] = useState<BilledProduct[]>([])
  const [billingAddress, setBillingAddress] = useState('')

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    setLoadingCustomers(true)
    try {
      const data = await getCustomers()
      setCustomers(data)
    } catch (err) {
      console.error('Failed to load customers', err)
    } finally {
      setLoadingCustomers(false)
    }
  }

  const addNewCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) return false

    try {
      const saved = await addCustomer(newCustomer)
      setCustomers((prev) => [...prev, saved])
      setSelectedCustomer(saved)
      setBillingAddress(saved.address || '')
      resetNewCustomer()
      setIsAddCustomerOpen(false)
      return true
    } catch (err) {
      console.error('Error saving customer', err)
      return false
    }
  }

  const resetNewCustomer = () =>
    setNewCustomer({ name: '', gstin: '', phone: '', address: '' })

  // ── Computed / Filters ─────────────────────────────────────
  const filteredCustomers = useMemo(() => {
    const search = customerSearch.toLowerCase()
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        (c.gstin && c.gstin.toLowerCase().includes(search)) ||
        c.phone.includes(search)
    )
  }, [customers, customerSearch])

  const filteredInventory = useMemo(() => {
    const search = productSearch.toLowerCase()
    return inventoryItems.filter((item) => item.name.toLowerCase().includes(search))
  }, [inventoryItems, productSearch])

  // ── Billed Products Actions ────────────────────────────────
  const addProductToBill = (item: InventoryItem) => {
    const basePerUnit = item.height * item.pricePerHeight + item.width * item.pricePerWidth
    const newProduct: BilledProduct = {
      id: Date.now().toString(),
      name: item.name,
      quantity: 1,
      height: item.height.toString(),
      width: item.width.toString(),
      discount: '0',
      discountType: '%',
      total: basePerUnit * 1,           // gross total
    }
    setBilledProducts((prev) => [...prev, newProduct])
    setProductSearch('')
  }

  const updateBilledProduct = (
    id: string,
    field: keyof BilledProduct,
    value: string | number
  ) => {
    setBilledProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p

        const updated = { ...p, [field]: value }

        const inv = inventoryItems.find((i) => i.name === updated.name)
        if (!inv) return updated

        const h = parseFloat(updated.height) || 0
        const w = parseFloat(updated.width) || 0

        // Calculate GROSS total only (discount does NOT affect total here)
        const basePerUnit = h * inv.pricePerHeight + w * inv.pricePerWidth
        updated.total = basePerUnit * (updated.quantity || 1)

        return updated
      })
    )
  }

  const removeBilledProduct = (id: string) => {
    setBilledProducts((prev) => prev.filter((p) => p.id !== id))
  }

  // ── Calculations ───────────────────────────────────────────
  const subtotal = useMemo(
    () => billedProducts.reduce((sum, p) => sum + p.total, 0),
    [billedProducts]
  )

  const totalDiscount = useMemo(
    () =>
      billedProducts.reduce((sum, p) => {
        const disc = parseFloat(p.discount) || 0
        if (disc <= 0) return sum

        if (p.discountType === '%') {
          return sum + (p.total * disc) / 100
        } else {
          // ₹ discount — assuming PER UNIT (most common for materials)
          // If it's total for the line → remove * p.quantity
          return sum + disc * p.quantity
        }
      }, 0),
    [billedProducts]
  )

  const taxableAmount = subtotal - totalDiscount
  const cgst = taxableAmount * 0.09
  const sgst = taxableAmount * 0.09
  const netAmount = taxableAmount + cgst + sgst

  // ── Save to Firebase ───────────────────────────────────────
  const saveInvoice = async () => {
    if (!selectedCustomer) return { success: false, message: 'No customer selected' }
    if (billedProducts.length === 0) return { success: false, message: 'No products added' }

    try {
      await addInvoice({
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        customerGstin: selectedCustomer.gstin ?? undefined,
        billingAddress,
        products: billedProducts.map((p) => ({
          name: p.name,
          quantity: p.quantity,
          height: p.height,
          width: p.width,
          discount: p.discount,
          discountType: p.discountType,
          total: p.total,                    // saving gross total per line
        })),
        subtotal,
        discount: totalDiscount,
        cgst,
        sgst,
        netAmount,
      })
      return { success: true }
    } catch (err) {
      console.error('Error saving invoice:', err)
      return { success: false, message: 'Failed to save invoice' }
    }
  }

  const resetForm = () => {
    setSelectedCustomer(null)
    setBilledProducts([])
    setBillingAddress('')
    setCustomerSearch('')
    setProductSearch('')
  }

  return {
    customers,
    loadingCustomers,
    customerSearch,
    setCustomerSearch,
    selectedCustomer,
    setSelectedCustomer,
    filteredCustomers,
    isAddCustomerOpen,
    setIsAddCustomerOpen,
    newCustomer,
    setNewCustomer,
    addNewCustomer,
    billingAddress,
    setBillingAddress,

    productSearch,
    setProductSearch,
    filteredInventory,
    billedProducts,
    addProductToBill,
    updateBilledProduct,
    removeBilledProduct,

    subtotal,
    totalDiscount,
    cgst,
    sgst,
    netAmount,

    saveInvoice,
    resetForm,
  }
}