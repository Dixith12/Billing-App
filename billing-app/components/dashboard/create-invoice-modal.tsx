'use client'

import React from "react"

import { useState } from 'react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useApp } from '@/lib/app-context'
import { Invoice } from '@/lib/types'

interface CreateInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateInvoiceModal({ isOpen, onClose }: CreateInvoiceModalProps) {
  const { addInvoice } = useApp()
  const [formData, setFormData] = useState({
    amount: '',
    customerName: '',
    customerPhone: '',
    status: 'pending' as Invoice['status'],
    mode: 'UPI' as Invoice['mode'],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.amount || !formData.customerName || !formData.customerPhone) {
      return
    }

    addInvoice({
      amount: parseFloat(formData.amount),
      status: formData.status,
      mode: formData.mode,
      customer: {
        name: formData.customerName,
        phone: formData.customerPhone,
      },
    })

    setFormData({
      amount: '',
      customerName: '',
      customerPhone: '',
      status: 'pending',
      mode: 'UPI',
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              placeholder="Enter customer name"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPhone">Customer Phone</Label>
            <Input
              id="customerPhone"
              placeholder="+91XXXXXXXXXX"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: Invoice['status']) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partially paid">Partially Paid</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mode">Payment Mode</Label>
            <Select
              value={formData.mode}
              onValueChange={(value: Invoice['mode']) =>
                setFormData({ ...formData, mode: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground">
              Create Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
