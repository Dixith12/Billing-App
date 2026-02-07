"use client";

import { useState, useMemo, useEffect } from "react";
import {
  addPurchase,
  updatePurchase,
  getPurchaseById,
  recordPurchasePayment,
} from "@/lib/firebase/purchase";
import { useVendors } from "@/hooks/use-vendors";
import { toast } from "sonner";
import { addVendor } from "@/lib/firebase/vendors";
import { useGst } from "@/hooks/use-gst";

/* ---------------- TYPES ---------------- */

export interface PurchaseItem {
  id: string;
  name: string;
  quantity: number;
  measurementType: "height_width" | "kg" | "unit";

  height?: string;
  width?: string;
  kg?: string;
  units?: string;

  pricePerHeight?: number;
  pricePerWidth?: number;
  pricePerKg?: number;
  pricePerUnit?: number;
  discount: string;
  discountType: "%" | "₹";

  grossTotal: number;
  netTotal: number;
}

/* ---------------- HOOK ---------------- */

export function useCreatePurchase(options?: {
  isEditMode?: boolean;
  editId?: string | null;
}) {
  /* -------- Vendors -------- */
  const { vendors, loading: vendorsLoading } = useVendors();
  const { cgst: gstCgst, sgst: gstSgst } = useGst();


  const [partySearch, setPartySearch] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);
  const [billingAddress, setBillingAddress] = useState("");

  const [isAddPartyOpen, setIsAddPartyOpen] = useState(false);

  const isEditMode = options?.isEditMode ?? false;
  const editId = options?.editId ?? null;

  /* -------- Payment -------- */
  const [selectedPurchase, setSelectedPurchase] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMode, setPaymentMode] = useState<
    "cash" | "upi" | "card" | undefined
  >(undefined);

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

  useEffect(() => {
    if (selectedVendor?.address) {
      setBillingAddress(selectedVendor.address);
    } else {
      setBillingAddress("");
    }
  }, [selectedVendor]);

  const filteredVendors = useMemo(() => {
    const search = partySearch.toLowerCase();
    return vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(search) ||
        (v.gstin && v.gstin.toLowerCase().includes(search)) ||
        v.phone.includes(search),
    );
  }, [vendors, partySearch]);

  /* -------- Date -------- */
  const [purchaseDate, setPurchaseDate] = useState<Date>(new Date());

  /* -------- Items -------- */
  const [items, setItems] = useState<PurchaseItem[]>([]);

  /* -------- Add Custom Item -------- */
  const addCustomPurchaseItem = (data: {
    name: string;
    measurementType: "height_width" | "kg" | "unit";
    height?: number;
    width?: number;
    kg?: number;
    units?: number;
    pricePerHeight?: number;
    pricePerWidth?: number;
    pricePerKg?: number;
    pricePerUnit?: number;
  }) => {
    let base = 0;

    switch (data.measurementType) {
      case "height_width":
        base =
          (data.pricePerHeight ?? 0) * (data.height ?? 1) +
          (data.pricePerWidth ?? 0) * (data.width ?? 1);
        break;
      case "kg":
        base = (data.pricePerKg ?? 0) * (data.kg ?? 1);
        break;
      case "unit":
        base = (data.pricePerUnit ?? 0) * (data.units ?? 1);
        break;
    }

    const item: PurchaseItem = {
      id: crypto.randomUUID(),
      name: data.name.trim() || "Unnamed Item",
      quantity: 1,
      measurementType: data.measurementType,
      height: data.height?.toString(),
      width: data.width?.toString(),
      kg: data.kg?.toString(),
      units: data.units?.toString(),
      pricePerHeight: data.pricePerHeight,
      pricePerWidth: data.pricePerWidth,
      pricePerKg: data.pricePerKg,
      pricePerUnit: data.pricePerUnit,
      discount: "0",
      discountType: "%",
      grossTotal: base,
      netTotal: base,
    };

    setItems((prev) => [...prev, item]);
    toast.success("Item added to purchase");
  };

  const addNewParty = async () => {
    if (!newParty.name.trim()) {
      toast.error("Vendor name is required");
      return false;
    }

    if (!newParty.phone.trim()) {
      toast.error("Vendor phone is required");
      return false;
    }

    try {
      const savedVendor = await addVendor({
        name: newParty.name.trim(),
        phone: newParty.phone.trim(),
        gstin: newParty.gstin || undefined,
        address: newParty.address || "",
        state: newParty.state || "",
        companyName: newParty.companyName || undefined,
      });

      // auto-select the newly created vendor
      setSelectedVendor(savedVendor);

      // reset form
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
      toast.success("Vendor added successfully");
      return true;
    } catch (err: any) {
      toast.error("Failed to add vendor");
      return false;
    }
  };

  //Record Payment

  const savePayment = async () => {
    if (!selectedPurchase) {
      return { success: false, error: "No purchase selected" };
    }

    const amount = Number(paymentAmount);
    if (amount <= 0) {
      return { success: false, error: "Invalid payment amount" };
    }

    if (!paymentMode) {
      return { success: false, error: "Select payment mode" };
    }

    try {
      const result = await recordPurchasePayment(selectedPurchase.id, {
        amount,
        mode: paymentMode,
      });

      toast.success("Payment recorded");

      // reset dialog state
      setPaymentAmount("");
      setPaymentMode(undefined);
      setPaymentDate("");

      return { success: true, result };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Failed to record payment",
      };
    }
  };

  /* -------- Update Item -------- */
  const updateItem = (
    id: string,
    field: keyof PurchaseItem,
    value: string | number,
  ) => {
    setItems((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        const updated = { ...p, [field]: value };

        const num = (v: any) => {
          const n = Number(v);
          return isNaN(n) ? 0 : n;
        };

        const priceH = num(updated.pricePerHeight);
        const priceW = num(updated.pricePerWidth);
        const priceKg = num(updated.pricePerKg);
        const priceUnit = num(updated.pricePerUnit);

        const height = num(updated.height);
        const width = num(updated.width);
        const kg = num(updated.kg);
        const units = num(updated.units);
        const qty = num(updated.quantity) || 1;

        let base = 0;

        switch (updated.measurementType) {
          case "height_width":
            base = height * priceH + width * priceW;
            break;
          case "kg":
            base = kg * priceKg;
            break;
          case "unit":
            base = units * priceUnit;
            break;
        }

        const gross = base * qty;
        updated.grossTotal = gross;
        updated.netTotal = gross; // 🔥 SAME AS INVOICE

        return updated;
      }),
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  function normalizeDate(date: any): Date {
    if (date instanceof Date) return date;
    if (date?.seconds) return new Date(date.seconds * 1000);
    return new Date();
  }

  /* -------- Totals -------- */
  /* -------- Totals (INVOICE STYLE) -------- */

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.grossTotal, 0),
    [items],
  );

  const totalDiscount = useMemo(() => {
    return items.reduce((sum, p) => {
      const gross = p.grossTotal;
      const disc = parseFloat(p.discount) || 0;

      if (disc <= 0) return sum;

      if (p.discountType === "%") {
        return sum + gross * (disc / 100);
      }

      return sum + disc;
    }, 0);
  }, [items]);

  const taxableAmount = subtotal - totalDiscount;

  const isKarnatakaVendor =
  selectedVendor?.state?.trim().toLowerCase() === "karnataka";

