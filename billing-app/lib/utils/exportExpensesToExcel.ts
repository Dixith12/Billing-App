import * as XLSX from 'xlsx';
import type { Expense } from '@/lib/firebase/expenses';

export function exportExpensesToExcel(
  expenses: Expense[],
  fileName = 'Expense_Register.xlsx',
) {
  if (expenses.length === 0) {
    alert('No expenses to export');
    return;
  }

  const data = expenses.map((exp) => {
    /* ───────────────
       STATE CHECK
    ─────────────── */

    const stateValue = exp.state ?? '';
    const stateLower = stateValue.toString().toLowerCase().trim();
    const isKarnataka = stateLower === 'karnataka';

    /* ───────────────
       BASE VALUES
    ─────────────── */

    const taxable = Number(exp.amount) || 0;
    const quantity = Number(exp.quantity) || 1;
    const unitPrice = quantity > 0 ? taxable / quantity : 0;

    /* ───────────────
       GST %
    ─────────────── */

    const cgstPct = Number(exp.cgstPercent) || 0;
    const sgstPct = Number(exp.sgstPercent) || 0;
    const igstPct = Number(exp.igstPercent) || 0;

    // Display logic:
    // Karnataka → CGST + SGST
    // Other state → IGST only
    const displayCgst = isKarnataka ? `${cgstPct}%` : '0%';
    const displaySgst = isKarnataka ? `${sgstPct}%` : '0%';
    const displayIgst = isKarnataka ? '0%' : `${igstPct}%`;

    /* ───────────────
       TOTAL AMOUNT
       (calculated internally)
    ─────────────── */

    const gstAmount = isKarnataka
      ? (taxable * (cgstPct + sgstPct)) / 100
      : (taxable * igstPct) / 100;

    const totalAmount = taxable + gstAmount;

    return {
      'Expense Date': exp.date
        ? new Date(exp.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
          })
        : '-',
      'Expense Name': exp.name || '-',
      'Vendor State': stateValue || '-',
      Category: exp.category || '-',
      Quantity: quantity,
      'Unit Price': unitPrice.toFixed(2),
      'Taxable Amount': taxable.toFixed(2),

      // ✅ PERCENTAGE COLUMNS ONLY
      'CGST %': displayCgst,
      'SGST %': displaySgst,
      'IGST %': displayIgst,

      'Total Amount': totalAmount.toFixed(2),
      'ITC Eligible': 'Yes',
    };
  });

  /* ───────────────
     EXCEL WRITE
  ─────────────── */

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Expenses');

  // Auto-size columns
  ws['!cols'] = [];
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let C = range.s.c; C <= range.e.c; ++C) {
    let maxw = 12;
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cell = ws[XLSX.utils.encode_cell({ c: C, r: R })];
      if (cell?.v) {
        maxw = Math.max(maxw, String(cell.v).length + 2);
      }
    }
    ws['!cols'][C] = { wch: maxw };
  }

  XLSX.writeFile(wb, fileName);
}
