'use client'

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react'
import { Invoice, InventoryItem } from './types'

// 🔥 IMPORT FIREBASE INVENTORY FUNCTIONS
import {
  listenInventory,
  addInventory,
  updateInventory,
  deleteInventory,
} from '@/lib/firebase/inventory'

// -----------------------------
// TEMP: invoices still hardcoded
// -----------------------------
const generateSampleInvoices = (): Invoice[] => {
  const customers = [
    { name: 'Ramesh', phone: '+915558626322' },
    { name: 'Rahul', phone: '+919876567899' },
    { name: 'Priya', phone: '+919123456789' },
    { name: 'Amit', phone: '+918765432100' },
  ]

  const statuses: Invoice['status'][] = [
    'paid',
    'pending',
    'partially paid',
    'paid',
    'paid',
  ]
  const modes: Invoice['mode'][] = [
    'UPI',
    'Cash',
    'Bank Transfer',
    'UPI',
    'UPI',
  ]
  const amounts = [49900, 150000, 24950, 250000, 35000]

  return statuses.map((status, index) => ({
    id: `inv-${index + 1}`,
    amount: amounts[index],
    status,
    mode: modes[index],
    billNo: `INV/24-25/${39 - index}`,
    customer: customers[index % customers.length],
    createdBy: 'Sanmeet',
    date: new Date(2025, 11, 6),
    pendingAmount: status === 'partially paid' ? 100000 : undefined,
  }))
}

interface AppContextType {
  invoices: Invoice[]
  inventoryItems: InventoryItem[]
  addInvoice: (
    invoice: Omit<Invoice, 'id' | 'billNo' | 'date' | 'createdBy'>
  ) => void
  addInventoryItem: (
    item: Omit<InventoryItem, 'id' | 'createdAt'>
  ) => Promise<void>
  updateInventoryItem: (
    id: string,
    item: Omit<InventoryItem, 'id' | 'createdAt'>
  ) => Promise<void>
  deleteInventoryItem: (id: string) => Promise<void>
  getTotalSales: () => number
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>(generateSampleInvoices())
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [invoiceCounter, setInvoiceCounter] = useState(40)

  // 🔥 REALTIME INVENTORY FROM FIRESTORE
  useEffect(() => {
    const unsubscribe = listenInventory(setInventoryItems)
    return () => unsubscribe()
  }, [])

  // -----------------------------
  // Invoice (unchanged for now)
  // -----------------------------
  const addInvoice = (
    invoiceData: Omit<Invoice, 'id' | 'billNo' | 'date' | 'createdBy'>
  ) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `inv-${Date.now()}`,
      billNo: `INV/24-25/${invoiceCounter}`,
      date: new Date(),
      createdBy: 'Sanmeet',
    }
    setInvoices((prev) => [newInvoice, ...prev])
    setInvoiceCounter((prev) => prev + 1)
  }

  const getTotalSales = () => {
    return invoices
      .filter(
        (inv) => inv.status === 'paid' || inv.status === 'partially paid'
      )
      .reduce((sum, inv) => sum + inv.amount, 0)
  }

  return (
    <AppContext.Provider
      value={{
        invoices,
        inventoryItems,

        // 🔥 FIREBASE FUNCTIONS (THIS IS THE KEY FIX)
        addInventoryItem: addInventory,
        updateInventoryItem: updateInventory,
        deleteInventoryItem: deleteInventory,

        addInvoice,
        getTotalSales,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