const cgst = taxableAmount * ((isKarnatakaVendor ? gstCgst : 0) / 100);
const sgst = taxableAmount * ((isKarnatakaVendor ? gstSgst : 0) / 100);
const igst = taxableAmount * ((isKarnatakaVendor ? 0 : gstCgst + gstSgst) / 100);

  const netAmount = taxableAmount + cgst + sgst + igst;

  /* -------- Save -------- */
  const savePurchase = async () => {
    if (!selectedVendor) {
      toast.error("Vendor required");
      return { success: false };
    }
    if (items.length === 0) {
      toast.error("Add at least one item");
      return { success: false };
    }
    const payload = {
      vendorId: selectedVendor.id,
      vendorName: selectedVendor.name,
      vendorPhone: selectedVendor.phone,
      vendorGstin: selectedVendor.gstin,
      vendorState: selectedVendor.state,
      billingAddress,

      purchaseDate:
        purchaseDate instanceof Date ? purchaseDate : new Date(purchaseDate),

      products: items.map((p) => ({
        name: p.name,
        quantity: p.quantity,
        measurementType: p.measurementType,

        height: p.height,
        width: p.width,
        kg: p.kg,
        units: p.units,

        pricePerHeight: p.pricePerHeight,
        pricePerWidth: p.pricePerWidth,
        pricePerKg: p.pricePerKg,
        pricePerUnit: p.pricePerUnit,

        discount: p.discount,
        discountType: p.discountType,

        grossTotal: p.grossTotal,
        total: p.grossTotal,
      })),

      subtotal,
      discount: totalDiscount,
      cgst,
      sgst,
      igst,
      netAmount,
    };

    if (isEditMode && editId) {
      // UPDATE EXISTING PURCHASE
      await updatePurchase(editId, payload);
      toast.success("Purchase updated");
    } else {
      // CREATE NEW PURCHASE
      await addPurchase(payload);
      toast.success("Purchase saved");
    }

    resetForm();
    return { success: true };
  };

  const resetForm = () => {
    setSelectedVendor(null);
    setPartySearch("");
    setItems([]);
    setPurchaseDate(new Date());
  };

  async function loadForEdit(id: string) {
    const doc = await getPurchaseById(id);

    if (!doc) throw new Error("Purchase not found");
    setSelectedPurchase(doc);

    // vendor
    setSelectedVendor({
      id: doc.vendorId,
      name: doc.vendorName,
      phone: doc.vendorPhone,
      gstin: doc.vendorGstin,
      state: doc.vendorState,
      address: doc.billingAddress || "",
    });

    setBillingAddress(doc.billingAddress || "");

    // date
    setPurchaseDate(normalizeDate(doc.purchaseDate));

    // items
    setItems(
      (doc.products || []).map((p: any) => {
        const qty = Number(p.quantity) || 1;

        let base = 0;
        switch (p.measurementType) {
          case "height_width":
            base =
              (Number(p.height) || 0) * (Number(p.pricePerHeight) || 0) +
              (Number(p.width) || 0) * (Number(p.pricePerWidth) || 0);
            break;

          case "kg":
            base = (Number(p.kg) || 0) * (Number(p.pricePerKg) || 0);
            break;

          case "unit":
            base = (Number(p.units) || 0) * (Number(p.pricePerUnit) || 0);
            break;
        }

        const gross = base * qty;

        const discountValue = Number(p.discount) || 0;
        const discountAmount =
          p.discountType === "%"
            ? gross * (discountValue / 100)
            : discountValue;

        const net = gross;

        return {
          id: crypto.randomUUID(),
          name: p.name,
          quantity: qty,
          measurementType: p.measurementType,

          height: p.height?.toString(),
          width: p.width?.toString(),
          kg: p.kg?.toString(),
          units: p.units?.toString(),

          pricePerHeight: Number(p.pricePerHeight) || 0,
          pricePerWidth: Number(p.pricePerWidth) || 0,
          pricePerKg: Number(p.pricePerKg) || 0,
          pricePerUnit: Number(p.pricePerUnit) || 0,

          discount: p.discount ?? "0",
          discountType: p.discountType ?? "%",

          grossTotal: gross,
          netTotal: net,
        };
      }),
    );
  }

  return {
    vendors,
    filteredVendors,
    loadingVendors: vendorsLoading,

    partySearch,
    setPartySearch,
    selectedVendor,
    setSelectedVendor,

    isAddPartyOpen,
    setIsAddPartyOpen,
    newParty,
    setNewParty,
    addNewParty,

    billingAddress,
    setBillingAddress,
    setItems,

    purchaseDate,
    setPurchaseDate,

    items,
    addCustomPurchaseItem,
    updateItem,
    removeItem,

    subtotal,
    totalDiscount,
    cgst,
    sgst,
    igst,
    netAmount,

    savePurchase,
    resetForm,
    loadForEdit,
  };
}
