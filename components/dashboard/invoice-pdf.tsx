"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Invoice } from "@/lib/firebase/invoices";

const ITEMS_PER_PAGE = 12;

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
  },

  /* ───────── HEADER ───────── */
  headerBg: {
    backgroundColor: "#0b3c78",
    padding: 32,
    margin: -40,
    marginBottom: 28,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  invoiceText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
  },
  companyRight: {
    textAlign: "right",
  },
  companyBrand: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
    letterSpacing: 1,
  },

  /* ───────── BILLING ───────── */
  billSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  leftCol: {
    width: "48%",
  },
  rightCol: {
    width: "48%",
    marginTop: 12,
    marginLeft: 250,
  },
  label: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 6,
  },

  /* ───────── TABLE ───────── */
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0b3c78",
    color: "white",
    padding: 8,
    fontWeight: "bold",
    marginTop: 16,
  },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  colProduct: { width: "40%" },
  colMeasurement: { width: "25%", textAlign: "left" },
  colQty: { width: "15%", textAlign: "center" },
  colTotal: { width: "20%", textAlign: "right" },

  /* ───────── TOTAL BOX ───────── */
  totalBox: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#0b3c78",
    width: 280,
    alignSelf: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 6,
  },
  totalHighlight: {
    backgroundColor: "#0b3c78",
    padding: 10,
  },
  totalHighlightText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "right",
  },

  /* ───────── TERMS ───────── */
  termsSection: {
    marginTop: 32,
    fontSize: 9,
    color: "#444",
  },
  termsTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 6,
  },

  pageNumber: {
    position: "absolute",
    bottom: 30,
    right: 40,
    fontSize: 9,
    color: "#666",
  },
});

interface InvoicePDFProps {
  invoice: Invoice;
}

const toJSDate = (ts?: { seconds: number }) =>
  ts ? new Date(ts.seconds * 1000) : null;

export default function InvoicePDF({ invoice }: InvoicePDFProps) {
  const invoiceDateObj = toJSDate(invoice.invoiceDate);

  const invoiceDate = invoiceDateObj
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(invoiceDateObj)
    : "—";

  const dueDateObj = toJSDate(invoice.dueDate);

  const dueDate = dueDateObj
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(dueDateObj)
    : "—";

  const products = invoice.products || [];

  const subtotal = invoice.subtotal || 0;
  const discount = invoice.discount || 0;
  const sgst = invoice.sgst || 0;
  const cgst = invoice.cgst || 0;
  const igst = invoice.igst || 0;

  const grandTotal = invoice.netAmount || 0;

  const taxable = subtotal - discount;

  const formatINR = (num: number) => {
    const value = Number(num || 0);
    return `Rs. ${new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)}`;
  };

  // Helper to format measurement in one column
  const getMeasurementText = (p: any) => {
    if (p.measurementType === "height_width") {
      return `Height: ${p.height ?? "—"} | Width: ${p.width ?? "—"}`;
    } else if (p.measurementType === "kg") {
      return `Kg: ${p.kg ?? "—"}`;
    } else if (p.measurementType === "unit") {
      return `Unit: ${p.units ?? "—"}`;
    }
    return "—";
  };

  // Split products into pages (max 12 per page)
  const pages = [];
  for (let i = 0; i < products.length; i += ITEMS_PER_PAGE) {
    pages.push(products.slice(i, i + ITEMS_PER_PAGE));
  }

  return (
    <Document>
      {pages.map((pageProducts, pageIndex) => (
        <Page
          key={pageIndex}
          size="A4"
          style={styles.page}
          wrap={false} // prevent automatic wrapping — we control it
        >
          {/* HEADER – only on first page */}
          {pageIndex === 0 && (
            <View style={styles.headerBg}>
              <View style={styles.headerRow}>
                <Text style={styles.invoiceText}>INVOICE</Text>
                <View style={styles.companyRight}>
                  <Text style={styles.companyBrand}>BIGBOT</Text>
                  <Text style={styles.companyBrand}>Nitte, Karkala</Text>
                </View>
              </View>
            </View>
          )}

          {/* BILL TO – only on first page */}
          {pageIndex === 0 && (
            <View style={styles.billSection}>
              <View style={styles.leftCol}>
                <Text style={styles.label}>BILL TO:</Text>
                <Text>{invoice.customerName || "—"}</Text>
                <Text>{invoice.billingAddress || "—"}</Text>
                <Text>Phone: {invoice.customerPhone || "—"}</Text>
              </View>

              <View style={styles.rightCol}>
                <Text style={{ marginBottom: 2 }}>
                  Invoice Number: INV-{invoice.invoiceNumber}
                </Text>
                <Text>Date: {invoiceDate}</Text>
                <Text>Due Date: {dueDate}</Text>
              </View>
            </View>
          )}

          {/* TABLE */}
          <View>
            {/* Table Header – only on first page or when continuing */}
            {(pageIndex === 0 || pageProducts.length > 0) && (
              <View style={styles.tableHeader}>
                <Text style={styles.colProduct}>Item Description</Text>
                <Text style={styles.colMeasurement}>Measurement</Text>
                <Text style={styles.colQty}>Qty</Text>
                <Text style={styles.colTotal}>Amount</Text>
              </View>
            )}

            {pageProducts.map((product: any, idx: number) => (
              <View style={styles.tableRow} key={idx}>
                <Text style={styles.colProduct}>{product.name || "—"}</Text>
                <Text style={styles.colMeasurement}>
                  {getMeasurementText(product)}
                </Text>
                <Text style={styles.colQty}>{product.quantity ?? 1}</Text>
                <Text style={styles.colTotal}>
                  {formatINR(product.total || 0)}
                </Text>
              </View>
            ))}
          </View>

          {/* TOTALS – only on the LAST page */}
          {pageIndex === pages.length - 1 && (
            <>
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
                {/* GST BREAKUP */}
                {igst > 0 ? (
                  <View style={styles.totalRow}>
                    <Text>
                      IGST (
                      {taxable > 0 ? ((igst / taxable) * 100).toFixed(1) : "0"}
                      %)
                    </Text>
                    <Text>{formatINR(igst)}</Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.totalRow}>
                      <Text>
                        CGST (
                        {taxable > 0
                          ? ((cgst / taxable) * 100).toFixed(1)
                          : "0"}
                        %)
                      </Text>
                      <Text>{formatINR(cgst)}</Text>
                    </View>

                    <View style={styles.totalRow}>
                      <Text>
                        SGST (
                        {taxable > 0
                          ? ((sgst / taxable) * 100).toFixed(1)
                          : "0"}
                        %)
                      </Text>
                      <Text>{formatINR(sgst)}</Text>
                    </View>
                  </>
                )}

                <View style={styles.totalHighlight}>
                  <Text style={styles.totalHighlightText}>
                    TOTAL: {formatINR(grandTotal)}
                  </Text>
                </View>
              </View>

              {/* TERMS – only on last page */}
              <View style={styles.termsSection}>
                <Text style={styles.termsTitle}>TERMS AND CONDITIONS</Text>
                <Text>Payment is due within 30 days from invoice date.</Text>
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
  );
}
