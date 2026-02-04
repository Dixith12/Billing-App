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
  Sparkles,
  FileText,
  Package,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Expense } from "@/lib/firebase/expenses";
import { addExpense, updateExpense } from "@/lib/firebase/expenses";
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
  const [cgstPercent, setCgstPercent] = useState("");
  const [sgstPercent, setSgstPercent] = useState("");
  const [igstPercent, setIgstPercent] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // IMPORTANT: Sync form state when modal opens or initialData changes
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      // Edit mode - fill with existing values
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
      setCgstPercent(initialData.cgstPercent?.toString() || "");
      setSgstPercent(initialData.sgstPercent?.toString() || "");
      setIgstPercent(initialData.igstPercent?.toString() || "");
    } else {
      // Add new mode - reset to defaults
      setName("");
      setCategory("");
      setState("");
      setQuantity("1");
      setAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      setCgstPercent("");
      setSgstPercent("");
      setIgstPercent("");
    }
  }, [isOpen, initialData]);

  const isEdit = !!initialData;
  const isKarnataka = state.toLowerCase() === "karnataka";

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

      if (isKarnataka) {
        if (cgstPercent === "" || sgstPercent === "") {
          throw new Error(
            "CGST and SGST percentages are required for Karnataka",
          );
        }
      } else {
        if (igstPercent === "") {
          throw new Error("IGST percentage is required for other states");
        }
      }

      if (isNaN(amountNum) || amountNum <= 0)
        throw new Error("Please enter a valid amount greater than zero");
      if (qtyNum <= 0) throw new Error("Quantity must be greater than zero");
      if (!date) throw new Error("Date is required");

      const expenseData: any = {
        name: name.trim(),
        category,
        state,
        quantity: qtyNum,
        amount: amountNum,
        date,
      };

      if (isKarnataka) {
        expenseData.cgstPercent = cgst;
        expenseData.sgstPercent = sgst;
      } else {
        expenseData.igstPercent = igst;
      }

      if (isEdit && initialData?.id) {
        await updateExpense(initialData.id, expenseData);
        toast.success("Expense updated successfully");
      } else {
        await addExpense(expenseData);
        toast.success("Expense added successfully");
      }

      if (onSave) {
        if (onSave) {
          onSave({
            ...(initialData || {}), // keep original fields if editing
            ...expenseData, // override with new values
            // No need to force id: 'new'
          } as Expense);
        }
      }

      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save expense");
      toast.error(err.message || "Failed to save expense");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white border-slate-200 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-5 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-40"></div>
              <div className="relative p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl">
                <ReceiptIndianRupee
                  className="h-7 w-7 text-white"
                  strokeWidth={2.2}
                />
              </div>
            </div>

            <div>
              <DialogTitle className="text-2xl font-bold text-slate-800">
                {isEdit ? "Edit Expense" : "Add New Expense"}
              </DialogTitle>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                {isEdit
                  ? "Update this expense record"
                  : "Record a new business expense"}
              </p>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 pt-2 overflow-y-auto flex-1 pr-2"
        >
          {/* Bill / Expense Name */}
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <FileText className="h-4 w-4 text-indigo-600" />
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
              className="border-slate-300 focus:border-indigo-400 focus:ring-indigo-200 h-11"
            />
          </div>

          {/* Category Dropdown */}
          <div className="space-y-2">
            <Label
              htmlFor="category"
              className="text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <Package className="h-4 w-4 text-violet-600" />
              Category <span className="text-red-500 text-xs">*</span>
            </Label>
            <Select
              value={category}
              onValueChange={setCategory}
              disabled={isSaving}
              required
            >
              <SelectTrigger className="h-11 border-slate-300 focus:border-violet-400 focus:ring-violet-200">
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

          {/* State Dropdown */}
          <div className="space-y-2">
            <Label
              htmlFor="state"
              className="text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <IndianRupee className="h-4 w-4 text-emerald-600" />
              State / UT <span className="text-red-500 text-xs">*</span>
            </Label>
            <Select
              value={state}
              onValueChange={setState}
              disabled={isSaving}
              required
            >
              <SelectTrigger className="h-11 border-slate-300 focus:border-emerald-400 focus:ring-emerald-200">
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

          {/* Conditional GST Fields */}
          {state && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className="border-slate-300 focus:border-indigo-400 focus:ring-indigo-200 h-11 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                      className="border-slate-300 focus:border-indigo-400 focus:ring-indigo-200 h-11 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                    className="border-slate-300 focus:border-indigo-400 focus:ring-indigo-200 h-11 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
              <Package className="h-4 w-4 text-violet-600" />
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
              className="border-slate-300 focus:border-violet-400 focus:ring-violet-200 h-11 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label
              htmlFor="amount"
              className="text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <IndianRupee className="h-4 w-4 text-emerald-600" />
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
              className="border-slate-300 focus:border-emerald-400 focus:ring-emerald-200 h-11 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label
              htmlFor="date"
              className="text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <CalendarDays className="h-4 w-4 text-violet-600" />
              Expense Date <span className="text-red-500 text-xs">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={isSaving}
              className="border-slate-300 focus:border-violet-400 focus:ring-violet-200 h-11"
            />
          </div>
        </form>

        <DialogFooter className="gap-3 pt-5 border-t border-slate-200 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="border-slate-300 hover:bg-slate-50 min-w-[110px]"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[160px] shadow-sm"
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
