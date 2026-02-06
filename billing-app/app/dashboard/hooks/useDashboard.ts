// app/dashboard/hooks/useDashboard.ts
"use client";

import { useState, useMemo, useCallback } from "react";
import type { Invoice } from "@/lib/firebase/invoices";
import { recordInvoicePayment, deleteInvoice } from "@/lib/firebase/invoices";

export type SortOrder = "asc" | "desc" | null;

export function useDashboard(
  invoices: Invoice[],
  onInvoicesChange?: (newInvoices: Invoice[]) => void,
) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  // Filters - Amount
  const [amountSort, setAmountSort] = useState<SortOrder>(null);
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");

  // Filters - Status & Mode
  const [statusFilters, setStatusFilters] = useState<Invoice["status"][]>([]);
  const [modeFilters, setModeFilters] = useState<Invoice["mode"][]>([]);

  // Filters - Date
  const [datePreset, setDatePreset] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [selectedPaymentMode, setSelectedPaymentMode] =
    useState<Invoice["mode"]>("cash"); // default

  // ── NEW delete-related states ────────────────────────────
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  type PaymentForm = {
    amount: string;
    date: string;
    mode: Invoice["mode"];
  };

  function safeToDate(value: any): Date | undefined {
    if (!value) return undefined;

    // Firestore Timestamp
    if (typeof value.toDate === "function") {
      const d = value.toDate();
      return isNaN(d.getTime()) ? undefined : d;
    }

    // Firestore { seconds, nanoseconds }
    if (typeof value.seconds === "number") {
      const d = new Date(value.seconds * 1000);
      return isNaN(d.getTime()) ? undefined : d;
    }

    // Already a Date
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? undefined : value;
    }

    return undefined;
  }

  const openDeleteDialog = useCallback((invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteInvoice = useCallback(async () => {
    if (!invoiceToDelete) return;

    setIsDeleting(true);
    try {
      await deleteInvoice(invoiceToDelete.id);
      // Success feedback (replace alert with toast later)
      alert("Invoice deleted successfully");

      // Trigger refresh if parent provided callback
      if (onInvoicesChange) {
        onInvoicesChange([]); // or better: force parent re-fetch
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete invoice");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  }, [invoiceToDelete, onInvoicesChange]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);

  const formatDate = (value: any) => {
  const date = safeToDate(value);
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};


  // Real relative time calculation
  const getRelativeTime = (value: any): string => {
    const timestamp = safeToDate(value);
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

  const uniqueModes = useMemo(
    () => [...new Set(invoices.map((inv) => inv.mode))],
    [invoices],
  );

  const allStatuses: Invoice["status"][] = [
    "paid",
    "pending",
    "partially paid",
    "cancelled",
  ];

  const filteredInvoices = useMemo(() => {
    let result = invoices.filter((invoice) => {
      const search = searchQuery.toLowerCase();
      const isNumericSearch = !isNaN(Number(search));
      const normalize = (v: string | number) => v.toString().replace(/^0+/, "");

      const matchesSearch =
        !search ||
        (invoice.customerName ?? "").toLowerCase().includes(search) ||
        (invoice.customerPhone ?? "").includes(search) ||
        (invoice.customerGstin ?? "").toLowerCase().includes(search) ||
        (isNumericSearch &&
          invoice.invoiceNumber != null &&
          normalize(invoice.invoiceNumber).includes(normalize(search)));

      const minAmount = amountMin ? parseFloat(amountMin) : null;
      const maxAmount = amountMax ? parseFloat(amountMax) : null;
      const matchesAmount =
        (minAmount === null || invoice.netAmount >= minAmount) &&
        (maxAmount === null || invoice.netAmount <= maxAmount);

      const matchesStatus =
        statusFilters.length === 0 || statusFilters.includes(invoice.status);
      const matchesMode =
        modeFilters.length === 0 || modeFilters.includes(invoice.mode ?? "");

      let matchesDate = true;

      const invDate = safeToDate(invoice.invoiceDate);

      if (invDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (datePreset) {
          switch (datePreset) {
            case "today":
              matchesDate = invDate.toDateString() === today.toDateString();
              break;
            case "yesterday": {
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              matchesDate = invDate.toDateString() === yesterday.toDateString();
              break;
            }
            case "thisMonth":
              matchesDate =
                invDate.getMonth() === today.getMonth() &&
                invDate.getFullYear() === today.getFullYear();
              break;
            case "last30days": {
              const last30 = new Date(today);
              last30.setDate(last30.getDate() - 30);
              matchesDate = invDate >= last30;
              break;
            }
          }
        } else if (dateFrom || dateTo) {
          const from = dateFrom ? new Date(dateFrom) : null;
          const to = dateTo ? new Date(dateTo) : null;

          if (from) from.setHours(0, 0, 0, 0);
          if (to) to.setHours(23, 59, 59, 999);

          matchesDate = (!from || invDate >= from) && (!to || invDate <= to);
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
      result = [...result].sort((a, b) =>
        amountSort === "asc"
          ? a.netAmount - b.netAmount
          : b.netAmount - a.netAmount,
      );
    }

    return result;
  }, [
    invoices,
    searchQuery,
    amountMin,
    amountMax,
    statusFilters,
    modeFilters,
    amountSort,
    datePreset,
    dateFrom,
    dateTo,
  ]);

  const getStatusBadgeVariant = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "partially paid":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "";
    }
  };

  const handleRecordPayment = (invoice: Invoice) => {
const pendingRaw =
  invoice.netAmount - (invoice.paidAmount || 0);

const pending = Number(pendingRaw.toFixed(2));
    setSelectedInvoice(invoice);
    setPaymentAmount(pending.toFixed(2)); // pre-fill with what's left
    setPaymentDate(new Date().toISOString().split("T")[0]); // today YYYY-MM-DD
    setSelectedPaymentMode("cash"); // or 'upi' — your preference
    setIsPaymentDialogOpen(true);
  };

  const savePayment = useCallback(async () => {
    if (!selectedInvoice)
      return { success: false, error: "No invoice selected" };

    const amountNum = Number(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return { success: false, error: "Invalid payment amount" };
    }

    if (!paymentDate || !selectedPaymentMode) {
      return { success: false, error: "Missing date or mode" };
    }

    try {
      const result = await recordInvoicePayment(selectedInvoice.id, {
        amount: amountNum,
        mode: selectedPaymentMode,
        paymentDate: paymentDate,
      });

      // Optional: optimistic update (if you manage local state)
      // or trigger full refresh
      if (onInvoicesChange) {
        // If parent passes refresh callback → use it
        onInvoicesChange([]); // or better: trigger re-fetch
      }

      setIsPaymentDialogOpen(false);
      setPaymentAmount("");
      setPaymentDate("");
      // setSelectedPaymentMode('cash') // optional reset

      return { success: true, result };
    } catch (err: any) {
      console.error("Payment save failed:", err);
      return { success: false, error: err.message || "Failed to save payment" };
    }
  }, [
    selectedInvoice,
    paymentAmount,
    paymentDate,
    selectedPaymentMode,
    onInvoicesChange,
  ]);

  const toggleStatusFilter = (status: Invoice["status"]) => {
    setStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const toggleModeFilter = (mode: Invoice["mode"]) => {
    setModeFilters((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode],
    );
  };

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

  return {
    searchQuery,
    setSearchQuery,
    selectedInvoice,
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,

    // Payment form states – expose them
    paymentAmount,
    setPaymentAmount,
    paymentDate,
    setPaymentDate,
    selectedPaymentMode,
    setSelectedPaymentMode,

    // Save function for the dialog button
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

    datePreset,
    setDatePreset,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    clearDateFilter,

    filteredInvoices,
    uniqueModes,
    allStatuses,

    formatCurrency,
    formatDate,
    getRelativeTime, // now dynamic
    getStatusBadgeVariant,

    handleRecordPayment,
    toggleStatusFilter,
    toggleModeFilter,
    clearAmountFilter,

    deleteDialogOpen,
    setDeleteDialogOpen,
    invoiceToDelete,
    isDeleting,
    openDeleteDialog, // ← table calls this when user clicks Delete
    handleDeleteInvoice,
  };
}
