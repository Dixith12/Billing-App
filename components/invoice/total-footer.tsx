"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface TotalsFooterProps {
  itemCount: number;
  totalQty: number;
  netAmount: number;
  onClose: () => void;
  onSave: () => void;
  isEditMode?: boolean;
  isSaving?: boolean;
  isQuotationMode?: boolean;
  isPurchaseMode?: boolean;
  disabled?: boolean;
}

export function TotalsFooter({
  itemCount,
  totalQty,
  netAmount,
  onClose,
  onSave,
  isEditMode = false,
  isSaving = false,
  isQuotationMode = false,
  isPurchaseMode = false,
  disabled = false,
}: TotalsFooterProps) {
  const actionLabel = isEditMode ? "Update" : "Save";

  const documentType = isPurchaseMode
    ? "Purchase"
    : isQuotationMode
      ? "Quotation"
      : "Invoice";

  const buttonText = isSaving
    ? `${actionLabel}ing ${documentType}...`
    : `${actionLabel} ${documentType}`;

  return (
    <div className="border-t border-slate-200 pt-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Left: Item & Qty summary */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-700 font-medium text-xs">
                {itemCount}
              </span>
            </div>
            <div>
              <span className="text-slate-600">Items</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-purple-700 font-medium text-xs">
                {totalQty}
              </span>
            </div>
            <div>
              <span className="text-slate-600">Total Qty</span>
            </div>
          </div>
        </div>

        {/* Right: Net Amount + Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          {/* Net Amount - highlighted */}
          <div className="flex justify-center items-center gap-2 text-center sm:text-right">
            <div className="text-sm text-slate-600">Net Amount</div>
            <div className="text-2xl font-bold">₹{netAmount.toFixed(2)}</div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={onClose}
              className="border-slate-300 hover:bg-slate-50 min-w-30"
              disabled={isSaving}
            >
              Close
            </Button>

            <Button
              size="lg"
              onClick={onSave}
              disabled={isSaving || disabled}
              className="group relative overflow-hidden bg-primary"
            >
              {isSaving ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="font-semibold">{buttonText}</span>
                </div>
              ) : (
                <span className="font-semibold">{buttonText}</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
