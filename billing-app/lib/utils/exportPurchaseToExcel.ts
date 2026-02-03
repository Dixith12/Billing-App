import * as XLSX from "xlsx";
import type { Purchase } from "@/lib/firebase/purchase";

export function exportPurchasesToExcel(
  purchases: Purchase[],
  fileName = "Purchase_Register.xlsx",
) {
  if (purchases.length === 0) {
    alert("No purchases to export");
    return;
  }

  const data: any[] = [];

  purchases.forEach((purchase) => {
    /* ───────────────
       BASIC FIELDS
    ─────────────── */

    const billNo = purchase.purchaseNumber
      ? `PO${String(purchase.purchaseNumber).padStart(3, "0")}`
      : "Draft";

    let billDate = "-";
    if (
      purchase.purchaseDate instanceof Date &&
      !isNaN(purchase.purchaseDate.getTime())
    ) {
      const d = purchase.purchaseDate;
      billDate = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }

    const vendorName = purchase.vendorName || "-";
    const vendorGstin = purchase.vendorGstin || "-";
    const vendorState = purchase.vendorState || "-";

    /* ───────────────
       AMOUNTS
    ─────────────── */

    const grossTotal = Number(purchase.subtotal || 0);
    const discountAmount = Number(purchase.discount || 0);

    // ✅ TAXABLE AFTER DISCOUNT
    const taxableAmount = Math.max(0, grossTotal - discountAmount);

    const cgstAmt = Number(purchase.cgst || 0);
    const sgstAmt = Number(purchase.sgst || 0);
    const igstAmt = Number(purchase.igst || 0);

    const totalGstAmount = cgstAmt + sgstAmt + igstAmt;

    /* ───────────────
       GST %
    ─────────────── */

    const cgstPct =
      taxableAmount > 0 ? Math.round((cgstAmt / taxableAmount) * 100) : 0;

    const sgstPct =
      taxableAmount > 0 ? Math.round((sgstAmt / taxableAmount) * 100) : 0;

    const igstPct =
      taxableAmount > 0 ? Math.round((igstAmt / taxableAmount) * 100) : 0;

    const totalGstPct = cgstPct + sgstPct + igstPct;

    /* ───────────────
       NO PRODUCTS
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
        "Unit Price": "",
        "Discount Amount": discountAmount.toFixed(2),
        "Taxable Amount": taxableAmount.toFixed(2),

        // ✅ NEW COLUMNS
        "GST %": totalGstPct ? `${totalGstPct}%` : "0%",
        "CGST %": cgstPct ? `${cgstPct}%` : "0%",
        "SGST %": sgstPct ? `${sgstPct}%` : "0%",
        "IGST %": igstPct ? `${igstPct}%` : "0%",
        "GST Amount": totalGstAmount.toFixed(2),

        "Total Amount": Number(purchase.netAmount || 0).toFixed(2),
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
      const unitPrice = qty > 0 ? itemTotal / qty : 0;

      data.push({
        "Bill No": billNo,
        "Bill Date": billDate,
        "Vendor Name": vendorName,
        "Vendor GSTIN": vendorGstin,
        "Vendor State": vendorState,
        "Product Name": prod.name || "-",
        "HSN Code": prod.hsnCode || "",
        Quantity: qty,
        "Unit Price": unitPrice.toFixed(2),
        "Discount Amount": discountAmount.toFixed(2),
        "Taxable Amount": taxableAmount.toFixed(2),

        // ✅ NEW COLUMNS
        "GST %": totalGstPct ? `${totalGstPct}%` : "0%",
        "CGST %": cgstPct ? `${cgstPct}%` : "0%",
        "SGST %": sgstPct ? `${sgstPct}%` : "0%",
        "IGST %": igstPct ? `${igstPct}%` : "0%",
        "GST Amount": totalGstAmount.toFixed(2),

        "Total Amount": itemTotal.toFixed(2),
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
      if (cell?.v) {
        maxw = Math.max(maxw, String(cell.v).length);
      }
    }
    ws["!cols"][C] = { wch: maxw + 2 };
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Purchases");
  XLSX.writeFile(wb, fileName);
}
