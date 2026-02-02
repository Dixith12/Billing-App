// lib/utils/exportPurchasesToExcel.ts
import * as XLSX from 'xlsx';
import type { Purchase } from '@/lib/firebase/purchase';

export function exportPurchasesToExcel(purchases: Purchase[], fileName = 'Purchase_Register.xlsx') {
  if (purchases.length === 0) {
    alert('No purchases to export');
    return;
  }

  const data: any[] = [];

  purchases.forEach((purchase) => {
    // Bill No: PO001, PO002, etc.
    const billNo = purchase.purchaseNumber
      ? `PO${String(purchase.purchaseNumber).padStart(3, '0')}`
      : 'Draft';

    // Bill Date: 1/1/2026 style (no leading zero on day/month)
    let billDate = '-';

if (purchase.purchaseDate instanceof Date && !isNaN(purchase.purchaseDate.getTime())) {
  const day = purchase.purchaseDate.getDate();
  const month = purchase.purchaseDate.getMonth() + 1;
  const year = purchase.purchaseDate.getFullYear();
  billDate = `${day}/${month}/${year}`;
}


    const vendorName = purchase.vendorName || '-';
    const vendorGstin = purchase.vendorGstin || '-';
    const vendorState = purchase.vendorState || '-'; // ← Now using the field you added

    // Root-level GST fallback
    const rootCgst = Number(purchase.cgst) || 0;
    const rootSgst = Number(purchase.sgst) || 0;
    const rootIgst = Number(purchase.igst) || 0;
    const rootGstTotal = rootCgst + rootSgst + rootIgst;

    if (!purchase.products || purchase.products.length === 0) {
      // No products → single summary row
      data.push({
        'Bill No': billNo,
        'Bill Date': billDate,
        'Vendor Name': vendorName,
        'Vendor GSTIN': vendorGstin,
        'Vendor State': vendorState,
        'Product Name': '(No items)',
        'HSN Code': '',
        Quantity: '',
        'Unit Price': '',
        'Discount Amount': '',
        'Taxable Amount': '',
        'GST %': '',
        'CGST Amount': rootCgst.toFixed(2),
        'SGST Amount': rootSgst.toFixed(2),
        'IGST Amount': rootIgst.toFixed(2),
        'GST Amount': rootGstTotal.toFixed(2),
        'Total Amount': Number(purchase.netAmount || 0).toFixed(2),
        'ITC Eligible': 'Yes',
      });
      return;
    }

    // One row per product (repeating purchase-level info)
    purchase.products.forEach((prod: any) => {
      const qty = Number(prod.quantity) || 1;

      // Rough unit price calculation
      const itemTotal = Number(prod.total || prod.netTotal || 0);
      const unitPrice = qty > 0 ? itemTotal / qty : 0;

      const discountAmt = Number(prod.discount) || 0;

      // Taxable amount fallback
      const taxable = Number(prod.taxableAmount) ||
        (itemTotal - Number(prod.gstAmount || rootGstTotal));

      // GST % calculation (from root or item)
      let gstPct = Number(prod.gstPercentage) || 0;
      if (gstPct === 0 && taxable > 0 && rootGstTotal > 0) {
        gstPct = Math.round((rootGstTotal / taxable) * 100);
      }

      data.push({
        'Bill No': billNo,
        'Bill Date': billDate,
        'Vendor Name': vendorName,
        'Vendor GSTIN': vendorGstin,
        'Vendor State': vendorState,
        'Product Name': prod.name || '-',
        'HSN Code': prod.hsnCode || '', // Add this field to your products later if needed
        Quantity: qty,
        'Unit Price': unitPrice.toFixed(2),
        'Discount Amount': discountAmt.toFixed(2),
        'Taxable Amount': taxable.toFixed(2),
        'GST %': gstPct > 0 ? `${gstPct}%` : '0%',
        'CGST Amount': (Number(prod.cgstAmount) || rootCgst).toFixed(2),
        'SGST Amount': (Number(prod.sgstAmount) || rootSgst).toFixed(2),
        'IGST Amount': (Number(prod.igstAmount) || rootIgst).toFixed(2),
        'GST Amount': (Number(prod.gstAmount) || rootGstTotal).toFixed(2),
        'Total Amount': itemTotal.toFixed(2),
        'ITC Eligible': 'Yes', // Change logic later if you store per-item
      });
    });
  });

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Auto-fit columns
  ws['!cols'] = [];
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let C = range.s.c; C <= range.e.c; ++C) {
    let maxw = 12;
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cell = ws[XLSX.utils.encode_cell({ c: C, r: R })];
      if (cell?.v) {
        const len = String(cell.v).length;
        if (len > maxw) maxw = len;
      }
    }
    ws['!cols'][C] = { wch: maxw + 2 };
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Purchases');
  XLSX.writeFile(wb, fileName);
}