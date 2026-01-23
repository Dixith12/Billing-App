//component/quotation/quotation-table
"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Quotation } from "@/lib/firebase/quotations";
import {
  Filter,
  ChevronUp,
  ChevronDown,
  Eye,
  MoreHorizontal,
  Download,
  Loader2,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; // shadcn dialog for preview modal
import { pdf, PDFViewer } from "@react-pdf/renderer";
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
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedPdfQuotation, setSelectedPdfQuotation] =
    useState<Quotation | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);

  const formatDate = (date: Date | undefined) =>
    date
      ? new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(date)
      : "-";

  const getRelativeTime = (timestamp: Date | undefined): string => {
    if (!timestamp) return "—";

    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();

    if (diffMs < 0) return "just now"; // future dates (unlikely but safe)

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 45) return "just now";
    if (diffSeconds < 90) return "1 minute ago";
    if (diffMinutes < 45) return `${diffMinutes} minutes ago`;
    if (diffMinutes < 90) return "1 hour ago";
    if (diffHours < 22) return `${diffHours} hours ago`;
    if (diffHours < 36) return "1 day ago";
    if (diffDays < 6) return `${diffDays} days ago`;
    if (diffDays < 10) return "1 week ago";
    if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
    if (diffMonths < 12) return `${diffMonths} months ago`;
    if (diffYears === 1) return "1 year ago";

    return `${diffYears} years ago`;
  };

  const formatQuotationNumber = (num: number | undefined): string => {
    if (num == null) return "#Draft";
    return `#${String(num).padStart(4, "0")}`;
  };

  // ── Download handler (native browser - no file-saver needed) ────────────────────────
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
      alert("Failed to generate or download PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredQuotations = useMemo(() => {
    let result = quotations.filter((q) => {
      const search = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !search ||
        (q.customerName ?? "").toLowerCase().includes(search) ||
        (q.customerPhone ?? "").includes(search) ||
        (q.customerGstin ?? "").toLowerCase().includes(search) ||
        (q.quotationNumber != null &&
          (q.quotationNumber.toString().includes(search) ||
            String(q.quotationNumber).includes(String(Number(search) || ""))));

      const minAmount = amountMin ? parseFloat(amountMin) : null;
      const maxAmount = amountMax ? parseFloat(amountMax) : null;
      const matchesAmount =
        (minAmount === null || q.netAmount >= minAmount) &&
        (maxAmount === null || q.netAmount <= maxAmount);

      let matchesDate = true;

      if (q.createdAt) {
        const qDate = q.createdAt.toDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (datePreset) {
          switch (datePreset) {
            case "today":
              matchesDate = qDate.toDateString() === today.toDateString();
              break;
            case "yesterday":
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              matchesDate = qDate.toDateString() === yesterday.toDateString();
              break;
            case "thisMonth":
              matchesDate =
                qDate.getMonth() === today.getMonth() &&
                qDate.getFullYear() === today.getFullYear();
              break;
            case "last30days":
              const last30 = new Date(today);
              last30.setDate(last30.getDate() - 30);
              matchesDate = qDate >= last30;
              break;
            default:
              matchesDate = true;
          }
        } else if (dateFrom || dateTo) {
          const from = dateFrom ? new Date(dateFrom) : null;
          const to = dateTo ? new Date(dateTo) : null;

          if (from) from.setHours(0, 0, 0, 0);
          if (to) to.setHours(23, 59, 59, 999);

          matchesDate = (!from || qDate >= from) && (!to || qDate <= to);
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
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center">
        <Input
          placeholder="Search by phone number, customer, GSTIN, quotation number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-4">
        {/* Amount Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              Amount
              <Filter
                className={cn(
                  "h-3 w-3",
                  amountMin || amountMax || amountSort
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              />
              {amountSort === "asc" && <ChevronUp className="h-3 w-3" />}
              {amountSort === "desc" && <ChevronDown className="h-3 w-3" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3">
            <div className="space-y-3">
              <div className="font-medium text-sm">Filter by Amount</div>
              <div className="flex gap-2">
                <Button
                  variant={amountSort === "asc" ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setAmountSort(amountSort === "asc" ? null : "asc")
                  }
                >
                  <ChevronUp className="h-3 w-3 mr-1" /> Low to High
                </Button>
                <Button
                  variant={amountSort === "desc" ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setAmountSort(amountSort === "desc" ? null : "desc")
                  }
                >
                  <ChevronDown className="h-3 w-3 mr-1" /> High to Low
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Min</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={amountMin}
                    onChange={(e) => setAmountMin(e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Max</label>
                  <Input
                    type="number"
                    placeholder="Any"
                    value={amountMax}
                    onChange={(e) => setAmountMax(e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAmountFilter}
                className="w-full"
              >
                Clear Filter
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Date Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              Date
              <Filter
                className={cn(
                  "h-3 w-3",
                  datePreset || dateFrom || dateTo
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-4">
              <div className="font-medium text-sm">Filter by Date</div>
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
                    variant={datePreset === item.value ? "default" : "outline"}
                    size="sm"
                    className="transition-none"
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

              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  Custom range
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
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
                    <label className="block text-xs text-muted-foreground mb-1">
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
                onClick={clearDateFilter}
                className="w-full"
              >
                Clear Date Filter
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-medium">Amount</TableHead>
              <TableHead className="font-medium text-center">
                #Quotation
              </TableHead>
              <TableHead className="font-medium">Customer</TableHead>
              <TableHead className="font-medium">Date</TableHead>
              <TableHead className="font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredQuotations.map((quotation) => (
              <TableRow key={quotation.id}>
                <TableCell className="font-medium">
                  {formatCurrency(quotation.netAmount)}
                </TableCell>
                <TableCell className="text-center font-medium">
                  {formatQuotationNumber(quotation.quotationNumber)}
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium">
                    {quotation.customerName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {quotation.customerPhone}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatDate(quotation.createdAt?.toDate())}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getRelativeTime(quotation.createdAt?.toDate())}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 flex-wrap">
                    {/* View PDF in Modal */}
                    {/* View PDF in Modal - with heading + relative time, no download */}
                    <Button
                      variant="outline"
                      size="sm"
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
                          alert("Failed to generate PDF");
                        } finally {
                          setIsGenerating(false);
                        }
                      }}
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Eye className="h-4 w-4 mr-1" />
                      )}
                      View
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-44 bg-white"
                      >
                        <DropdownMenuItem onClick={() => onEdit(quotation)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onConvertToInvoice(quotation.id)}
                        >
                          Add to Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDownloadPDF(quotation)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => alert("Thermal Print - coming soon")}
                        >
                          Thermal Print
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(quotation.id)}
                          className="text-destructive focus:bg-red-50"
                        >
                          Delete
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

      <Dialog
        open={pdfModalOpen}
        onOpenChange={(open) => {
          setPdfModalOpen(open);
          if (!open) {
            if (pdfBlobUrl) {
              URL.revokeObjectURL(pdfBlobUrl);
              setPdfBlobUrl(null);
            }
            setSelectedPdfQuotation(null);
          }
        }}
      >
        <DialogContent className="max-w-6xl h-[90vh] p-0 flex flex-col">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>
              <span className="text-lg font-semibold">
                Quotation{" "}
                {selectedPdfQuotation?.quotationNumber
                  ? ` - ${String(selectedPdfQuotation.customerName)}`
                  : ""}
              </span>
            </DialogTitle>
            <DialogDescription>
              {selectedPdfQuotation
                ? `Created: ${formatDate(
                    selectedPdfQuotation.createdAt?.toDate(),
                  )} • ${getRelativeTime(
                    selectedPdfQuotation.createdAt?.toDate(),
                  )}`
                : "Loading quotation..."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 bg-gray-50 overflow-hidden">
            {isGenerating ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : pdfBlobUrl ? (
              <iframe
                src={`${pdfBlobUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-full border-0"
                title="Quotation PDF Preview"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Failed to load PDF
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t flex justify-end">
            <Button variant="outline" onClick={() => setPdfModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
