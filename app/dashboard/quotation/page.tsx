"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { QuotationTable } from "@/components/quotation/quotation-table";
import { useQuotation } from "@/hooks/use-quotation";
import { Plus, FileText, CheckCircle2 } from "lucide-react";
import { Quotation } from "@/lib/firebase/quotations";

export default function QuotationPage() {
  const { quotations, deleteQuotation, convertToInvoice } = useQuotation();
  const router = useRouter();

  const handleCreateQuotation = () => {
    router.push("/dashboard/invoice?type=quotation");
  };

  const handleEditQuotation = (quotation: Quotation) => {
    router.push(`/dashboard/invoice?type=quotation&edit=${quotation.id}`);
  };

  const totalQuotations = quotations.length;

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
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  Quotations
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Create, manage and convert quotations to invoices
                </p>
              </div>
            </div>

            {/* Create Quotation Button */}
            <Button
              onClick={handleCreateQuotation}
              size="lg"
              className="group relative overflow-hidden hover:scale-105 px-8 w-full lg:w-auto"
            >
              <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold">Create Quotation</span>
            </Button>
          </div>
        </div>

        {/* All Quotations Section */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-semibold text-slate-700">All Quotations</h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <QuotationTable
              quotations={quotations}
              onEdit={handleEditQuotation}
              onDelete={deleteQuotation}
              onConvertToInvoice={convertToInvoice}
            />
          </div>
        </div>

        {/* Footer Status */}
        <div className="pt-8 pb-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-primary/5 border border-indigo-200/60 rounded-xl">
            <div className="flex items-center gap-3 text-sm text-indigo-900">
              <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0" />
              <span className="font-medium">
                You have {totalQuotations} quotation
                {totalQuotations !== 1 ? "s" : ""} in your system
              </span>
            </div>
            <div className="text-xs text-indigo-700" suppressHydrationWarning>
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
