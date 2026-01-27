"use client";

import { useState, useEffect, useMemo } from "react";
import { useApp } from "@/lib/app-context";
import { addInvoice } from "@/lib/firebase/invoices";
import { addCustomer, getCustomers } from "@/lib/firebase/customers";
import type { Customer } from "@/lib/firebase/customers";
import type { InventoryItem } from "@/lib/types";
import { useGst } from "@/app/dashboard/gst/hooks/useGst";

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
  wasteAmount?: number; // ← NEW: calculated/edited waste total

  discount: string;
  discountType: "%" | "₹";

  grossTotal: number; // before discount + waste added
  netTotal: number; // after discount
}

export function useCreateInvoice() {
  const { inventoryItems } = useApp();
  const { cgst: gstCgst, sgst: gstSgst } = useGst();

  // ── Customers ──────────────────────────────────────────────
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    gstin: "",
    phone: "",
    address: "",
  });

  // ── Products ───────────────────────────────────────────────
  const [productSearch, setProductSearch] = useState("");
  const [billedProducts, setBilledProducts] = useState<BilledProduct[]>([]);
  const [billingAddress, setBillingAddress] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomer?.address) {
      setBillingAddress(selectedCustomer.address);
    } else if (selectedCustomer === null) {
      setBillingAddress("");
    }
  }, [selectedCustomer]);

  const loadCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const addNewCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) return false;
    try {
      const saved = await addCustomer(newCustomer);
      setCustomers((prev) => [...prev, saved]);
      setSelectedCustomer(saved);
      setBillingAddress(saved.address || "");
      resetNewCustomer();
      setIsAddCustomerOpen(false);
      return true;
    } catch (err) {
      console.error("Error saving customer", err);
      return false;
    }
  };

  const resetNewCustomer = () =>
    setNewCustomer({ name: "", gstin: "", phone: "", address: "" });

  const filteredCustomers = useMemo(() => {
    const search = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        (c.gstin && c.gstin.toLowerCase().includes(search)) ||
        c.phone.includes(search),
    );
  }, [customers, customerSearch]);

  const filteredInventory = useMemo(() => {
    const search = productSearch.toLowerCase();
    return inventoryItems.filter((item) =>
      item.name.toLowerCase().includes(search),
    );
  }, [inventoryItems, productSearch]);

  // ── Billed Products Actions ────────────────────────────────
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

        // ── Product row changes ─────────────────────
        if (["height", "width", "kg", "units", "quantity"].includes(field)) {
          const base = calculateProductBase(updated, inventoryItems);
          const waste = updated.wasteEnabled
            ? Number(updated.wasteAmount || 0)
            : 0;

          updated.grossTotal = base + waste;
          updated.netTotal = updated.grossTotal;
        }

        // ── Waste measurement → update wasteAmount ──
        if (
          ["wasteHeight", "wasteWidth", "wasteKg", "wasteUnits"].includes(field)
        ) {
          updated.wasteAmount = calculateWasteAmount(updated, inventoryItems);

          const base = calculateProductBase(updated, inventoryItems);
          updated.grossTotal = base + (updated.wasteAmount || 0);
          updated.netTotal = updated.grossTotal;
        }

        // ── Manual waste amount edit ────────────────
        if (field === "wasteAmount") {
          const base = calculateProductBase(updated, inventoryItems);
          updated.grossTotal = base + (Number(value) || 0);
          updated.netTotal = updated.grossTotal;
        }

        // ── Waste toggle OFF ────────────────────────
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

  //chatgpt

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

  // ── Calculations ───────────────────────────────────────────
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

      // ₹ flat discount per product line
      return sum + disc;
    }, 0);
  }, [billedProducts]);

  const taxableAmount = subtotal - totalDiscount;
  const cgstAmount = taxableAmount * (gstCgst / 100);
  const sgstAmount = taxableAmount * (gstSgst / 100);
  const netAmount = taxableAmount + cgstAmount + sgstAmount;

  // ── Save to Firebase ───────────────────────────────────────
  const saveInvoice = async () => {
    if (!selectedCustomer)
      return { success: false, message: "No customer selected" };
    if (billedProducts.length === 0)
      return { success: false, message: "No products added" };

    try {
      await addInvoice({
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        customerGstin: selectedCustomer.gstin ?? undefined,
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
          total: p.netTotal, // ← send netTotal as total (what invoice expects)
          // you can also add grossTotal if you want to save it too:
          grossTotal: p.grossTotal, // optional – nice to have for future reference
        })),
        subtotal, // based on netTotals
        discount: totalDiscount,
        cgst: cgstAmount,
        sgst: sgstAmount,
        netAmount,
      });
      return { success: true };
    } catch (err) {
      console.error("Error saving invoice:", err);
      return { success: false, message: "Failed to save invoice" };
    }
  };

  const resetForm = () => {
    setSelectedCustomer(null);
    setBilledProducts([]);
    setBillingAddress("");
    setCustomerSearch("");
    setProductSearch("");
  };

  return {
    customers,
    loadingCustomers,
    customerSearch,
    setCustomerSearch,
    selectedCustomer,
    setSelectedCustomer,
    filteredCustomers,
    isAddCustomerOpen,
    setIsAddCustomerOpen,
    newCustomer,
    setNewCustomer,
    addNewCustomer,
    billingAddress,
    setBillingAddress,

    productSearch,
    setProductSearch,
    filteredInventory,
    billedProducts,
    addProductToBill,
    updateBilledProduct,
    removeBilledProduct,
    setBilledProducts,

    totalGross,
    subtotal,
    totalDiscount,
    cgst: cgstAmount,
    sgst: sgstAmount,
    netAmount,

    saveInvoice,
    resetForm,
  };
}
