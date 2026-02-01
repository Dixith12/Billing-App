'use client'

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
  Trash2,
  Pencil,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { pdf } from "@react-pdf/renderer";
// import PurchasePDF from "@/components/purchase/purchase-pdf"; // ← create this later if needed

type SortOrder = "asc" | "desc" | null;

interface PurchaseTableProps {
  purchases: any[]; // Replace with your Purchase type later
  onEdit: (purchase: any) => void;
  onDelete: (id: string) => void;
}

export function PurchaseTable({
  purchases,
  onEdit,
  onDelete,
}: PurchaseTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [amountSort, setAmountSort] = useState<SortOrder>(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedPdfPurchase, setSelectedPdfPurchase] = useState<any>(null);
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

  const formatDate = (date: Date | undefined) =>
    date
      ? new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(date)
      : "—";

  const getRelativeTime = (timestamp: Date | undefined): string => {
    if (!timestamp) return "—";
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    if (diffMs < 0) return "just now";

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 45) return "just now";
    if (diffMinutes < 45) return `${diffMinutes} minutes ago`;
    if (diffHours < 22) return `${diffHours} hours ago`;
    if (diffDays < 6) return `${diffDays} days ago`;
    return `${diffDays} days ago`;
  };

  const formatPurchaseNumber = (num: number | undefined): string => {
    if (num == null) return "Draft";
    return `#${String(num).padStart(4, "0")}`;
  };

//   const handleDownloadPDF = async (purchase: any) => {
//     if (isGenerating) return;
//     setIsGenerating(true);
//     try {
//       const blob = await pdf(<PurchasePDF purchase={purchase} />).toBlob();
//       const url = URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = `Purchase-${formatPurchaseNumber(purchase.purchaseNumber)}.pdf`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       URL.revokeObjectURL(url);
//     } catch (err) {
//       console.error("PDF download failed:", err);
//       alert("Failed to generate PDF.");
//     } finally {
//       setIsGenerating(false);
//     }
//   };

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const search = searchQuery.toLowerCase().trim();
      return (
        !search ||
        p.vendorName?.toLowerCase().includes(search) ||
        p.vendorPhone?.includes(search) ||
        (p.purchaseNumber != null && String(p.purchaseNumber).includes(search))
      );
    });
  }, [purchases, searchQuery]);

  return (
    <div className="space-y-6 mt-3 ml-3 mr-3 mb-3">
      {/* Search */}
      <div className="relative max-w-md">
        <Input
          placeholder="Search by vendor name, phone or purchase #..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-slate-300 focus:border-indigo-400 focus:ring-indigo-200"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
      </div>

      {/* Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 border-b border-slate-200">
              <TableHead className="font-semibold text-slate-700">Amount</TableHead>
              <TableHead className="font-semibold text-slate-700 text-center">#Purchase</TableHead>
              <TableHead className="font-semibold text-slate-700">Vendor</TableHead>
              <TableHead className="font-semibold text-slate-700">Date</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredPurchases.map((purchase) => (
              <TableRow
                key={purchase.id}
                className="hover:bg-slate-50/70 transition-colors"
              >
                <TableCell>
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 border-emerald-200 px-2.5 py-0.5 font-medium"
                  >
                    {formatCurrency(purchase.netAmount)}
                  </Badge>
                </TableCell>

                <TableCell className="text-center font-semibold text-slate-700">
                  {formatPurchaseNumber(purchase.purchaseNumber)}
                </TableCell>

                <TableCell>
                  <div className="font-medium text-slate-900">
                    {purchase.vendorName || "—"}
                  </div>
                  <div className="text-xs text-slate-500">
                    {purchase.vendorPhone || "—"}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="text-sm font-medium text-slate-700">
                    {formatDate(purchase.createdAt)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {getRelativeTime(purchase.createdAt)}
                  </div>
                </TableCell>

                <TableCell className="text-right pr-6">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* <Button
                      variant="outline"
                      size="sm"
                      className="h-9 gap-2 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300"
                      disabled={isGenerating}
                      onClick={() => handleDownloadPDF(purchase)}
                    >
                      <Download className="h-4 w-4" />
                      PDF
                    </Button> */}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-slate-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(purchase)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-700"
                          onClick={() => onDelete(purchase.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
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
    </div>
  );
}