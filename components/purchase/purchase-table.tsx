"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Eye,
  MoreHorizontal,
  Download,
  Trash2,
  Pencil,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  Calendar,
  IndianRupee,
  Loader2,
  AlertCircle,
  CreditCard,
  CheckCircle2,
  BellRing,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Purchase } from "@/lib/firebase/purchase";
import { pdf } from "@react-pdf/renderer";
import PurchasePDF from "@/components/purchase/purchase-pdf";
import { exportPurchasesToExcel } from "@/lib/utils/exportPurchaseToExcel";
import type { PurchaseStatus, PurchaseMode } from "@/lib/utils/purchase_types";

type SortOrder = "asc" | "desc" | null;


interface PurchaseTableProps {
  purchases: Purchase[];
  onEdit: (purchase: Purchase) => void;
  onDelete: (id: string) => Promise<void>;
  isDeleting: boolean;
  purchaseToDelete: Purchase | null;
  setPurchaseToDelete: (p: Purchase | null) => void;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;

  selectedPurchase: Purchase | null;
  setSelectedPurchase: (p: Purchase | null) => void;
  isPaymentDialogOpen: boolean;
  setIsPaymentDialogOpen: (v: boolean) => void;
  paymentAmount: string;
  setPaymentAmount: (v: string) => void;
  paymentDate: string;
  setPaymentDate: (v: string) => void;
  selectedPaymentMode: PurchaseMode | undefined;
setSelectedPaymentMode: (v: PurchaseMode | undefined) => void;

  savePayment: () => Promise<{
    success: boolean;
    result?: any;
    error?: string;
  }>;

  statusFilters: PurchaseStatus[];
  setStatusFilters: (filters: PurchaseStatus[]) => void;
  modeFilters: PurchaseMode[];
  setModeFilters: (filters: PurchaseMode[]) => void;
}

const allStatuses: PurchaseStatus[] = ["pending", "partially_paid", "paid"];

const getStatusBadgeVariant = (status: PurchaseStatus): string => {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "partially_paid":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "pending":
      return "bg-primary/5 text-primary border-primary/20";
    default:
      return "";
  }
};

const getModeBadgeVariant = (mode: PurchaseMode): string => {
  switch (mode) {
    case "cash":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "upi":
      return "bg-violet-50 text-violet-800 border-violet-200";
    case "card":
      return "bg-blue-50 text-blue-800 border-blue-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-300";
  }
};

