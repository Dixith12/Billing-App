'use client'

import React from "react"

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
import { useApp } from '@/lib/app-context'

interface InventoryListProps {
  items: InventoryItem[]
}

export function InventoryList({ items }: InventoryListProps) {
  const { deleteInventoryItem, updateInventoryItem } = useApp()
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    height: 1,
    width: 1,
    pricePerHeight: '',
    pricePerWidth: '',
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      height: item.height,
      width: item.width,
      pricePerHeight: item.pricePerHeight.toString(),
      pricePerWidth: item.pricePerWidth.toString(),
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem || !formData.name || !formData.pricePerHeight || !formData.pricePerWidth) {
      return
    }

    updateInventoryItem(editingItem.id, {
      name: formData.name,
      height: formData.height,
      width: formData.width,
      pricePerHeight: parseFloat(formData.pricePerHeight),
      pricePerWidth: parseFloat(formData.pricePerWidth),
    })

    setIsEditDialogOpen(false)
    setEditingItem(null)
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
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-medium">Name</TableHead>
              <TableHead className="font-medium">Height</TableHead>
              <TableHead className="font-medium">Width</TableHead>
              <TableHead className="font-medium">Price/Height</TableHead>
              <TableHead className="font-medium">Price/Width</TableHead>
              <TableHead className="font-medium">Total Price</TableHead>
              <TableHead className="font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const totalPrice = item.height * item.pricePerHeight + item.width * item.pricePerWidth
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.height}</TableCell>
                  <TableCell>{item.width}</TableCell>
                  <TableCell>{formatCurrency(item.pricePerHeight)}</TableCell>
                  <TableCell>{formatCurrency(item.pricePerWidth)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(totalPrice)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => deleteInventoryItem(item.id)}
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Inventory</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Inventory Name</Label>
              <Input
                id="editName"
                placeholder="Enter inventory name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editHeight">Height</Label>
                <Input
                  id="editHeight"
                  type="number"
                  value={formData.height}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editWidth">Width</Label>
                <Input
                  id="editWidth"
                  type="number"
                  value={formData.width}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editPricePerHeight">Price per Height</Label>
                <Input
                  id="editPricePerHeight"
                  type="number"
                  placeholder="Enter price"
                  value={formData.pricePerHeight}
                  onChange={(e) =>
                    setFormData({ ...formData, pricePerHeight: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editPricePerWidth">Price per Width</Label>
                <Input
                  id="editPricePerWidth"
                  type="number"
                  placeholder="Enter price"
                  value={formData.pricePerWidth}
                  onChange={(e) =>
                    setFormData({ ...formData, pricePerWidth: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
