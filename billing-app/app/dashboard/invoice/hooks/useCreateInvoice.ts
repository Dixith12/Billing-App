"use client";

import { useState, useEffect, useMemo } from "react";
import { useApp } from "@/lib/app-context";
import { addInvoice } from "@/lib/firebase/invoices";
import { useCustomers } from "@/app/dashboard/customer/hooks/useCustomers";
import type { Customer } from "@/lib/firebase/customers";
import type { InventoryItem } from "@/lib/types";
import { useGst } from "@/app/dashboard/gst/hooks/useGst";
import { toast } from "sonner";
import { useVendors } from "@/app/dashboard/vendor/hooks/useVendors";


export interface BilledProduct {
  id: string;
  name: string;
  quantity: number;

  measurementType: "height_width" | "kg" | "unit";
  height?: string;
  width?: string;
  kg?: string;
  units?: string;

  wasteEnabled: boolean;
  wasteHeight?: string;
  wasteWidth?: string;
  wasteKg?: string;
  wasteUnits?: string;
  wasteAmount?: number;

  discount: string;
  discountType: "%" | "₹";

  grossTotal: number;
  netTotal: number;
}

export function useCreateInvoice() {
  const { inventoryItems } = useApp();
  const { cgst: gstCgst, sgst: gstSgst } = useGst();

  // ── Date states (neutral for all modes) ────────────────────────────────
  const [documentDate, setDocumentDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30); // default 30 days later
    return date;
  });

  // ── Party (Customer/Vendor) ────────────────────────────────────────────
const { customers, addCustomer, loading: customersLoading } = useCustomers();
const { vendors, addVendor, loading: vendorsLoading } = useVendors();
  const [partySearch, setPartySearch] = useState("");
  const [selectedParty, setSelectedParty] = useState<Customer | null>(null);
  const [isAddPartyOpen, setIsAddPartyOpen] = useState(false);
  const [newParty, setNewParty] = useState({
    name: "",
    companyName: "",
    gstin: "",
    phone: "",
    address: "",
    state: "",
    openingBalanceType: "debit" as "debit" | "credit",
    openingBalanceAmount: "",
  });

  // ── Products & Billing ─────────────────────────────────────────────────
  const [productSearch, setProductSearch] = useState("");
  const [billedProducts, setBilledProducts] = useState<BilledProduct[]>([]);
  const [billingAddress, setBillingAddress] = useState("");

  useEffect(() => {
    if (selectedParty?.address) {
      setBillingAddress(selectedParty.address);
    } else if (selectedParty === null) {
      setBillingAddress("");
    }
  }, [selectedParty]);

  const addNewParty = async () => {
    if (
      !newParty.name.trim() ||
      !newParty.phone.trim() ||
      !newParty.address.trim() ||
      !newParty.state.trim()
    ) {
      toast.error("Required fields missing");
      return false;
    }

    try {
      const amount = Number(newParty.openingBalanceAmount) || 0;
      let openingBalance: number | undefined = undefined;

      if (amount > 0) {
        openingBalance =
          newParty.openingBalanceType === "debit" ? amount : -amount;
      }

      const partyData: Omit<Customer, "id" | "createdAt"> = {
        name: newParty.name.trim(),
        phone: newParty.phone.trim(),
        address: newParty.address.trim(),
        state: newParty.state.trim(),
        openingBalance,
        ...(newParty.companyName.trim() && {
          companyName: newParty.companyName.trim(),
        }),
        ...(newParty.gstin.trim() && {
          gstin: newParty.gstin.trim(),
        }),
      };

      const saved = await addCustomer(partyData);

      setSelectedParty(saved);
      setBillingAddress(saved.address || "");

      setNewParty({
        name: "",
        companyName: "",
        gstin: "",
        phone: "",
        address: "",
        state: "",
        openingBalanceType: "debit",
        openingBalanceAmount: "",
      });

      setIsAddPartyOpen(false);

      toast.success("Party added successfully");
      return true;
    } catch (err: any) {
      console.error("Failed to add party:", err);
      toast.error("Could not add party", { description: err.message });
      return false;
    }
  };

const filteredCustomers = useMemo(() => {
  const search = partySearch.toLowerCase();
  return customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search) ||
      (c.gstin && c.gstin.toLowerCase().includes(search)) ||
      c.phone.includes(search),
  );
}, [customers, partySearch]);

