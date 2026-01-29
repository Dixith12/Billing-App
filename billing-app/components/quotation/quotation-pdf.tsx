"use client"

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { Quotation } from '@/lib/firebase/quotations'

const ITEMS_PER_PAGE = 12

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.4,
    position: 'relative',
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
  quotationText: {
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
    marginTop: 12,
    marginLeft: 200,
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
  colProduct: { width: '40%' },
  colMeasurement: { width: '25%', textAlign: 'left' },
  colQty: { width: '15%', textAlign: 'center' },
  colTotal: { width: '20%', textAlign: 'right' },

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

  /* Rupee symbol fix – bold + larger size */
  rupeeLarge: {
    fontFamily: 'Helvetica',
    fontSize: 10,
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

  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 40,
    fontSize: 9,
    color: '#666',
  },

  /* Spacer to prevent page shrink when few items */
  pageSpacer: {
    flexGrow: 1,
    minHeight: 250,
  },
})

interface QuotationPDFProps {
  quotation: Quotation
}

export default function QuotationPDF({ quotation }: QuotationPDFProps) {
  const quotationNumber = quotation.quotationNumber
  const createdDate = quotation.createdAt
    ? new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(quotation.createdAt)
    : '—'

  const products = quotation.products || []

  const subtotal = quotation.subtotal || 0
  const discount = quotation.discount || 0
  const sgst = quotation.sgst || 0
  const cgst = quotation.cgst || 0
  const grandTotal = quotation.netAmount || 0

  const formatINR = (num: number) => {
  const value = Number(num || 0)
  return `Rs. ${new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`
}

  // Helper to format measurement in one column (same as InvoicePDF)
  const getMeasurementText = (p: any) => {
    if (p.measurementType === 'height_width') {
      return `Height: ${p.height ?? '—'} | Width: ${p.width ?? '—'}`
    } else if (p.measurementType === 'kg') {
      return `Kg: ${p.kg ?? '—'}`
    } else if (p.measurementType === 'unit') {
      return `Unit: ${p.units ?? '—'}`
    }
    return '—'
  }

  // Split products into pages (max 12 per page)
  const pages = []
  for (let i = 0; i < products.length; i += ITEMS_PER_PAGE) {
    pages.push(products.slice(i, i + ITEMS_PER_PAGE))
  }
  if (pages.length === 0) pages.push([])

  return (
    <Document>
      {pages.map((pageProducts, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page} wrap={false}>
          {/* HEADER – only on first page */}
          {pageIndex === 0 && (
            <View style={styles.headerBg}>
              <View style={styles.headerRow}>
                <Text style={styles.quotationText}>QUOTATION</Text>
                <View style={styles.companyRight}>
                  <Text style={styles.companyBrand}>HANOVER</Text>
                  <Text style={styles.companyBrand}>& TYKE</Text>
                </View>
              </View>
            </View>
          )}

          {/* BILL TO – only on first page */}
          {pageIndex === 0 && (
            <View style={styles.billSection}>
              <View style={styles.leftCol}>
                <Text style={styles.label}>BILL TO:</Text>
                <Text>{quotation.customerName || '—'}</Text>
                <Text>{quotation.billingAddress || '—'}</Text>
                <Text>Phone: {quotation.customerPhone || '—'}</Text>
              </View>

              <View style={styles.rightCol}>
                <Text style={{ marginBottom: 2 }}>
                  Quotation Number: QUO-{quotationNumber ? String(quotationNumber).padStart(4, '0') : 'Draft'}
                </Text>
                <Text>Date: {createdDate}</Text>
              </View>
            </View>
          )}

          {/* TABLE – exact same structure as InvoicePDF */}
          <View>
            <View style={styles.tableHeader}>
              <Text style={styles.colProduct}>Item Description</Text>
              <Text style={styles.colMeasurement}>Measurement</Text>
              <Text style={styles.colQty}>Qty</Text>
              <Text style={styles.colTotal}>Amount</Text>
            </View>

            {pageProducts.map((product: any, idx: number) => (
              <View style={styles.tableRow} key={idx}>
                <Text style={styles.colProduct}>
                  {product.name || '—'}
                </Text>
                <Text style={styles.colMeasurement}>
                  {getMeasurementText(product)}
                </Text>
                <Text style={styles.colQty}>
                  {product.quantity ?? 1}
                </Text>
                <Text style={{ ...styles.colTotal, ...styles.rupeeLarge }}>
                  {formatINR(product.total || 0)}
                </Text>
              </View>
            ))}

            {pageProducts.length === 0 && pageIndex === 0 && (
              <View style={styles.tableRow}>
                <Text style={{ ...styles.colProduct, textAlign: 'center' }}>
                  No products added
                </Text>
              </View>
            )}
          </View>
          {/* SUMMARY + TERMS – only on LAST page */}
          {pageIndex === pages.length - 1 && (
            <>
              <View style={styles.totalBox}>
                <View style={styles.totalRow}>
                  <Text>Sub Total</Text>
                  <Text style={styles.rupeeLarge}>{formatINR(subtotal)}</Text>
                </View>

                {discount > 0 && (
                  <View style={styles.totalRow}>
                    <Text>Discount</Text>
                    <Text style={styles.rupeeLarge}>{formatINR(discount)}</Text>
                  </View>
                )}

                <View style={styles.totalRow}>
                  <Text>CGST ({(cgst / (subtotal - discount) * 100 || 0).toFixed(1)}%)</Text>
                  <Text style={styles.rupeeLarge}>{formatINR(cgst)}</Text>
                </View>

                <View style={styles.totalRow}>
                  <Text>SGST ({(sgst / (subtotal - discount) * 100 || 0).toFixed(1)}%)</Text>
                  <Text style={styles.rupeeLarge}>{formatINR(sgst)}</Text>
                </View>

                <View style={styles.totalHighlight}>
                  <Text style={styles.totalHighlightText}>
                    TOTAL: {formatINR(grandTotal)}
                  </Text>
                </View>
              </View>

              <View style={styles.termsSection}>
                <Text style={styles.termsTitle}>TERMS AND CONDITIONS</Text>
                <Text>Quotation valid for 30 days from date of issue</Text>
                <Text>Please contact us to confirm acceptance</Text>
                <Text>BigBot Co.</Text>
              </View>
            </>
          )}

          {/* Page Number */}
          <Text style={styles.pageNumber}>
            Page {pageIndex + 1} of {pages.length}
          </Text>
        </Page>
      ))}
    </Document>
  )
}