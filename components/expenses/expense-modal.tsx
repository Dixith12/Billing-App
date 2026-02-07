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
import {
  ReceiptIndianRupee,
  IndianRupee,
  CalendarDays,
  AlertCircle,
  CheckCircle2,
  FileText,
  Package,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Expense } from "@/lib/firebase/expenses";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Expense | null;
  onSave?: (data: Expense) => void;
}

export function ExpenseModal({
  isOpen,
  onClose,
  initialData,
  onSave,
}: ExpenseModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [state, setState] = useState("");
  const [gstApplicable, setGstApplicable] = useState(false);
  const [cgstPercent, setCgstPercent] = useState("");
  const [sgstPercent, setSgstPercent] = useState("");
  const [igstPercent, setIgstPercent] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync form state when modal opens or initialData changes
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      // Edit mode
      setName(initialData.name || "");
      setCategory(initialData.category || "");
      setState(initialData.state || "");
      setQuantity(initialData.quantity?.toString() || "1");
      setAmount(initialData.amount?.toString() || "");
      setDate(
        initialData.date
          ? new Date(initialData.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      );

      // Try to detect if GST was previously saved
      const hasGstData =
        initialData.cgstPercent != null ||
        initialData.sgstPercent != null ||
        initialData.igstPercent != null;

      setGstApplicable(hasGstData);

      if (hasGstData) {
        setCgstPercent(initialData.cgstPercent?.toString() || "");
        setSgstPercent(initialData.sgstPercent?.toString() || "");
        setIgstPercent(initialData.igstPercent?.toString() || "");
      } else {
        setCgstPercent("");
        setSgstPercent("");
        setIgstPercent("");
      }
    } else {
      // Add new mode - reset everything
      setName("");
      setCategory("");
      setState("");
      setGstApplicable(false);
      setCgstPercent("");
      setSgstPercent("");
      setIgstPercent("");
      setQuantity("1");
      setAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      setError(null);
    }
  }, [isOpen, initialData]);

  // Clear GST fields when toggle turned off or state cleared
  useEffect(() => {
    if (!gstApplicable || !state) {
      setCgstPercent("");
      setSgstPercent("");
      setIgstPercent("");
    }
  }, [gstApplicable, state]);

  const isEdit = !!initialData;
  const isKarnataka = state.toLowerCase() === "karnataka";
  const showGstFields = gstApplicable && !!state;

  // ---------- Total Amount Calculation (UI only) ----------
  const qtyNum = parseFloat(quantity) || 1;
  const amountNum = parseFloat(amount) || 0;
  const cgstNum = parseFloat(cgstPercent) || 0;
  const sgstNum = parseFloat(sgstPercent) || 0;
  const igstNum = parseFloat(igstPercent) || 0;

  let totalAmount = 0;

  if (gstApplicable && amountNum > 0) {
    if (isKarnataka) {
      // CGST + SGST
      const gstValue = (amountNum * (cgstNum + sgstNum)) / 100;
      totalAmount = (amountNum + gstValue) * qtyNum;
    } else {
      // IGST
      const gstValue = (amountNum * igstNum) / 100;
      totalAmount = (amountNum + gstValue) * qtyNum;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isSaving) return;

    setIsSaving(true);

    try {
      const amountNum = parseFloat(amount);
      const qtyNum = parseFloat(quantity) || 1;
      const cgst = parseFloat(cgstPercent) || 0;
      const sgst = parseFloat(sgstPercent) || 0;
      const igst = parseFloat(igstPercent) || 0;

      if (!name.trim()) throw new Error("Bill / Expense name is required");
      if (!category) throw new Error("Please select a category");
      if (!state) throw new Error("Please select a state");
      if (isNaN(amountNum) || amountNum <= 0)
        throw new Error("Please enter a valid amount greater than zero");
      if (qtyNum <= 0) throw new Error("Quantity must be greater than zero");
      if (!date) throw new Error("Date is required");

      // GST validation only when toggle is ON
      if (gstApplicable) {
        if (isKarnataka) {
          if (cgstPercent === "" || sgstPercent === "") {
            throw new Error(
              "CGST and SGST percentages are required when GST is applicable in Karnataka",
            );
          }
        } else {
          if (igstPercent === "") {
            throw new Error(
              "IGST percentage is required when GST is applicable (non-Karnataka)",
            );
          }
        }
      }

      const expenseData: any = {
        name: name.trim(),
        category,
        state,
        gstApplicable,
        quantity: qtyNum,
        amount: amountNum,
        date,
      };

      if (gstApplicable) {
        if (isKarnataka) {
          expenseData.cgstPercent = cgst;
          expenseData.sgstPercent = sgst;
          expenseData.igstPercent = null; // clean up
        } else {
          expenseData.igstPercent = igst;
          expenseData.cgstPercent = null;
          expenseData.sgstPercent = null;
        }
      } else {
        // Explicitly clear GST fields when not applicable
        expenseData.cgstPercent = null;
        expenseData.sgstPercent = null;
        expenseData.igstPercent = null;
      }

      if (!onSave) {
        throw new Error("Save handler not provided");
      }

      await onSave({
        ...(initialData || {}),
        ...expenseData,
        gstApplicable,
      } as Expense);

      toast.success(
        isEdit ? "Expense updated successfully" : "Expense added successfully",
      );

      onClose();
    } catch (err: any) {
      const msg = err.message || "Failed to save expense";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white border-slate-200 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-5 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div>
              <DialogTitle className="text-lg font-bold text-slate-800">
                <div className="flex justify-start items-center gap-2 w-full">
                  <div className="p-2 bg-primary rounded-md">
                    <ReceiptIndianRupee className="h-4 w-4 text-white" />
                  </div>
                  <span>{isEdit ? "Edit Expense" : "Add New Expense"}</span>
                </div>
              </DialogTitle>
              <p className="text-sm text-slate-500 mt-2">
                {isEdit
                  ? "Update this expense record"
                  : "Record a new business expense"}
              </p>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 pt-2 overflow-y-auto flex-1 pl-1 pr-2 no-scrollbar"
        >
          {/* Bill / Expense Name */}
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <FileText className="h-4 w-4 text-primary" />
              Bill / Expense Name{" "}
              <span className="text-red-500 text-xs">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. Electricity Bill, Office Rent, Fuel..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSaving}
              className="border-slate-300 focus:border-primary focus:ring-primary/20"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label
              htmlFor="category"
              className="text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <Package className="h-4 w-4 text-primary" />
              Category <span className="text-red-500 text-xs">*</span>
            </Label>
            <Select
              value={category}
              onValueChange={setCategory}
              disabled={isSaving}
              required
            >
              <SelectTrigger className=" border-slate-300 focus:border-primary focus:ring-primary/20">
                <SelectValue placeholder="Select expense category" />
              </SelectTrigger>
              <SelectContent className="max-h-80 bg-white">
                {[
                  "Office Supplies",
                  "Rent (Office/Warehouse)",
                  "Utilities",
                  "Repairs & Maintenance",
                  "Raw Materials / Stock",
                  "Packing & Shipping",
                  "Professional Fees",
                  "Advertising & Marketing",
                  "Travel & Conveyance",
                  "IT / Software Subscriptions",
                  "Bank Charges",
                  "Employee Salaries / Wages",
                  "Employee Benefits / Allowances",
                  "Miscellaneous Expenses",
                  "Donations / CSR",
                ].map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* State */}
          <div className="space-y-2">
            <Label
              htmlFor="state"
              className="text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <IndianRupee className="h-4 w-4 text-primary" />
              State / UT <span className="text-red-500 text-xs">*</span>
            </Label>
            <Select
              value={state}
              onValueChange={setState}
              disabled={isSaving}
              required
            >
              <SelectTrigger className=" border-slate-300 focus:border-primary focus:ring-primary/20">
                <SelectValue placeholder="Select state or union territory" />
              </SelectTrigger>
              <SelectContent className="max-h-96 bg-white">
                {[
                  "Andaman and Nicobar Islands",
                  "Andhra Pradesh",
                  "Arunachal Pradesh",
                  "Assam",
                  "Bihar",
                  "Chandigarh",
                  "Chhattisgarh",
                  "Dadra and Nagar Haveli and Daman and Diu",
                  "Delhi",
                  "Goa",
                  "Gujarat",
                  "Haryana",
                  "Himachal Pradesh",
                  "Jammu and Kashmir",
                  "Jharkhand",
                  "Karnataka",
                  "Kerala",
                  "Ladakh",
                  "Lakshadweep",
                  "Madhya Pradesh",
                  "Maharashtra",
                  "Manipur",
                  "Meghalaya",
                  "Mizoram",
                  "Nagaland",
                  "Odisha",
                  "Puducherry",
                  "Punjab",
                  "Rajasthan",
                  "Sikkim",
                  "Tamil Nadu",
                  "Telangana",
                  "Tripura",
                  "Uttar Pradesh",
                  "Uttarakhand",
                  "West Bengal",
                ].map((st) => (
                  <SelectItem key={st} value={st}>
                    {st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* GST Applicable Toggle – only shown after state is selected */}
          {state && (
            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                <ReceiptIndianRupee className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium text-slate-700">
                  GST Applicable?
                </Label>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={gstApplicable}
                onClick={() => setGstApplicable((prev) => !prev)}
                disabled={isSaving}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  gstApplicable ? "bg-primary" : "bg-slate-300",
                  isSaving && "opacity-60 cursor-not-allowed",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white ring-0 transition duration-200 ease-in-out",
                    gstApplicable ? "translate-x-5" : "translate-x-0",
                  )}
                />
              </button>
            </div>
          )}

          {/* GST Fields – only when toggle ON + state selected */}
          {showGstFields && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              {isKarnataka ? (
                <>
                  <div className="space-y-2">
                    <Label
                      htmlFor="cgst"
                      className="text-sm font-medium text-slate-700 flex items-center gap-2"
                    >
                      CGST (%) <span className="text-red-500 text-xs">*</span>
                    </Label>
                    <Input
                      id="cgst"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g. 9"
                      value={cgstPercent}
                      onChange={(e) => setCgstPercent(e.target.value)}
                      onWheel={(e) => e.currentTarget.blur()}
                      required
                      disabled={isSaving}
                      className="border-slate-300 focus:border-primary focus:ring-primary/20  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="sgst"
                      className="text-sm font-medium text-slate-700 flex items-center gap-2"
                    >
                      SGST (%) <span className="text-red-500 text-xs">*</span>
                    </Label>
                    <Input
                      id="sgst"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g. 9"
                      value={sgstPercent}
                      onChange={(e) => setSgstPercent(e.target.value)}
                      onWheel={(e) => e.currentTarget.blur()}
                      required
                      disabled={isSaving}
                      className="border-slate-300 focus:border-primary focus:ring-primary/20  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2 sm:col-span-2">
                  <Label
                    htmlFor="igst"
                    className="text-sm font-medium text-slate-700 flex items-center gap-2"
                  >
                    IGST (%) <span className="text-red-500 text-xs">*</span>
                  </Label>
                  <Input
                    id="igst"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 18"
                    value={igstPercent}
                    onChange={(e) => setIgstPercent(e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    required
                    disabled={isSaving}
                    className="border-slate-300 focus:border-primary focus:ring-primary/20  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <Label
              htmlFor="quantity"
              className="text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <Package className="h-4 w-4 text-primary" />
              Quantity <span className="text-red-500 text-xs">*</span>
            </Label>
            <Input
              id="quantity"
              type="number"
              step="1"
              min="1"
              placeholder="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              onWheel={(e) => e.currentTarget.blur()}
              required
              disabled={isSaving}
              className="border-slate-300 focus:border-primary focus:ring-primary/20  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label
              htmlFor="amount"
              className="text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <IndianRupee className="h-4 w-4 text-primary" />
              Amount (₹) <span className="text-red-500 text-xs">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onWheel={(e) => e.currentTarget.blur()}
              required
              disabled={isSaving}
              className="border-slate-300 focus:border-primary focus:ring-primary/20  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {/* Total Amount (Readonly – only when GST is enabled) */}
          {gstApplicable && (
            <div className="space-y-2">
              <Label
                htmlFor="totalAmount"
                className="text-sm font-medium text-slate-700 flex items-center gap-2"
              >
                <IndianRupee className="h-4 w-4 text-primary" />
                Total Amount (₹)
              </Label>
              <Input
                id="totalAmount"
                value={totalAmount.toFixed(2)}
                readOnly
                className="bg-slate-100 border-slate-300 text-slate-800 font-semibold cursor-not-allowed "
              />
            </div>
          )}

          {/* Date */}
          <div className="space-y-2">
            <Label
              htmlFor="date"
              className="text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <CalendarDays className="h-4 w-4 text-primary" />
              Expense Date <span className="text-red-500 text-xs">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={isSaving}
              className="border-slate-300 focus:border-primary focus:ring-primary/20 "
            />
          </div>
        </form>

        <DialogFooter className="gap-3 pt-5 border-t border-slate-200 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="border-slate-300 hover:bg-slate-50 min-w-27.5"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="min-w-40"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEdit ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {isEdit ? "Update Expense" : "Save Expense"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
