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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select' // ← Make sure you have this from shadcn/ui
import { useAddInventoryForm } from '@/app/inventory/hooks/useAddInventoryForm'

interface AddInventoryModalProps {
  isOpen: boolean
  onClose: () => void
}

type MeasurementType = 'height_width' | 'kg' | 'unit'

export function AddInventoryModal({ isOpen, onClose }: AddInventoryModalProps) {
  const { form, updateField, submit, error, reset } = useAddInventoryForm(() => {
    reset()
    onClose()
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const success = submit()
    if (success) onClose()
  }

  // Helper to render price fields based on type
  const renderPriceFields = () => {
    const type = form.measurementType as MeasurementType | undefined

    if (!type) return null

    if (type === 'height_width') {
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="number"
                value={form.height ?? 1}
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
                value={form.width ?? 1}
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
                value={form.pricePerHeight ?? ''}
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
                value={form.pricePerWidth ?? ''}
                onChange={(e) => updateField('pricePerWidth', e.target.value)}
                required
              />
            </div>
          </div>
        </>
      )
    }

    // For kg and unit — horizontal single field
    const label = type === 'kg' ? 'Price per Kg' : 'Price per Unit'
    const fieldKey = type === 'kg' ? 'pricePerKg' : 'pricePerUnit'

    return (
      <div className="space-y-2">
        <Label htmlFor={fieldKey}>{label}</Label>
        <Input
          id={fieldKey}
          type="number"
          placeholder="Enter price"
          value={form[fieldKey] ?? ''}
          onChange={(e) => updateField(fieldKey, e.target.value)}
          required
        />
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Inventory</DialogTitle>
        </DialogHeader>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Always visible */}
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

          {/* Measurement Type Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="measurementType">Measurement Type</Label>
            <Select
              value={form.measurementType || ''}
              onValueChange={(value) => {
                updateField('measurementType', value)
                // Optional: reset irrelevant price fields if needed
                if (value !== 'height_width') {
                  updateField('pricePerHeight', '')
                  updateField('pricePerWidth', '')
                }
                if (value !== 'kg') updateField('pricePerKg', '')
                if (value !== 'unit') updateField('pricePerUnit', '')
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select measurement type" />
              </SelectTrigger>
              <SelectContent className='bg-white'>
                <SelectItem value="height_width">Height × Width</SelectItem>
                <SelectItem value="kg">Kg</SelectItem>
                <SelectItem value="unit">Unit / Pcs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional fields appear here */}
          {renderPriceFields()}

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