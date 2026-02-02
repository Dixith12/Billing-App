// lib/utils/exportToExcel.ts
import * as XLSX from 'xlsx'
import type { Invoice } from '@/lib/firebase/invoices'

export function exportTransactionsToExcel(invoices: Invoice[], fileName: string = 'GST_Invoices.xlsx') {
  if (invoices.length === 0) {
    alert('No invoices to export')
    return
  }

  const data: any[] = []

  invoices.forEach((invoice) => {
    // Dates
    const invDate = invoice.invoiceDate
      ? new Date(invoice.invoiceDate.seconds * 1000)
      : null
    const formattedInvDate = invDate
      ? invDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' })
      : '-'

    // Invoice number
    const invoiceNum = invoice.invoiceNumber
      ? `#${String(invoice.invoiceNumber).padStart(4, '0')}`
      : 'Draft'

    // Customer & Address
    const customerGST = invoice.customerGstin || '-'
    const billingAddr = invoice.billingAddress || '-'
    const customerGSAddress = `${customerGST} ${billingAddr}`.trim() || '-'

    // Place of Supply (update this field name if you have it!)
    const placeOfSupply = 'KA' // ← Change to real value when available (e.g. invoice.placeOfSupply || invoice.state || 'KA')

    // Root-level values
    const subtotal = Number(invoice.subtotal) || 0
    const discountAmount = Number(invoice.discount) || 0
    const taxableAmount = Math.max(0, subtotal - discountAmount)
    const cgst = Number(invoice.cgst) || 0
    const sgst = Number(invoice.sgst) || 0
    const igst = Number(invoice.igst) || 0
    const totalGst = cgst + sgst + igst
    const netAmount = Number(invoice.netAmount) || 0

    // Calculate combined GST %
    let gstPercentage = 0
    if (taxableAmount > 0 && totalGst > 0) {
      gstPercentage = Math.round((totalGst / taxableAmount) * 100)
    }
    const gstPercentStr = gstPercentage > 0 ? `${gstPercentage}%` : '0%'

    const isGstApplicable = totalGst > 0 ? 'Yes' : 'No'

    // If no products → one summary row
    if (!invoice.products || invoice.products.length === 0) {
      data.push({
        'Invoice N': invoiceNum,
        'Invoice Date': formattedInvDate,
        Customer: invoice.customerName || '-',
        'Customer GS Address': customerGSAddress,
        'Place of Su': placeOfSupply,
        Product: '(No items)',
        'HSN/SAC': '',
        Quantity: '',
        'Unit Price': '',
        'Discount Amount': discountAmount.toFixed(2),
        'Taxable Amount': taxableAmount.toFixed(2),
        'GST %': gstPercentStr,
        'CGST Amount': cgst.toFixed(2),
        'SGST Amount': sgst.toFixed(2),
        'IGST Amount': igst.toFixed(2),
        'GST Amount': totalGst.toFixed(2),
        'Total Amount': netAmount.toFixed(2),
        'Is GST Applicable': isGstApplicable,
      })
      return
    }

    // One row per product (repeat invoice-level GST, discount, taxable etc.)
    invoice.products.forEach((product: any) => {
      const itemName = product.name || '-'
      const itemQty = Number(product.quantity) || 1
      const itemTotal = Number(product.total) || 0
      // Rough unit price (for display)
      const unitPrice = itemQty > 0 ? (itemTotal / itemQty) : 0

      data.push({
        'Invoice N': invoiceNum,
        'Invoice Date': formattedInvDate,
        Customer: invoice.customerName || '-',
        'Customer GS Address': customerGSAddress,
        'Place of Su': placeOfSupply,
        Product: itemName,
        'HSN/SAC': product.hsnCode || product.hsn || '', // add field when you store it
        Quantity: itemQty,
        'Unit Price': unitPrice.toFixed(2),
        'Discount Amount': discountAmount.toFixed(2), // invoice-level discount shown on each row
        'Taxable Amount': taxableAmount.toFixed(2),   // invoice-level after discount
        'GST %': gstPercentStr,
        'CGST Amount': cgst.toFixed(2),
        'SGST Amount': sgst.toFixed(2),
        'IGST Amount': igst.toFixed(2),
        'GST Amount': totalGst.toFixed(2),
        'Total Amount': netAmount.toFixed(2),         // full invoice total (repeated)
        'Is GST Applicable': isGstApplicable,
      })
    })
  })

  if (data.length === 0) {
    alert('No data to export')
    return
  }

  const ws = XLSX.utils.json_to_sheet(data)

  // Auto-size columns roughly
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
  ws['!cols'] = []
  for (let C = range.s.c; C <= range.e.c; ++C) {
    let maxw = 10
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cell = ws[XLSX.utils.encode_cell({ c: C, r: R })]
      if (cell?.v) {
        const len = String(cell.v).length
        if (len > maxw) maxw = len
      }
    }
    ws['!cols'][C] = { wch: maxw + 3 }
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Invoices')
  XLSX.writeFile(wb, fileName)
}