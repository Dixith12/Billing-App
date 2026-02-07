// lib/app-context.ts
'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { InventoryItem } from './types'
import { Invoice } from '@/lib/firebase/invoices'
import { onSnapshot, query, orderBy, collection } from 'firebase/firestore' // ← add these
import { db } from '@/lib/firebase' // ← assuming this exists from firebase.ts
import { listenInventory, addInventory, updateInventory, deleteInventory } from '@/lib/firebase/inventory'

interface AppContextType {
  invoices: Invoice[]
  inventoryItems: InventoryItem[]
  addInventoryItem: (
    item: Omit<InventoryItem, 'id' | 'createdAt'>
  ) => Promise<void>
  updateInventoryItem: (
    id: string,
    item: Partial<Omit<InventoryItem, 'id' | 'createdAt'>>
  ) => Promise<void>
  deleteInventoryItem: (id: string) => Promise<void>
  getTotalSales: () => number
}


const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])

  // Realtime Inventory (unchanged)
  useEffect(() => {
    const unsubscribe = listenInventory(setInventoryItems)
    return () => unsubscribe()
  }, [])

  // Realtime Invoices (NEW: use onSnapshot instead of getInvoices)
  useEffect(() => {
    const q = query(collection(db, 'invoices'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Invoice[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Invoice, 'id'>),
      }))
      setInvoices(data)
    })
    return () => unsubscribe()
  }, [])

  const getTotalSales = () => {
    return invoices
      .filter((inv) => inv.status === 'paid' || inv.status === 'partially paid')
      .reduce((sum, inv) => sum + inv.netAmount, 0)
  }

  return (
    <AppContext.Provider
      value={{
        invoices,
        inventoryItems,
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