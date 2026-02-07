"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Plus,
  X,
  UserPlus,
  CheckCircle2,
  MapPin,
  Phone,
  FileText,
  Building2,
  Briefcase,
  Landmark,
  IndianRupee,
  AlertCircle,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Customer } from "@/lib/firebase/customers";
import { useState } from "react";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

interface PartySelectorProps {
  mode: "customer" | "vendor";
  partySearch: string;
  setPartySearch: (v: string) => void;
  filteredParties: Customer[];
  selectedParty: Customer | null;
  setSelectedParty: (c: Customer | null) => void;
  isAddPartyOpen: boolean;
  setIsAddPartyOpen: (v: boolean) => void;
  newParty: {
    name: string;
    companyName: string;
    gstin: string;
    phone: string;
    address: string;
    state: string;
    openingBalanceType: "debit" | "credit";
    openingBalanceAmount: string;
  };
  setNewParty: (v: any) => void;
  addNewParty: () => Promise<boolean>;
}

export function CustomerSelector(props: PartySelectorProps) {
  const {
    mode,
    partySearch,
    setPartySearch,
    filteredParties,
    selectedParty,
    setSelectedParty,
    isAddPartyOpen,
    setIsAddPartyOpen,
    newParty,
    setNewParty,
    addNewParty,
  } = props;

  const isVendorMode = mode === "vendor";

  const title = isVendorMode ? "Vendor Details" : "Customer Details";
  const searchPlaceholder = isVendorMode
    ? "Search vendors by name, phone or GSTIN..."
    : "Search customers by name, phone or GSTIN...";

  const addButtonText = `Add New ${isVendorMode ? "Vendor" : "Customer"}`;
  const sheetTitleText = `Add New ${isVendorMode ? "Vendor" : "Customer"}`;

  const nameLabel = `${isVendorMode ? "Vendor" : "Customer"} Name`;
  const namePlaceholder = isVendorMode
    ? "Vendor / Supplier name"
    : "Full name or contact name";

  const [formError, setFormError] = useState<string | null>(null);

  const validateForm = () => {
    if (!newParty.name.trim()) return `${nameLabel} is required`;
    if (!newParty.phone.trim()) return "Phone Number is required";
    if (!newParty.address.trim()) return "Address is required";
    return null;
  };

  const handleSave = async () => {
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }
    setFormError(null);
    const success = await addNewParty();
    if (success) {
      setIsAddPartyOpen(false);
    }
  };

  return (
    <section className="space-y-6 bg-white border border-slate-200 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-slate-800">{title}</h2>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-slate-300 hover:bg-slate-50"
          onClick={() => setIsAddPartyOpen(true)}
        >
          <Plus className="h-4 w-4" />
          {addButtonText}
        </Button>
      </div>

      {/* Search & Selected Party Display */}
      <div className="space-y-4">
        <div className="relative">
          <div className="flex items-center">
            <Search className="absolute left-3 h-5 w-5 text-slate-400" />
            <Input
              placeholder={searchPlaceholder}
              className="pl-10 border-slate-300 focus:border-primary focus:ring-primary/20 bg-white"
              value={partySearch}
              onChange={(e) => setPartySearch(e.target.value)}
            />
          </div>

          {filteredParties.length > 0 && partySearch.trim().length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl max-h-64 overflow-auto">
              {filteredParties.map((p) => (
                <button
                  key={p.id}
                  className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex flex-col border-b border-slate-100 last:border-none"
                  onClick={() => {
                    setSelectedParty(p);
                    setPartySearch("");
                  }}
                >
                  <span className="font-medium text-slate-900">{p.name}</span>
                  <span className="text-sm text-slate-500">
                    {p.phone && <span>{p.phone} • </span>}
                    GSTIN: {p.gstin || "—"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedParty && (
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                {isVendorMode ? (
                  <Building2 className="h-4 w-4 text-primary" />
                ) : (
                  <UserPlus className="h-4 w-4 text-primary" />
                )}
              </div>
              <div>
                <div className="font-medium text-slate-900">
                  {selectedParty.name}
                </div>
                <div className="text-xs text-slate-600">
                  {selectedParty.phone || "No phone"} • GSTIN:{" "}
                  {selectedParty.gstin || "—"}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedParty(null)}
              className="text-slate-500 hover:text-red-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Add New Party Sheet */}
      <Sheet open={isAddPartyOpen} onOpenChange={setIsAddPartyOpen}>
        <SheetContent className="sm:max-w-lg bg-white border-slate-200 flex flex-col p-0 max-h-screen">
          {/* Header */}
          <div className="px-6 pt-6 pb-5 border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-4">
              <div>
                <SheetTitle className="font-bold text-slate-800">
                  <div className="flex justify-start items-center gap-2 w-full">
                    <div className="p-2 bg-primary rounded-md">
                      {isVendorMode ? (
                        <Building2 className="h-4 w-4 text-white" />
                      ) : (
                        <UserPlus className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span>{sheetTitleText}</span>
                  </div>
                </SheetTitle>
                <p className="text-sm text-slate-500 mt-2">
                  Enter {isVendorMode ? "vendor" : "customer"} details below
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-slate-300">
            <div className="space-y-6">
              {/* Error */}
              {formError && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-800">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                  <span className="text-sm font-medium">{formError}</span>
                </div>
              )}

              {/* Name */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  {isVendorMode ? (
                    <Building2 className="h-4 w-4 text-primary" />
                  ) : (
                    <UserPlus className="h-4 w-4 text-primary" />
                  )}
                  {nameLabel} <span className="text-red-500 text-xs">*</span>
                </Label>
                <Input
                  value={newParty.name}
                  onChange={(e) =>
                    setNewParty({ ...newParty, name: e.target.value })
                  }
                  placeholder={namePlaceholder}
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
                  value={newParty.companyName}
                  onChange={(e) =>
                    setNewParty({ ...newParty, companyName: e.target.value })
                  }
                  placeholder="Company / Firm name"
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
                  value={newParty.phone}
                  onChange={(e) =>
                    setNewParty({ ...newParty, phone: e.target.value })
                  }
                  placeholder="10-digit mobile / landline"
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
                  value={newParty.gstin}
                  onChange={(e) =>
                    setNewParty({ ...newParty, gstin: e.target.value })
                  }
                  placeholder="15-digit GST number (if applicable)"
                  className="border-slate-300 focus:border-primary focus:ring-primary/20 h-11"
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Address <span className="text-red-500 text-xs">*</span>
                </Label>
                <Textarea
                  value={newParty.address}
                  onChange={(e) =>
                    setNewParty({ ...newParty, address: e.target.value })
                  }
                  placeholder="Street, area, city, PIN code..."
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
                <Select
                  value={newParty.state}
                  onValueChange={(val) =>
                    setNewParty({ ...newParty, state: val })
                  }
                >
                  <SelectTrigger className="border-slate-300 focus:border-primary h-11">
                    <SelectValue placeholder="Select state / union territory" />
                  </SelectTrigger>
                  <SelectContent className="bg-white max-h-60">
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Opening Balance */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 space-y-5">
                <h3 className="font-semibold text-slate-800">
                  Opening Balance
                </h3>

                <div className="flex items-center gap-10">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      id="debit"
                      name="balanceType"
                      checked={newParty.openingBalanceType === "debit"}
                      onChange={() =>
                        setNewParty({
                          ...newParty,
                          openingBalanceType: "debit",
                        })
                      }
                      className="h-5 w-5 text-primary focus:ring-primary border-slate-300"
                    />
                    <label htmlFor="debit" className="text-sm cursor-pointer">
                      Debit
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      id="credit"
                      name="balanceType"
                      checked={newParty.openingBalanceType === "credit"}
                      onChange={() =>
                        setNewParty({
                          ...newParty,
                          openingBalanceType: "credit",
                        })
                      }
                      className="h-5 w-5 text-primary focus:ring-primary border-slate-300"
                    />
                    <label htmlFor="credit" className="text-sm cursor-pointer">
                      Credit
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center border border-slate-300 rounded-lg h-11 overflow-hidden focus-within:border-primary focus-within:ring-primary/20">
                    <span className="px-4 text-slate-600 font-medium bg-slate-100">
                      ₹
                    </span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newParty.openingBalanceAmount}
                      onChange={(e) =>
                        setNewParty({
                          ...newParty,
                          openingBalanceAmount: e.target.value,
                        })
                      }
                      className="border-0 focus:ring-0 h-full rounded-none bg-transparent px-3"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {newParty.openingBalanceAmount &&
                    Number(newParty.openingBalanceAmount) > 0 && (
                      <div
                        className={cn(
                          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
                          newParty.openingBalanceType === "debit"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-green-50 text-green-700 border border-green-200",
                        )}
                      >
                        <IndianRupee className="h-3.5 w-3.5" />
                        {isVendorMode
                          ? newParty.openingBalanceType === "debit"
                            ? "Vendor pays you"
                            : "You pay the vendor"
                          : newParty.openingBalanceType === "debit"
                            ? "Customer owes you"
                            : "You owe customer"}
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-slate-200 shrink-0 bg-white">
            <SheetFooter className="gap-3 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsAddPartyOpen(false)}
                className="border-slate-300 hover:bg-slate-50 min-w-25"
              >
                Cancel
              </Button>
              <Button onClick={handleSave} className="min-w-35">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Save {isVendorMode ? "Vendor" : "Customer"}
              </Button>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}
