'use client'

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react'
import { InventoryItem } from './types'
import { Invoice } from '@/lib/firebase/invoices'
import { getInvoices } from "@/lib/firebase/invoices"


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

interface AppContextType {
  invoices: Invoice[]
  inventoryItems: InventoryItem[]
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
  const [invoices, setInvoices] = useState<Invoice[]>([])
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
  
  const getTotalSales = () => {
  return invoices
    .filter(inv => inv.status === 'paid' || inv.status === 'partially paid')
    .reduce((sum, inv) => sum + inv.netAmount, 0)
}


  useEffect(() => {
  loadInvoices()
}, [])

const loadInvoices = async () => {
  const data = await getInvoices()
  setInvoices(data)
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
