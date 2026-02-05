// lib/utils/exportToExcel.ts
import * as XLSX from "xlsx";
import type { Invoice } from "@/lib/firebase/invoices";

export function exportTransactionsToExcel(invoices: Invoice[]) {
  if (invoices.length === 0) {
    alert("No invoices to export");
    return;
  }

  function safeToDate(value: any): Date | null {
    if (!value) return null;

    // Firestore Timestamp (toDate)
    if (typeof value.toDate === "function") {
      const d = value.toDate();
      return isNaN(d.getTime()) ? null : d;
    }

    // Firestore { seconds }
    if (typeof value.seconds === "number") {
      const d = new Date(value.seconds * 1000);
      return isNaN(d.getTime()) ? null : d;
    }

    // JS Date
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }

    // ISO / string fallback
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  /* ───────────────
     FILE NAME (DATE BASED)
  ─────────────── */
  const today = new Date().toISOString().split("T")[0];
  const fileName = `Invoices_${today}.xlsx`;

  const data: any[] = [];

  invoices.forEach((invoice) => {
    /* ───────────────
       DATE & NUMBER
    ─────────────── */

    const invDate = safeToDate(invoice.invoiceDate);

    const formattedInvDate = invDate
      ? invDate.toLocaleDateString("en-IN")
      : "-";

    const invoiceNum = invoice.invoiceNumber
      ? `INV-${String(invoice.invoiceNumber).padStart(4, "0")}`
      : "Draft";

    /* ───────────────
       CUSTOMER
    ─────────────── */

    const customerName = invoice.customerName || "-";
    const customerGSTIN = invoice.customerGstin || "-";
    const customerAddress = invoice.billingAddress || "-";
    const placeOfSupply = invoice.placeOfSupply || "-";

    /* ───────────────
       AMOUNTS
    ─────────────── */

    const subtotal = Number(invoice.subtotal) || 0;
    const discountAmount = Number(invoice.discount) || 0;
    const taxableAmount = Math.max(0, subtotal - discountAmount);

    const cgstAmt = Number(invoice.cgst) || 0;
    const sgstAmt = Number(invoice.sgst) || 0;
    const igstAmt = Number(invoice.igst) || 0;

    const totalGstAmt = cgstAmt + sgstAmt + igstAmt;
    const invoiceTotal =
      Number(invoice.netAmount) || taxableAmount + totalGstAmt;

    /* ───────────────
       GST %
    ─────────────── */

    const cgstPct =
      taxableAmount > 0 ? ((cgstAmt / taxableAmount) * 100).toFixed(2) : "0";

    const sgstPct =
      taxableAmount > 0 ? ((sgstAmt / taxableAmount) * 100).toFixed(2) : "0";

    const igstPct =
      taxableAmount > 0 ? ((igstAmt / taxableAmount) * 100).toFixed(2) : "0";

    const totalGstPct = (
      Number(cgstPct) +
      Number(sgstPct) +
      Number(igstPct)
    ).toFixed(2);

    const gstApplicable = totalGstAmt > 0 ? "Yes" : "No";

    /* ───────────────
       NO PRODUCTS
    ─────────────── */

    if (!invoice.products || invoice.products.length === 0) {
      data.push({
        "Invoice No": invoiceNum,
        "Invoice Date": formattedInvDate,
        Customer: customerName,
        "Customer GSTIN": customerGSTIN,
        "Customer Address": customerAddress,
        "Place of Supply": placeOfSupply,

        Product: "(No items)",
        "HSN Code": "",
        Quantity: "",
        "Unit Price": "",

        "Discount Amount": discountAmount.toFixed(2),
        "Taxable Amount": taxableAmount.toFixed(2),

        "GST Percentage": totalGstPct,
        "CGST Percentage": cgstPct,
        "SGST Percentage": sgstPct,
        "IGST Percentage": igstPct,

        "GST Amount": totalGstAmt.toFixed(2),
        "Total Amount": invoiceTotal.toFixed(2),

        "GST Applicable": gstApplicable,
      });
      return;
    }

    /* ───────────────
       PER PRODUCT
    ─────────────── */

    invoice.products.forEach((product: any) => {
      const qty = Number(product.quantity) || 1;
      const itemTotal = Number(product.total) || 0;
      const unitRate = qty > 0 ? itemTotal / qty : 0;

      data.push({
        "Invoice No": invoiceNum,
        "Invoice Date": formattedInvDate,
        Customer: customerName,
        "Customer GSTIN": customerGSTIN,
        "Customer Address": customerAddress,
        "Place of Supply": placeOfSupply,

        Product: product.name || "-",
        "HSN Code": product.hsnCode || product.hsn || "",
        Quantity: qty,
        "Unit Price": unitRate.toFixed(2),

        "Discount Amount": discountAmount.toFixed(2),
        "Taxable Amount": taxableAmount.toFixed(2),

        "GST Percentage": totalGstPct,
        "CGST Percentage": cgstPct,
        "SGST Percentage": sgstPct,
        "IGST Percentage": igstPct,

        "GST Amount": totalGstAmt.toFixed(2),
        "Total Amount": invoiceTotal.toFixed(2),

        "GST Applicable": gstApplicable,
      });
    });
  });

  /* ───────────────
     EXCEL WRITE
  ─────────────── */

  const ws = XLSX.utils.json_to_sheet(data);

  ws["!cols"] = [];
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");

  for (let C = range.s.c; C <= range.e.c; ++C) {
    let maxw = 12;
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cell = ws[XLSX.utils.encode_cell({ c: C, r: R })];
      if (cell?.v) maxw = Math.max(maxw, String(cell.v).length);
    }
    ws["!cols"][C] = { wch: maxw + 3 };
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Invoices");
  XLSX.writeFile(wb, fileName);
}
