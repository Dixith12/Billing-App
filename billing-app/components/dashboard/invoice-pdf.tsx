'use client'

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { Invoice } from '@/lib/firebase/invoices'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.4,
  },

  /* ───────── HEADER ───────── */
  headerBg: {
    backgroundColor: '#0b3c78',
    padding: 32,
    margin: -40,
    marginBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invoiceText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
  },
  companyRight: {
    textAlign: 'right',
  },
  companyBrand: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1,
  },

  /* ───────── BILLING ───────── */
  billSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  leftCol: {
    width: '48%',
  },
  rightCol: {
    width: '48%',
    marginTop:12,
    marginLeft:250,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  /* ───────── TABLE ───────── */
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0b3c78',
    color: 'white',
    padding: 8,
    fontWeight: 'bold',
    marginTop: 16,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  colProduct: { width: '30%' },
  colWidth: { width: '15%', textAlign: 'right' },
  colHeight: { width: '15%', textAlign: 'right' },
  colQty: { width: '15%', textAlign: 'center' },
  colTotal: { width: '25%', textAlign: 'right' },

  /* ───────── TOTAL BOX ───────── */
  totalBox: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#0b3c78',
    width: 280,
    alignSelf: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 6,
  },
  totalHighlight: {
    backgroundColor: '#0b3c78',
    padding: 10,
  },
  totalHighlightText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'right',
  },

  /* ───────── TERMS ───────── */
  termsSection: {
    marginTop: 32,
    fontSize: 9,
    color: '#444',
  },
  termsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
  },
})

interface InvoicePDFProps {
  invoice: Invoice
}

export default function InvoicePDF({ invoice }: InvoicePDFProps) {
  const createdDate = invoice.createdAt?.toDate()
    ? new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(invoice.createdAt.toDate())
    : '—'

  const dueDateObj = invoice.createdAt?.toDate()
    ? new Date(invoice.createdAt.toDate().getTime() + 30 * 24 * 60 * 60 * 1000)
    : null

  const dueDate = dueDateObj
    ? new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(dueDateObj)
    : '—'

  const products = invoice.products || []

  const subtotal = invoice.subtotal || 0
  const discount = invoice.discount || 0
  const sgst = invoice.sgst || 0
  const cgst = invoice.cgst || 0
  const grandTotal = invoice.netAmount || 0

  const taxable = subtotal - discount


  const formatINR = (num: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(num)

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* HEADER */}
        <View style={styles.headerBg}>
          <View style={styles.headerRow}>
            <Text style={styles.invoiceText}>INVOICE</Text>
            <View style={styles.companyRight}>
              <Text style={styles.companyBrand}>HANOVER</Text>
              <Text style={styles.companyBrand}>& TYKE</Text>
            </View>
          </View>
        </View>

        {/* BILL TO */}
        <View style={styles.billSection}>
          <View style={styles.leftCol}>
            <Text style={styles.label}>BILL TO:</Text>
            <Text>{invoice.customerName || '—'}</Text>
            <Text>{invoice.billingAddress || '—'}</Text>
            <Text>Phone: {invoice.customerPhone || '—'}</Text>
          </View>

          <View style={styles.rightCol}>
            <Text style={{ marginBottom: 2 }}>
  Invoice Number: INV-{invoice.invoiceNumber}
</Text>
            <Text>Date: {createdDate}</Text>
            <Text>Due Date: {dueDate}</Text>
          </View>
        </View>

        {/* TABLE */}
        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.colProduct}>Item Description</Text>
            <Text style={styles.colWidth}>Width</Text>
            <Text style={styles.colHeight}>Height</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colTotal}>Amount</Text>
          </View>

          {products.map((product: any, index: number) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.colProduct}>{product.name || '—'}</Text>
              <Text style={styles.colWidth}>{product.width || '—'}</Text>
              <Text style={styles.colHeight}>{product.height || '—'}</Text>
              <Text style={styles.colQty}>{product.quantity ?? 1}</Text>
              <Text style={styles.colTotal}>{formatINR(product.total || 0)}</Text>
            </View>
          ))}
        </View>

        {/* TOTAL BOX */}
        <View style={styles.totalBox}>
          <View style={styles.totalRow}>
            <Text>Sub Total</Text>
            <Text>{formatINR(subtotal)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.totalRow}>
              <Text>Discount</Text>
              <Text>{formatINR(discount)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text>CGST ({(cgst / taxable * 100).toFixed(1)}%)</Text>
            <Text>{formatINR(cgst)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>SGST ({(cgst / taxable * 100).toFixed(1)}%)</Text>
            <Text>{formatINR(sgst)}</Text>
          </View>

          <View style={styles.totalHighlight}>
            <Text style={styles.totalHighlightText}>
              TOTAL: {formatINR(grandTotal)}
            </Text>
          </View>
        </View>

        {/* TERMS */}
        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>TERMS AND CONDITIONS</Text>
          <Text>Payment is due within 30 days from invoice date.</Text>
        </View>

      </Page>
    </Document>
  )
}