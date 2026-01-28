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
import {
  Percent,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Calculator,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

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
  const [cgst, setCgst] = useState(initialCgst.toFixed(2))
  const [sgst, setSgst] = useState(initialSgst.toFixed(2))
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

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
      <DialogContent className="sm:max-w-lg bg-white border-slate-200">
        <DialogHeader className="pb-5 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-40"></div>
              <div className="relative p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl">
                <Calculator className="h-7 w-7 text-white" strokeWidth={2.2} />
              </div>
            </div>

            <div>
              <DialogTitle className="text-2xl font-bold text-slate-800">
                Edit GST Rates
              </DialogTitle>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                Update Central & State GST percentages
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* CGST */}
          <div className="space-y-2">
            <Label
              htmlFor="cgst"
              className="text-sm font-semibold text-slate-700 flex items-center gap-2"
            >
              <Percent className="h-4 w-4 text-indigo-600" />
              CGST (%)
              <span className="text-red-500 text-xs">*</span>
            </Label>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300 pointer-events-none"></div>
              <Input
                id="cgst"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 9.00"
                value={cgst}
                onChange={(e) => {
                  setCgst(e.target.value)
                  setError(null)
                }}
                required
                className="relative border-slate-300 focus:border-indigo-500 focus:ring-indigo-200 h-11"
              />
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500/60" />
              Central GST – applied across the country
            </p>
          </div>

          {/* SGST */}
          <div className="space-y-2">
            <Label
              htmlFor="sgst"
              className="text-sm font-semibold text-slate-700 flex items-center gap-2"
            >
              <Percent className="h-4 w-4 text-purple-600" />
              SGST (%)
              <span className="text-red-500 text-xs">*</span>
            </Label>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300 pointer-events-none"></div>
              <Input
                id="sgst"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 9.00"
                value={sgst}
                onChange={(e) => {
                  setSgst(e.target.value)
                  setError(null)
                }}
                required
                className="relative border-slate-300 focus:border-purple-500 focus:ring-purple-200 h-11"
              />
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500/60" />
              State GST – varies by state of supply
            </p>
          </div>

          <DialogFooter className="gap-3 pt-5 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-300 hover:bg-slate-50 min-w-[100px]"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 min-w-[160px]"
            >
              <CheckCircle2 className="h-4.5 w-4.5 mr-2 group-hover:scale-110 transition-transform" />
              Save GST Rates
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}