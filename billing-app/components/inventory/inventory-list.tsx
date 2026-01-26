"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2 } from "lucide-react";
import { InventoryItem } from "@/lib/types";
import { useInventory } from "@/app/inventory/hooks/useInventory";
import { calculateTotalPrice, formatINR } from "@/lib/utils/inventory";
import { useEditInventoryForm } from "@/app/inventory/hooks/useEditInventoryForm";

interface InventoryListProps {
  items: InventoryItem[];
}

export function InventoryList({ items }: InventoryListProps) {
  const { deleteItem } = useInventory();

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { form, updateField, submit, error } = useEditInventoryForm(
    editingItem,
    () => {
      setIsEditDialogOpen(false);
      setEditingItem(null);
    },
  );

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    submit();
  };

  // Helper: format measurement display for the table
const getMeasurementDisplay = (item: InventoryItem) => {
  switch (item.measurementType) {
    case 'height_width':
      const priceHeight = formatINR(item.pricePerHeight ?? 0);
      const priceWidth = formatINR(item.pricePerWidth ?? 0);
      return `Height: ${priceHeight} / Width: ${priceWidth}`;

    case 'kg':
      return `Weight: ${formatINR(item.pricePerKg ?? 0)}/kg`;

    case 'unit':
      return `Per unit: ${formatINR(item.pricePerUnit ?? 0)}`;

    default:
      return '—';
  }
};

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No inventory items yet.</p>
        <p className="text-sm">Click "Add Inventory" to add your first item.</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Measurement</TableHead>
              <TableHead>Total Price / Rate</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="capitalize">
                  {item.measurementType
                    ? item.measurementType.replace("_", " ")
                    : "—"}
                </TableCell>
                <TableCell>{getMeasurementDisplay(item)}</TableCell>
                <TableCell className="font-medium">
                  {formatINR(calculateTotalPrice(item))}
                </TableCell>
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
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog remains the same */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
          </DialogHeader>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </p>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Measurement Type</Label>
              <div className="px-3 py-2 border rounded-md bg-muted/40 capitalize">
                {form.measurementType.replace("_", " ")}
              </div>
            </div>

            {form.measurementType === "height_width" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Height</Label>
                    <Input
                      type="number"
                      value={form.height}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Width</Label>
                    <Input
                      type="number"
                      value={form.width}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price per Height</Label>
                    <Input
                      type="number"
                      value={form.pricePerHeight}
                      onChange={(e) =>
                        updateField("pricePerHeight", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price per Width</Label>
                    <Input
                      type="number"
                      value={form.pricePerWidth}
                      onChange={(e) =>
                        updateField("pricePerWidth", e.target.value)
                      }
                    />
                  </div>
                </div>
              </>
            )}

            {form.measurementType === "kg" && (
              <div className="space-y-2">
                <Label>Price per Kg</Label>
                <Input
                  type="number"
                  value={form.pricePerKg}
                  onChange={(e) => updateField("pricePerKg", e.target.value)}
                />
              </div>
            )}

            {form.measurementType === "unit" && (
              <div className="space-y-2">
                <Label>Price per Unit</Label>
                <Input
                  type="number"
                  value={form.pricePerUnit}
                  onChange={(e) => updateField("pricePerUnit", e.target.value)}
                />
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
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
  );
}
