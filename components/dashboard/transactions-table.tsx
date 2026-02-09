"use client";

import { useState, useEffect } from "react";
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
  IndianRupee,
  Filter,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Trash2,
  Printer,
  Download,
  AlertCircle,
  CreditCard,
  CheckCircle2,
  DollarSign,
  Search,
  Calendar,
  Edit,
  BellRing,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteInvoice, type Invoice } from "@/lib/firebase/invoices";
import type { SortOrder } from "@/hooks/use-dashboard";
import { pdf } from "@react-pdf/renderer";
import InvoicePDF from "@/components/dashboard/invoice-pdf";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { exportTransactionsToExcel } from "@/lib/utils/exportToExcel";
import { Timestamp } from "firebase/firestore";

interface TransactionsTableProps {
  invoices: Invoice[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;

  selectedInvoice: Invoice | null;
  isPaymentDialogOpen: boolean;
  setIsPaymentDialogOpen: (v: boolean) => void;

  paymentAmount: string;
  setPaymentAmount: (v: string) => void;
  paymentDate: string;
  setPaymentDate: (v: string) => void;
  selectedPaymentMode: Invoice["mode"];
  setSelectedPaymentMode: (v: Invoice["mode"]) => void;
  savePayment: () => Promise<{
    success: boolean;
    result?: any;
    error?: string;
  }>;

  amountSort: SortOrder;
  setAmountSort: (v: SortOrder) => void;
  amountMin: string;
  setAmountMin: (v: string) => void;
  amountMax: string;
  setAmountMax: (v: string) => void;

  statusFilters: Invoice["status"][];
  setStatusFilters: (filters: Invoice["status"][]) => void;
  modeFilters: Invoice["mode"][];
  setModeFilters: (filters: Invoice["mode"][]) => void;

  filteredInvoices: Invoice[];
  uniqueModes: Invoice["mode"][];
  allStatuses: Invoice["status"][];

  formatCurrency: (amount: number) => string;
  formatDate: (value: any) => string;
  getRelativeTime: (timestamp: Date | undefined) => string;
  getStatusBadgeVariant: (status: Invoice["status"]) => string;

  handleRecordPayment: (invoice: Invoice) => void;
  toggleStatusFilter: (status: Invoice["status"]) => void;
  toggleModeFilter: (mode: Invoice["mode"]) => void;
  clearAmountFilter: () => void;

  datePreset: string | null;
  setDatePreset: (preset: string | null) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  clearDateFilter: () => void;

  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  invoiceToDelete: Invoice | null;
  isDeleting: boolean;
  openDeleteDialog: (invoice: Invoice) => void;
  handleDeleteInvoice: () => Promise<void>;
}

export function TransactionsTable(props: TransactionsTableProps) {
  const router = useRouter();
  const {
    searchQuery,
    setSearchQuery,
    selectedInvoice,
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,

    paymentAmount,
    setPaymentAmount,
    paymentDate,
    setPaymentDate,
    selectedPaymentMode,
    setSelectedPaymentMode,
    savePayment,

    amountSort,
    setAmountSort,
    amountMin,
    setAmountMin,
    amountMax,
    setAmountMax,
    statusFilters,
    setStatusFilters,
    modeFilters,
    setModeFilters,
    filteredInvoices,
    uniqueModes,
    allStatuses,
    formatCurrency,
    formatDate,
    getRelativeTime,
    getStatusBadgeVariant,
    handleRecordPayment,

    toggleStatusFilter,
    toggleModeFilter,
    clearAmountFilter,
    datePreset,
    setDatePreset,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    clearDateFilter,
  } = props;

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    return (b.invoiceNumber || 0) - (a.invoiceNumber || 0);
  });

  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedPdfInvoice, setSelectedPdfInvoice] = useState<Invoice | null>(
    null,
  );
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pendingDownloadInvoice, setPendingDownloadInvoice] =
    useState<Invoice | null>(null);

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

  function safeToDate(value: any): Date | undefined {
    if (!value) return undefined;

    if (value instanceof Date) return value;

    if (value instanceof Timestamp) return value.toDate();

    if (typeof value?.toDate === "function") return value.toDate();

    if (typeof value?.seconds === "number") {
      return new Date(value.seconds * 1000);
    }

    return undefined;
  }

  return (
    <div className="space-y-5 ml-3 mt-3 mr-3 mb-3">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg">
          <div className="font-bold">Transactions</div>
          <div className="relative">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
              {filteredInvoices.length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-300 hover:bg-slate-50"
            onClick={() => exportTransactionsToExcel(filteredInvoices)}
          >
            <Download className="h-4 w-4 mr-2 text-primary" />
            <span className="font-semibold">Export Excel</span>
          </Button>

          <Link href="/dashboard/invoice">
            <Button size="sm" className="px-8">
              <Plus className="h-5 w-5" />
              <span className="font-semibold">Create Invoice</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by phone, customer, GST number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white border-slate-200 selection:bg-slate-300 focus:border-primary focus:ring-primary/20"
        />
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
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <DollarSign className="h-3 w-3 text-white" />
                        </div>
                        <h3 className="font-semibold text-slate-800">
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
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
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
                            variant="outline"
                            className={cn(
                              "flex-1 text-xs font-medium py-1 px-3",
                              status === "paid" && "bg-emerald-50",
                              status === "partially paid" && "bg-amber-200",
                              status === "pending" && "bg-indigo-200",
                            )}
                          >
                            {status === "partially paid"
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
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
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
                              mode === "cash" && "bg-amber-200",
                              mode === "upi" && "bg-violet-200",
                              mode === "card" && "bg-indigo-200",
                              !mode && "bg-slate-300",
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
                Invoice #
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Customer
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
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="font-semibold text-slate-800">
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
            {sortedInvoices.map((invoice, index) => (
              <TableRow
                key={invoice.id}
                className={cn(
                  "hover:bg-slate-50/70 transition-colors",
                  index % 2 === 0 ? "bg-white" : "bg-slate-50/40",
                )}
              >
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="font-semibold text-slate-900">
                      {formatCurrency(invoice.netAmount)}
                    </div>
                    {invoice.status === "partially paid" && (
                      <div className="text-xs font-medium text-orange-700 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Pending:{" "}
                        {formatCurrency(
                          invoice.netAmount - (invoice.paidAmount || 0),
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
                        getStatusBadgeVariant(invoice.status),
                      )}
                    >
                      {invoice.status
                        ? invoice.status === "partially paid"
                          ? "Partially Paid"
                          : invoice.status.charAt(0).toUpperCase() +
                            invoice.status.slice(1)
                        : "—"}
                    </Badge>
                    {(invoice.status === "pending" ||
                      invoice.status === "partially paid") && (
                      <BellRing className="h-4 w-4 text-orange-600" />
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  {invoice.mode && (
                    <Badge
                      variant="outline"
                      className="bg-slate-100 text-slate-700 border-slate-300 font-medium"
                    >
                      {invoice.mode}
                    </Badge>
                  )}
                </TableCell>

                <TableCell className="text-sm font-semibold text-slate-700">
                  #
                  {invoice.invoiceNumber
                    ? String(invoice.invoiceNumber).padStart(4, "0")
                    : "Draft"}
                </TableCell>

                <TableCell>
                  <div className="text-sm font-semibold text-slate-900">
                    {invoice.customerName}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <span>{invoice.customerPhone}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="text-sm font-medium text-slate-700">
                    {formatDate(invoice.invoiceDate ?? invoice.createdAt)}
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 px-3 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                      onClick={() => handleRecordPayment(invoice)}
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
                        setSelectedPdfInvoice(invoice);
                        setPdfModalOpen(true);

                        try {
                          const element = <InvoicePDF invoice={invoice} />;
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
                          onClick={() =>
                            router.push(`/dashboard/invoice?edit=${invoice.id}`)
                          }
                          className="cursor-pointer hover:bg-primary/5"
                        >
                          <Edit className="h-4 w-4 mr-2 text-primary" />
                          <span className="font-medium">Edit</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={async () => {
                            if (isGeneratingPdf) return;

                            setIsGeneratingPdf(true);
                            try {
                              const element = <InvoicePDF invoice={invoice} />;
                              const blob = await pdf(element).toBlob();

                              const url = URL.createObjectURL(blob);
                              const link = document.createElement("a");
                              link.href = url;
                              link.download = `Invoice-${invoice.id || "draft"}-${invoice.customerName || "client"}.pdf`;
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
                          }}
                          className="cursor-pointer hover:bg-blue-50"
                          disabled={isGeneratingPdf}
                        >
                          <Download className="h-4 w-4 mr-2 text-blue-600" />
                          <span className="font-medium">Download PDF</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() =>
                            alert("Thermal print not implemented yet")
                          }
                          className="cursor-pointer hover:bg-purple-50"
                        >
                          <Printer className="h-4 w-4 mr-2 text-purple-600" />
                          <span className="font-medium">Thermal Print</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => {
                            props.openDeleteDialog(invoice);
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
                {selectedInvoice?.customerName || "this invoice"}
              </span>
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-6 py-2">
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="text-xs font-medium text-blue-700 mb-1 flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5" />
                    Total Amount
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatCurrency(selectedInvoice.netAmount)}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
                  <div className="text-xs font-medium text-orange-700 mb-1 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Still Pending
                  </div>
                  <div className="text-2xl font-bold text-orange-900">
                    {formatCurrency(
                      selectedInvoice.netAmount -
                        (selectedInvoice.paidAmount || 0),
                    )}
                  </div>
                </div>
              </div>

              {/* Amount Received */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <IndianRupee className="h-4 w-4" />
                  Amount Received
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
                  className="text-lg h-12 font-semibold bg-white border-slate-300 selection:bg-slate-300 focus:border-primary focus:ring-primary/20"
                  min="0.01"
                  max={Math.max(
                    0,
                    selectedInvoice.netAmount -
                      (selectedInvoice.paidAmount || 0),
                  )}
                  step="0.01"
                  disabled={isSavingPayment}
                />

                {/* Real-time preview */}
                {(() => {
                  const remaining = Number(
                    (
                      selectedInvoice.netAmount -
                      (selectedInvoice.paidAmount || 0)
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
                      selectedInvoice.netAmount -
                      (selectedInvoice.paidAmount || 0)
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
                  className="bg-white border-slate-300 focus:border-primary selection:bg-slate-300 focus:ring-primary/20"
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
                          selectedInvoice.netAmount -
                          (selectedInvoice.paidAmount || 0)
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
            setSelectedPdfInvoice(null);
          }
        }}
      >
        <DialogContent className="max-w-6xl h-[90vh] p-0 flex flex-col bg-white border-slate-200">
          <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <DialogTitle className="flex items-center justify-between">
              <span className="text-xl font-bold text-slate-800">
                Invoice Preview
                {selectedPdfInvoice?.customerName && (
                  <span className="text-slate-700">
                    {" "}
                    - {selectedPdfInvoice.customerName}
                  </span>
                )}
              </span>
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-slate-600 mt-1">
              {selectedPdfInvoice
                ? (() => {
                    const createdAtDate = safeToDate(
                      selectedPdfInvoice.invoiceDate,
                    );

                    return (
                      <>
                        <Calendar className="h-3.5 w-3.5" />
                        Created: {formatDate(createdAtDate)}
                      </>
                    );
                  })()
                : "Loading invoice..."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 bg-slate-100 overflow-hidden">
            {isGeneratingPdf ? (
              <div className="h-full flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <div className="text-center">
                  <p className="text-lg font-semibold text-slate-900 mb-1">
                    Generating Invoice PDF
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
                title={`Invoice ${selectedPdfInvoice?.id || "preview"}`}
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
      <AlertDialog
        open={props.deleteDialogOpen}
        onOpenChange={props.setDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-white border-slate-200 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <AlertCircle className="h-6 w-6 text-red-600" />
              Delete invoice?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 pt-2 space-y-3">
              <span className="block">
                This will permanently delete invoice{" "}
                <span className="font-semibold text-slate-900">
                  #{props.invoiceToDelete?.invoiceNumber}
                </span>{" "}
                for{" "}
                <span className="font-semibold text-slate-900">
                  {props.invoiceToDelete?.customerName}
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
              disabled={props.isDeleting}
              className="hover:bg-slate-100"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={props.handleDeleteInvoice}
              disabled={props.isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white min-w-35"
            >
              {props.isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Invoice
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
