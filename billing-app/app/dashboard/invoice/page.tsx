"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Loader2,
  Sparkles,
  CheckCircle2,
  Package,
  FileText,
  ReceiptIndianRupee,
  ShoppingCart,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCreateInvoice } from "./hooks/useCreateInvoice";
import { CustomerSelector } from "@/components/invoice/customerSelector";
import { ProductSearcher } from "@/components/invoice/productSearcher";
import { BilledProductsTable } from "@/components/invoice/billedProductTable";
import { InvoiceSummary } from "@/components/invoice/invoice-summary";
import { TotalsFooter } from "@/components/invoice/totalFooter";

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Invoice, InvoiceProduct } from "@/lib/firebase/invoices";
import { addQuotation } from "@/lib/firebase/quotations";
import { addPurchase, updatePurchase } from "@/lib/firebase/purchase";
import { addInvoice } from "@/lib/firebase/invoices";
import { cleanUndefined } from "@/lib/utils/invoiceUtil";
import { useApp } from "@/lib/app-context";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ── NEW: Import the purchase-specific modal
import { CreatePurchaseItemModal } from "@/components/purchase/createPurchaseItemModel";

function InvoiceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("edit");
  const isEditMode = !!editId;
  const type = searchParams.get("type") || "invoice";
  const isQuotationMode = type === "quotation";
  const isPurchaseMode = type === "purchase";
  const isInvoiceMode = !isQuotationMode && !isPurchaseMode;
  const enableWaste = !isPurchaseMode;
  const { inventoryItems } = useApp();

  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // NEW: Control the "Create Item" modal in purchase mode
  const [isCreateItemModalOpen, setIsCreateItemModalOpen] = useState(false);

  function safeToDate(value: any): Date | undefined {
    if (!value) return undefined;

    // Firestore Timestamp
    if (typeof value.toDate === "function") {
      const d = value.toDate();
      return isNaN(d.getTime()) ? undefined : d;
    }

    // Firestore { seconds, nanoseconds }
    if (typeof value.seconds === "number") {
      const d = new Date(value.seconds * 1000);
      return isNaN(d.getTime()) ? undefined : d;
    }

    // JS Date
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? undefined : value;
    }

    return undefined;
  }

  const {
    partySearch,
    setPartySearch,
    filteredCustomers,
    filteredVendors,
    selectedParty,
    setSelectedParty,
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
    billedProducts,
    addProductToBill,
    addCustomPurchaseItem, // ← NEW: from hook
    updateBilledProduct,
    removeBilledProduct,
    setBilledProducts,

    subtotal,
    totalDiscount,
    cgst,
    sgst,
    igst,
    netAmount,
    totalGross,

    documentDate,
    setDocumentDate,
    dueDate,
    setDueDate,

    saveDocument,
    resetForm,
  } = useCreateInvoice({ isPurchaseMode });

  useEffect(() => {
    if (!isPurchaseMode) return;

    // Force-disable waste for purchase mode
    setBilledProducts((prev) =>
      prev.map((p) =>
        p.wasteEnabled
          ? {
              ...p,
              wasteEnabled: false,
              wasteHeight: undefined,
              wasteWidth: undefined,
              wasteKg: undefined,
              wasteUnits: undefined,
              wasteAmount: undefined,
            }
          : p,
      ),
    );
  }, [isPurchaseMode, setBilledProducts]);

  const isValidForSave =
    !!selectedParty &&
    !!selectedParty.name?.trim() &&
    billedProducts.length > 0;

  // ── Load existing document in edit mode ────────────────────────────────
  useEffect(() => {
    if (!isEditMode || !editId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const collectionName = isPurchaseMode
          ? "purchases"
          : isQuotationMode
            ? "quotations"
            : "invoices";

        const ref = doc(db, collectionName, editId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setError(
            `${isPurchaseMode ? "Purchase" : isQuotationMode ? "Quotation" : "Invoice"} not found`,
          );
          return;
        }

        const data = snap.data() as any;

        setSelectedParty({
          id: data.customerId || data.vendorId || "",
          name: data.customerName || data.vendorName || "",
          phone: data.customerPhone || data.vendorPhone || "",
          gstin: data.customerGstin || data.vendorGstin || "",
          address: data.billingAddress || "",
        } as any);

        setBillingAddress(data.billingAddress || "");

        // Load document date
        const docDateField = isPurchaseMode
          ? data.purchaseDate
          : isQuotationMode
            ? data.quotationDate
            : data.invoiceDate;

        const safeDocDate = safeToDate(docDateField);
        if (safeDocDate) {
          setDocumentDate(safeDocDate);
        }

        const safeDueDate = safeToDate(data.dueDate);
        if (safeDueDate) {
          setDueDate(safeDueDate);
        }

        const formProducts = (data.products || []).map((p: InvoiceProduct) => ({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: p.name,
          quantity: p.quantity,
          measurementType: p.measurementType ?? "height_width",
          height: p.height ?? undefined,
          width: p.width ?? undefined,
          kg: p.kg ?? undefined,
          units: p.units ?? undefined,
          wasteEnabled: p.wasteEnabled ?? false,
          wasteHeight: p.wasteHeight ?? undefined,
          wasteWidth: p.wasteWidth ?? undefined,
          wasteKg: p.wasteKg ?? undefined,
          wasteUnits: p.wasteUnits ?? undefined,
          discount: p.discount ?? "0",
          discountType: p.discountType ?? "%",
          grossTotal: p.grossTotal ?? p.total ?? 0,
          netTotal: p.total ?? 0,
        }));

        setBilledProducts(formProducts);
      } catch (err: any) {
        console.error("Failed to load document:", err);
        setError("Could not load data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [
    isEditMode,
    editId,
    isQuotationMode,
    isPurchaseMode,
    setSelectedParty,
    setBillingAddress,
    setBilledProducts,
  ]);

  // ── Save / Update handler (unchanged – works with custom items) ────────
  const handleSave = async () => {
  if (isSaving) return;
  setIsSaving(true);

  try {
    // ── BASIC VALIDATION ─────────────────────────────
    if (!selectedParty) {
      toast.error("Party Required", {
        description: "Please select a customer or vendor.",
      });
      return;
    }

    if (billedProducts.length === 0) {
      toast.error("No Products", {
        description: "Please add at least one product.",
      });
      return;
    }

    const partyName = selectedParty.name?.trim() || "Unnamed Party";

    // ── PRODUCTS PAYLOAD ─────────────────────────────
    const productsToSave = billedProducts.map((p) => {
      const inventoryItem = inventoryItems.find((i) => i.name === p.name);

      return cleanUndefined({
        name: p.name,
        quantity: p.quantity,
        measurementType: p.measurementType,

        ...(p.measurementType === "height_width" && {
          height: p.height,
          width: p.width,
        }),
        ...(p.measurementType === "kg" && { kg: p.kg }),
        ...(p.measurementType === "unit" && { units: p.units }),

        // ✅ ALWAYS undefined, never null
        hsnCode: inventoryItem?.hsnCode ?? undefined,

        wasteEnabled: enableWaste ? p.wasteEnabled : false,

        ...(enableWaste &&
          p.wasteEnabled && {
            wasteHeight: p.wasteHeight,
            wasteWidth: p.wasteWidth,
            wasteKg: p.wasteKg,
            wasteUnits: p.wasteUnits,
            wasteAmount: p.wasteAmount ?? 0,
          }),

        discount: p.discount,
        discountType: p.discountType,
        total: p.netTotal,
        grossTotal: p.grossTotal ?? p.netTotal,
      });
    });

    // ── SAFE DATES (NO TIMEZONE ISSUES) ──────────────
    const finalDocumentDate = new Date(
      documentDate.getFullYear(),
      documentDate.getMonth(),
      documentDate.getDate(),
      12, // noon = safe
      0,
      0,
    );

    const finalDueDate =
      isInvoiceMode && dueDate
        ? new Date(
            dueDate.getFullYear(),
            dueDate.getMonth(),
            dueDate.getDate(),
            12,
            0,
            0,
          )
        : undefined;

    // ── COMMON PAYLOAD ───────────────────────────────
    const commonPayload = cleanUndefined({
      billingAddress,
      products: productsToSave,
      subtotal,
      discount: totalDiscount,
      cgst,
      sgst,
      igst,
      netAmount,
      totalGross,
    });

    // ── EDIT MODE ────────────────────────────────────
    if (isEditMode) {
      if (!editId) throw new Error("Missing edit ID");

      const collectionName = isPurchaseMode
        ? "purchases"
        : isQuotationMode
          ? "quotations"
          : "invoices";

      const ref = doc(db, collectionName, editId);

      await updateDoc(
        ref,
        cleanUndefined({
          ...commonPayload,

          ...(isPurchaseMode && {
            vendorId: selectedParty.id,
            vendorName: partyName,
            vendorPhone: selectedParty.phone,
            vendorGstin: selectedParty.gstin,
            vendorState: selectedParty.state,
            purchaseDate: Timestamp.fromDate(finalDocumentDate),
          }),

          ...(isQuotationMode && {
            customerId: selectedParty.id,
            customerName: partyName,
            customerPhone: selectedParty.phone,
            customerGstin: selectedParty.gstin,
            placeOfSupply: selectedParty.state?.trim(),
            quotationDate: Timestamp.fromDate(finalDocumentDate),
          }),

          ...(isInvoiceMode && {
            customerId: selectedParty.id,
            customerName: partyName,
            customerPhone: selectedParty.phone,
            customerGstin: selectedParty.gstin,
            placeOfSupply: selectedParty.state?.trim() || "Karnataka",
            invoiceDate: Timestamp.fromDate(finalDocumentDate),
            ...(finalDueDate && {
              dueDate: Timestamp.fromDate(finalDueDate),
            }),
          }),

          updatedAt: serverTimestamp(),
        }),
      );

      toast.success(
        `${isPurchaseMode ? "Purchase" : isQuotationMode ? "Quotation" : "Invoice"} Updated`,
      );

      resetForm();
      router.push(
        isPurchaseMode
          ? "/dashboard/purchase"
          : isQuotationMode
            ? "/dashboard/quotation"
            : "/dashboard",
      );
      return;
    }

    // ── CREATE MODE ──────────────────────────────────
    if (isPurchaseMode) {
      await addPurchase({
        ...commonPayload,
        vendorId: selectedParty.id,
        vendorName: partyName,
        vendorPhone: selectedParty.phone,
        vendorGstin: selectedParty.gstin,
        vendorState: selectedParty.state,
        purchaseDate: finalDocumentDate,
      });

      toast.success("Purchase Created");
    } else if (isQuotationMode) {
      await addQuotation({
        ...commonPayload,
        customerId: selectedParty.id,
        customerName: partyName,
        customerPhone: selectedParty.phone,
        customerGstin: selectedParty.gstin,
        placeOfSupply: selectedParty.state?.trim(),
        quotationDate: finalDocumentDate,
      });

      toast.success("Quotation Created");
    } else {
      // ✅ INVOICE CREATE (THIS WAS MISSING BEFORE)
      await addInvoice({
        ...commonPayload,
        customerId: selectedParty.id,
        customerName: partyName,
        customerPhone: selectedParty.phone,
        customerGstin: selectedParty.gstin,
        placeOfSupply: selectedParty.state?.trim() || "Karnataka",
        invoiceDate: finalDocumentDate,
        dueDate: finalDueDate,
      });

      toast.success("Invoice Created");
    }

    resetForm();
    router.push(
      isPurchaseMode
        ? "/dashboard/purchase"
        : isQuotationMode
          ? "/dashboard/quotation"
          : "/dashboard",
    );
  } catch (err: any) {
    console.error("Save failed:", err);
    toast.error("Save Failed", {
      description: err.message || "Something went wrong.",
    });
  } finally {
    setIsSaving(false);
  }
};


  // ── Loading / Error UI ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="text-slate-600">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-red-600 text-lg font-medium">{error}</p>
        <Button
          onClick={() =>
            router.push(
              isPurchaseMode
                ? "/dashboard/purchase"
                : isQuotationMode
                  ? "/dashboard/quotation"
                  : "/dashboard",
            )
          }
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Back to{" "}
          {isPurchaseMode
            ? "Purchases"
            : isQuotationMode
              ? "Quotations"
              : "Dashboard"}
        </Button>
      </div>
    );
  }

  // ── Main UI ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-gradient-to-br from-pink-500/10 to-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative p-6 lg:p-8 space-y-10 max-w-[1400px] mx-auto">
        {/* Hero Card */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-2xl"></div>

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 lg:p-8 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur-lg opacity-40"></div>
                  <div className="relative p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                    {isPurchaseMode ? (
                      <ShoppingCart className="h-7 w-7 text-white" />
                    ) : isQuotationMode ? (
                      <FileText className="h-7 w-7 text-white" />
                    ) : (
                      <ReceiptIndianRupee className="h-7 w-7 text-white" />
                    )}
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 bg-clip-text text-transparent tracking-tight">
                    {isEditMode
                      ? isPurchaseMode
                        ? "Edit Purchase"
                        : isQuotationMode
                          ? "Edit Quotation"
                          : "Edit Invoice"
                      : isPurchaseMode
                        ? "Create New Purchase"
                        : isQuotationMode
                          ? "Create New Quotation"
                          : "Create New Invoice"}
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">
                    {isPurchaseMode
                      ? "Record purchases from vendors"
                      : isQuotationMode
                        ? "Generate professional quotations for your clients"
                        : "Create invoices and track payments seamlessly"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm pl-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-slate-600">
                  Form ready • {isEditMode ? "Editing" : "New"}{" "}
                  {isPurchaseMode
                    ? "Purchase"
                    : isQuotationMode
                      ? "Quotation"
                      : "Invoice"}
                </span>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={isSaving || loading || !isValidForSave}
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-10 min-w-[220px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  <span className="font-semibold">
                    {isEditMode
                      ? isPurchaseMode
                        ? "Updating Purchase..."
                        : isQuotationMode
                          ? "Updating Quotation..."
                          : "Updating Invoice..."
                      : isPurchaseMode
                        ? "Saving Purchase..."
                        : isQuotationMode
                          ? "Saving Quotation..."
                          : "Saving Invoice..."}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-semibold">
                    {isEditMode
                      ? isPurchaseMode
                        ? "Update Purchase"
                        : isQuotationMode
                          ? "Update Quotation"
                          : "Update Invoice"
                      : isPurchaseMode
                        ? "Save Purchase"
                        : isQuotationMode
                          ? "Save Quotation"
                          : "Save Invoice"}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Form */}
        <div className="space-y-8">
          <CustomerSelector
            mode={isPurchaseMode ? "vendor" : "customer"}
            partySearch={partySearch}
            setPartySearch={setPartySearch}
            filteredParties={
              isPurchaseMode ? filteredVendors : filteredCustomers
            }
            selectedParty={selectedParty}
            setSelectedParty={setSelectedParty}
            isAddPartyOpen={isAddPartyOpen}
            setIsAddPartyOpen={setIsAddPartyOpen}
            newParty={newParty}
            setNewParty={setNewParty}
            addNewParty={addNewParty}
          />

          <section className="space-y-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between gap-6 flex-wrap">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 flex-shrink-0">
                <Package className="h-5 w-5 text-indigo-600" />
                Products & Services
              </h2>

              <div className="flex items-center gap-6 flex-wrap">
                <div className="space-y-1 min-w-[180px]">
                  <Label className="text-xs font-medium text-slate-600">
                    {isPurchaseMode
                      ? "Purchase Date"
                      : isQuotationMode
                        ? "Quotation Date"
                        : "Invoice Date"}
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "w-full justify-start text-left font-normal text-sm h-9 px-3 border-slate-300",
                          !documentDate && "text-slate-400",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {documentDate
                          ? format(documentDate, "dd MMM yyyy")
                          : "Select"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white">
                      <Calendar
                        mode="single"
                        selected={documentDate}
                        onSelect={(date) => {
                          if (!date) return;

                          const localDate = new Date(
                            date.getFullYear(),
                            date.getMonth(),
                            date.getDate(),
                            0,
                            0,
                            0,
                            0,
                          );

                          setDocumentDate(localDate);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {isInvoiceMode && (
                  <div className="space-y-1 min-w-[180px]">
                    <Label className="text-xs font-medium text-slate-600">
                      Due Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "w-full justify-start text-left font-normal text-sm h-9 px-3 border-slate-300",
                            !dueDate && "text-slate-400",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, "dd MMM yyyy") : "Select"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white">
                        <Calendar
                          mode="single"
                          selected={dueDate}
                          onSelect={(date) => {
                            if (!date) return;

                            const localDate = new Date(
                              date.getFullYear(),
                              date.getMonth(),
                              date.getDate(),
                              0,
                              0,
                              0,
                              0,
                            );

                            setDueDate(localDate);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            </div>

            {/* ── CONDITIONAL RENDERING FOR PRODUCTS SECTION ── */}
            {isPurchaseMode ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 transition-colors">
                <Button
                  size="lg"
                  className="h-14 px-10 text-lg gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-xl transition-all duration-300 group"
                  onClick={() => setIsCreateItemModalOpen(true)}
                >
                  <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
                  <span className="font-semibold">Create & Add New Item</span>
                </Button>
                <p className="mt-4 text-sm text-slate-500 text-center max-w-md">
                  Items added here are specific to this purchase (not saved to
                  main inventory)
                </p>
              </div>
            ) : (
              <ProductSearcher
                productSearch={productSearch}
                setProductSearch={setProductSearch}
                filteredInventory={filteredInventory}
                onAddProduct={addProductToBill}
              />
            )}

            <BilledProductsTable
              products={billedProducts}
              onUpdate={updateBilledProduct}
              onRemove={removeBilledProduct}
              enableWaste={enableWaste}
            />

            {billedProducts.length > 0 && (
              <>
                <div className="border-t bg-slate-50/50 p-6 rounded-lg">
                  <InvoiceSummary
                    address={billingAddress}
                    onAddressChange={setBillingAddress}
                    grandTotal={totalGross}
                    discount={totalDiscount}
                    cgst={cgst}
                    sgst={sgst}
                    igst={igst}
                    netAmount={netAmount}
                  />
                </div>

                <TotalsFooter
                  itemCount={billedProducts.length}
                  totalQty={billedProducts.reduce(
                    (sum, p) => sum + p.quantity,
                    0,
                  )}
                  netAmount={netAmount}
                  onClose={() => router.back()}
                  onSave={handleSave}
                  isEditMode={isEditMode}
                  isSaving={isSaving}
                  isQuotationMode={isQuotationMode}
                  disabled={!isValidForSave}
                />
              </>
            )}

            {billedProducts.length === 0 && (
              <div className="border border-dashed border-slate-300 rounded-xl p-12 text-center bg-slate-50/50">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Package className="h-10 w-10 text-slate-400" />
                  </div>
                </div>
                <p className="text-slate-600 font-medium mb-2">
                  No products added yet
                </p>
                <p className="text-sm text-slate-500">
                  {isPurchaseMode
                    ? "Click 'Create & Add New Item' to start building your purchase"
                    : "Search and add products or services to continue"}
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ── Purchase-only modal for creating new items ── */}
      {isPurchaseMode && (
        <CreatePurchaseItemModal
          isOpen={isCreateItemModalOpen}
          onClose={() => setIsCreateItemModalOpen(false)}
          onItemCreated={addCustomPurchaseItem} // from the updated hook
        />
      )}
    </div>
  );
}

export default function InvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          <span className="text-slate-600">Loading form...</span>
        </div>
      }
    >
      <InvoiceContent />
    </Suspense>
  );
}
