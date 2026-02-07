"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GstEditModal } from "@/components/gst/gst-modal";
import { useGst } from "@/hooks/use-gst";
import {
  Pencil,
  TrendingUp,
  CheckCircle2,
  Info,
  AlertCircle,
} from "lucide-react";

export default function GstPage() {
  const { cgst, sgst, updateGst } = useGst();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const totalGst = (cgst + sgst).toFixed(2);

  return (
    <div className="min-h-screen bg-white">
      <div className="relative p-6 lg:p-8 space-y-8 max-w-350 mx-auto">
        {/* GST Settings Hero */}
        <div className="relative mb-10">
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-col items-start gap-2">
                <h1 className="flex justify-start items-center gap-2 text-lg lg:text-xl font-bold tracking-tight">
                  <div className="relative p-2 bg-primary rounded-xl">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  GST Settings
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Manage your tax rates and compliance settings
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsEditOpen(true)}
              size="lg"
              className="group relative overflow-hidden hover:scale-105 px-8 w-full lg:w-auto"
            >
              <Pencil className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-semibold">Edit Rates</span>
            </Button>
          </div>
        </div>

        {/* Tax Rates */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-semibold text-slate-700">Tax Rates Overview</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CGST */}
            <div className="border border-slate-200 rounded-xl p-6 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Central GST
                  </p>
                  <p className="text-slate-600 font-semibold">CGST</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900">{cgst}%</div>
            </div>

            {/* SGST */}
            <div className="border border-slate-200 rounded-xl p-6 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    State GST
                  </p>
                  <p className="text-slate-600 font-semibold">SGST</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900">{sgst}%</div>
            </div>

            {/* Total */}
            <div className="border border-slate-200 rounded-xl p-6 bg-primary/5">
              <p className="text-xs font-medium text-slate-500 mb-1">
                Combined Rate
              </p>
              <p className="text-slate-600 mb-4 font-semibold">Total GST</p>
              <div className="text-4xl font-bold text-slate-900">
                {totalGst}%
              </div>
            </div>
          </div>
        </div>

        {/* Information & Guidelines */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-semibold text-slate-700">
              Information & Guidelines
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoCard
              icon={<CheckCircle2 className="h-5 w-5 text-primary" />}
              title="Auto-applied to invoices"
              description="Updated GST rates are automatically applied to all new invoices."
            />

            <InfoCard
              icon={<Pencil className="h-5 w-5 text-primary" />}
              title="Editable anytime"
              description="You can update GST values whenever regulations change."
            />

            <InfoCard
              icon={<AlertCircle className="h-5 w-5 text-primary" />}
              title="Stay compliant"
              description="Always ensure your GST rates match government guidelines."
            />

            <InfoCard
              icon={<Info className="h-5 w-5 text-primary" />}
              title="Audit friendly"
              description="All changes are tracked automatically for record keeping."
            />
          </div>
        </div>
      </div>

      <GstEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialCgst={cgst}
        initialSgst={sgst}
        onSave={updateGst}
      />
    </div>
  );
}

/* Small internal helper */
function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="border border-slate-200 rounded-xl p-6 bg-white flex gap-4">
      <div className="flex justify-center items-center p-2 w-10 h-10 bg-primary/10 rounded-lg shrink-0">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </div>
  );
}
