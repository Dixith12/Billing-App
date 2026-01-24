// components/quotation-pdf.tsx  
'use client'

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { Quotation } from '@/lib/firebase/quotations'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.4,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  companyInfo: {
    width: '50%',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  companyAddress: {
    fontSize: 10,
    color: '#444',
  },
  quotationTitle: {  // ← renamed from invoiceTitle
    fontSize: 28,
    fontWeight: 'bold',
    color: '#c2410c',
    marginBottom: 25,
    textAlign: 'center',
  },
  billToSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  billToLeft: {
    width: '50%',
  },
  billToRight: {
    flex: 1,
    paddingLeft: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#c2410c',
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontWeight: 'bold',
    width: 80,
  },
  detailValue: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#c2410c',
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
  colWidth:    { width: '15%', textAlign: 'right' },
  colHeight:   { width: '15%', textAlign: 'right' },
  colQty:      { width: '15%', textAlign: 'center' },
  colTotal:    { width: '25%', textAlign: 'right' },
  summarySection: {
    alignItems: 'flex-end',
    marginTop: 28,
    marginRight: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    width: 260,
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontWeight: 'bold',
  },
  summaryValue: {
    textAlign: 'right',
    width: 110,
    minWidth: 100,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 260,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#c2410c',
  },
  grandTotalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  grandTotalValue: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'right',
    width: 110,
  },
  termsSection: {
    marginTop: 40,
    fontSize: 10,
    color: '#444',
  },
  termsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
  },
})

interface QuotationPDFProps {
  quotation: Quotation
}

export default function QuotationPDF({ quotation }: QuotationPDFProps) {
  const quotationNumber = quotation.quotationNumber
  const createdDate = quotation.createdAt?.toDate()
    ? new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(quotation.createdAt.toDate())
    : '—'

  const products = quotation.products || []

  // Use pre-calculated values from Firestore
  const subtotal = quotation.subtotal || 0
  const discount = quotation.discount || 0
  const sgst = quotation.sgst || 0
  const cgst = quotation.cgst || 0
  const grandTotal = quotation.netAmount || 0

  const formatINR = (num: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Company Header */}
        <View style={styles.headerSection}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>BigBot Co.</Text>
            <Text style={styles.companyAddress}>
              AIc, Nitee{'\n'}
              PIN: 576443{'\n'}
              Karnataka, India
            </Text>
          </View>
        </View>

        {/* QUOTATION Title */}
        <Text style={styles.quotationTitle}>QUOTATION</Text>

        {/* Bill To + Details */}
        <View style={styles.billToSection}>
          <View style={styles.billToLeft}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>
              {quotation.customerName || '—'}
            </Text>
            <Text>
              {quotation.billingAddress || '—'}{'\n'}
              Phone: {quotation.customerPhone || '—'}
            </Text>
          </View>

          <View style={styles.billToRight}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Quotation No.</Text>
              <Text style={styles.detailValue}>
                #{quotationNumber ? String(quotationNumber).padStart(4, '0') : 'Draft'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Quotation Date</Text>
              <Text style={styles.detailValue} wrap={false}>
                {createdDate}
              </Text>
            </View>
            {/* No Due Date for Quotation */}
          </View>
        </View>

        {/* Products Table */}
        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.colProduct}>Product</Text>
            <Text style={styles.colWidth}>Width</Text>
            <Text style={styles.colHeight}>Height</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>

          {products.map((product: any, index: number) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.colProduct}>
                {product.name || '—'}
              </Text>
              <Text style={styles.colWidth}>
                {product.width ? `${product.width}` : '—'}
              </Text>
              <Text style={styles.colHeight}>
                {product.height ? `${product.height}` : '—'}
              </Text>
              <Text style={styles.colQty}>
                {product.quantity ?? 1}
              </Text>
              <Text style={styles.colTotal}>
                {formatINR(product.total || 0)}
              </Text>
            </View>
          ))}

          {products.length === 0 && (
            <View style={styles.tableRow}>
              <Text style={{ ...styles.colProduct, textAlign: 'center' }}>
                No products
              </Text>
            </View>
          )}
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatINR(subtotal)}</Text>
          </View>

          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={styles.summaryValue}>{formatINR(discount)}</Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>SGST</Text>
            <Text style={styles.summaryValue}>{formatINR(sgst)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>CGST</Text>
            <Text style={styles.summaryValue}>{formatINR(cgst)}</Text>
          </View>

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Grand Total (Rupees)</Text>
            <Text style={styles.grandTotalValue}>{formatINR(grandTotal)}</Text>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>Terms and Conditions</Text>
          <Text>Quotation valid for 30 days from date of issue</Text>
          <Text>Please contact us to confirm acceptance</Text>
          <Text>BigBot Co.</Text>
        </View>
      </Page>
    </Document>
  )
}