export function PurchaseTable(props: PurchaseTableProps) {
  const {
    purchases,
    onEdit,
    onDelete,
    isDeleting,
    purchaseToDelete,
    setPurchaseToDelete,
    deleteDialogOpen,
    setDeleteDialogOpen,

    selectedPurchase,
    setSelectedPurchase,
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,
    paymentAmount,
    setPaymentAmount,
    paymentDate,
    setPaymentDate,
    selectedPaymentMode,
    setSelectedPaymentMode,
    savePayment,

    statusFilters,
    setStatusFilters,
    modeFilters,
    setModeFilters,
  } = props;

  const [searchQuery, setSearchQuery] = useState("");
  const [amountSort, setAmountSort] = useState<SortOrder>(null);
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [datePreset, setDatePreset] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedPdfPurchase, setSelectedPdfPurchase] =
    useState<Purchase | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
        setPdfBlobUrl(null);
      }
    };
  }, [pdfBlobUrl]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);

  const formatDate = (raw: any) => {
    if (!raw) return "—";
    let date: Date | null = null;
    if (raw instanceof Date) date = raw;
    else if (typeof raw.toDate === "function") date = raw.toDate();
    else if (raw.seconds) date = new Date(raw.seconds * 1000);
    return date
      ? new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(date)
      : "—";
  };

  const formatPurchaseNumber = (num: number | undefined): string => {
    if (num == null) return "Draft";
    return String(num).padStart(4, "0");
  };

  const uniqueModes = useMemo(() => {
    return Array.from(
      new Set(purchases.map((p) => p.mode).filter(Boolean)),
    ) as PurchaseMode[];
  }, [purchases]);

  const filteredPurchases = useMemo(() => {
    let result = purchases.filter((p) => {
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !q ||
        p.vendorName?.toLowerCase().includes(q) ||
        p.vendorPhone?.includes(q) ||
        p.vendorGstin?.toLowerCase().includes(q) ||
        formatPurchaseNumber(p.purchaseNumber).toLowerCase().includes(q);

      const min = amountMin ? parseFloat(amountMin) : null;
      const max = amountMax ? parseFloat(amountMax) : null;
      const matchesAmount =
        (min === null || p.netAmount >= min) &&
        (max === null || p.netAmount <= max);

      const matchesStatus =
        statusFilters.length === 0 ||
        statusFilters.includes(p.status as PurchaseStatus);

      const matchesMode =
        modeFilters.length === 0 ||
        modeFilters.includes(p.mode as PurchaseMode);

      let matchesDate = true;
      if (p.purchaseDate) {
        const pd = p.purchaseDate;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (datePreset) {
          switch (datePreset) {
            case "today":
              matchesDate = pd.toDateString() === today.toDateString();
              break;
            case "yesterday": {
              const yest = new Date(today);
              yest.setDate(yest.getDate() - 1);
              matchesDate = pd.toDateString() === yest.toDateString();
              break;
            }
            case "thisMonth":
              matchesDate =
                pd.getMonth() === today.getMonth() &&
                pd.getFullYear() === today.getFullYear();
              break;
            case "last30days": {
              const last30 = new Date(today);
              last30.setDate(last30.getDate() - 30);
              matchesDate = pd >= last30;
              break;
            }
          }
        } else if (dateFrom || dateTo) {
          const from = dateFrom ? new Date(dateFrom) : null;
          const to = dateTo ? new Date(dateTo) : null;
          if (from) from.setHours(0, 0, 0, 0);
          if (to) to.setHours(23, 59, 59, 999);
          matchesDate = (!from || pd >= from) && (!to || pd <= to);
        }
      }

      return (
        matchesSearch &&
        matchesAmount &&
        matchesStatus &&
        matchesMode &&
        matchesDate
      );
    });

    if (amountSort) {
      result.sort((a, b) =>
        amountSort === "asc"
          ? a.netAmount - b.netAmount
          : b.netAmount - a.netAmount,
      );
    }

    return result;
  }, [
    purchases,
    searchQuery,
    amountMin,
    amountMax,
    datePreset,
    dateFrom,
    dateTo,
    amountSort,
    statusFilters,
    modeFilters,
  ]);

  const clearAmountFilter = () => {
    setAmountMin("");
    setAmountMax("");
    setAmountSort(null);
  };

  const clearDateFilter = () => {
    setDatePreset(null);
    setDateFrom("");
    setDateTo("");
  };

  const toggleStatusFilter = (status: PurchaseStatus) => {
    setStatusFilters(
      statusFilters.includes(status)
        ? statusFilters.filter((s) => s !== status)
        : [...statusFilters, status],
    );
  };

  const toggleModeFilter = (mode: PurchaseMode) => {
    setModeFilters(
      modeFilters.includes(mode)
        ? modeFilters.filter((m) => m !== mode)
        : [...modeFilters, mode],
    );
  };

  const handleRecordPayment = (purchase: Purchase) => {
    const remaining = purchase.netAmount - (purchase.paidAmount || 0);

    setSelectedPaymentMode(purchase.mode ?? undefined);
    setPaymentAmount(remaining.toFixed(2));
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setSelectedPurchase(purchase);
    setIsPaymentDialogOpen(true);
  };

  const handleDownloadPDF = async (purchase: Purchase) => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      const element = <PurchasePDF purchase={purchase} />;
      const blob = await pdf(element).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Purchase-${purchase.id || "draft"}-${purchase.vendorName || "vendor"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("Failed to generate PDF for download");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-5 ml-3 mt-3 mr-3 mb-3">
      {/* Search + Export Row */}
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by vendor, phone, GST number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-slate-200 focus:border-primary focus:ring-primary/20"
          />
        </div>

        {/* Export */}
        <Button
          variant="outline"
          size="sm"
          className="border-slate-300 hover:bg-slate-50"
          onClick={() => exportPurchasesToExcel(filteredPurchases)}
        >
          <Download className="h-4 w-4 mr-2 text-primary" />
          <span className="font-semibold">Export Excel</span>
        </Button>
      </div>

      {/* Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 border-b border-slate-200">
              {/* Amount Filter */}
              <TableHead className="font-semibold text-slate-700">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 hover:text-primary transition-colors">
                      <IndianRupee className="h-4 w-4" />
                      Amount
                      <Filter
                        className={cn(
                          "h-3.5 w-3.5",
                          amountMin || amountMax || amountSort
                            ? "text-primary"
                            : "text-slate-400",
                        )}
                      />
                      {amountSort === "asc" && (
                        <ChevronUp className="h-3.5 w-3.5 text-primary" />
                      )}
                      {amountSort === "desc" && (
                        <ChevronDown className="h-3.5 w-3.5 text-primary" />
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-80 p-6 bg-white border border-slate-200 rounded-xl"
                    align="start"
                  >
                    <div className="space-y-5">
                      {/* Header */}
                      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <IndianRupee className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg text-slate-800">
                          Filter by Amount
                        </h3>
                      </div>

                      {/* Sort Buttons */}
                      <div className="flex gap-3">
                        <Button
                          variant={amountSort === "asc" ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            setAmountSort(amountSort === "asc" ? null : "asc")
                          }
                          className="flex-1"
                        >
                          <ChevronUp className="h-4 w-4 mr-2" /> Low to High
                        </Button>
                        <Button
                          variant={
                            amountSort === "desc" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            setAmountSort(amountSort === "desc" ? null : "desc")
                          }
                          className="flex-1"
                        >
                          <ChevronDown className="h-4 w-4 mr-2" /> High to Low
                        </Button>
                      </div>

                      {/* Min/Max */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-slate-700">
                            Minimum
                          </label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={amountMin}
                            onChange={(e) => setAmountMin(e.target.value)}
                            className="border-slate-300 focus:border-primary focus:ring-primary/20 h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-slate-700">
                            Maximum
                          </label>
                          <Input
                            type="number"
                            placeholder="Any"
                            value={amountMax}
                            onChange={(e) => setAmountMax(e.target.value)}
                            className="border-slate-300 focus:border-primary focus:ring-primary/20 h-10"
                          />
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAmountFilter}
                        className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        Clear Amount Filter
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </TableHead>

              {/* Status Filter */}
              <TableHead className="font-semibold text-slate-700">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 hover:text-primary transition-colors">
                      <CheckCircle2 className="h-4 w-4" />
                      Status
                      <Filter
                        className={cn(
                          "h-3.5 w-3.5",
                          statusFilters.length > 0
                            ? "text-primary"
                            : "text-slate-400",
                        )}
                      />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-72 p-5 bg-white border border-slate-200 rounded-xl"
                    align="start"
                  >
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="font-semibold text-base text-slate-800">
                          Status Filter
                        </h3>
                      </div>

                      {/* Status Options */}
                      {allStatuses.map((status) => (
                        <label
                          key={status}
                          className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2.5 rounded-lg transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={statusFilters.includes(status)}
                            onChange={() => toggleStatusFilter(status)}
                            className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                          />
                          <Badge
                            className={cn(
                              "flex-1 text-xs font-medium py-1 px-3 border transition-all duration-300 group-hover:scale-105",
                              getStatusBadgeVariant(status),
                            )}
                          >
                            {status === "partially_paid"
                              ? "Partially Paid"
                              : status.charAt(0).toUpperCase() +
                                status.slice(1)}
                          </Badge>
                        </label>
                      ))}

                      {/* Clear Button */}
                      {statusFilters.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStatusFilters([])}
                          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 mt-1 text-xs"
                        >
                          Clear Status Filters
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </TableHead>

              {/* Mode Filter */}
              <TableHead className="font-semibold text-slate-700">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 hover:text-primary transition-colors">
                      <CreditCard className="h-4 w-4" />
                      Mode
                      <Filter
                        className={cn(
                          "h-3.5 w-3.5",
                          modeFilters.length > 0
                            ? "text-primary"
                            : "text-slate-400",
                        )}
                      />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-64 p-5 bg-white border border-slate-200 rounded-xl"
                    align="start"
                  >
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="font-semibold text-base text-slate-800">
                          Payment Mode
                        </h3>
                      </div>

                      {/* Mode Options */}
                      {uniqueModes.map((mode) => (
                        <label
                          key={mode ?? "unknown"}
                          className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2.5 rounded-lg transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={modeFilters.includes(mode)}
                            onChange={() => toggleModeFilter(mode)}
                            className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                          />
                          <Badge
                            variant="outline"
                            className={cn(
                              "flex-1 text-xs font-medium py-1 px-3",
                              getModeBadgeVariant(mode),
                            )}
                          >
                            {mode ? mode.toUpperCase() : "—"}
                          </Badge>
                        </label>
                      ))}

                      {/* Clear Button */}
                      {modeFilters.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setModeFilters([])}
                          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 mt-1 text-xs"
                        >
                          Clear Mode Filters
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </TableHead>

              <TableHead className="font-semibold text-slate-700">
                PO #
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Vendor
              </TableHead>

              {/* Date Filter */}
              <TableHead className="font-semibold text-slate-700">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 hover:text-primary transition-colors">
                      <Calendar className="h-4 w-4" />
                      Date
                      <Filter
                        className={cn(
                          "h-3.5 w-3.5",
                          datePreset || dateFrom || dateTo
                            ? "text-primary"
                            : "text-slate-400",
                        )}
                      />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-96 p-6 bg-white border border-slate-200 rounded-xl"
                    align="start"
                  >
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg text-slate-800">
                          Filter by Date
                        </h3>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: "All", value: null },
                          { label: "Today", value: "today" },
                          { label: "Yesterday", value: "yesterday" },
                          { label: "This Month", value: "thisMonth" },
                          { label: "Last 30 days", value: "last30days" },
                        ].map((item) => (
                          <Button
                            key={item.value ?? "all"}
                            variant={
                              datePreset === item.value ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => {
                              setDatePreset(item.value);
                              if (item.value) {
                                setDateFrom("");
                                setDateTo("");
                              }
                            }}
                          >
                            {item.label}
                          </Button>
                        ))}
                      </div>

                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                          Custom Range
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                              From
                            </label>
                            <Input
                              type="date"
                              value={dateFrom}
                              onChange={(e) => {
                                setDateFrom(e.target.value);
                                setDatePreset(null);
                              }}
                              className="border-slate-300 focus:border-primary focus:ring-primary/20 h-10"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                              To
                            </label>
                            <Input
                              type="date"
                              value={dateTo}
                              onChange={(e) => {
                                setDateTo(e.target.value);
                                setDatePreset(null);
                              }}
                              className="border-slate-300 focus:border-primary focus:ring-primary/20 h-10"
                            />
                          </div>
                        </div>
                      </div>

                      {(datePreset || dateFrom || dateTo) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearDateFilter}
                          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 mt-2"
                        >
                          Clear Date Filter
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredPurchases.map((purchase, index) => (
              <TableRow
                key={purchase.id}
                className={cn(
                  "hover:bg-slate-50/70 transition-colors",
                  index % 2 === 0 ? "bg-white" : "bg-slate-50/40",
                )}
              >
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="font-semibold text-slate-900">
                      {formatCurrency(purchase.netAmount)}
                    </div>
                    {purchase.status === "partially_paid" && (
                      <div className="text-xs font-medium text-orange-700 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Pending:{" "}
                        {formatCurrency(
                          purchase.netAmount - (purchase.paidAmount || 0),
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium",
                        getStatusBadgeVariant(
                          purchase.status as PurchaseStatus,
                        ),
                      )}
                    >
                      {purchase.status
                        ? purchase.status === "partially_paid"
                          ? "Partially Paid"
                          : purchase.status.charAt(0).toUpperCase() +
                            purchase.status.slice(1)
                        : "—"}
                    </Badge>
                    {(purchase.status === "pending" ||
                      purchase.status === "partially_paid") && (
                      <BellRing className="h-4 w-4 text-orange-600" />
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  {purchase.mode && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-medium",
                        getModeBadgeVariant(purchase.mode as PurchaseMode),
                      )}
                    >
                      {purchase.mode}
                    </Badge>
                  )}
                </TableCell>

                <TableCell className="text-sm font-semibold text-slate-700">
                  #
                  {purchase.purchaseNumber
                    ? String(purchase.purchaseNumber).padStart(4, "0")
                    : "Draft"}
                </TableCell>

                <TableCell>
                  <div className="text-sm font-semibold text-slate-900">
                    {purchase.vendorName}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <span>{purchase.vendorPhone}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="text-sm font-medium text-slate-700">
                    {formatDate(purchase.purchaseDate)}
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 px-3 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                      onClick={() => handleRecordPayment(purchase)}
                      title="Record Payment"
                    >
                      <IndianRupee className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 gap-2 hover:bg-primary/5 hover:text-primary hover:border-primary/20"
                      onClick={async () => {
                        if (isGeneratingPdf) return;
                        setIsGeneratingPdf(true);
                        setSelectedPdfPurchase(purchase);
                        setPdfModalOpen(true);

                        try {
                          const element = <PurchasePDF purchase={purchase} />;
                          const blob = await pdf(element).toBlob();
                          const url = URL.createObjectURL(blob);
                          setPdfBlobUrl(url);
                        } catch (err) {
                          console.error("PDF error:", err);
                          alert("Failed to generate PDF");
                        } finally {
                          setIsGeneratingPdf(false);
                        }
                      }}
                      disabled={isGeneratingPdf}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 hover:bg-slate-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 bg-white border-slate-200"
                      >
                        <DropdownMenuItem
                          onClick={() => onEdit(purchase)}
                          className="cursor-pointer hover:bg-primary/5"
                        >
                          <Pencil className="h-4 w-4 mr-2 text-primary" />
                          <span className="font-medium">Edit</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleDownloadPDF(purchase)}
                          className="cursor-pointer hover:bg-blue-50"
                          disabled={isGeneratingPdf}
                        >
                          <Download className="h-4 w-4 mr-2 text-blue-600" />
                          <span className="font-medium">Download PDF</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => {
                            setPurchaseToDelete(purchase);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          <span className="font-medium">Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Record Payment Dialog */}
      <Dialog
        open={isPaymentDialogOpen}
        onOpenChange={(open) => {
          setIsPaymentDialogOpen(open);
          if (!open) {
            setPaymentError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">
              Record Payment
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Record a payment for{" "}
              <span className="font-semibold text-slate-900">
                {selectedPurchase?.vendorName || "this purchase"}
              </span>
            </DialogDescription>
          </DialogHeader>

          {selectedPurchase && (
            <div className="space-y-6 py-2">
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="text-xs font-medium text-blue-700 mb-1 flex items-center gap-1.5">
                    <IndianRupee className="h-3.5 w-3.5" />
                    Total Amount
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatCurrency(selectedPurchase.netAmount)}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
                  <div className="text-xs font-medium text-orange-700 mb-1 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Still Pending
                  </div>
                  <div className="text-2xl font-bold text-orange-900">
                    {formatCurrency(
                      selectedPurchase.netAmount -
                        (selectedPurchase.paidAmount || 0),
                    )}
                  </div>
                </div>
              </div>

              {/* Amount Received */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <IndianRupee className="h-4 w-4" />
                  Amount Paid
                  <span className="text-red-500 text-xs">*</span>
                </label>

                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPaymentAmount(val);
                    setPaymentError(null);
                  }}
                  placeholder="0.00"
                  className="text-lg h-12 font-semibold bg-white border-slate-300 focus:border-primary focus:ring-primary/20"
                  min="0.01"
                  max={Math.max(
                    0,
                    selectedPurchase.netAmount -
                      (selectedPurchase.paidAmount || 0),
                  )}
                  step="0.01"
                  disabled={isSavingPayment}
                />

                {/* Real-time preview */}
                {(() => {
                  const remaining = Number(
                    (
                      selectedPurchase.netAmount -
                      (selectedPurchase.paidAmount || 0)
                    ).toFixed(2),
                  );

                  const pendingAfter = Math.max(
                    0,
                    Number((remaining - Number(paymentAmount)).toFixed(2)),
                  );

                  return (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">
                          Pending after payment:
                        </span>
                        <span
                          className={cn(
                            "font-bold text-sm",
                            pendingAfter === 0
                              ? "text-emerald-600"
                              : Number(paymentAmount) > remaining
                                ? "text-red-600"
                                : "text-orange-600",
                          )}
                        >
                          {formatCurrency(pendingAfter)}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Overpayment warning */}
                {Number(paymentAmount) >
                  Number(
                    (
                      selectedPurchase.netAmount -
                      (selectedPurchase.paidAmount || 0)
                    ).toFixed(2),
                  ) && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                    <span className="text-xs font-medium text-red-700">
                      Amount exceeds remaining balance — overpayment not allowed
                    </span>
                  </div>
                )}
              </div>

              {/* Payment Date */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Payment Date
                </label>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => {
                    setPaymentDate(e.target.value);
                    setPaymentError(null);
                  }}
                  disabled={isSavingPayment}
                  className="bg-white border-slate-300 focus:border-primary focus:ring-primary/20"
                />
              </div>

              {/* Mode selection */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4" />
                  Payment Mode
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(["cash", "upi", "card"] as const).map((mode) => (
                    <Button
                      key={mode}
                      variant={
                        selectedPaymentMode === mode ? "default" : "outline"
                      }
                      size="sm"
                      className={cn(
                        "font-semibold h-11",
                        selectedPaymentMode !== mode &&
                          "hover:border-slate-400",
                      )}
                      onClick={() => {
                        setSelectedPaymentMode(mode);
                        setPaymentError(null);
                      }}
                      disabled={isSavingPayment}
                    >
                      {selectedPaymentMode === mode && (
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      {mode.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Error message */}
              {paymentError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-red-700">
                    {paymentError}
                  </span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={() => setIsPaymentDialogOpen(false)}
                  disabled={isSavingPayment}
                  className="hover:bg-slate-100"
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    setIsSavingPayment(true);
                    setPaymentError(null);

                    const response = await savePayment();

                    setIsSavingPayment(false);

                    if (response.success) {
                      alert("Payment recorded successfully!");
                      setIsPaymentDialogOpen(false);
                    } else {
                      setPaymentError(response.error || "Something went wrong");
                    }
                  }}
                  disabled={
                    isSavingPayment ||
                    !paymentAmount ||
                    Number(paymentAmount) <= 0 ||
                    !paymentDate ||
                    !selectedPaymentMode ||
                    Number(paymentAmount) >
                      Number(
                        (
                          selectedPurchase.netAmount -
                          (selectedPurchase.paidAmount || 0)
                        ).toFixed(2),
                      )
                  }
                  className="min-w-40"
                >
                  {isSavingPayment ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Record Payment
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* PDF Preview Popup */}
      <Dialog
        open={pdfModalOpen}
        onOpenChange={(open) => {
          setPdfModalOpen(open);
          if (!open) {
            if (pdfBlobUrl) {
              URL.revokeObjectURL(pdfBlobUrl);
              setPdfBlobUrl(null);
            }
            setSelectedPdfPurchase(null);
          }
        }}
      >
        <DialogContent className="max-w-6xl h-[90vh] p-0 flex flex-col bg-white border-slate-200">
          <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <DialogTitle className="flex items-center justify-between">
              <span className="text-xl font-bold text-slate-800">
                Purchase Preview
                {selectedPdfPurchase?.vendorName && (
                  <span className="text-slate-700">
                    {" "}
                    - {selectedPdfPurchase.vendorName}
                  </span>
                )}
              </span>
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-slate-600 mt-1">
              <Calendar className="h-3.5 w-3.5" />
              Created: {formatDate(selectedPdfPurchase?.purchaseDate)}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 bg-slate-100 overflow-hidden">
            {isGeneratingPdf ? (
              <div className="h-full flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <div className="text-center">
                  <p className="text-lg font-semibold text-slate-900 mb-1">
                    Generating Purchase PDF
                  </p>
                  <p className="text-sm text-slate-500">
                    Please wait while we prepare your document...
                  </p>
                </div>
              </div>
            ) : pdfBlobUrl ? (
              <iframe
                src={`${pdfBlobUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-full border-0"
                title={`Purchase ${selectedPdfPurchase?.id || "preview"}`}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <p className="text-slate-600 font-medium">
                  Failed to load PDF preview
                </p>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setPdfModalOpen(false)}
              className="hover:bg-slate-100"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-slate-200 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <AlertCircle className="h-6 w-6 text-red-600" />
              Delete purchase?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 pt-2 space-y-3">
              <span className="block">
                This will permanently delete purchase{" "}
                <span className="font-semibold text-slate-900">
                  #{purchaseToDelete?.purchaseNumber}
                </span>{" "}
                for{" "}
                <span className="font-semibold text-slate-900">
                  {purchaseToDelete?.vendorName}
                </span>
                .
              </span>

              <span className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              disabled={isDeleting}
              className="hover:bg-slate-100"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(purchaseToDelete?.id || "")}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white min-w-35"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Purchase
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
