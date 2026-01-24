// lib/utils/exportToExcel.ts
import * as XLSX from 'xlsx'
import type { Invoice } from '@/lib/firebase/invoices' // Adjust import to your Invoice type

export function exportTransactionsToExcel(invoices: Invoice[], fileName: string = 'Transactions.xlsx') {
  if (invoices.length === 0) {
    alert('No data to export')
    return
  }

  // Map invoices to simple array of objects for Excel
  const data = invoices.map((invoice) => ({
    Amount: invoice.netAmount.toFixed(2), // Format as string for Excel
    Status: invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1),
    Mode: invoice.mode.toUpperCase(),
    'Invoice Number': invoice.invoiceNumber ? String(invoice.invoiceNumber).padStart(4, '0') : 'Draft',
    Customer: invoice.customerName,
    'Customer Phone': invoice.customerPhone,
    Date: invoice.createdAt?.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) || '-',
    'Relative Time': getRelativeTime(invoice.createdAt?.toDate()), // Use your getRelativeTime function (import if needed)
  }))

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data)

  // Create workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Transactions')

  // Generate and download
  XLSX.writeFile(wb, fileName)
}

const getRelativeTime = (timestamp: Date | undefined): string => {
    if (!timestamp) return '—'

    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()

    if (diffMs < 0) return 'just now' // future dates (unlikely but safe)

    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffDays / 365)

    if (diffSeconds < 45) return 'just now'
    if (diffSeconds < 90) return '1 minute ago'
    if (diffMinutes < 45) return `${diffMinutes} minutes ago`
    if (diffMinutes < 90) return '1 hour ago'
    if (diffHours < 22) return `${diffHours} hours ago`
    if (diffHours < 36) return '1 day ago'
    if (diffDays < 6) return `${diffDays} days ago`
    if (diffDays < 10) return '1 week ago'
    if (diffWeeks < 4) return `${diffWeeks} weeks ago`
    if (diffMonths < 12) return `${diffMonths} months ago`
    if (diffYears === 1) return '1 year ago'

    return `${diffYears} years ago`
  }

