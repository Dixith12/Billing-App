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
import { Percent, AlertCircle, CheckCircle2, Calculator } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface GstEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCgst: number;
  initialSgst: number;
  onSave: (cgst: number, sgst: number) => void;
}

export function GstEditModal({
  isOpen,
  onClose,
  initialCgst,
  initialSgst,
  onSave,
}: GstEditModalProps) {
  const [cgst, setCgst] = useState(initialCgst.toFixed(2));
  const [sgst, setSgst] = useState(initialSgst.toFixed(2));
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cgstNum = parseFloat(cgst);
    const sgstNum = parseFloat(sgst);

    if (isNaN(cgstNum) || cgstNum < 0) {
      setError("CGST must be a valid non-negative number");
      return;
    }
    if (isNaN(sgstNum) || sgstNum < 0) {
      setError("SGST must be a valid non-negative number");
      return;
    }

    onSave(cgstNum, sgstNum);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white border-slate-200">
        <DialogHeader className="pb-5 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div>
              <DialogTitle className="text-lg font-bold text-slate-800">
                <div className="flex justify-start items-center gap-2 w-full">
                  <div className="p-2 bg-primary rounded-md">
                    <Calculator className="h-4 w-4 text-white" />
                  </div>
                  <span>Edit GST Rates</span>
                </div>
              </DialogTitle>
              <p className="text-sm text-slate-500 mt-2">
                Update Central & State GST percentages
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* CGST */}
          <div className="space-y-2">
            <Label
              htmlFor="cgst"
              className="text-sm font-semibold text-slate-700 flex items-center gap-2"
            >
              <Percent className="h-4 w-4 text-primary" />
              CGST (%)
              <span className="text-red-500 text-xs">*</span>
            </Label>
            <Input
              id="cgst"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 9.00"
              value={cgst}
              onChange={(e) => {
                setCgst(e.target.value);
                setError(null);
              }}
              required
              className="border-slate-300 focus:border-primary selection:bg-slate-300 focus:ring-primary/20 h-11"
            />
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/60" />
              Central GST - applied across the country
            </p>
          </div>

          {/* SGST */}
          <div className="space-y-2">
            <Label
              htmlFor="sgst"
              className="text-sm font-semibold text-slate-700 flex items-center gap-2"
            >
              <Percent className="h-4 w-4 text-primary" />
              SGST (%)
              <span className="text-red-500 text-xs">*</span>
            </Label>
            <Input
              id="sgst"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 9.00"
              value={sgst}
              onChange={(e) => {
                setSgst(e.target.value);
                setError(null);
              }}
              required
              className="border-slate-300 focus:border-primary selection:bg-slate-300 focus:ring-primary/20 h-11"
            />
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/60" />
              State GST - varies by state of supply
            </p>
          </div>

          <DialogFooter className="gap-3 pt-5 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-300 hover:bg-slate-50 min-w-25"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="group transition-all duration-300 min-w-40"
            >
              <CheckCircle2 className="h-4.5 w-4.5 mr-2 group-hover:scale-110 transition-transform" />
              Save GST Rates
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
