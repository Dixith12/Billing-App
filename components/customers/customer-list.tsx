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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Pencil,
  Trash2,
  Users,
  AlertCircle,
  CheckCircle2,
  MapPin,
  FileText,
  Phone,
  Landmark,
  Briefcase,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Customer } from "@/lib/firebase/customers";
import { useCustomers, useEditCustomerForm } from "@/hooks/use-customers";
import { INDIAN_STATES_AND_UTS } from "@/lib/utils/india";
import { toast } from "sonner";
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

// State codes mapping (unchanged)
const STATE_CODES: Record<string, string> = {
  "Andhra Pradesh": "AP",
  "Arunachal Pradesh": "AR",
  Assam: "AS",
  Bihar: "BR",
  Chhattisgarh: "CG",
  Goa: "GA",
  Gujarat: "GJ",
  Haryana: "HR",
  "Himachal Pradesh": "HP",
  Jharkhand: "JH",
  Karnataka: "KA",
  Kerala: "KL",
  "Madhya Pradesh": "MP",
  Maharashtra: "MH",
  Manipur: "MN",
  Meghalaya: "ML",
  Mizoram: "MZ",
  Nagaland: "NL",
  Odisha: "OR",
  Punjab: "PB",
  Rajasthan: "RJ",
  Sikkim: "SK",
  "Tamil Nadu": "TN",
  Telangana: "TG",
  Tripura: "TR",
  "Uttar Pradesh": "UP",
  Uttarakhand: "UK",
  "West Bengal": "WB",
  "Andaman and Nicobar Islands": "AN",
  Chandigarh: "CH",
  "Dadra and Nagar Haveli and Daman and Diu": "DN",
  Delhi: "DL",
  "Jammu and Kashmir": "JK",
  Ladakh: "LA",
  Lakshadweep: "LD",
  Puducherry: "PY",
};

interface CustomerListProps {
  items: Customer[];
  onRefresh: () => Promise<void>;
}

