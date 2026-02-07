"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  Package,
  FileText,
  ReceiptIndianRupee,
  ShoppingCart,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateInvoice } from "../../../hooks/use-create-invoice";
import { CustomerSelector } from "@/components/invoice/customer-selector";
import { ProductSearcher } from "@/components/invoice/product-searcher";
import { BilledProductsTable } from "@/components/invoice/billed-product-table";
import { InvoiceSummary } from "@/components/invoice/invoice-summary";
import { TotalsFooter } from "@/components/invoice/total-footer";
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
import { useCreatePurchase } from "@/hooks/use-create-purchase";
import { useCreateQuotation } from "@/hooks/use-create-quotation";
import { CreatePurchaseItemModal } from "@/components/purchase/create-purchase-item-model";

import { useGst } from "@/hooks/use-gst";

function InvoiceContent() {
  const hasLoadedRef = useRef(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("edit");
  const isEditMode = !!editId;
  const type = searchParams.get("type") || "invoice";
  const isQuotationMode = type === "quotation";
  const isPurchaseMode = type === "purchase";
  const isInvoiceMode = !isQuotationMode && !isPurchaseMode;
  const enableWaste = !isPurchaseMode;

  const { cgst: gstCgst, sgst: gstSgst } = useGst();

  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isCreateItemModalOpen, setIsCreateItemModalOpen] = useState(false);

  const invoiceHook = useCreateInvoice();

  const quotationHook = useCreateQuotation();

  const purchaseHook = useCreatePurchase({
    isEditMode,
    editId,
  });

  const hook = isPurchaseMode
    ? purchaseHook
    : isQuotationMode
      ? quotationHook
      : invoiceHook;

  const {
    // party
    partySearch,
    setPartySearch,

    selectedParty,
    setSelectedParty,
    filteredCustomers,

    selectedVendor,
    setSelectedVendor,
    filteredVendors,

    isAddPartyOpen,
    setIsAddPartyOpen,
    newParty,
    setNewParty,
    addNewParty,

    billingAddress,
    setBillingAddress,

    // products
    productSearch,
    setProductSearch,
    filteredInventory,

    billedProducts, // invoice
    products, // quotation
    items, // purchase
    setBilledProducts,

    addProductToBill,
    addProductToQuotation,
    addCustomPurchaseItem,

    updateBilledProduct,
    updateProduct,
    updateItem,

    removeBilledProduct,
    removeProduct,
    removeItem,

    // totals
    subtotal,
    totalDiscount,
    cgst,
    sgst,
    igst,
    netAmount,
    totalGross,

    // dates
    documentDate,
    setDocumentDate,
    dueDate,
    setDueDate,
    quotationDate,
    setQuotationDate,
    purchaseDate,
    setPurchaseDate,

    // save
    saveDocument,
    saveQuotation,
    savePurchase,
    loadForEdit,
  } = hook as any;

  useEffect(() => {
    if (!isEditMode || !editId) {
      setLoading(false);
      return;
    }

    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    setLoading(true);

    loadForEdit(editId)
      .catch((err: any) => {
        console.error(err);
        setError("Failed to load invoice");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isEditMode, editId]);

  const isValidForSave = isPurchaseMode
    ? !!selectedVendor && items.length > 0
    : isQuotationMode
      ? !!selectedParty && products.length > 0
      : !!selectedParty && billedProducts.length > 0;

  const handleSave = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);

      let result;
      if (isPurchaseMode) {
        result = await savePurchase();
      } else if (isQuotationMode) {
        result = await saveQuotation();
      } else {
        result = await saveDocument();
      }

      if (result?.success) {
        router.push(
          isPurchaseMode
            ? "/dashboard/purchase"
            : isQuotationMode
              ? "/dashboard/quotation"
              : "/dashboard",
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

  const currentProducts = isPurchaseMode
    ? items
    : isQuotationMode
      ? products
      : billedProducts;
  const safeNetAmount = netAmount ?? subtotal ?? totalGross ?? 0;

  const safeDiscount = totalDiscount ?? 0;
  const safeCgst = cgst ?? 0;
  const safeSgst = sgst ?? 0;
  const safeIgst = igst ?? 0;

  const itemCount = currentProducts?.length ?? 0;

  const totalQty = currentProducts?.reduce(
    (sum: number, p: any) => sum + (p.quantity || 1),
    0,
  );

  const activeDate = isPurchaseMode
    ? purchaseDate
    : isQuotationMode
      ? quotationDate
      : documentDate;

  const setActiveDate = (date: Date) => {
    if (isPurchaseMode) setPurchaseDate(date);
    else if (isQuotationMode) setQuotationDate(date);
    else setDocumentDate(date);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="relative p-6 lg:p-8 space-y-8 max-w-350 mx-auto">
        {/* Hero Header */}
        <div className="relative mb-10">
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-col items-start gap-2">
                <h1 className="flex justify-start items-center gap-2 text-lg lg:text-xl font-bold tracking-tight">
                  <div className="relative p-1.5 bg-primary rounded-md">
                    {isPurchaseMode ? (
                      <ShoppingCart className="h-4 w-4 text-white" />
                    ) : isQuotationMode ? (
                      <FileText className="h-4 w-4 text-white" />
                    ) : (
                      <ReceiptIndianRupee className="h-4 w-4 text-white" />
                    )}
                  </div>
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

            <Button
              onClick={handleSave}
              disabled={isSaving || loading || !isValidForSave}
              size="lg"
              className="group relative overflow-hidden hover:scale-105 px-10 min-w-55 w-full lg:w-auto"
            >
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
            selectedParty={isPurchaseMode ? selectedVendor : selectedParty}
            setSelectedParty={
              isPurchaseMode ? setSelectedVendor : setSelectedParty
            }
            isAddPartyOpen={isAddPartyOpen}
            setIsAddPartyOpen={setIsAddPartyOpen}
            newParty={newParty}
            setNewParty={setNewParty}
            addNewParty={addNewParty}
          />

          <section className="space-y-6 bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 shrink-0">
                <Package className="h-5 w-5 text-primary" />
                Products & Services
              </h2>

              <div className="flex items-center gap-6 flex-wrap">
                <div className="space-y-1 min-w-45">
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
                          !activeDate && "text-slate-400",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {activeDate
                          ? format(activeDate, "dd MMM yyyy")
                          : "Select"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white border-gray-200 shadow-none">
                      <Calendar
                        mode="single"
                        selected={activeDate}
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

                          setActiveDate(localDate);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {isInvoiceMode && (
                  <div className="space-y-1 min-w-45">
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

            {/* Products Section */}
            {isPurchaseMode ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <Button
                  size="lg"
                  className="h-14 px-10 text-lg gap-3 group"
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
                onAddProduct={
                  isQuotationMode ? addProductToQuotation : addProductToBill
                }
              />
            )}

            <BilledProductsTable
              products={
                isPurchaseMode
                  ? items
                  : isQuotationMode
                    ? products
                    : billedProducts
              }
              onUpdate={
                isPurchaseMode
                  ? updateItem
                  : isQuotationMode
                    ? updateProduct
                    : updateBilledProduct
              }
              onRemove={
                isPurchaseMode
                  ? removeItem
                  : isQuotationMode
                    ? removeProduct
                    : removeBilledProduct
              }
              enableWaste={!isPurchaseMode}
            />

            {itemCount > 0 && (
              <>
                <div className="rounded-lg">
                  <InvoiceSummary
                    address={billingAddress}
                    onAddressChange={setBillingAddress}
                    grandTotal={subtotal}
                    discount={safeDiscount}
                    cgst={safeCgst}
                    sgst={safeSgst}
                    igst={safeIgst}
                    netAmount={netAmount}
                    cgstRate={gstCgst}
                    sgstRate={gstSgst}
                    igstRate={gstCgst + gstSgst}
                  />
                </div>

                <TotalsFooter
                  itemCount={itemCount}
                  totalQty={totalQty}
                  netAmount={safeNetAmount}
                  onClose={() => router.back()}
                  onSave={handleSave}
                  isEditMode={isEditMode}
                  isSaving={isSaving}
                  isQuotationMode={isQuotationMode}
                  isPurchaseMode={isPurchaseMode}
                  disabled={!isValidForSave}
                />
              </>
            )}

            {itemCount === 0 && (
              <div className="border border-dashed border-slate-300 rounded-xl p-12 text-center bg-slate-50">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 flex items-center justify-center">
                    <Package className="h-15 w-15 text-slate-400" />
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

      {isPurchaseMode && (
        <CreatePurchaseItemModal
          isOpen={isCreateItemModalOpen}
          onClose={() => setIsCreateItemModalOpen(false)}
          onItemCreated={(item) => {
            addCustomPurchaseItem(item);
          }}
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
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="text-slate-600">Loading form...</span>
        </div>
      }
    >
      <InvoiceContent />
    </Suspense>
  );
}
