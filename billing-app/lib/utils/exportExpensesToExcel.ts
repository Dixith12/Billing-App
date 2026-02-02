// lib/utils/exportExpensesToExcel.ts
import * as XLSX from 'xlsx';
import type { Expense } from '@/lib/firebase/expenses';

export function exportExpensesToExcel(expenses: Expense[], fileName = 'Expense_Register.xlsx') {
  if (expenses.length === 0) {
    alert('No expenses to export');
    return;
  }

  const data = expenses.map((exp) => {
    // Super safe state handling
    const stateValue = exp.state ?? ''; // null/undefined → ''
    const stateLower = stateValue.toString().toLowerCase().trim();
    const isKarnataka = stateLower === 'karnataka';

    // Safe percentage defaults
    const cgstPct = Number(exp.cgstPercent) || 0;
    const sgstPct = Number(exp.sgstPercent) || 0;
    const igstPct = Number(exp.igstPercent) || 0;

    // GST amounts (safe even if percentages are missing)
    const cgstAmt = isKarnataka ? (exp.amount * cgstPct) / 100 : 0;
    const sgstAmt = isKarnataka ? (exp.amount * sgstPct) / 100 : 0;
    const igstAmt = !isKarnataka ? (exp.amount * igstPct) / 100 : 0;
    const totalGst = cgstAmt + sgstAmt + igstAmt;

    const taxable = Number(exp.amount) || 0;
    const quantity = Number(exp.quantity) || 1;
    const unitPrice = quantity > 0 ? taxable / quantity : 0;

    const gstPercentDisplay = isKarnataka
      ? `${(cgstPct + sgstPct).toFixed(0)}%`
      : `${igstPct.toFixed(0)}%`;

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
      'GST %': gstPercentDisplay,
      'CGST Amount': cgstAmt.toFixed(2),
      'SGST Amount': sgstAmt.toFixed(2),
      'IGST Amount': igstAmt.toFixed(2),
      'GST Amount': totalGst.toFixed(2),
      'Total Amount': (taxable + totalGst).toFixed(2),
      'ITC Eligible': 'Yes',
    };
  });

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
      if (cell?.v) maxw = Math.max(maxw, String(cell.v).length + 2);
    }
    ws['!cols'][C] = { wch: maxw };
  }

  XLSX.writeFile(wb, fileName);
}