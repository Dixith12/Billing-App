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
import {
  Badge,
} from "@/components/ui/badge";
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
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InventoryItem } from "@/lib/types";
import { useInventory} from "@/app/dashboard/inventory/hooks/useInventory";
import { calculateTotalPrice, formatINR } from "@/lib/utils/inventory";
import { useEditInventoryForm } from "@/app/dashboard/inventory/hooks/useEditInventoryForm";

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

  // ─── Helper: show measurement + price info ────────────────────────────────
  const getMeasurementDisplay = (item: InventoryItem) => {
    switch (item.measurementType) {
      case "height_width":
        return (
          <div className="space-y-1">
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 px-2.5 py-0.5 mr-1 text-xs">
              {formatINR(item.pricePerHeight ?? 0)} / ft height
            </Badge>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 px-2.5 py-0.5 text-xs">
              {formatINR(item.pricePerWidth ?? 0)} / ft width
            </Badge>
          </div>
        );

      case "kg":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1">
            {formatINR(item.pricePerKg ?? 0)} / kg
          </Badge>
        );

      case "unit":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
            {formatINR(item.pricePerUnit ?? 0)} / unit
          </Badge>
        );

      default:
        return "—";
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50/70 rounded-xl border border-slate-200">
        <Package className="mx-auto h-12 w-12 text-slate-400 mb-4" />
        <p className="text-lg font-medium text-slate-700">No inventory items yet</p>
        <p className="text-sm text-slate-500 mt-2">
          Click "Add Inventory" to create your first item
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 border-b border-slate-200">
              <TableHead className="font-semibold text-slate-700">Name</TableHead>
              <TableHead className="font-semibold text-slate-700">Type</TableHead>
              <TableHead className="font-semibold text-slate-700">Pricing</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">Total / Rate</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map((item, idx) => (
              <TableRow
                key={item.id}
                className={cn(
                  "hover:bg-slate-50/70 transition-colors",
                  idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                )}
              >
                <TableCell className="font-medium text-slate-900">
                  {item.name}
                </TableCell>
                <TableCell className="text-slate-600 capitalize">
                  {item.measurementType?.replace("_", " ") || "—"}
                </TableCell>
                <TableCell>{getMeasurementDisplay(item)}</TableCell>
                <TableCell className="text-right font-semibold text-indigo-700">
                  {formatINR(calculateTotalPrice(item))}
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                      onClick={() => handleEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (confirm("Delete this item? This cannot be undone.")) {
                          deleteItem(item.id);
                        }
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

      {/* ─── Edit Dialog ──────────────────────────────────────────────────────── */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-white border-slate-200">
          <DialogHeader className="pb-5 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-indigo-600 rounded-xl shadow-sm">
                <Package className="h-7 w-7 text-white" strokeWidth={2.2} />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-slate-800">
                  Edit Inventory Item
                </DialogTitle>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  Update name and pricing
                </p>
              </div>
            </div>
          </DialogHeader>

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-800">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6 pt-3">
            {/* Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Package className="h-4 w-4 text-indigo-600" />
                Item Name <span className="text-red-500 text-xs">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="border-slate-300 focus:border-indigo-400 focus:ring-indigo-200 h-11"
              />
            </div>

            {/* Measurement Type – read-only */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                {form.measurementType === "height_width" && <Ruler className="h-4 w-4 text-indigo-600" />}
                {form.measurementType === "kg" && <Weight className="h-4 w-4 text-emerald-600" />}
                {form.measurementType === "unit" && <Hash className="h-4 w-4 text-blue-600" />}
                Measurement Type
              </Label>
              <div className="px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50/60 text-slate-700 capitalize font-medium">
                {form.measurementType?.replace("_", " ") || "—"}
              </div>
            </div>

            {/* Conditional pricing fields */}
            {form.measurementType === "height_width" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-indigo-600" />
                      Height (ft)
                    </Label>
                    <Input
                      type="number"
                      value={form.height}
                      disabled
                      className="bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-indigo-600" />
                      Width (ft)
                    </Label>
                    <Input
                      type="number"
                      value={form.width}
                      disabled
                      className="bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed h-11"
                    />
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-600 rounded-lg text-white">
                      <IndianRupee className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-slate-800">Pricing</span>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Price per Height (ft)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={form.pricePerHeight ?? ""}
                        onChange={(e) => updateField("pricePerHeight", e.target.value)}
                        className="border-slate-300 focus:border-indigo-400 focus:ring-indigo-200 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Price per Width (ft)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={form.pricePerWidth ?? ""}
                        onChange={(e) => updateField("pricePerWidth", e.target.value)}
                        className="border-slate-300 focus:border-indigo-400 focus:ring-indigo-200 h-11"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {form.measurementType === "kg" && (
              <div className="p-5 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 rounded-lg text-white">
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
                    className="border-slate-300 focus:border-emerald-400 focus:ring-emerald-200 h-11"
                  />
                </div>
              </div>
            )}

            {form.measurementType === "unit" && (
              <div className="p-5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg text-white">
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
                    onChange={(e) => updateField("pricePerUnit", e.target.value)}
                    className="border-slate-300 focus:border-blue-400 focus:ring-blue-200 h-11"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="gap-3 pt-5 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border-slate-300 hover:bg-slate-50 min-w-[110px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px] shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}