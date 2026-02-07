"use client";

import { useState, useEffect, useMemo } from "react";
import { useApp } from "@/lib/app-context";
import {
  addQuotation,
  getQuotationById,
  updateQuotation,
} from "@/lib/firebase/quotations";
import { useCustomers } from "@/hooks/use-customers";
import type { Customer } from "@/lib/firebase/customers";
import type { InventoryItem } from "@/lib/types";
import { useGst } from "@/hooks/use-gst";
import { toast } from "sonner";

/* ---------------- TYPES ---------------- */

export interface QuotationProduct {
  id: string;
  name: string;
  quantity: number;
  hsncode?: string;

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

/* ---------------- HOOK ---------------- */

export function useCreateQuotation() {
  const { inventoryItems } = useApp();
  const { cgst: gstCgst, sgst: gstSgst } = useGst();

  /* -------- Date -------- */
  const [quotationDate, setQuotationDate] = useState<Date>(new Date());

  /* -------- Customer -------- */
  const { customers, addCustomer, loading: customersLoading } = useCustomers();

  const [partySearch, setPartySearch] = useState("");
  const [selectedParty, setSelectedParty] = useState<Customer | null>(null);
  const [billingAddress, setBillingAddress] = useState("");

  const [isAddPartyOpen, setIsAddPartyOpen] = useState(false);
  const [editingQuotationId, setEditingQuotationId] = useState<string | null>(
    null,
  );

  const [newParty, setNewParty] = useState({
    name: "",
    phone: "",
    address: "",
    state: "",
    gstin: "",
  });

  useEffect(() => {
    if (selectedParty?.address) {
      setBillingAddress(selectedParty.address);
    } else {
      setBillingAddress("");
    }
  }, [selectedParty]);

  const filteredCustomers = useMemo(() => {
    const search = partySearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.phone.includes(search) ||
        (c.gstin && c.gstin.toLowerCase().includes(search)),
    );
  }, [customers, partySearch]);

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
      const saved = await addCustomer({
        name: newParty.name.trim(),
        phone: newParty.phone.trim(),
        address: newParty.address.trim(),
        state: newParty.state.trim(),
        ...(newParty.gstin && { gstin: newParty.gstin }),
      });

      setSelectedParty(saved);
      setBillingAddress(saved.address || "");
      setIsAddPartyOpen(false);

      setNewParty({
        name: "",
        phone: "",
        address: "",
        state: "",
        gstin: "",
      });

