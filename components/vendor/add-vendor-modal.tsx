// app/vendors/components/add-vendor-modal.tsx
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
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVendors } from "@/hooks/use-vendors";
import { INDIAN_STATES_AND_UTS } from "@/lib/utils/india";
import { toast } from "sonner";

interface AddVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export function AddVendorModal({
  isOpen,
  onClose,
  onSuccess,
}: AddVendorModalProps) {
  const { useVendorForm } = useVendors();

  const {
    form,
    updateField,
    setBalanceType,
    submit,
    formError: error,
    isSubmitting: isLoading,
    resetForm,
  } = useVendorForm(async () => {
    await onSuccess();
    resetForm();
    onClose();
    toast.success("Vendor created successfully", {
      description: "New vendor has been added to your list.",
      duration: 4000,
    });
  });

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const success = await submit();
  if (!success) return; // ⛔ don't close or toast
};


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white border-slate-200 max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-5 border-b border-slate-200">
          <DialogTitle className="text-lg font-bold text-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-md">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <span>Add New Vendor</span>
            </div>
          </DialogTitle>
          <p className="text-sm text-slate-500 mt-2">
            Enter vendor details below
          </p>
        </DialogHeader>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 mx-1">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <div className="max-h-[70vh] overflow-y-auto px-1 py-2 no-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vendor Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                Vendor Name <span className="text-red-500 text-xs">*</span>
              </Label>
              <Input
                placeholder="Vendor / Supplier name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
                className="border-slate-300 focus:border-primary focus:ring-primary/20"
              />
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Company Name{" "}
                <span className="text-xs text-slate-500">(optional)</span>
              </Label>
              <Input
                placeholder="Company / Firm name"
                value={form.companyName || ""}
                onChange={(e) => updateField("companyName", e.target.value)}
                className="border-slate-300 focus:border-primary focus:ring-primary/20"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                Phone Number <span className="text-red-500 text-xs">*</span>
              </Label>
              <Input
  type="tel"
  placeholder="10-digit mobile number"
  value={form.phone}
  onChange={(e) =>
    updateField(
      "phone",
      e.target.value.replace(/\D/g, "").slice(0, 10)
    )
  }
  required
  className={cn(
    "border-slate-300 focus:border-primary focus:ring-primary/20",
    error?.toLowerCase().includes("phone") &&
      "border-red-500 focus:border-red-500 focus:ring-red-200"
  )}
/>

            </div>

            {/* GSTIN */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                GSTIN <span className="text-xs text-slate-500">(optional)</span>
              </Label>
              <Input
                placeholder="15-digit GST number"
                value={form.gstin || ""}
                onChange={(e) => updateField("gstin", e.target.value)}
                className="border-slate-300 focus:border-primary focus:ring-primary/20"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Address <span className="text-red-500 text-xs">*</span>
              </Label>
              <Textarea
                placeholder="Street, area, city, PIN code..."
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                required
                className="border-slate-300 focus:border-primary focus:ring-primary/20 min-h-25 resize-none"
              />
            </div>

            {/* State */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Landmark className="h-4 w-4 text-primary" />
                State / UT{" "}
                <span className="text-xs text-red-500">*</span>
              </Label>
              <select
                value={form.state || ""}
                onChange={(e) => updateField("state", e.target.value)}
                className={cn(
                  "w-full px-4 border border-slate-300 rounded-lg h-10",
                  "focus:border-primary focus:ring-2 focus:ring-primary/20",
                )}
              >
                <option value="">Select state / union territory</option>
                {INDIAN_STATES_AND_UTS.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* Opening Balance */}
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Optional Details
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-8">
                  {["debit", "credit"].map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="radio"
                        checked={form.openingBalanceType === type}
                        onChange={() =>
                          setBalanceType(type as "debit" | "credit")
                        }
                        className="h-4 w-4 text-primary"
                      />
                      {type === "debit" ? "Debit" : "Credit"}
                    </label>
                  ))}
                </div>

                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden focus-within:border-primary focus-within:ring-primary/20">
                  <span className="px-4 text-slate-600 font-medium">₹</span>
                  <Input
                    type="number"
                    value={form.openingBalanceAmount}
                    onChange={(e) =>
                      updateField("openingBalanceAmount", e.target.value)
                    }
                    className="border-0 focus:ring-0 rounded-none bg-transparent h-10"
                  />
                  <span
                    className={cn(
                      "px-4 text-sm font-medium whitespace-nowrap",
                      form.openingBalanceType === "debit"
                        ? "text-red-600"
                        : "text-green-600",
                    )}
                  >
                    {form.openingBalanceType === "debit"
                      ? "Vendor pays you"
                      : "You pay the vendor"}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-3 pt-6 border-t border-slate-200 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  "Saving..."
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Save Vendor
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
