"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface InvoiceSummaryProps {
  address: string;
  onAddressChange: (value: string) => void;
  grandTotal: number;
  discount: number;
  cgst: number;
  sgst: number;
  igst: number;
  netAmount: number;

  cgstRate: number;
  sgstRate: number;
  igstRate: number;
}

export function InvoiceSummary({
  address,
  onAddressChange,
  grandTotal,
  discount,
  cgst,
  sgst,
  igst,
  netAmount,
  cgstRate,
  sgstRate,
  igstRate,
}: InvoiceSummaryProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Subtle glow wrapper on hover */}
      <div className="relative group">
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          {/* Left: Billing Address */}
          <div className="space-y-4">
            <Label className="text-base font-semibold text-slate-800 flex items-center gap-2">
              Billing Address
            </Label>

            <div className="relative">
              <Textarea
                placeholder="Enter full billing address (street, city, state, PIN code...)"
                value={address}
                onChange={(e) => onAddressChange(e.target.value)}
                className="min-h-35 resize-none border-slate-300 focus:border-indigo-400 focus:ring-indigo-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Right: Amount Summary */}
          <div className="space-y-5 bg-slate-50/70 rounded-lg p-6 border border-slate-100">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Grand Total</span>
                <span className="font-medium text-slate-900">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Discount</span>
                <span className="font-medium text-orange-700">
                  ₹{discount.toFixed(2)}
                </span>
              </div>

              {/* Always show all three GST lines */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">CGST ({cgstRate}%)</span>
                <span className="font-medium text-slate-900">
                  ₹{cgst.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">SGST ({sgstRate}%)</span>
                <span className="font-medium text-slate-900">
                  ₹{sgst.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">IGST ({igstRate}%)</span>
                <span className="font-medium text-slate-900">
                  ₹{igst.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Net Amount – highlighted */}
            <div className="border-t border-slate-200 pt-4 mt-2 flex justify-between items-center">
              <span className="text-lg font-semibold text-slate-900">
                Net Amount
              </span>
              <span className="text-xl font-bold text-emerald-700">
                ₹{netAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
