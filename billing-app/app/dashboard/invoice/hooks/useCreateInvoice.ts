"use client";

import { useState, useEffect, useMemo } from "react";
import { useApp } from "@/lib/app-context";
import { addInvoice } from "@/lib/firebase/invoices";
import { addPurchase } from "@/lib/firebase/purchase"; // ← Make sure this is imported
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
  hsncode?: string;
  measurementType: "height_width" | "kg" | "unit";
  height?: string;
  width?: string;
  kg?: string;
  units?: string;

  pricePerHeight?: number;
  pricePerWidth?: number;
  pricePerKg?: number;
  pricePerUnit?: number;


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

export interface UseCreateInvoiceReturn {
  // Party
  parties: Customer[]; // ✅ ADD THIS
  loadingParties: boolean;

  partySearch: string;
  setPartySearch: React.Dispatch<React.SetStateAction<string>>;
  selectedParty: Customer | null;
  setSelectedParty: React.Dispatch<React.SetStateAction<Customer | null>>;
  filteredCustomers: Customer[];
  filteredVendors: Customer[];

  isAddPartyOpen: boolean;
  setIsAddPartyOpen: React.Dispatch<React.SetStateAction<boolean>>;
  newParty: any;
  setNewParty: React.Dispatch<React.SetStateAction<any>>;
  addNewParty: () => Promise<boolean>;
  billingAddress: string;
  setBillingAddress: React.Dispatch<React.SetStateAction<string>>;

  // Products
  productSearch: string;
  setProductSearch: React.Dispatch<React.SetStateAction<string>>;
  filteredInventory: any[];
  billedProducts: any[];
  addProductToBill: (item: any) => void;
  addCustomPurchaseItem: (data: any) => void;
  updateBilledProduct: (
    id: string,
    field: any,
    value: string | number | boolean,
  ) => void;
  removeBilledProduct: (id: string) => void;
  setBilledProducts: React.Dispatch<React.SetStateAction<any[]>>;

  // Calculations
  totalGross: number;
  subtotal: number;
  totalDiscount: number;
  cgst: number;
  sgst: number;
  igst: number;
  netAmount: number;

  // Dates
  documentDate: Date;
  setDocumentDate: React.Dispatch<React.SetStateAction<Date>>;
  dueDate: Date;
  setDueDate: React.Dispatch<React.SetStateAction<Date>>;

  // Actions
  saveDocument: () => Promise<{ success: boolean; message?: string }>;
  resetForm: () => void;

  isPurchaseMode: boolean;
}

