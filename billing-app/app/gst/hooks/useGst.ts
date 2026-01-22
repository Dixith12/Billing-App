'use client'

import { useState, useEffect } from 'react'
import { getGstRates, saveGstRates } from '@/lib/firebase/gstSetting'

const DEFAULT_CGST = 9
const DEFAULT_SGST = 9

export function useGst() {
  const [cgst, setCgst] = useState<number>(DEFAULT_CGST)
  const [sgst, setSgst] = useState<number>(DEFAULT_SGST)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const rates = await getGstRates()
        if (rates) {
          setCgst(rates.cgst)
          setSgst(rates.sgst)
        }
      } catch (err) {
        console.error('Failed to load GST rates:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const updateGst = async (newCgst: number, newSgst: number) => {
    try {
      await saveGstRates(newCgst, newSgst)
      setCgst(newCgst)
      setSgst(newSgst)
    } catch (err) {
      console.error('Failed to save GST rates:', err)
      throw err // let modal show error if needed
    }
  }

  return {
    cgst,
    sgst,
    loading,
    updateGst,
  }
}