const filteredVendors = useMemo(() => {
  const search = partySearch.toLowerCase();
  return vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(search) ||
      (v.gstin && v.gstin.toLowerCase().includes(search)) ||
      v.phone.includes(search),
  );
}, [vendors, partySearch]);


  const filteredInventory = useMemo(() => {
    const search = productSearch.toLowerCase();
    return inventoryItems.filter((item) =>
      item.name.toLowerCase().includes(search),
    );
  }, [inventoryItems, productSearch]);

  // ── Billed Products Actions ────────────────────────────────────────────
  const addProductToBill = (item: InventoryItem) => {
    let basePrice = 0;

    switch (item.measurementType) {
      case "height_width":
        basePrice =
          (item.pricePerHeight ?? 0) * (item.height ?? 1) +
          (item.pricePerWidth ?? 0) * (item.width ?? 1);
        break;
      case "kg":
        basePrice = item.pricePerKg ?? 0;
        break;
      case "unit":
        basePrice = item.pricePerUnit ?? 0;
        break;
      default:
        basePrice = 0;
    }

    const newProduct: BilledProduct = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      name: item.name,
      quantity: 1,
      measurementType: item.measurementType ?? "height_width",
      height:
        item.measurementType === "height_width"
          ? (item.height ?? 1).toString()
          : undefined,
      width:
        item.measurementType === "height_width"
          ? (item.width ?? 1).toString()
          : undefined,
      kg: item.measurementType === "kg" ? "1" : undefined,
      units: item.measurementType === "unit" ? "1" : undefined,
      wasteEnabled: false,
      wasteAmount: undefined,
      discount: "0",
      discountType: "%",
      grossTotal: basePrice * 1,
      netTotal: basePrice * 1,
    };

    setBilledProducts((prev) => [...prev, newProduct]);
    setProductSearch("");
  };

  const updateBilledProduct = (
    id: string,
    field: keyof BilledProduct,
    value: string | number | boolean,
  ) => {
    setBilledProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        let updated: BilledProduct = { ...p, [field]: value };

        if (["height", "width", "kg", "units", "quantity"].includes(field)) {
          const base = calculateProductBase(updated, inventoryItems);
          const waste = updated.wasteEnabled
            ? Number(updated.wasteAmount || 0)
            : 0;

          updated.grossTotal = base + waste;
          updated.netTotal = updated.grossTotal;
        }

        if (["wasteHeight", "wasteWidth", "wasteKg", "wasteUnits"].includes(field)) {
          updated.wasteAmount = calculateWasteAmount(updated, inventoryItems);
          const base = calculateProductBase(updated, inventoryItems);
          updated.grossTotal = base + (updated.wasteAmount || 0);
          updated.netTotal = updated.grossTotal;
        }

        if (field === "wasteAmount") {
          const base = calculateProductBase(updated, inventoryItems);
          updated.grossTotal = base + (Number(value) || 0);
          updated.netTotal = updated.grossTotal;
        }

        if (field === "wasteEnabled" && !value) {
          updated.wasteHeight = undefined;
          updated.wasteWidth = undefined;
          updated.wasteKg = undefined;
          updated.wasteUnits = undefined;
          updated.wasteAmount = undefined;

          const base = calculateProductBase(updated, inventoryItems);
          updated.grossTotal = base;
          updated.netTotal = base;
        }

        return updated;
      }),
    );
  };

  function calculateProductBase(p: BilledProduct, inventory: InventoryItem[]) {
    const inv = inventory.find((i) => i.name === p.name);
    if (!inv) return 0;

    let base = 0;

    switch (p.measurementType) {
      case "height_width":
        base =
          (parseFloat(p.height || "0") || 0) * (inv.pricePerHeight ?? 0) +
          (parseFloat(p.width || "0") || 0) * (inv.pricePerWidth ?? 0);
        break;
      case "kg":
        base = (parseFloat(p.kg || "0") || 0) * (inv.pricePerKg ?? 0);
        break;
      case "unit":
        base = (parseFloat(p.units || "0") || 0) * (inv.pricePerUnit ?? 0);
        break;
    }

    return base * (p.quantity || 1);
  }

  function calculateWasteAmount(p: BilledProduct, inventory: InventoryItem[]) {
    const inv = inventory.find((i) => i.name === p.name);
    if (!inv || !p.wasteEnabled) return 0;

    switch (p.measurementType) {
      case "height_width":
        return (
          (parseFloat(p.wasteHeight || "0") || 0) * (inv.pricePerHeight ?? 0) +
          (parseFloat(p.wasteWidth || "0") || 0) * (inv.pricePerWidth ?? 0)
        );
      case "kg":
        return (parseFloat(p.wasteKg || "0") || 0) * (inv.pricePerKg ?? 0);
      case "unit":
        return (parseFloat(p.wasteUnits || "0") || 0) * (inv.pricePerUnit ?? 0);
      default:
        return 0;
    }
  }

  const removeBilledProduct = (id: string) => {
    setBilledProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // ── Calculations ───────────────────────────────────────────────────────
  const subtotal = useMemo(
    () => billedProducts.reduce((sum, p) => sum + p.netTotal, 0),
    [billedProducts],
  );

  const totalGross = useMemo(
    () => billedProducts.reduce((sum, p) => sum + p.grossTotal, 0),
    [billedProducts],
  );

  const totalDiscount = useMemo(() => {
    return billedProducts.reduce((sum, p) => {
      const gross = p.grossTotal;
      const disc = parseFloat(p.discount) || 0;

      if (disc <= 0) return sum;

      if (p.discountType === "%") {
        return sum + gross * (disc / 100);
      }

      return sum + disc;
    }, 0);
  }, [billedProducts]);

  const taxableAmount = subtotal - totalDiscount;

  const isKarnatakaParty = selectedParty?.state?.trim().toLowerCase() === "karnataka";

  const cgstRate = isKarnatakaParty ? gstCgst : 0;
  const sgstRate = isKarnatakaParty ? gstSgst : 0;
  const igstRate = isKarnatakaParty ? 0 : (gstCgst + gstSgst);

  const cgstAmount = taxableAmount * (cgstRate / 100);
  const sgstAmount = taxableAmount * (sgstRate / 100);
  const igstAmount = taxableAmount * (igstRate / 100);

  const netAmount = taxableAmount + cgstAmount + sgstAmount + igstAmount;

  // ── Save Invoice (only for invoice mode) ───────────────────────────────
  const saveInvoice = async () => {
    if (!selectedParty) return { success: false, message: "No party selected" };
    if (billedProducts.length === 0) return { success: false, message: "No products added" };

    try {
      const now = new Date();

      let finalDocumentDate = new Date(documentDate);
      const isToday =
        finalDocumentDate.getFullYear() === now.getFullYear() &&
        finalDocumentDate.getMonth() === now.getMonth() &&
        finalDocumentDate.getDate() === now.getDate();

      if (!isToday) {
        finalDocumentDate.setHours(0, 0, 0, 0);
      }

      let finalDueDate = new Date(dueDate);
      const isDueToday =
        finalDueDate.getFullYear() === now.getFullYear() &&
        finalDueDate.getMonth() === now.getMonth() &&
        finalDueDate.getDate() === now.getDate();

      if (!isDueToday) {
        finalDueDate.setHours(0, 0, 0, 0);
      }

      await addInvoice({
        customerId: selectedParty.id,
        customerName: selectedParty.name,
        customerPhone: selectedParty.phone,
        customerGstin: selectedParty.gstin ?? undefined,
        billingAddress,
        products: billedProducts.map((p) => ({
          name: p.name,
          quantity: p.quantity,
          measurementType: p.measurementType,
          height: p.height,
          width: p.width,
          kg: p.kg,
          units: p.units,
          wasteEnabled: p.wasteEnabled,
          wasteHeight: p.wasteHeight,
          wasteWidth: p.wasteWidth,
          wasteKg: p.wasteKg,
          wasteUnits: p.wasteUnits,
          wasteAmount: p.wasteAmount,
          discount: p.discount,
          discountType: p.discountType,
          total: p.netTotal,
          grossTotal: p.grossTotal,
        })),
        subtotal,
        discount: totalDiscount,
        cgst: cgstAmount,
        sgst: sgstAmount,
        igst: igstAmount,
        netAmount,
        invoiceDate: finalDocumentDate,
        dueDate: finalDueDate,
      });

      toast.success("Invoice saved successfully");
      return { success: true };
    } catch (err: any) {
      console.error("Error saving invoice:", err);
      toast.error("Failed to save invoice", { description: err.message });
      return { success: false, message: "Failed to save invoice" };
    }
  };

  const resetForm = () => {
    setSelectedParty(null);
    setBilledProducts([]);
    setBillingAddress("");
    setPartySearch("");
    setProductSearch("");
    setDocumentDate(new Date());
    setDueDate(() => {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date;
    });
  };

  const loadingParties = customersLoading || vendorsLoading;

  return {
  // Party
  parties: customers, // optional, you can remove later
  loadingParties,
  partySearch,
  setPartySearch,
  selectedParty,
  setSelectedParty,
  filteredCustomers,
  filteredVendors,

  isAddPartyOpen,
  setIsAddPartyOpen,
  newParty,
  setNewParty,
  addNewParty,
  billingAddress,
  setBillingAddress,

  // Products
  productSearch,
  setProductSearch,
  filteredInventory,
  billedProducts,
  addProductToBill,
  updateBilledProduct,
  removeBilledProduct,
  setBilledProducts,

  // Calculations
  totalGross,
  subtotal,
  totalDiscount,
  cgst: cgstAmount,
  sgst: sgstAmount,
  igst: igstAmount,
  netAmount,

  saveInvoice,
  resetForm,

  documentDate,
  setDocumentDate,
  dueDate,
  setDueDate,
};

}