export function useCreateInvoice(options?: {
  isPurchaseMode?: boolean;
}): UseCreateInvoiceReturn {
  const isPurchaseMode = options?.isPurchaseMode ?? false;

  const { inventoryItems } = useApp();
  const { cgst: gstCgst, sgst: gstSgst } = useGst();

  // ── Date states ────────────────────────────────────────────────────────
  const [documentDate, setDocumentDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  });

  // ── Party selection ────────────────────────────────────────────────────
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

  // ── Add new party ──────────────────────────────────────────────────────
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
        ...(newParty.gstin.trim() && { gstin: newParty.gstin.trim() }),
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
    if (isPurchaseMode) return [];
    const search = productSearch.toLowerCase();
    return inventoryItems.filter((item) =>
      item.name.toLowerCase().includes(search),
    );
  }, [inventoryItems, productSearch, isPurchaseMode]);

  const addProductToBill = (item: InventoryItem) => {
    if (isPurchaseMode) return;

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
      id:
        crypto.randomUUID() ||
        Date.now().toString() + Math.random().toString(36).slice(2),
      name: item.name,
      hsncode: item.hsnCode ?? undefined,
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
    if (!isPurchaseMode) {
      setProductSearch("");
    }
  };

  // ── Add custom item (for purchase mode) ────────────────────────────────
  const addCustomPurchaseItem = (customData: {
    name: string;
    measurementType: "height_width" | "kg" | "unit";
    height?: number;
    width?: number;
    pricePerHeight?: number;
    pricePerWidth?: number;
    kg?: number;
    pricePerKg?: number;
    units?: number;
    pricePerUnit?: number;
  }) => {
    let basePrice = 0;

    switch (customData.measurementType) {
      case "height_width":
        basePrice =
          (customData.pricePerHeight ?? 0) * (customData.height ?? 1) +
          (customData.pricePerWidth ?? 0) * (customData.width ?? 1);
        break;
      case "kg":
        basePrice = (customData.pricePerKg ?? 0) * (customData.kg ?? 1);
        break;
      case "unit":
        basePrice = (customData.pricePerUnit ?? 0) * (customData.units ?? 1);
        break;
    }

    const newProduct: BilledProduct = {
      id: crypto.randomUUID(),
      name: customData.name.trim() || "Unnamed Item",
      quantity: 1,
      measurementType: customData.measurementType,
      height:
        customData.measurementType === "height_width"
          ? String(customData.height ?? 1)
          : undefined,
      width:
        customData.measurementType === "height_width"
          ? String(customData.width ?? 1)
          : undefined,
      kg:
        customData.measurementType === "kg"
          ? String(customData.kg ?? 1)
          : undefined,
      units:
        customData.measurementType === "unit"
          ? String(customData.units ?? 1)
          : undefined,
          pricePerHeight: customData.pricePerHeight,
  pricePerWidth: customData.pricePerWidth,
  pricePerKg: customData.pricePerKg,
  pricePerUnit: customData.pricePerUnit,
      wasteEnabled: false,
      wasteHeight: undefined,
      wasteWidth: undefined,
      wasteKg: undefined,
      wasteUnits: undefined,
      wasteAmount: undefined,
      discount: "0",
      discountType: "%",
      grossTotal: basePrice,
      netTotal: basePrice,
    };

    setBilledProducts((prev) => [...prev, newProduct]);
    toast.success("Item added to purchase");
  };

  function calculateInvoiceBaseAmount(
  p: BilledProduct,
  inventoryItems: InventoryItem[],
) {
  const inv = inventoryItems.find((i) => i.name === p.name);
  if (!inv) return 0;

  let base = 0;

  switch (p.measurementType) {
    case "height_width":
      base =
        (Number(p.height) || 0) * (inv.pricePerHeight ?? 0) +
        (Number(p.width) || 0) * (inv.pricePerWidth ?? 0);
      break;

    case "kg":
      base = (Number(p.kg) || 0) * (inv.pricePerKg ?? 0);
      break;

    case "unit":
      base = (Number(p.units) || 0) * (inv.pricePerUnit ?? 0);
      break;
  }

  return base * (p.quantity || 1);
}


  function calculatePurchaseBaseAmount(p: BilledProduct) {
  let base = 0;

  switch (p.measurementType) {
    case "height_width":
      base =
        (Number(p.height) || 0) * (p.pricePerHeight || 0) +
        (Number(p.width) || 0) * (p.pricePerWidth || 0);
      break;

    case "kg":
      base = (Number(p.kg) || 0) * (p.pricePerKg || 0);
      break;

    case "unit":
      base = (Number(p.units) || 0) * (p.pricePerUnit || 0);
      break;
  }

  return base * (p.quantity || 1);
}


  function calculateWasteAmount(
    p: BilledProduct,
    inventoryItems: InventoryItem[],
  ) {
    const inv = inventoryItems.find((i) => i.name === p.name);
    if (!inv) return 0;

    let waste = 0;

    switch (p.measurementType) {
      case "height_width":
        waste =
          (parseFloat(p.wasteHeight || "0") || 0) * (inv.pricePerHeight ?? 0) +
          (parseFloat(p.wasteWidth || "0") || 0) * (inv.pricePerWidth ?? 0);
        break;

      case "kg":
        waste = (parseFloat(p.wasteKg || "0") || 0) * (inv.pricePerKg ?? 0);
        break;

      case "unit":
        waste =
          (parseFloat(p.wasteUnits || "0") || 0) * (inv.pricePerUnit ?? 0);
        break;
    }

    return waste;
  }

  const updateBilledProduct = (
    id: string,
    field: keyof BilledProduct,
    value: string | number | boolean,
  ) => {
    setBilledProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        let updated: BilledProduct = { ...p, [field]: value };

        // Auto-clear waste when disabled
        if (field === "wasteEnabled" && !value) {
          updated.wasteHeight = undefined;
          updated.wasteWidth = undefined;
          updated.wasteKg = undefined;
          updated.wasteUnits = undefined;
          updated.wasteAmount = undefined;
        }

const baseAmount = isPurchaseMode
  ? calculatePurchaseBaseAmount(updated)
  : calculateInvoiceBaseAmount(updated, inventoryItems);

        let wasteAmount = 0;

if (updated.wasteEnabled) {
  // 🟢 User is typing in Waste ₹ → respect it
  if (field === "wasteAmount") {
    wasteAmount = Number(value) || 0;
    updated.wasteAmount = wasteAmount;
  }
  // 🟢 User changed dimensions → auto calculate
  else {
    wasteAmount = calculateWasteAmount(updated, inventoryItems);
    updated.wasteAmount = wasteAmount;
  }
}


        updated.grossTotal = baseAmount + wasteAmount;
        updated.netTotal = updated.grossTotal;

        return updated;
      }),
    );
  };

  const removeBilledProduct = (id: string) => {
    setBilledProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // ── Totals ─────────────────────────────────────────────────────────────
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

  const isKarnatakaParty =
    selectedParty?.state?.trim().toLowerCase() === "karnataka";

  const cgstRate = isKarnatakaParty ? gstCgst : 0;
  const sgstRate = isKarnatakaParty ? gstSgst : 0;
  const igstRate = isKarnatakaParty ? 0 : gstCgst + gstSgst;

  const cgstAmount = taxableAmount * (cgstRate / 100);
  const sgstAmount = taxableAmount * (sgstRate / 100);
  const igstAmount = taxableAmount * (igstRate / 100);

  const netAmount = taxableAmount + cgstAmount + sgstAmount + igstAmount;

  // ── Save logic (main change here) ──────────────────────────────────────
  const saveDocument = async () => {
    if (!selectedParty) return { success: false, message: "No party selected" };
    if (billedProducts.length === 0)
      return { success: false, message: "No products added" };

    try {
      const commonData = {
        billingAddress,
        products: billedProducts.map((p) => ({
          name: p.name,
          hsnCode: p.hsncode ?? undefined,
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
      };

      if (isPurchaseMode) {
        // PURCHASE MODE
        await addPurchase({
          ...commonData,
          vendorId: selectedParty.id,
          vendorName: selectedParty.name,
          vendorPhone: selectedParty.phone,
          vendorGstin: selectedParty.gstin ?? undefined,
          vendorState: selectedParty.state?.trim(),

          purchaseDate: documentDate,
        });
        toast.success("Purchase order saved successfully");
      } else {
        // INVOICE MODE
        await addInvoice({
          ...commonData,
          customerId: selectedParty.id,
          customerName: selectedParty.name,
          customerPhone: selectedParty.phone,
          customerGstin: selectedParty.gstin ?? undefined,
          placeOfSupply: selectedParty.state?.trim() || "Karnataka",

          // ✅ ALWAYS pass clean Date objects
          invoiceDate: new Date(documentDate),
          dueDate: new Date(dueDate),
        });

        toast.success("Invoice saved successfully");
      }

      return { success: true };
    } catch (err: any) {
      console.error("Error saving document:", err);
      toast.error(`Failed to save ${isPurchaseMode ? "purchase" : "invoice"}`, {
        description: err.message,
      });
      return { success: false, message: err.message };
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
    parties: customers, // note: you might want to return vendors when isPurchaseMode
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
    addCustomPurchaseItem,
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

    saveDocument, // ← Updated name - use this in your form button
    resetForm,

    documentDate,
    setDocumentDate,
    dueDate,
    setDueDate,

    isPurchaseMode, // useful if component needs to know mode
  };
}
