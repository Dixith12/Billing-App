'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

interface GstEditModalProps {
  isOpen: boolean
  onClose: () => void
  initialCgst: number
  initialSgst: number
  onSave: (cgst: number, sgst: number) => void
}

export function GstEditModal({
  isOpen,
  onClose,
  initialCgst,
  initialSgst,
  onSave,
}: GstEditModalProps) {
  const [cgst, setCgst] = useState(initialCgst.toString())
  const [sgst, setSgst] = useState(initialSgst.toString())
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const cgstNum = parseFloat(cgst)
    const sgstNum = parseFloat(sgst)

    if (isNaN(cgstNum) || cgstNum < 0) {
      setError('CGST must be a valid non-negative number')
      return
    }
    if (isNaN(sgstNum) || sgstNum < 0) {
      setError('SGST must be a valid non-negative number')
      return
    }

    onSave(cgstNum, sgstNum)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit GST Rates</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="cgst">CGST (%)</Label>
            <Input
              id="cgst"
              type="number"
              step="0.01"
              min="0"
              value={cgst}
              onChange={(e) => {
                setCgst(e.target.value)
                setError(null)
              }}
              placeholder="9"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sgst">SGST (%)</Label>
            <Input
              id="sgst"
              type="number"
              step="0.01"
              min="0"
              value={sgst}
              onChange={(e) => {
                setSgst(e.target.value)
                setError(null)
              }}
              placeholder="9"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-black text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}