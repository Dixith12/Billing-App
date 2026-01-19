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
import { useApp } from '@/lib/app-context'

interface AddInventoryModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddInventoryModal({ isOpen, onClose }: AddInventoryModalProps) {
  const { addInventoryItem } = useApp()
  const [formData, setFormData] = useState({
    name: '',
    height: 1,
    width: 1,
    pricePerHeight: '',
    pricePerWidth: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.pricePerHeight || !formData.pricePerWidth) {
      return
    }

    addInventoryItem({
      name: formData.name,
      height: formData.height,
      width: formData.width,
      pricePerHeight: parseFloat(formData.pricePerHeight),
      pricePerWidth: parseFloat(formData.pricePerWidth),
    })

    setFormData({
      name: '',
      height: 1,
      width: 1,
      pricePerHeight: '',
      pricePerWidth: '',
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Inventory</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inventoryName">Inventory Name</Label>
            <Input
              id="inventoryName"
              placeholder="Enter inventory name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
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
                value={formData.width}
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
                value={formData.pricePerHeight}
                onChange={(e) =>
                  setFormData({ ...formData, pricePerHeight: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricePerWidth">Price per Width</Label>
              <Input
                id="pricePerWidth"
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
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
