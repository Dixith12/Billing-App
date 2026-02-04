import * as XLSX from "xlsx";
import type { Expense } from "@/lib/firebase/expenses";

export function exportExpensesToExcel(
  expenses: Expense[],
  fileName = `Expense_Register_${new Date().toISOString().split("T")[0]}.xlsx`,
) {
  if (expenses.length === 0) {
    alert("No expenses to export");
    return;
  }

  const data = expenses.map((exp) => {
    /* ───────────────
       STATE + GST FLAG
    ─────────────── */

    const stateValue = exp.state ?? "";
    const stateLower = stateValue.toLowerCase().trim();
    const isKarnataka = stateLower === "karnataka";
    const gstApplicable = !!exp.gstApplicable;

    /* ───────────────
       BASE VALUES
    ─────────────── */

    const taxable = Number(exp.amount) || 0;
    const quantity = Number(exp.quantity) || 1;
    const unitPrice = quantity > 0 ? taxable / quantity : 0;

    /* ───────────────
       GST % (STRICT)
    ─────────────── */

    let cgstPct = 0;
    let sgstPct = 0;
    let igstPct = 0;

    if (gstApplicable) {
      if (isKarnataka) {
        cgstPct = Number(exp.cgstPercent) || 0;
        sgstPct = Number(exp.sgstPercent) || 0;
      } else {
        igstPct = Number(exp.igstPercent) || 0;
      }
    }

    const totalGstPct = cgstPct + sgstPct + igstPct;

    /* ───────────────
       GST AMOUNT
    ─────────────── */

    const gstAmount = (taxable * totalGstPct) / 100;
    const totalAmount = taxable + gstAmount;

    return {
      "Expense Date": exp.date
        ? new Date(exp.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
          })
        : "-",

      "Expense Name": exp.name || "-",
      "Vendor State": stateValue || "-",
      Category: exp.category || "-",
      Quantity: quantity,
      "Unit Price": unitPrice.toFixed(2),
      "Taxable Amount": taxable.toFixed(2),

      // GST summary
      "GST Percentage": gstApplicable ? `${totalGstPct}` : "0",

      // Individual GST columns
      "CGST Percentage": gstApplicable && isKarnataka ? `${cgstPct}` : "0",
      "SGST Percentage": gstApplicable && isKarnataka ? `${sgstPct}` : "0",
      "IGST Percentage": gstApplicable && !isKarnataka ? `${igstPct}` : "0",

      "GST Amount": gstApplicable ? gstAmount.toFixed(2) : "0.00",
      "Total Amount": totalAmount.toFixed(2),

      "GST Applicable": gstApplicable ? "Yes" : "No",
    };
  });

  /* ───────────────
     EXCEL WRITE
  ─────────────── */

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Expenses");

  // Auto-size columns
  ws["!cols"] = [];
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");

  for (let C = range.s.c; C <= range.e.c; ++C) {
    let maxw = 12;
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cell = ws[XLSX.utils.encode_cell({ c: C, r: R })];
      if (cell?.v) {
        maxw = Math.max(maxw, String(cell.v).length + 2);
      }
    }
    ws["!cols"][C] = { wch: maxw };
  }

  XLSX.writeFile(wb, fileName);
}
