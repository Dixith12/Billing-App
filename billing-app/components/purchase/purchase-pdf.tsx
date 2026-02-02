"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Purchase } from "@/lib/firebase/purchase"; // adjust path if needed

const ITEMS_PER_PAGE = 12;

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
    position: "relative",
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
  titleText: {
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

  /* ───────── VENDOR SECTION ───────── */
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
    marginLeft: 200,
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

  rupeeLarge: {
    fontFamily: "Helvetica",
    fontSize: 10,
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

  pageSpacer: {
    flexGrow: 1,
    minHeight: 250,
  },
});

interface PurchasePDFProps {
  purchase: Purchase;
}

export default function PurchasePDF({ purchase }: PurchasePDFProps) {
  const purchaseNumber = purchase.purchaseNumber ?? 0;
  const purchaseDate = purchase.purchaseDate
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(purchase.purchaseDate)
    : "—";

  const products = purchase.products || [];

  const subtotal    = purchase.subtotal    ?? 0;
  const discount    = purchase.discount    ?? 0;
  const cgst        = purchase.cgst        ?? 0;
  const sgst        = purchase.sgst        ?? 0;
  const igst        = purchase.igst        ?? 0;
  const netAmount   = purchase.netAmount   ?? 0;

  const formatINR = (num: number) => {
    return `₹ ${new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)}`;
  };

  const getMeasurementText = (p: any) => {
    if (p.measurementType === "height_width") {
      return `Height: ${p.height ?? "—"} | Width: ${p.width ?? "—"}`;
    }
    if (p.measurementType === "kg") {
      return `Kg: ${p.kg ?? "—"}`;
    }
    if (p.measurementType === "unit") {
      return `Unit: ${p.units ?? "—"}`;
    }
    return "—";
  };

  // Paginate products
  const pages: any[][] = [];
  for (let i = 0; i < products.length; i += ITEMS_PER_PAGE) {
    pages.push(products.slice(i, i + ITEMS_PER_PAGE));
  }
  if (pages.length === 0) pages.push([]);

  return (
    <Document>
      {pages.map((pageProducts, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page} wrap={false}>
          {/* HEADER – first page only */}
          {pageIndex === 0 && (
            <View style={styles.headerBg}>
              <View style={styles.headerRow}>
                <Text style={styles.titleText}>PURCHASE ORDER</Text>
                <View style={styles.companyRight}>
                  <Text style={styles.companyBrand}>HANOVER</Text>
                  <Text style={styles.companyBrand}>& TYKE</Text>
                </View>
              </View>
            </View>
          )}

          {/* VENDOR INFO – first page only */}
          {pageIndex === 0 && (
            <View style={styles.billSection}>
              <View style={styles.leftCol}>
                <Text style={styles.label}>VENDOR</Text>
                <Text>{purchase.vendorName || "—"}</Text>
                <Text>{purchase.billingAddress || "—"}</Text>
                {purchase.vendorPhone && <Text>Phone: {purchase.vendorPhone}</Text>}
                {purchase.vendorGstin && <Text>GSTIN: {purchase.vendorGstin}</Text>}
              </View>

              <View style={styles.rightCol}>
                <Text style={{ marginBottom: 2 }}>
                  PO No.: {String(purchaseNumber).padStart(4, "0")}
                </Text>
                <Text>Date: {purchaseDate}</Text>
              </View>
            </View>
          )}

          {/* TABLE HEADER + ROWS */}
          <View>
            <View style={styles.tableHeader}>
              <Text style={styles.colProduct}>Item Description</Text>
              <Text style={styles.colMeasurement}>Measurement</Text>
              <Text style={styles.colQty}>Qty</Text>
              <Text style={styles.colTotal}>Amount</Text>
            </View>

            {pageProducts.map((product, idx) => (
              <View style={styles.tableRow} key={idx}>
                <Text style={styles.colProduct}>{product.name || "—"}</Text>
                <Text style={styles.colMeasurement}>
                  {getMeasurementText(product)}
                </Text>
                <Text style={styles.colQty}>{product.quantity ?? 1}</Text>
                <Text style={{ ...styles.colTotal, ...styles.rupeeLarge }}>
                  {formatINR(product.total || 0)}
                </Text>
              </View>
            ))}

            {pageProducts.length === 0 && pageIndex === 0 && (
              <View style={styles.tableRow}>
                <Text style={{ ...styles.colProduct, textAlign: "center", width: "100%" }}>
                  No items in this purchase order
                </Text>
              </View>
            )}
          </View>

          {/* TOTALS + TERMS – last page only */}
          {pageIndex === pages.length - 1 && (
            <>
              <View style={styles.totalBox}>
                <View style={styles.totalRow}>
                  <Text>Subtotal</Text>
                  <Text style={styles.rupeeLarge}>{formatINR(subtotal)}</Text>
                </View>

                {discount > 0 && (
                  <View style={styles.totalRow}>
                    <Text>Discount</Text>
                    <Text style={styles.rupeeLarge}>-{formatINR(discount)}</Text>
                  </View>
                )}

                {cgst > 0 && (
                  <View style={styles.totalRow}>
                    <Text>CGST ({((cgst / (subtotal - discount)) * 100 || 0).toFixed(1)}%)</Text>
                    <Text style={styles.rupeeLarge}>{formatINR(cgst)}</Text>
                  </View>
                )}

                {sgst > 0 && (
                  <View style={styles.totalRow}>
                    <Text>SGST ({((sgst / (subtotal - discount)) * 100 || 0).toFixed(1)}%)</Text>
                    <Text style={styles.rupeeLarge}>{formatINR(sgst)}</Text>
                  </View>
                )}

                {igst > 0 && (
                  <View style={styles.totalRow}>
                    <Text>IGST ({((igst / (subtotal - discount)) * 100 || 0).toFixed(1)}%)</Text>
                    <Text style={styles.rupeeLarge}>{formatINR(igst)}</Text>
                  </View>
                )}

                <View style={styles.totalHighlight}>
                  <Text style={styles.totalHighlightText}>
                    GRAND TOTAL: {formatINR(netAmount)}
                  </Text>
                </View>
              </View>

              <View style={styles.termsSection}>
                <Text style={styles.termsTitle}>TERMS & CONDITIONS</Text>
                <Text>• This purchase order is valid for 30 days from the date of issue.</Text>
                <Text>• Supply should strictly adhere to specifications and delivery schedule.</Text>
                <Text>• Payment terms: 30 days from receipt of invoice and material.</Text>
                <Text style={{ marginTop: 8 }}>Hanover & Tyke</Text>
              </View>
            </>
          )}

          <Text style={styles.pageNumber}>
            Page {pageIndex + 1} of {pages.length}
          </Text>
        </Page>
      ))}
    </Document>
  );
}