      toast.success("Customer added");
      return true;
    } catch (err: any) {
      toast.error("Failed to add customer");
      return false;
    }
  };

  /* -------- Inventory -------- */
  const [productSearch, setProductSearch] = useState("");
  const filteredInventory = useMemo(() => {
    const search = productSearch.toLowerCase();
    return inventoryItems.filter((i) => i.name.toLowerCase().includes(search));
  }, [inventoryItems, productSearch]);

  /* -------- Products -------- */
  const [products, setProducts] = useState<QuotationProduct[]>([]);

  const addProductToQuotation = (item: InventoryItem) => {
    let base = 0;

    switch (item.measurementType) {
      case "height_width":
        base =
          (item.pricePerHeight ?? 0) * (item.height ?? 1) +
          (item.pricePerWidth ?? 0) * (item.width ?? 1);
        break;
      case "kg":
        base = item.pricePerKg ?? 0;
        break;
      case "unit":
        base = item.pricePerUnit ?? 0;
        break;
    }

    setProducts((prev): QuotationProduct[] => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: item.name,

        // FIX 1: remove null explicitly
        hsncode: item.hsnCode ?? undefined,

        quantity: 1,

        // FIX 2: hard narrow measurementType
        measurementType: item.measurementType as "height_width" | "kg" | "unit",

        height:
          item.measurementType === "height_width"
            ? item.height?.toString()
            : undefined,
        width:
          item.measurementType === "height_width"
            ? item.width?.toString()
            : undefined,
        kg: item.measurementType === "kg" ? "1" : undefined,
        units: item.measurementType === "unit" ? "1" : undefined,

        wasteEnabled: false,
        wasteHeight: undefined,
        wasteWidth: undefined,
        wasteKg: undefined,
        wasteUnits: undefined,
        wasteAmount: undefined,

        discount: "0",
        discountType: "%",

        grossTotal: base,
        netTotal: base,
      },
    ]);

    setProductSearch("");
  };

  const updateProduct = (
    id: string,
    field: keyof QuotationProduct,
    value: string | number | boolean,
  ) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        const updated: QuotationProduct = {
          ...p,
          [field]: value,
        };

        // auto-clear waste
        if (field === "wasteEnabled" && !value) {
          updated.wasteHeight = undefined;
          updated.wasteWidth = undefined;
          updated.wasteKg = undefined;
          updated.wasteUnits = undefined;
          updated.wasteAmount = undefined;
        }

        const inv = inventoryItems.find((i) => i.name === updated.name);
        if (!inv) return updated;

        let base = 0;
        switch (updated.measurementType) {
          case "height_width":
            base =
              ((Number(updated.height) || 0) * (inv.pricePerHeight ?? 0) +
                (Number(updated.width) || 0) * (inv.pricePerWidth ?? 0)) *
              (updated.quantity || 1);
            break;

          case "kg":
            base =
              (Number(updated.kg) || 0) *
              (inv.pricePerKg ?? 0) *
              (updated.quantity || 1);
            break;

          case "unit":
            base =
              (Number(updated.units) || 0) *
              (inv.pricePerUnit ?? 0) *
              (updated.quantity || 1);
            break;
        }

        let waste = 0;

        if (updated.wasteEnabled) {
          // USER MANUALLY EDITED WASTE AMOUNT → RESPECT IT
          if (field === "wasteAmount") {
            waste = Number(value) || 0;
            updated.wasteAmount = waste;
          }
          // AUTO CALCULATE FROM MEASUREMENTS
          else {
            switch (updated.measurementType) {
              case "height_width":
                waste =
                  ((Number(updated.wasteHeight) || 0) *
                    (inv.pricePerHeight ?? 0) +
                    (Number(updated.wasteWidth) || 0) *
                      (inv.pricePerWidth ?? 0)) *
                  (updated.quantity || 1);
                break;

              case "kg":
                waste =
                  (Number(updated.wasteKg) || 0) *
                  (inv.pricePerKg ?? 0) *
                  (updated.quantity || 1);
                break;

              case "unit":
                waste =
                  (Number(updated.wasteUnits) || 0) *
                  (inv.pricePerUnit ?? 0) *
                  (updated.quantity || 1);
                break;
            }

            updated.wasteAmount = waste;
          }
        }

        updated.grossTotal = base + waste;
        updated.netTotal = updated.grossTotal;

        return updated;
      }),
    );
  };

  const removeProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  /* -------- Totals -------- */
  const subtotal = useMemo(
    () => products.reduce((sum, p) => sum + p.grossTotal, 0),
    [products],
  );

  const totalGross = subtotal;

  const discountTotal = useMemo(() => {
    return products.reduce((sum, p) => {
      const d = parseFloat(p.discount) || 0;
      if (p.discountType === "%") {
        return sum + p.grossTotal * (d / 100);
      }
      return sum + d;
    }, 0);
  }, [products]);

  const taxableAmount = subtotal - discountTotal;

  const isKarnataka = selectedParty?.state?.toLowerCase() === "karnataka";

  const cgst = taxableAmount * ((isKarnataka ? gstCgst : 0) / 100);
  const sgst = taxableAmount * ((isKarnataka ? gstSgst : 0) / 100);
  const igst = taxableAmount * ((isKarnataka ? 0 : gstCgst + gstSgst) / 100);

  const netAmount = taxableAmount + cgst + sgst + igst;

  /* -------- Save -------- */
  const saveQuotation = async () => {
    if (!selectedParty) {
      toast.error("Select customer");
      return { success: false };
    }

    if (products.length === 0) {
      toast.error("Add at least one product");
      return { success: false };
    }

    const payload = {
      customerId: selectedParty.id,
      customerName: selectedParty.name,
      customerPhone: selectedParty.phone,
      customerGstin: selectedParty.gstin,
      placeOfSupply: selectedParty.state,
      billingAddress,
      quotationDate,
      products: products.map((p) => ({
        name: p.name,
        hsnCode: p.hsncode,
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
      discount: discountTotal,
      cgst,
      sgst,
      igst,
      netAmount,
    };

    try {
      if (editingQuotationId) {
        // EDIT MODE
        await updateQuotation(editingQuotationId, payload);
        toast.success("Quotation updated successfully");
      } else {
        // CREATE MODE
        await addQuotation(payload);
        toast.success("Quotation created successfully");
      }

      // IMPORTANT: reset edit mode
      setEditingQuotationId(null);
      resetForm();

      return { success: true };
    } catch (err: any) {
      toast.error("Failed to save quotation");
      return { success: false };
    }
  };

  const resetForm = () => {
    setSelectedParty(null);
    setProducts([]);
    setPartySearch("");
    setProductSearch("");
    setQuotationDate(new Date());
    setEditingQuotationId(null);
  };

  async function loadForEdit(id: string) {
    const doc = await getQuotationById(id);

    if (!doc) {
      throw new Error("Quotation not found");
    }

    setEditingQuotationId(id);

    setSelectedParty({
      id: doc.customerId,
      name: doc.customerName,
      phone: doc.customerPhone,
      gstin: doc.customerGstin,
      address: doc.billingAddress,
      state: doc.placeOfSupply,
    });

    setBillingAddress(doc.billingAddress);
    setQuotationDate(
      doc.quotationDate instanceof Date ? doc.quotationDate : new Date(),
    );

    setProducts(
      doc.products.map((p: any) => ({
        id: crypto.randomUUID(),
        name: p.name,
        quantity: p.quantity,
        measurementType: p.measurementType,
        height: p.height,
        width: p.width,
        kg: p.kg,
        units: p.units,
        wasteEnabled: p.wasteEnabled ?? false,
        wasteHeight: p.wasteHeight,
        wasteWidth: p.wasteWidth,
        wasteKg: p.wasteKg,
        wasteUnits: p.wasteUnits,
        wasteAmount: p.wasteAmount,
        discount: p.discount ?? "0",
        discountType: p.discountType ?? "%",
        grossTotal: p.grossTotal,
        netTotal: p.total,
      })),
    );
  }

  return {
    loadingCustomers: customersLoading,

    partySearch,
    setPartySearch,
    selectedParty,
    setSelectedParty,
    filteredCustomers,

    isAddPartyOpen,
    setIsAddPartyOpen,
    newParty,
    setNewParty,
    addNewParty,

    billingAddress,
    setBillingAddress,

    productSearch,
    setProductSearch,
    filteredInventory,

    products,
    addProductToQuotation,
    updateProduct,
    removeProduct,

    quotationDate,
    setQuotationDate,

    subtotal,
    totalGross,
    totalDiscount: discountTotal,
    cgst,
    sgst,
    igst,
    netAmount,

    saveQuotation,
    resetForm,
    loadForEdit,
  };
}
