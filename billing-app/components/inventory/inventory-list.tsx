// components/inventory/inventory-list.tsx
'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pencil, Trash2 } from 'lucide-react'
import { InventoryItem } from '@/lib/types'
import { useInventory } from '@/app/inventory/hooks/useInventory'
import { calculateTotalPrice, formatINR } from '@/lib/utils/inventory'
import { useEditInventoryForm } from '@/app/inventory/hooks/useEditInventoryForm'

interface InventoryListProps {
  items: InventoryItem[]
}

export function InventoryList({ items }: InventoryListProps) {
  const { deleteItem } = useInventory()

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const { form, updateField, submit, error } = useEditInventoryForm(
    editingItem,
    () => {
      setIsEditDialogOpen(false)
      setEditingItem(null)
    }
  )

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setIsEditDialogOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const success = submit()
    if (success) {
      // Dialog closes automatically via onSuccess callback
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No inventory items yet.</p>
        <p className="text-sm">Click "Add Inventory" to add your first item.</p>
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Height</TableHead>
              <TableHead>Width</TableHead>
              <TableHead>Price/Height</TableHead>
              <TableHead>Price/Width</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const total = calculateTotalPrice(item)
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.height}</TableCell>
                  <TableCell>{item.width}</TableCell>
                  <TableCell>{formatINR(item.pricePerHeight)}</TableCell>
                  <TableCell>{formatINR(item.pricePerWidth)}</TableCell>
                  <TableCell className="font-medium">{formatINR(total)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => deleteItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
          </DialogHeader>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Height</Label>
                <Input type="number" value={form.height} disabled className="bg-gray-100" />
              </div>
              <div className="space-y-2">
                <Label>Width</Label>
                <Input type="number" value={form.width} disabled className="bg-gray-100" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pricePerHeight">Price per Height</Label>
                <Input
                  id="pricePerHeight"
                  type="number"
                  value={form.pricePerHeight}
                  onChange={(e) => updateField('pricePerHeight', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricePerWidth">Price per Width</Label>
                <Input
                  id="pricePerWidth"
                  type="number"
                  value={form.pricePerWidth}
                  onChange={(e) => updateField('pricePerWidth', e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-black text-white">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}