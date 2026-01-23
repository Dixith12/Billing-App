"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react"; // ← make sure you import Loader2 if using it

interface TotalsFooterProps {
  itemCount: number;
  totalQty: number;
  netAmount: number;
  onClose: () => void;
  onSave: () => void;
  isEditMode?: boolean;
  isSaving?: boolean;
  isQuotationMode?: boolean;
  disabled?: boolean; // optional, good
}

export function TotalsFooter({
  itemCount,
  totalQty,
  netAmount,
  onClose,
  onSave,
  isEditMode = false,
  isSaving = false,
  isQuotationMode = false, // ← default to false so it's safe even if not passed
  disabled = false
}: TotalsFooterProps) {
  // Decide label based on mode
  const actionLabel = isEditMode ? "Update" : "Save";
  const documentType = isQuotationMode ? "Quotation" : "Invoice";

  const buttonText = isSaving
    ? `${actionLabel}ing ${documentType}...`
    : `${actionLabel} ${documentType}`;

  return (
    <div className="border-t bg-muted/30 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Items: {itemCount}, Qty: {totalQty}
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-sm text-muted-foreground">Grand Total: </span>
            <span className="text-xl font-bold">₹{netAmount.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={onSave}
              disabled={isSaving||disabled}
            >
              {isSaving ? (
                <div className="flex items-center gap-2 justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {buttonText}
                </div>
              ) : (
                buttonText
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
