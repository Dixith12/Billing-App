// components/inventory/add-inventory-modal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddInventory } from "@/hooks/use-add-inventory";
import {
  Package,
  Ruler,
  Weight,
  Hash,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type MeasurementType = "height_width" | "kg" | "unit";

export function AddInventoryModal({ isOpen, onClose }: AddInventoryModalProps) {
  const { form, updateField, submit, error, reset } = useAddInventory(() => {
    reset();
    onClose();
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = submit();
    if (success) onClose();
  };

  const getMeasurementIcon = (type: MeasurementType | undefined) => {
    switch (type) {
      case "height_width":
        return <Ruler className="h-4 w-4" />;
      case "kg":
        return <Weight className="h-4 w-4" />;
      case "unit":
        return <Hash className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const renderPriceFields = () => {
    const type = form.measurementType as MeasurementType | undefined;

    if (!type) return null;

    if (type === "height_width") {
      return (
        <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Dimensions – disabled inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="height"
                className="text-sm font-medium text-slate-700 flex items-center gap-1.5"
              >
                <Ruler className="h-3.5 w-3.5 text-primary" />
                Height (ft)
              </Label>
              <div className="relative">
                <Input
                  id="height"
                  type="number"
                  value={form.height ?? 1}
                  disabled
                  className="bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                Default: 1 ft
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="width"
                className="text-sm font-medium text-slate-700 flex items-center gap-1.5"
              >
                <Ruler className="h-3.5 w-3.5 text-primary" />
                Width (ft)
              </Label>
              <div className="relative">
                <Input
                  id="width"
                  type="number"
                  value={form.width ?? 1}
                  disabled
                  className="bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                Default: 1 ft
              </p>
            </div>
          </div>

          {/* Pricing block */}
          <div className="p-5 rounded-xl bg-primary/5 border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary text-white">
                <IndianRupee className="h-4 w-4" />
              </div>
              <span className="text-base font-semibold text-slate-800">
                Pricing Configuration
              </span>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label
                  htmlFor="pricePerHeight"
                  className="text-sm font-medium text-slate-700"
                >
                  Price per Height (ft)
                </Label>
                <Input
                  id="pricePerHeight"
                  type="number"
                  placeholder="0.00"
                  value={form.pricePerHeight ?? ""}
                  onChange={(e) =>
                    updateField("pricePerHeight", e.target.value)
                  }
                  onWheel={(e) => e.currentTarget.blur()}
                  required
                  className="border-slate-300 focus:border-primary focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="pricePerWidth"
                  className="text-sm font-medium text-slate-700"
                >
                  Price per Width (ft)
                </Label>
                <Input
                  id="pricePerWidth"
                  type="number"
                  placeholder="0.00"
                  value={form.pricePerWidth ?? ""}
                  onChange={(e) => updateField("pricePerWidth", e.target.value)}
                  onWheel={(e) => e.currentTarget.blur()}
                  required
                  className="border-slate-300 focus:border-primary focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // kg or unit
    const label = type === "kg" ? "Price per Kg" : "Price per Unit";
    const fieldKey = type === "kg" ? "pricePerKg" : "pricePerUnit";
    const icon =
      type === "kg" ? (
        <Weight className="h-4 w-4" />
      ) : (
        <Hash className="h-4 w-4" />
      );

    return (
      <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="p-5 rounded-xl bg-primary/5 border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-primary text-white">
              <IndianRupee className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold text-slate-800">
              Pricing Configuration
            </span>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor={fieldKey}
              className="text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              {icon}
              {label}
            </Label>
            <Input
              id={fieldKey}
              type="number"
              placeholder="0.00"
              value={form[fieldKey] ?? ""}
              onChange={(e) => updateField(fieldKey, e.target.value)}
              onWheel={(e) => e.currentTarget.blur()}
              required
              className="border-slate-300 focus:border-primary focus:ring-primary/20"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-hidden bg-white border-slate-200 flex flex-col">
        <DialogHeader className="pb-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div>
              <DialogTitle className="text-lg font-bold text-slate-800">
                <div className="flex justify-start items-center gap-2 w-full">
                  <div className="p-2 bg-primary rounded-md">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  <span>Add New Inventory Item</span>
                </div>
              </DialogTitle>
              <p className="text-sm text-slate-500 mt-2">
                Fill in the details below
              </p>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-100 text-red-800">
            <AlertCircle className="h-4.5 w-4.5 text-red-600 mt-0.5 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 pt-2 overflow-y-auto flex-1 pr-1 no-scrollbar px-1"
        >
          {/* Name */}
          <div className="space-y-2">
            <Label
              htmlFor="inventoryName"
              className="text-sm font-medium text-slate-700 flex items-center gap-1.5"
            >
              <Package className="h-4 w-4 text-primary" />
              Inventory Name
              <span className="text-red-500 text-xs">*</span>
            </Label>
            <Input
              id="inventoryName"
              placeholder="e.g. Teak Wood Panels, MS Rods, etc."
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              onWheel={(e) => e.currentTarget.blur()}
              required
              className="border-slate-300 focus:border-primary focus:ring-primary/20"
            />
          </div>

          {/* HSN Code */}
          <div className="space-y-2">
            <Label
              htmlFor="hsnCode"
              className="text-sm font-medium text-slate-700 flex items-center gap-1.5"
            >
              <Hash className="h-4 w-4 text-primary" />
              HSN Code
            </Label>
            <Input
              id="hsnCode"
              placeholder="e.g. 4407 (Wood), 7213 (Steel), etc."
              value={form.hsnCode ?? ""}
              onChange={(e) => updateField("hsnCode", e.target.value)}
              className="border-slate-300 focus:border-primary focus:ring-primary/20"
            />
            <p className="text-xs text-slate-500">
              Enter 4–8 digit HSN code for GST classification (optional)
            </p>
          </div>

          {/* Measurement Type */}
          <div className="space-y-2">
            <Label
              htmlFor="measurementType"
              className="text-sm font-medium text-slate-700 flex items-center gap-1.5"
            >
              {getMeasurementIcon(form.measurementType as MeasurementType)}
              Measurement Type
              <span className="text-red-500 text-xs">*</span>
            </Label>
            <Select
              value={form.measurementType || ""}
              onValueChange={(value) => {
                updateField("measurementType", value);
                if (value !== "height_width") {
                  updateField("pricePerHeight", "");
                  updateField("pricePerWidth", "");
                }
                if (value !== "kg") updateField("pricePerKg", "");
                if (value !== "unit") updateField("pricePerUnit", "");
              }}
              required
            >
              <SelectTrigger className="border-slate-300 focus:border-primary data-placeholder:text-slate-400">
                <SelectValue placeholder="Select measurement type" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="height_width">
                  <div className="flex items-center gap-2 py-0.5">
                    <Ruler className="h-4 w-4 text-primary" />
                    Height x Width (ft)
                  </div>
                </SelectItem>
                <SelectItem value="kg">
                  <div className="flex items-center gap-2 py-0.5">
                    <Weight className="h-4 w-4 text-primary" />
                    Kg (Kilogram)
                  </div>
                </SelectItem>
                <SelectItem value="unit">
                  <div className="flex items-center gap-2 py-0.5">
                    <Hash className="h-4 w-4 text-primary" />
                    Unit / Pieces
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              Choose how this item is sold/measured
            </p>
          </div>

          {/* Conditional pricing section */}
          {renderPriceFields()}

          <DialogFooter className="gap-3 pt-5 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button type="submit" className="min-w-32.5">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Save Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
