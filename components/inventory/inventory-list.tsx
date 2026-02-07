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
import { Badge } from "@/components/ui/badge";
import {
  Pencil,
  Trash2,
  Package,
  Ruler,
  Weight,
  Hash,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { InventoryItem } from "@/lib/types";
import { useInventory } from "@/hooks/use-inventory";
import { calculateTotalPrice, formatINR } from "@/lib/utils/inventory";
import { useEditInventory } from "@/hooks/use-edit-inventory";

interface InventoryListProps {
  items: InventoryItem[];
}

export function InventoryList({ items }: InventoryListProps) {
  const { deleteItem } = useInventory();

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { form, updateField, submit, error } = useEditInventory(
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

  // Helper: show measurement + price info
  const getMeasurementDisplay = (item: InventoryItem) => {
    switch (item.measurementType) {
      case "height_width":
        return (
          <div className="space-y-1">
            <Badge
              variant="outline"
              className="bg-primary/5 text-primary border-primary/20 px-2.5 py-0.5 mr-1 text-xs"
            >
              {formatINR(item.pricePerHeight ?? 0)} / ft height
            </Badge>
            <Badge
              variant="outline"
              className="bg-primary/5 text-primary border-primary/20 px-2.5 py-0.5 text-xs"
            >
              {formatINR(item.pricePerWidth ?? 0)} / ft width
            </Badge>
          </div>
        );

      case "kg":
        return (
          <Badge
            variant="outline"
            className="bg-primary/5 text-primary border-primary/20 px-3 py-1"
          >
            {formatINR(item.pricePerKg ?? 0)} / kg
          </Badge>
        );

      case "unit":
        return (
          <Badge
            variant="outline"
            className="bg-primary/5 text-primary border-primary/20 px-3 py-1"
          >
            {formatINR(item.pricePerUnit ?? 0)} / unit
          </Badge>
        );

      default:
        return "—";
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-200">
        <Package className="mx-auto h-12 w-12 text-slate-400 mb-4" />
        <p className="text-lg font-medium text-slate-700">
          No inventory items yet
        </p>
        <p className="text-sm text-slate-500 mt-2">
          Click "Add Inventory" to create your first item
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 border-b border-slate-200">
              <TableHead className="font-semibold text-slate-700">
                Name
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Type
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Pricing
              </TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">
                Total / Rate
              </TableHead>
              <TableHead className="font-semibold text-slate-700 text-right pr-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map((item, idx) => (
              <TableRow
                key={item.id}
                className={cn(
                  "hover:bg-slate-50/70 transition-colors",
                  idx % 2 === 0 ? "bg-white" : "bg-slate-50/40",
                )}
              >
                <TableCell className="font-medium text-slate-900">
                  {item.name}
                </TableCell>
                <TableCell className="text-slate-600 capitalize">
                  {item.measurementType?.replace("_", " ") || "—"}
                </TableCell>
                <TableCell>{getMeasurementDisplay(item)}</TableCell>
                <TableCell className="text-right font-semibold text-primary">
                  {formatINR(calculateTotalPrice(item))}
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 text-slate-600 hover:text-primary hover:bg-primary/5"
                      onClick={() => handleEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setItemToDelete(item);
                        setDeleteDialogOpen(true);
                      }}
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-white border-slate-200">
          <DialogHeader className="pb-5 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div>
                <DialogTitle className="text-lg font-bold text-slate-800">
                  <div className="flex justify-start items-center gap-2 w-full">
                    <div className="p-2 bg-primary rounded-md">
                      <Package className="h-4 w-4 text-white" />
                    </div>
                    <span>Edit Inventory Item</span>
                  </div>
                </DialogTitle>
                <p className="text-sm text-slate-500 mt-2">
                  Update name and pricing
                </p>
              </div>
            </div>
          </DialogHeader>

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-800">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6 pt-3">
            {/* Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Item Name <span className="text-red-500 text-xs">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="border-slate-300 focus:border-primary focus:ring-primary/20"
              />
            </div>

            {/* Measurement Type – read-only */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                {form.measurementType === "height_width" && (
                  <Ruler className="h-4 w-4 text-primary" />
                )}
                {form.measurementType === "kg" && (
                  <Weight className="h-4 w-4 text-primary" />
                )}
                {form.measurementType === "unit" && (
                  <Hash className="h-4 w-4 text-primary" />
                )}
                Measurement Type
              </Label>
              <div className="px-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50/60 text-slate-700 capitalize font-medium">
                {form.measurementType?.replace("_", " ") || "—"}
              </div>
            </div>

            {/* Conditional pricing fields */}
            {form.measurementType === "height_width" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-primary" />
                      Height (ft)
                    </Label>
                    <Input
                      type="number"
                      value={form.height}
                      disabled
                      className="bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-primary" />
                      Width (ft)
                    </Label>
                    <Input
                      type="number"
                      value={form.width}
                      disabled
                      className="bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-primary/5 border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary rounded-lg text-white">
                      <IndianRupee className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-slate-800">
                      Pricing
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">
                        Price per Height (ft)
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={form.pricePerHeight ?? ""}
                        onChange={(e) =>
                          updateField("pricePerHeight", e.target.value)
                        }
                        onWheel={(e) => e.currentTarget.blur()}
                        className="border-slate-300 focus:border-primary focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">
                        Price per Width (ft)
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={form.pricePerWidth ?? ""}
                        onChange={(e) =>
                          updateField("pricePerWidth", e.target.value)
                        }
                        onWheel={(e) => e.currentTarget.blur()}
                        className="border-slate-300 focus:border-primary focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {form.measurementType === "kg" && (
              <div className="p-5 rounded-xl bg-primary/5 border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary rounded-lg text-white">
                    <IndianRupee className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-slate-800">Pricing</span>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Weight className="h-4 w-4" />
                    Price per Kg
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.pricePerKg ?? ""}
                    onChange={(e) => updateField("pricePerKg", e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="border-slate-300 focus:border-primary focus:ring-primary/20"
                  />
                </div>
              </div>
            )}

            {form.measurementType === "unit" && (
              <div className="p-5 rounded-xl bg-primary/5 border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary rounded-lg text-white">
                    <IndianRupee className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-slate-800">Pricing</span>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Price per Unit
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.pricePerUnit ?? ""}
                    onChange={(e) =>
                      updateField("pricePerUnit", e.target.value)
                    }
                    onWheel={(e) => e.currentTarget.blur()}
                    className="border-slate-300 focus:border-primary focus:ring-primary/20"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="gap-3 pt-5 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border-slate-300 hover:bg-slate-50 min-w-27.5"
              >
                Cancel
              </Button>
              <Button type="submit" className="min-w-35">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-slate-200 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <AlertCircle className="h-6 w-6 text-red-600" />
              Delete inventory item?
            </AlertDialogTitle>

            <AlertDialogDescription asChild>
              <div className="text-slate-600 space-y-3 pt-2">
                <div>
                  This will permanently delete{" "}
                  <span className="font-semibold text-slate-900">
                    {itemToDelete?.name}
                  </span>
                  .
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  This action cannot be undone.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              disabled={isDeleting}
              className="hover:bg-slate-100"
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white min-w-35"
              onClick={async () => {
                if (!itemToDelete) return;

                try {
                  setIsDeleting(true);
                  await deleteItem(itemToDelete.id);
                } finally {
                  setIsDeleting(false);
                  setDeleteDialogOpen(false);
                  setItemToDelete(null);
                }
              }}
            >
              {isDeleting ? "Deleting..." : "Delete Item"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
