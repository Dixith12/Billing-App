import * as XLSX from "xlsx";
import type { Purchase } from "@/lib/firebase/purchase";

export function exportPurchasesToExcel(purchases: Purchase[]) {
  if (purchases.length === 0) {
    alert("No purchases to export");
    return;
  }

  /* ───────────────
     FILE NAME (DATE BASED)
  ─────────────── */
  const today = new Date().toISOString().split("T")[0];
  const fileName = `Purchase_Register_${today}.xlsx`;

  const data: any[] = [];

  purchases.forEach((purchase) => {
    /* ───────────────
       BASIC DETAILS
    ─────────────── */

    const billNo = purchase.purchaseNumber
      ? `P${String(purchase.purchaseNumber).padStart(3, "0")}`
      : "Draft";

    const billDate = purchase.purchaseDate
      ? new Date(purchase.purchaseDate).toLocaleDateString("en-IN")
      : "-";

    const vendorName = purchase.vendorName || "-";
    const vendorGstin = purchase.vendorGstin || "-";
    const vendorState = purchase.vendorState || "-";

    /* ───────────────
       AMOUNTS (CORRECT)
    ─────────────── */

    const grossTotal = Number(purchase.subtotal) || 0;
    const discountAmount = Number(purchase.discount) || 0;

    // ✅ TAXABLE VALUE (after discount)
    const taxableAmount = Math.max(0, grossTotal - discountAmount);

    const cgstAmt = Number(purchase.cgst) || 0;
    const sgstAmt = Number(purchase.sgst) || 0;
    const igstAmt = Number(purchase.igst) || 0;

    const gstAmount = cgstAmt + sgstAmt + igstAmt;
    const invoiceTotal = taxableAmount + gstAmount;

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

    /* ───────────────
       NO PRODUCTS CASE
    ─────────────── */

    if (!purchase.products || purchase.products.length === 0) {
      data.push({
        "Bill No": billNo,
        "Bill Date": billDate,
        "Vendor Name": vendorName,
        "Vendor GSTIN": vendorGstin,
        "Vendor State": vendorState,

        "Product Name": "(No items)",
        "HSN Code": "",
        Quantity: "",
        "Unit Rate": "",

        "Discount Amount": discountAmount.toFixed(2),
        "Taxable Amount": taxableAmount.toFixed(2),

        
        "GST Percentage": totalGstPct,
        "CGST Percentage": cgstPct,
        "SGST Percentage": sgstPct,
        "IGST Percentage": igstPct,

        "GST Amount": gstAmount.toFixed(2),
        "Total Amount": invoiceTotal.toFixed(2),

        "ITC Eligible": "Yes",
      });
      return;
    }

    /* ───────────────
       PER PRODUCT ROW
    ─────────────── */

    purchase.products.forEach((prod: any) => {
      const qty = Number(prod.quantity) || 1;
      const itemTotal = Number(prod.total || prod.netTotal || 0);
      const unitRate = qty > 0 ? itemTotal / qty : 0;

      data.push({
        "Bill No": billNo,
        "Bill Date": billDate,
        "Vendor Name": vendorName,
        "Vendor GSTIN": vendorGstin,
        "Vendor State": vendorState,

        "Product Name": prod.name || "-",
        "HSN Code": prod.hsnCode || "",
        Quantity: qty,
        "Unit Price": unitRate.toFixed(2),

        "Discount Amount": discountAmount.toFixed(2),
        "Taxable Amount": taxableAmount.toFixed(2),

        
        "GST Percentage": totalGstPct,
        "CGST Percentage": cgstPct,
        "SGST Percentage": sgstPct,
        "IGST Percentage": igstPct,

        "GST Amount": gstAmount.toFixed(2),
        "Total Amount": invoiceTotal.toFixed(2),

        "ITC Eligible": "Yes",
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
    ws["!cols"][C] = { wch: maxw + 2 };
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Purchases");
  XLSX.writeFile(wb, fileName);
}
