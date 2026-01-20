// components/inventory/add-inventory-modal.tsx
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
import { useAddInventoryForm } from '@/app/inventory/hooks/useAddInventoryForm'

interface AddInventoryModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddInventoryModal({ isOpen, onClose }: AddInventoryModalProps) {
  const { form, updateField, submit, error, reset } = useAddInventoryForm(() => {
    reset()
    onClose()
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const success = submit()
    if (success) onClose() // extra safety
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Inventory</DialogTitle>
        </DialogHeader>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inventoryName">Inventory Name</Label>
            <Input
              id="inventoryName"
              placeholder="Enter inventory name"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="number"
                value={form.height}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Default value: 1</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="number"
                value={form.width}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Default value: 1</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pricePerHeight">Price per Height</Label>
              <Input
                id="pricePerHeight"
                type="number"
                placeholder="Enter price"
                value={form.pricePerHeight}
                onChange={(e) => updateField('pricePerHeight', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricePerWidth">Price per Width</Label>
              <Input
                id="pricePerWidth"
                type="number"
                placeholder="Enter price"
                value={form.pricePerWidth}
                onChange={(e) => updateField('pricePerWidth', e.target.value)}
                required
              />
            </div>
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