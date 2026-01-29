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
  // ... existing imports
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
  Send,
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
import type { SortOrder } from "@/app/dashboard/hooks/useDashboard";
import { pdf } from "@react-pdf/renderer";
import InvoicePDF from "@/components/dashboard/invoice-pdf";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { exportTransactionsToExcel } from "@/lib/utils/exportToExcel"; // Adjust path to your new utility file

interface TransactionsTableProps {
  invoices: Invoice[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;

  selectedInvoice: Invoice | null;
  isPaymentDialogOpen: boolean;
  setIsPaymentDialogOpen: (v: boolean) => void;

  // ── NEW: Payment dialog form state & actions ───────────────────────────
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

  // Existing filter-related props
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
  formatDate: (date: Date | undefined) => string;
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

  // PDF modal states
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedPdfInvoice, setSelectedPdfInvoice] = useState<Invoice | null>(
    null,
  );
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pendingDownloadInvoice, setPendingDownloadInvoice] =
    useState<Invoice | null>(null);

  // NEW local states for UI feedback in dialog
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Cleanup blob URL when modal closes or component unmounts
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
        setPdfBlobUrl(null);
      }
    };
  }, [pdfBlobUrl]);

  return (
  <div className="space-y-5 ml-3 mt-3 mr-3 mb-3">
    {/* Enhanced Header */}
    <div className="flex items-center justify-between gap-6 pb-4 border-b-2 border-gradient-to-r from-indigo-200 via-purple-200 to-pink-200">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
        <div className="relative flex items-center gap-3 bg-white px-4 py-2 rounded-lg">
          <div className="text-lg font-bold bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 bg-clip-text text-transparent">
            Transactions
          </div>
          <div className="relative">
            <span className="flex h-7 w-7">
              <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex items-center justify-center rounded-full h-7 w-7 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold shadow-lg">
                {filteredInvoices.length}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="group relative overflow-hidden bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:shadow-lg transition-all duration-300"
          onClick={() => exportTransactionsToExcel(filteredInvoices)}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <Download className="h-4 w-4 mr-2 text-purple-600" />
          <span className="font-semibold text-purple-700">
            Export Excel
          </span>
        </Button>

        <Link href="/dashboard/invoice">
          <Button 
            size="sm"
            className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-8"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-semibold">Create Invoice</span>
          </Button>
        </Link>
      </div>
    </div>

    {/* Enhanced Search */}
    <div className="relative group max-w-md">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
        <Input
          placeholder="Search by phone, customer, GST number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white border-slate-200 focus:border-indigo-500 transition-all duration-300"
        />
      </div>
    </div>

    {/* Enhanced Table */}
    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-lg bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-slate-50 via-slate-50 to-slate-100 border-b-2 border-slate-200 hover:bg-slate-100">
            <TableHead className="font-semibold text-slate-700">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 hover:text-indigo-600 transition-colors group">
                    <DollarSign className="h-4 w-4" />
                    Amount
                    <Filter
                      className={cn(
                        "h-3.5 w-3.5 transition-all duration-300",
                        amountMin || amountMax || amountSort
                          ? "text-indigo-600 scale-110"
                          : "text-slate-400 group-hover:scale-110",
                      )}
                    />
                    {amountSort === "asc" && (
                      <ChevronUp className="h-3.5 w-3.5 text-indigo-600" />
                    )}
                    {amountSort === "desc" && (
                      <ChevronDown className="h-3.5 w-3.5 text-indigo-600" />
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-72 p-4 bg-white border-slate-200 shadow-xl"
                  align="start"
                >
                  <div className="space-y-4">
                    <div className="font-semibold text-sm flex items-center gap-2">
                      <Filter className="h-4 w-4 text-indigo-600" />
                      Filter by Amount
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={amountSort === "asc" ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          setAmountSort(amountSort === "asc" ? null : "asc")
                        }
                        className={cn(
                          "transition-all duration-300",
                          amountSort === "asc" &&
                            "bg-indigo-600 hover:bg-indigo-700",
                        )}
                      >
                        <ChevronUp className="h-3.5 w-3.5 mr-1" /> Low to High
                      </Button>
                      <Button
                        variant={
                          amountSort === "desc" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setAmountSort(amountSort === "desc" ? null : "desc")
                        }
                        className={cn(
                          "transition-all duration-300",
                          amountSort === "desc" &&
                            "bg-indigo-600 hover:bg-indigo-700",
                        )}
                      >
                        <ChevronDown className="h-3.5 w-3.5 mr-1" /> High to
                        Low
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                          Min
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={amountMin}
                          onChange={(e) => setAmountMin(e.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                          Max
                        </label>
                        <Input
                          type="number"
                          placeholder="Any"
                          value={amountMax}
                          onChange={(e) => setAmountMax(e.target.value)}
                          className="h-9"
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAmountFilter}
                      className="w-full hover:bg-red-50 hover:text-red-600"
                    >
                      Clear Filter
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </TableHead>

            <TableHead className="font-semibold text-slate-700">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 hover:text-indigo-600 transition-colors group">
                    <CheckCircle2 className="h-4 w-4" />
                    Status
                    <Filter
                      className={cn(
                        "h-3.5 w-3.5 transition-all duration-300",
                        statusFilters.length > 0
                          ? "text-indigo-600 scale-110"
                          : "text-slate-400 group-hover:scale-110",
                      )}
                    />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-56 p-4 bg-white shadow-xl"
                  align="start"
                >
                  <div className="space-y-3">
                    <div className="font-semibold text-sm flex items-center gap-2">
                      <Filter className="h-4 w-4 text-indigo-600" />
                      Filter by Status
                    </div>
                    {allStatuses.map((status) => (
                      <label
                        key={`status-${status}`}
                        className="flex items-center gap-2.5 cursor-pointer group/item hover:bg-slate-50 p-2 rounded-lg transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={statusFilters.includes(status)}
                          onChange={() => toggleStatusFilter(status)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs capitalize transition-all duration-200 group-hover/item:scale-105",
                            getStatusBadgeVariant(status),
                          )}
                        >
                          {status}
                        </Badge>
                      </label>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStatusFilters([])}
                      className="w-full mt-2 hover:bg-red-50 hover:text-red-600"
                    >
                      Clear Filter
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </TableHead>

            <TableHead className="font-semibold text-slate-700">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 hover:text-indigo-600 transition-colors group">
                    <CreditCard className="h-4 w-4" />
                    Mode
                    <Filter
                      className={cn(
                        "h-3.5 w-3.5 transition-all duration-300",
                        modeFilters.length > 0
                          ? "text-indigo-600 scale-110"
                          : "text-slate-400 group-hover:scale-110",
                      )}
                    />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-52 p-4 bg-white shadow-xl"
                  align="start"
                >
                  <div className="space-y-3">
                    <div className="font-semibold text-sm flex items-center gap-2">
                      <Filter className="h-4 w-4 text-indigo-600" />
                      Filter by Mode
                    </div>
                    {uniqueModes.map((mode) => (
                      <label
                        key={`mode-${mode ?? "unknown"}`}
                        className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={modeFilters.includes(mode)}
                          onChange={() => toggleModeFilter(mode)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <Badge
                          variant="outline"
                          className="bg-slate-100 text-slate-700 border-slate-300"
                        >
                          {mode ?? "—"}
                        </Badge>
                      </label>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setModeFilters([])}
                      className="w-full mt-2 hover:bg-red-50 hover:text-red-600"
                    >
                      Clear Filter
                    </Button>
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

            <TableHead className="font-semibold text-slate-700">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 hover:text-indigo-600 transition-colors group">
                    <Calendar className="h-4 w-4" />
                    Date
                    <Filter
                      className={cn(
                        "h-3.5 w-3.5 transition-all duration-300",
                        datePreset || dateFrom || dateTo
                          ? "text-indigo-600 scale-110"
                          : "text-slate-400 group-hover:scale-110",
                      )}
                    />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-80 p-4 bg-white shadow-xl"
                  align="start"
                >
                  <div className="space-y-4">
                    <div className="font-semibold text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-indigo-600" />
                      Filter by Date
                    </div>
                    <div className="grid grid-cols-2 gap-2">
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
                          className={cn(
                            "transition-all duration-300",
                            datePreset === item.value &&
                              "bg-indigo-600 hover:bg-indigo-700",
                          )}
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

                    <div className="space-y-3 pt-2 border-t">
                      <div className="text-xs font-medium text-slate-600">
                        Custom range
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1.5">
                            From
                          </label>
                          <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => {
                              setDateFrom(e.target.value);
                              setDatePreset(null);
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1.5">
                            To
                          </label>
                          <Input
                            type="date"
                            value={dateTo}
                            onChange={(e) => {
                              setDateTo(e.target.value);
                              setDatePreset(null);
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full hover:bg-red-50 hover:text-red-600"
                      onClick={clearDateFilter}
                    >
                      Clear Date Filter
                    </Button>
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
          {filteredInvoices.map((invoice, index) => (
            <TableRow
              key={invoice.id}
              className={cn(
                "hover:bg-slate-50 transition-colors duration-200 animate-in fade-in slide-in-from-bottom-2",
                index % 2 === 0 ? "bg-white" : "bg-slate-50/50",
              )}
              style={{ animationDelay: `${index * 30}ms` }}
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
                      "text-xs font-medium transition-all duration-200 hover:scale-105",
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
                  {formatDate(invoice.createdAt?.toDate())}
                </div>
                <div className="text-xs text-slate-500">
                  {getRelativeTime(invoice.createdAt?.toDate())}
                </div>
              </TableCell>

              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-3 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200 group"
                    onClick={() => handleRecordPayment(invoice)}
                    title="Record Payment"
                  >
                    <IndianRupee className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all duration-200 group"
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
                    <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    View
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 hover:bg-slate-100 transition-all duration-200 group"
                      >
                        <MoreHorizontal className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 bg-white border-slate-200 shadow-xl"
                    >
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/dashboard/invoice?edit=${invoice.id}`)
                        }
                        className="cursor-pointer group hover:bg-indigo-50 transition-colors"
                      >
                        <Edit className="h-4 w-4 mr-2 text-indigo-600 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Edit</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={async () => {
                          if (isGeneratingPdf) return;

                          setIsGeneratingPdf(true);
                          try {
                            const element = <InvoicePDF invoice={invoice} />;
                            const blob = await pdf(element).toBlob();

                            // Trigger download
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = url;
                            link.download = `Invoice-${invoice.id || "draft"}-${invoice.customerName || "client"}.pdf`;
                            document.body.appendChild(link);
                            link.click();

                            // Cleanup
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                          } catch (err) {
                            console.error("PDF download failed:", err);
                            alert("Failed to generate PDF for download");
                          } finally {
                            setIsGeneratingPdf(false);
                          }
                        }}
                        className="cursor-pointer group hover:bg-blue-50 transition-colors"
                        disabled={isGeneratingPdf}
                      >
                        <Download className="h-4 w-4 mr-2 text-blue-600 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Download PDF</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() =>
                          alert("Thermal print not implemented yet")
                        }
                        className="cursor-pointer group hover:bg-purple-50 transition-colors"
                      >
                        <Printer className="h-4 w-4 mr-2 text-purple-600 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Thermal Print</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors group"
                        onClick={() => {
                          props.openDeleteDialog(invoice);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
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
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
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
            {/* Enhanced Summary cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                <div className="text-xs font-medium text-blue-700 mb-1 flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" />
                  Total Amount
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {formatCurrency(selectedInvoice.netAmount)}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200">
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

            {/* Enhanced Amount Received */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <IndianRupee className="h-4 w-4" />
                Amount Received
                <span className="text-red-500 text-xs">*</span>
              </label>

              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPaymentAmount(val);
                    setPaymentError(null);
                  }}
                  placeholder="0.00"
                  className="relative text-lg h-12 font-semibold bg-white border-slate-300 focus:border-indigo-500"
                  min="0.01"
                  max={Math.max(
                    0,
                    selectedInvoice.netAmount -
                      (selectedInvoice.paidAmount || 0),
                  )}
                  step="0.01"
                  disabled={isSavingPayment}
                />
              </div>

              {/* Enhanced Real-time preview */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">
                    Pending after payment:
                  </span>
                  <span
                    className={cn(
                      "font-bold text-sm",
                      (() => {
                        const remaining =
                          selectedInvoice.netAmount -
                          (selectedInvoice.paidAmount || 0);
                        const entered = Number(paymentAmount) || 0;
                        if (entered > remaining) return "text-red-600";
                        if (entered === remaining) return "text-emerald-600";
                        return "text-orange-600";
                      })(),
                    )}
                  >
                    {formatCurrency(
                      Math.max(
                        0,
                        selectedInvoice.netAmount -
                          (selectedInvoice.paidAmount || 0) -
                          (Number(paymentAmount) || 0),
                      ),
                    )}
                  </span>
                </div>
              </div>

              {/* Enhanced Overpayment warning */}
              {Number(paymentAmount) >
                selectedInvoice.netAmount -
                  (selectedInvoice.paidAmount || 0) && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span className="text-xs font-medium text-red-700">
                    Amount exceeds remaining balance — overpayment not allowed
                  </span>
                </div>
              )}
            </div>

            {/* Enhanced Payment Date */}
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
                className="bg-white border-slate-300"
              />
            </div>

            {/* Enhanced Mode selection */}
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
                      "relative overflow-hidden transition-all duration-300 font-semibold h-11",
                      selectedPaymentMode === mode &&
                        mode === "cash" &&
                        "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg",
                      selectedPaymentMode === mode &&
                        mode === "upi" &&
                        "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg",
                      selectedPaymentMode === mode &&
                        mode === "card" &&
                        "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg",
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

            {/* Enhanced Error message */}
            {paymentError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-red-700">
                  {paymentError}
                </span>
              </div>
            )}

            {/* Enhanced Action buttons */}
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
                    selectedInvoice.netAmount -
                      (selectedInvoice.paidAmount || 0)
                }
                className="min-w-[160px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
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
        <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <DialogTitle className="flex items-center justify-between">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
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
            {selectedPdfInvoice ? (
              <>
                <Calendar className="h-3.5 w-3.5" />
                Created: {formatDate(
                  selectedPdfInvoice.createdAt?.toDate(),
                )}{" "}
                • {getRelativeTime(selectedPdfInvoice.createdAt?.toDate())}
              </>
            ) : (
              "Loading invoice..."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 bg-slate-100 overflow-hidden">
          {isGeneratingPdf ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <Loader2 className="relative h-16 w-16 animate-spin text-indigo-600" />
              </div>
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
      <AlertDialogContent className="bg-white border-slate-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <AlertCircle className="h-6 w-6 text-red-600" />
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-600 space-y-2 pt-2">
            <p>
              This will permanently delete invoice{" "}
              <span className="font-semibold text-slate-900">
                #
                {props.invoiceToDelete?.invoiceNumber
                  ? String(props.invoiceToDelete.invoiceNumber).padStart(
                      4,
                      "0",
                    )
                  : "draft"}
              </span>{" "}
              for{" "}
              <span className="font-semibold text-slate-900">
                {props.invoiceToDelete?.customerName || "this customer"}
              </span>
              .
            </p>
            <p className="flex items-center gap-1.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              This action cannot be undone.
            </p>
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
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:ring-red-600 text-white shadow-lg min-w-[140px]"
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