export function CustomerList({ items, onRefresh }: CustomerListProps) {
  const { deleteCustomer, updateCustomer } = useCustomers();

  const [searchQuery, setSearchQuery] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const { form, updateField, setBalanceType, submit, error, isLoading } =
    useEditCustomerForm(updateCustomer, editingCustomer, async () => {
      await onRefresh();
      setIsEditDialogOpen(false);
      setEditingCustomer(null);
      toast.success("Customer updated successfully", {
        description: "Changes have been saved.",
        duration: 4000,
      });
    });

  const filteredCustomers = items.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery)) ||
      (c.gstin && c.gstin.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.state && c.state.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const getStateCode = (fullState?: string): string => {
    if (!fullState || !fullState.trim()) return "—";
    const trimmed = fullState.trim();
    return STATE_CODES[trimmed] || "—";
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsEditDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit();
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;

    try {
      setIsDeleting(true);
      await deleteCustomer(customerToDelete.id);
      await onRefresh();
      toast.success("Customer deleted", {
        description: "The customer has been permanently removed.",
      });
    } catch (err) {
      toast.error("Failed to delete customer");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  return (
    <div className="space-y-6 ml-3 mr-3 mb-3">
      {/* Search */}
      <div className="relative max-w-md ml-1 mt-2.5">
        <Input
          placeholder="Search by name, phone, GSTIN or state..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-slate-300 focus:border-primary focus:ring-primary/20"
        />
        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
      </div>

      {/* Table */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-200">
          <Users className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <p className="text-lg font-medium text-slate-700">
            No customers found
          </p>
          <p className="text-sm text-slate-500 mt-2">
            {searchQuery
              ? "Try adjusting your search"
              : "Add your first customer to get started"}
          </p>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200">
                <TableHead className="font-semibold text-slate-700">
                  Name
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  GSTIN
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Phone
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Address
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">
                  State
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-right pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer, idx) => (
                <TableRow
                  key={customer.id}
                  className={cn(
                    "hover:bg-slate-50 transition-colors",
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50/40",
                  )}
                >
                  <TableCell className="font-medium text-slate-900">
                    {customer.name}
                  </TableCell>
                  <TableCell>
                    {customer.gstin ? (
                      <Badge
                        variant="outline"
                        className="bg-primary/10 text-primary border-primary/20 px-2.5 py-0.5"
                      >
                        {customer.gstin}
                      </Badge>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {customer.phone || "—"}
                  </TableCell>
                  <TableCell className="text-slate-600 max-w-md truncate">
                    {customer.address || "—"}
                  </TableCell>
                  <TableCell className="text-center text-slate-700 font-medium">
                    <span
                      className={cn(
                        getStateCode(customer.state) === "—"
                          ? "text-slate-400"
                          : "text-primary",
                      )}
                    >
                      {getStateCode(customer.state)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 text-slate-600 hover:text-primary hover:bg-primary/10"
                        onClick={() => handleEdit(customer)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setCustomerToDelete(customer);
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
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-white border-slate-200 max-h-[90vh] overflow-hidden">
          <DialogHeader className="pb-5 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div>
                <DialogTitle className="text-lg font-bold text-slate-800">
                  <div className="flex justify-start items-center gap-2 w-full">
                    <div className="p-2 bg-primary rounded-md">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <span>Edit Customer</span>
                  </div>
                </DialogTitle>
                <p className="text-sm text-slate-500 mt-2">
                  Update customer details
                </p>
              </div>
            </div>
          </DialogHeader>

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 mx-1">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Scrollable content */}
          <div className="max-h-[70vh] overflow-y-auto px-1 py-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 no-scrollbar">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Customer Name <span className="text-red-500 text-xs">*</span>
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="border-slate-300 focus:border-primary focus:ring-primary/20 h-11"
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
                  value={form.companyName || ""}
                  onChange={(e) => updateField("companyName", e.target.value)}
                  className="border-slate-300 focus:border-primary focus:ring-primary/20 h-11"
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
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="border-slate-300 focus:border-primary focus:ring-primary/20 h-11"
                />
              </div>

              {/* GSTIN */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  GSTIN{" "}
                  <span className="text-xs text-slate-500">(optional)</span>
                </Label>
                <Input
                  value={form.gstin || ""}
                  onChange={(e) => updateField("gstin", e.target.value)}
                  className="border-slate-300 focus:border-primary focus:ring-primary/20 h-11"
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Full Address <span className="text-red-500 text-xs">*</span>
                </Label>
                <Textarea
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  className="border-slate-300 focus:border-primary focus:ring-primary/20 min-h-25 resize-none"
                />
              </div>

              {/* State */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-primary" />
                  State / UT{" "}
                  <span className="text-xs text-slate-500">(optional)</span>
                </Label>
                <select
                  value={form.state || ""}
                  onChange={(e) => updateField("state", e.target.value)}
                  className={cn(
                    "w-full h-11 px-4 py-2.5 border border-slate-300 rounded-lg",
                    "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
                    "bg-white text-slate-900 transition-all duration-200",
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
                  Opening Balance
                </h3>

                <div className="space-y-5">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700">
                      Current Opening Balance
                    </Label>

                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="debit-edit"
                          name="balanceType-edit"
                          checked={form.openingBalanceType === "debit"}
                          onChange={() => setBalanceType("debit")}
                          className="h-4 w-4 text-primary border-slate-300 focus:ring-primary"
                        />
                        <Label
                          htmlFor="debit-edit"
                          className="text-sm text-slate-700 cursor-pointer"
                        >
                          Debit
                        </Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="credit-edit"
                          name="balanceType-edit"
                          checked={form.openingBalanceType === "credit"}
                          onChange={() => setBalanceType("credit")}
                          className="h-4 w-4 text-primary border-slate-300 focus:ring-primary"
                        />
                        <Label
                          htmlFor="credit-edit"
                          className="text-sm text-slate-700 cursor-pointer"
                        >
                          Credit
                        </Label>
                      </div>
                    </div>

                    <div className="flex items-center border border-slate-300 rounded-lg focus-within:border-primary focus-within:ring-primary/20 overflow-hidden h-11">
                      <span className="px-4 text-slate-600 font-medium">₹</span>
                      <Input
                        type="number"
                        placeholder={
                          form.openingBalanceType === "debit"
                            ? "Enter Debit Amount"
                            : "Enter Credit Amount"
                        }
                        value={form.openingBalanceAmount}
                        onChange={(e) =>
                          updateField("openingBalanceAmount", e.target.value)
                        }
                        className="border-0 focus:ring-0 h-full rounded-none bg-transparent"
                        min="0"
                        step="0.01"
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
                          ? "Customer pays you"
                          : "You pay the customer"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-3 pt-6 border-t border-slate-200 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-slate-300 hover:bg-slate-50 min-w-27.5"
                  disabled={isLoading}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "min-w-35",
                    isLoading && "opacity-70 cursor-not-allowed",
                  )}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <AlertCircle className="h-6 w-6 text-red-600" />
              Are you absolutely sure?
            </AlertDialogTitle>

            <AlertDialogDescription className="text-slate-600 space-y-2 pt-2">
              <span className="block">
                This will permanently delete customer{" "}
                <span className="font-semibold text-slate-900">
                  {customerToDelete?.name}
                </span>
                .
              </span>

              <span className="flex items-center gap-1.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                This action cannot be undone.
              </span>
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
              onClick={handleDeleteCustomer}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white min-w-35"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Customer
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
