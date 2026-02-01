"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Loader2,
  Sparkles,
  CheckCircle2,
  Package,
  FileText,
  ReceiptIndianRupee,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCreateInvoice } from "./hooks/useCreateInvoice";
import { CustomerSelector } from "@/components/invoice/customerSelector";
import { ProductSearcher } from "@/components/invoice/productSearcher";
import { BilledProductsTable } from "@/components/invoice/billedProductTable";
import { InvoiceSummary } from "@/components/invoice/invoice-summary";
import { TotalsFooter } from "@/components/invoice/totalFooter";

import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Invoice, InvoiceProduct } from "@/lib/firebase/invoices";
import { addQuotation } from "@/lib/firebase/quotations";
import { addPurchase, updatePurchase } from "@/lib/firebase/purchase";
import { cleanUndefined } from "@/lib/utils/invoiceUtil";
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

  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [documentDate, setDocumentDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  });

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

    saveInvoice,
    resetForm,
  } = useCreateInvoice();

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

        if (docDateField) {
          setDocumentDate(docDateField.toDate?.() || new Date(docDateField));
        }

        if (data.dueDate) {
          setDueDate(data.dueDate.toDate?.() || new Date(data.dueDate));
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

  // ── Save / Update handler ────────────────────────────────────────────────
  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      if (!selectedParty) {
        toast.error("Party Required", {
          description: "Please select a customer or vendor before saving.",
        });
        return;
      }

      // Critical guard: ensure name exists (prevents cleanUndefined from removing it)
      const partyName = selectedParty.name?.trim() || "Unnamed Party";

      if (billedProducts.length === 0) {
        toast.error("No Products", {
          description: "Please add at least one product.",
        });
        return;
      }

      const productsToSave = billedProducts.map((p) =>
        cleanUndefined({
          name: p.name,
          quantity: p.quantity,
          measurementType: p.measurementType,

          ...(p.measurementType === "height_width" && {
            height: p.height,
            width: p.width,
          }),
          ...(p.measurementType === "kg" && { kg: p.kg }),
          ...(p.measurementType === "unit" && { units: p.units }),

          wasteEnabled: enableWaste ? p.wasteEnabled : false,

          ...(enableWaste &&
            p.wasteEnabled && {
              wasteHeight: p.wasteHeight,
              wasteWidth: p.wasteWidth,
              wasteKg: p.wasteKg,
              wasteUnits: p.wasteUnits,
            }),

          discount: p.discount,
          discountType: p.discountType,
          total: p.netTotal,
          grossTotal: p.grossTotal ?? p.netTotal,
        }),
      );

      // Prepare dates (midnight if not today)
      const now = new Date();
      let finalDocumentDate = new Date(documentDate);
      const isToday =
        finalDocumentDate.getFullYear() === now.getFullYear() &&
        finalDocumentDate.getMonth() === now.getMonth() &&
        finalDocumentDate.getDate() === now.getDate();
      if (!isToday) finalDocumentDate.setHours(0, 0, 0, 0);

      let finalDueDate = new Date(dueDate);
      const isDueToday =
        finalDueDate.getFullYear() === now.getFullYear() &&
        finalDueDate.getMonth() === now.getMonth() &&
        finalDueDate.getDate() === now.getDate();
      if (!isDueToday) finalDueDate.setHours(0, 0, 0, 0);

      // Common fields — name is guaranteed non-empty
      const commonPayload = cleanUndefined({
        ...(isPurchaseMode
          ? { vendorId: selectedParty.id }
          : { customerId: selectedParty.id }),
        ...(isPurchaseMode
          ? { vendorName: partyName }
          : { customerName: partyName }),
        ...(isPurchaseMode
          ? { vendorPhone: selectedParty.phone }
          : { customerPhone: selectedParty.phone }),
        ...(selectedParty.gstin && {
          ...(isPurchaseMode
            ? { vendorGstin: selectedParty.gstin }
            : { customerGstin: selectedParty.gstin }),
        }),
        billingAddress,
        products: productsToSave,
        subtotal,
        discount: totalDiscount,
        cgst,
        sgst,
        igst,
        netAmount,
      });

      // Add mode-specific date field
      const dateFieldName = isPurchaseMode
        ? "purchaseDate"
        : isQuotationMode
          ? "quotationDate"
          : "invoiceDate";

      const payload = cleanUndefined({
        ...commonPayload,
        [dateFieldName]: finalDocumentDate,
        ...(isInvoiceMode && { dueDate: finalDueDate }),
      });

      let success = false;

      if (isEditMode) {
        if (!editId) throw new Error("Missing edit ID");

        const collectionName = isPurchaseMode
          ? "purchases"
          : isQuotationMode
            ? "quotations"
            : "invoices";

        const ref = doc(db, collectionName, editId);

        await updateDoc(ref, {
          ...payload,
          updatedAt: serverTimestamp(),
        });

        toast.success(
          `${isPurchaseMode ? "Purchase" : isQuotationMode ? "Quotation" : "Invoice"} Updated`,
        );
        success = true;
      } else {
        if (isPurchaseMode) {
          await addPurchase({
            vendorId: selectedParty.id,
            vendorName: partyName,
            vendorPhone: selectedParty.phone,
            vendorGstin: selectedParty.gstin,
            billingAddress,
            products: productsToSave,
            subtotal,
            discount: totalDiscount,
            cgst,
            sgst,
            igst,
            netAmount,
            totalGross,
            purchaseDate: finalDocumentDate,
          });
          success = true;
        } else if (isQuotationMode) {
          await addQuotation({
            customerId: selectedParty.id,
            customerName: partyName,
            customerPhone: selectedParty.phone,
            customerGstin: selectedParty.gstin,
            billingAddress,
            products: productsToSave,
            subtotal,
            discount: totalDiscount,
            cgst,
            sgst,
            igst,
            netAmount,
            totalGross,
            quotationDate: finalDocumentDate,
          });
          success = true;
        } else {
          const result = await saveInvoice();
          success = result.success;
        }

        if (success) {
          toast.success(
            `${isPurchaseMode ? "Purchase" : isQuotationMode ? "Quotation" : "Invoice"} Created`,
          );
        } else {
          toast.error("Save Failed");
        }
      }

      if (success) {
        resetForm();
        router.push(
          isPurchaseMode
            ? "/dashboard/purchase"
            : isQuotationMode
              ? "/dashboard/quotation"
              : "/dashboard",
        );
      }
    } catch (err: any) {
      console.error("Save failed:", err);
      toast.error("Error", {
        description: err.message || "Failed to save document.",
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
                        onSelect={(date) => date && setDocumentDate(date)}
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
                          onSelect={(date) => date && setDueDate(date)}
                          disabled={(date) => date < documentDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            </div>

            <ProductSearcher
              productSearch={productSearch}
              setProductSearch={setProductSearch}
              filteredInventory={filteredInventory}
              onAddProduct={addProductToBill}
            />

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
                  Search and add products or services to continue
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
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
