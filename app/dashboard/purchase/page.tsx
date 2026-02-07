"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PurchaseTable } from "@/components/purchase/purchase-table";
import { usePurchases } from "@/hooks/use-purchase";
import { Plus, ShoppingCart, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import type { Purchase } from "@/lib/firebase/purchase";
import { recordPurchasePayment } from "@/lib/firebase/purchase";
import type { PurchaseStatus, PurchaseMode } from "@/lib/utils/purchase_types";


export default function PurchasePage() {

  const { purchases, loading, error, deletePurchase, refetch } = usePurchases();

  // Payment dialog state
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null,
  );
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<Purchase | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
const [paymentMode, setPaymentMode] =
  useState<PurchaseMode | undefined>(undefined);

  // Filters
  const [statusFilters, setStatusFilters] = useState<PurchaseStatus[]>([]);
  const [modeFilters, setModeFilters] = useState<PurchaseMode[]>([]);
  const router = useRouter();

  const savePayment = async () => {
    if (!selectedPurchase) {
      return { success: false, error: "No purchase selected" };
    }

    const amount = Number(paymentAmount);
    if (amount <= 0) {
      return { success: false, error: "Invalid amount" };
    }

    if (!paymentMode) {
      return { success: false, error: "Select payment mode" };
    }

    try {
      await recordPurchasePayment(selectedPurchase.id, {
        amount,
        mode: paymentMode,
      });

      await refetch();

      setPaymentAmount("");
      setPaymentMode(undefined);
      setPaymentDate("");
      setSelectedPurchase(null);

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Failed to record payment",
      };
    }
  };

  const handleCreatePurchase = () => {
    router.push("/dashboard/invoice?type=purchase");
  };

  const handleEditPurchase = (purchase: any) => {
    router.push(`/dashboard/invoice?type=purchase&edit=${purchase.id}`);
  };

  const totalPurchases = purchases.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-slate-600">Loading purchases...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-600 text-lg font-medium mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="relative p-6 lg:p-8 space-y-8 max-w-350 mx-auto">
        {/* Hero Card */}
        <div className="relative mb-10">
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-col items-start gap-2">
                <h1 className="flex justify-start items-center gap-2 text-lg lg:text-xl font-bold tracking-tight">
                  <div className="relative p-1.5 bg-primary rounded-md">
                    <ShoppingCart className="h-4 w-4 text-white" />
                  </div>
                  Purchases
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Record and manage purchases from vendors
                </p>
              </div>
            </div>

            <Button
              onClick={handleCreatePurchase}
              size="lg"
              className="group relative overflow-hidden hover:scale-105 px-8 w-full lg:w-auto"
            >
              <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold">New Purchase</span>
            </Button>
          </div>
        </div>

        {/* Purchase Table */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-semibold text-slate-700">All Purchases</h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <PurchaseTable
              purchases={purchases}
              onEdit={handleEditPurchase}
              onDelete={deletePurchase}
              selectedPurchase={selectedPurchase}
              setSelectedPurchase={setSelectedPurchase}
              isPaymentDialogOpen={isPaymentDialogOpen}
              setIsPaymentDialogOpen={setIsPaymentDialogOpen}
              paymentAmount={paymentAmount}
              setPaymentAmount={setPaymentAmount}
              paymentDate={paymentDate}
              setPaymentDate={setPaymentDate}
              selectedPaymentMode={paymentMode}
              setSelectedPaymentMode={setPaymentMode}
              savePayment={savePayment}
              statusFilters={statusFilters}
              setStatusFilters={setStatusFilters}
              modeFilters={modeFilters}
              setModeFilters={setModeFilters}
              purchaseToDelete={purchaseToDelete}
              setPurchaseToDelete={setPurchaseToDelete}
              deleteDialogOpen={deleteDialogOpen}
              setDeleteDialogOpen={setDeleteDialogOpen}
              isDeleting={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
