// components/quotation/quotation-table.tsx
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
  Eye,
  MoreHorizontal,
  Download,
  Loader2,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  CalendarDays,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Pencil,
  ReceiptIndianRupee,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Quotation } from "@/lib/firebase/quotations";
import { pdf } from "@react-pdf/renderer";
import QuotationPDF from "@/components/quotation/quotation-pdf";

type SortOrder = "asc" | "desc" | null;

interface QuotationTableProps {
  quotations: Quotation[];
  onEdit: (quotation: Quotation) => void;
  onDelete: (id: string) => void;
  onConvertToInvoice: (id: string) => void;
}

export function QuotationTable({
  quotations,
  onEdit,
  onDelete,
  onConvertToInvoice,
}: QuotationTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [amountSort, setAmountSort] = useState<SortOrder>(null);
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [datePreset, setDatePreset] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    // When a quotation is edited, reset date filters
    setDatePreset(null);
    setDateFrom("");
    setDateTo("");
  }, [quotations]);

  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedPdfQuotation, setSelectedPdfQuotation] =
    useState<Quotation | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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

    const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};


  const formatDate = (date?: Date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return "—"
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}


  const formatQuotationNumber = (num: number | undefined): string => {
    if (num == null) return "Draft";
    return `#${String(num).padStart(4, "0")}`;
  };

  const handleDownloadPDF = async (quotation: Quotation) => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const blob = await pdf(<QuotationPDF quotation={quotation} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Quotation-${formatQuotationNumber(quotation.quotationNumber)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("Failed to generate or download PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredQuotations = useMemo(() => {
    let result = quotations.filter((q) => {
      const search = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !search ||
        q.customerName?.toLowerCase().includes(search) ||
        q.customerPhone?.includes(search) ||
        q.customerGstin?.toLowerCase().includes(search) ||
        (q.quotationNumber != null &&
          String(q.quotationNumber).includes(search));

      const minAmount = amountMin ? parseFloat(amountMin) : null;
      const maxAmount = amountMax ? parseFloat(amountMax) : null;
      const matchesAmount =
        (minAmount === null || q.netAmount >= minAmount) &&
        (maxAmount === null || q.netAmount <= maxAmount);

      let matchesDate = true;

      if (q.quotationDate) {
        const qDate =
          q.quotationDate instanceof Date
            ? q.quotationDate
            : typeof (q.quotationDate as any)?.toDate === "function"
              ? (q.quotationDate as any).toDate()
              : null;

        if (!qDate) return false;

        const qDay = startOfDay(qDate);
const today = startOfDay(new Date());

if (datePreset) {
  switch (datePreset) {
    case "today":
      matchesDate = qDay.getTime() === today.getTime();
      break;

    case "yesterday": {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      matchesDate = qDay.getTime() === yesterday.getTime();
      break;
    }

    case "thisMonth":
      matchesDate =
        qDay.getMonth() === today.getMonth() &&
        qDay.getFullYear() === today.getFullYear();
      break;

    case "last30days": {
      const last30 = new Date(today);
      last30.setDate(last30.getDate() - 30);
      matchesDate = qDay >= last30;
      break;
    }
  }
} else if (dateFrom || dateTo) {
  const from = dateFrom ? startOfDay(new Date(dateFrom)) : null;
  const to = dateTo
    ? new Date(new Date(dateTo).setHours(23, 59, 59, 999))
    : null;

  matchesDate =
    (!from || qDay >= from) &&
    (!to || qDay <= to);
}

      }

      return matchesSearch && matchesAmount && matchesDate;
    });

    if (amountSort) {
      result = [...result].sort((a, b) =>
        amountSort === "asc"
          ? a.netAmount - b.netAmount
          : b.netAmount - a.netAmount,
      );
    }

    return result;
  }, [
    quotations,
    searchQuery,
    amountMin,
    amountMax,
    datePreset,
    dateFrom,
    dateTo,
    amountSort,
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

  return (
    <div className="space-y-6 ml-3 mr-3 mt-3 mb-3">
      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative max-w-md w-full">
          <Input
            placeholder="Search by customer, phone, GSTIN or quotation #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-slate-300 focus:border-indigo-400 focus:ring-indigo-200"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        </div>

        <div className="flex gap-3">
          {/* Amount Filter */}
          {/* Enhanced Amount Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "group relative overflow-hidden border-slate-300 hover:border-indigo-400 transition-all duration-300 shadow-sm hover:shadow-md",
                  amountMin || amountMax || amountSort
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-indigo-300"
                    : "text-slate-700 hover:bg-slate-50",
                )}
              >
                {/* Glow overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md pointer-events-none"></div>

                <span className="relative flex items-center gap-2 font-medium">
                  <IndianRupee className="h-4 w-4" />
                  Amount
                  <Filter
                    className={cn(
                      "h-4 w-4 transition-all duration-300",
                      amountMin || amountMax || amountSort
                        ? "text-indigo-600 scale-110"
                        : "text-slate-400 group-hover:text-indigo-600 group-hover:scale-110",
                    )}
                  />
                  {amountSort === "asc" && (
                    <ChevronUp className="h-4 w-4 text-indigo-600" />
                  )}
                  {amountSort === "desc" && (
                    <ChevronDown className="h-4 w-4 text-indigo-600" />
                  )}
                </span>
              </Button>
            </PopoverTrigger>

            <PopoverContent
              className="w-80 p-6 bg-white border border-slate-200 shadow-2xl rounded-xl"
              align="end"
            >
              <div className="space-y-5">
                {/* Header with gradient icon */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                    <IndianRupee className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
                    Filter & Sort by Amount
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
                    className={cn(
                      "flex-1 transition-all duration-300 shadow-sm",
                      amountSort === "asc" &&
                        "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white",
                    )}
                  >
                    <ChevronUp className="h-4 w-4 mr-2" /> Low to High
                  </Button>
                  <Button
                    variant={amountSort === "desc" ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setAmountSort(amountSort === "desc" ? null : "desc")
                    }
                    className={cn(
                      "flex-1 transition-all duration-300 shadow-sm",
                      amountSort === "desc" &&
                        "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white",
                    )}
                  >
                    <ChevronDown className="h-4 w-4 mr-2" /> High to Low
                  </Button>
                </div>

                {/* Min / Max Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700">
                      Minimum Amount
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={amountMin}
                      onChange={(e) => setAmountMin(e.target.value)}
                      className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-200 h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700">
                      Maximum Amount
                    </label>
                    <Input
                      type="number"
                      placeholder="Any"
                      value={amountMax}
                      onChange={(e) => setAmountMax(e.target.value)}
                      className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-200 h-10"
                    />
                  </div>
                </div>

                {/* Clear Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAmountFilter}
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors mt-2"
                >
                  Clear Amount Filter
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Date Filter */}
          {/* Enhanced Date Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "group relative overflow-hidden border-slate-300 hover:border-indigo-400 transition-all duration-300 shadow-sm hover:shadow-md",
                  datePreset || dateFrom || dateTo
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-indigo-300"
                    : "text-slate-700 hover:bg-slate-50",
                )}
              >
                {/* Glow overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md pointer-events-none"></div>

                <span className="relative flex items-center gap-2 font-medium">
                  <CalendarDays className="h-4 w-4" />
                  Date
                  <Filter
                    className={cn(
                      "h-4 w-4 transition-all duration-300",
                      datePreset || dateFrom || dateTo
                        ? "text-indigo-600 scale-110"
                        : "text-slate-400 group-hover:text-indigo-600 group-hover:scale-110",
                    )}
                  />
                </span>
              </Button>
            </PopoverTrigger>

            <PopoverContent
              className="w-96 p-6 bg-white border border-slate-200 shadow-2xl rounded-xl"
              align="end"
            >
              <div className="space-y-6">
                {/* Header with gradient icon */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                    <CalendarDays className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
                    Filter by Date
                  </h3>
                </div>

                {/* Quick Preset Buttons */}
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
                      className={cn(
                        "transition-all duration-300 shadow-sm",
                        datePreset === item.value &&
                          "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white",
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

                {/* Custom Range */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                    Custom Date Range
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-indigo-600" />
                        From
                      </label>
                      <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => {
                          setDateFrom(e.target.value);
                          setDatePreset(null);
                        }}
                        className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-200 h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-indigo-600" />
                        To
                      </label>
                      <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => {
                          setDateTo(e.target.value);
                          setDatePreset(null);
                        }}
                        className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-200 h-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Clear Filter Button */}
                {(datePreset || dateFrom || dateTo) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearDateFilter}
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors mt-2"
                  >
                    Clear Date Filter
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Empty State */}
      {filteredQuotations.length === 0 ? (
        <div className="text-center py-16 bg-slate-50/70 rounded-xl border border-slate-200">
          <ReceiptIndianRupee className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <p className="text-lg font-medium text-slate-700">
            No quotations found
          </p>
          <p className="text-sm text-slate-500 mt-2">
            {searchQuery ||
            amountMin ||
            amountMax ||
            datePreset ||
            dateFrom ||
            dateTo
              ? "Try adjusting your filters"
              : "Create your first quotation to get started"}
          </p>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 border-b border-slate-200">
                <TableHead className="font-semibold text-slate-700">
                  Amount
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">
                  #Quotation
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Customer
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Date
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-right pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredQuotations.map((quotation, index) => (
                <TableRow
                  key={quotation.id}
                  className={cn(
                    "hover:bg-slate-50/70 transition-colors",
                    index % 2 === 0 ? "bg-white" : "bg-slate-50/40",
                  )}
                >
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 border-emerald-200 px-2.5 py-0.5 font-medium"
                    >
                      {formatCurrency(quotation.netAmount)}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-center font-semibold text-slate-700">
                    {formatQuotationNumber(quotation.quotationNumber)}
                  </TableCell>

                  <TableCell>
                    <div className="font-medium text-slate-900">
                      {quotation.customerName || "—"}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      {quotation.customerPhone && (
                        <span>{quotation.customerPhone}</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm font-medium text-slate-700">
                      {quotation.quotationDate
                        ? formatDate(quotation.quotationDate)
                        : "—"}
                    </div>
                  </TableCell>

                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-2 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all duration-200 group"
                        disabled={isGenerating}
                        onClick={async () => {
                          if (isGenerating) return;
                          setIsGenerating(true);
                          setSelectedPdfQuotation(quotation);
                          setPdfModalOpen(true);
                          try {
                            const blob = await pdf(
                              <QuotationPDF quotation={quotation} />,
                            ).toBlob();
                            const url = URL.createObjectURL(blob);
                            setPdfBlobUrl(url);
                          } catch (err) {
                            console.error("PDF error:", err);
                            alert("Failed to generate PDF preview");
                          } finally {
                            setIsGenerating(false);
                          }
                        }}
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
                            onClick={() => onEdit(quotation)}
                            className="cursor-pointer group hover:bg-indigo-50 transition-colors"
                          >
                            <Pencil className="h-4 w-4 mr-2 text-indigo-600 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">Edit</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => onConvertToInvoice(quotation.id)}
                            className="cursor-pointer group hover:bg-emerald-50 transition-colors"
                          >
                            <IndianRupee className="h-4 w-4 mr-2 text-emerald-600 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">
                              Convert to Invoice
                            </span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleDownloadPDF(quotation)}
                            disabled={isGenerating}
                            className="cursor-pointer group hover:bg-blue-50 transition-colors"
                          >
                            <Download className="h-4 w-4 mr-2 text-blue-600 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">Download PDF</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors group"
                            onClick={() => onDelete(quotation.id)}
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
      )}

      {/* PDF Preview Modal */}
      <Dialog open={pdfModalOpen} onOpenChange={setPdfModalOpen}>
        <DialogContent className="max-w-6xl h-[90vh] p-0 flex flex-col bg-white border-slate-200">
          <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
              Quotation Preview
              {selectedPdfQuotation?.customerName &&
                ` – ${selectedPdfQuotation.customerName}`}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-slate-600 mt-1">
              {selectedPdfQuotation ? (
                <>
                  <CalendarDays className="h-3.5 w-3.5" />
                  Quotation Date:{" "}
                  {selectedPdfQuotation.quotationDate
                    ? formatDate(selectedPdfQuotation.quotationDate)
                    : "—"}
                </>
              ) : (
                "Loading quotation..."
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 bg-slate-100 overflow-hidden">
            {isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  <Loader2 className="relative h-16 w-16 animate-spin text-indigo-600" />
                </div>
                <p className="text-lg font-semibold text-slate-900">
                  Generating Quotation PDF
                </p>
                <p className="text-sm text-slate-500">Please wait...</p>
              </div>
            ) : pdfBlobUrl ? (
              <iframe
                src={`${pdfBlobUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-full border-0"
                title="Quotation PDF Preview"
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

          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
            <Button variant="outline" onClick={() => setPdfModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
