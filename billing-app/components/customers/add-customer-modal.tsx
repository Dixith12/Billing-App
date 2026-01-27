// app/customers/components/add-customer-modal.tsx
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
import { Textarea } from '@/components/ui/textarea'
import { useAddCustomerForm } from '@/app/dashboard/customer/hooks/useCustomers'

interface AddCustomerModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddCustomerModal({ isOpen, onClose }: AddCustomerModalProps) {
  const { form, updateField, submit, error, reset } = useAddCustomerForm(() => {
    reset()
    onClose()
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await submit()
    if (success) onClose() // extra safety
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Customer</DialogTitle>
        </DialogHeader>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Name</Label>
            <Input
              id="customerName"
              placeholder="Enter customer name"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gstin">GSTIN (Optional)</Label>
            <Input
              id="gstin"
              placeholder="Enter GSTIN"
              value={form.gstin || ''}
              onChange={(e) => updateField('gstin', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Enter address"
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" className="bg-black text-white">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}