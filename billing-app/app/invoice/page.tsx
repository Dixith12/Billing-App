'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCreateInvoice } from './hooks/useCreateInvoice'
import { CustomerSelector } from '@/components/invoice/customerSelector'
import { ProductSearcher } from '@/components/invoice/productSearcher'
import { BilledProductsTable } from '@/components/invoice/billedProductTable'
import { InvoiceSummary } from '@/components/invoice/invoice-summary'
import { TotalsFooter } from '@/components/invoice/totalFooter'

import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Invoice } from '@/lib/firebase/invoices'

// ── Inner content component (uses client hooks) ─────────────────────────────
function InvoiceContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const editId = searchParams.get('edit')
  const isEditMode = !!editId

  const [loading, setLoading] = useState(isEditMode)
  const [error, setError] = useState<string | null>(null)

  const {
    customerSearch,
    setCustomerSearch,
    filteredCustomers,
    selectedCustomer,
    setSelectedCustomer,
    isAddCustomerOpen,
    setIsAddCustomerOpen,
    newCustomer,
    setNewCustomer,
    addNewCustomer,
    billingAddress,
    setBillingAddress,

    productSearch,
    setProductSearch,
    filteredInventory,
    billedProducts,
    addProductToBill,
    updateBilledProduct,
    removeBilledProduct,
    setBilledProducts,

    subtotal,
    totalDiscount,
    cgst,
    sgst,
    netAmount,

    saveInvoice,
    resetForm,
  } = useCreateInvoice()

  // Load invoice in edit mode
  useEffect(() => {
    if (!isEditMode || !editId) return

    const loadInvoice = async () => {
      try {
        const invoiceRef = doc(db, 'invoices', editId)
        const snap = await getDoc(invoiceRef)

        if (!snap.exists()) {
          setError('Invoice not found')
          return
        }

        const data = { id: snap.id, ...snap.data() } as Invoice

        // Populate customer
        setSelectedCustomer({
          id: data.customerId,
          name: data.customerName,
          phone: data.customerPhone,
          gstin: data.customerGstin || '',
          address: data.billingAddress || '',
        } as any) // type assertion – improve later

        setBillingAddress(data.billingAddress || '')

        // Populate products
        const formProducts = data.products.map((p) => ({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: p.name,
          quantity: p.quantity,
          height: p.height,
          width: p.width,
          discount: p.discount,
          discountType: p.discountType,
          total: p.total,
        }))

        setBilledProducts(formProducts)
      } catch (err: any) {
        console.error('Failed to load invoice:', err)
        setError('Could not load invoice. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadInvoice()
  }, [isEditMode, editId, setSelectedCustomer, setBillingAddress, setBilledProducts])

  // Save / Update handler
  const handleSave = async () => {
    if (isEditMode) {
      if (!editId) {
        alert('Cannot update: missing invoice ID')
        return
      }

      try {
        const invoiceRef = doc(db, 'invoices', editId)

        await updateDoc(invoiceRef, {
          customerId: selectedCustomer?.id,
          customerName: selectedCustomer?.name,
          customerPhone: selectedCustomer?.phone,
          customerGstin: selectedCustomer?.gstin || null,
          billingAddress,
          products: billedProducts.map((p) => ({
            name: p.name,
            quantity: p.quantity,
            height: p.height,
            width: p.width,
            discount: p.discount,
            discountType: p.discountType,
            total: p.total,
          })),
          subtotal,
          discount: totalDiscount,
          cgst,
          sgst,
          netAmount,
          updatedAt: serverTimestamp(),
        })

        alert('Invoice updated successfully')
        resetForm()
        router.push('/dashboard')
      } catch (err: any) {
        console.error('Update failed:', err)
        alert('Failed to update invoice. Please try again.')
      }
    } else {
      const result = await saveInvoice()
      if (result.success) {
        alert('Invoice saved successfully ✅')
        resetForm()
        router.push('/dashboard')
      } else {
        alert(result.message || 'Failed to save invoice')
      }
    }
  }

  const handleClose = () => router.back()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span>Loading invoice...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-red-600 text-lg font-medium">{error}</p>
        <Button onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 bg-background border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">
              {isEditMode ? 'Edit Invoice' : 'Create Invoice'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSave}
              disabled={loading}
            >
              {isEditMode ? 'Update Invoice' : 'Save Invoice'}
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto space-y-8">
        <CustomerSelector
          customerSearch={customerSearch}
          setCustomerSearch={setCustomerSearch}
          filteredCustomers={filteredCustomers}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          isAddCustomerOpen={isAddCustomerOpen}
          setIsAddCustomerOpen={setIsAddCustomerOpen}
          newCustomer={newCustomer}
          setNewCustomer={setNewCustomer}
          addNewCustomer={addNewCustomer}
        />

        <section className="space-y-4">
          <h2 className="text-lg font-medium">Products & Services</h2>

          <ProductSearcher
            productSearch={productSearch}
            setProductSearch={setProductSearch}
            filteredInventory={filteredInventory}
            onAddProduct={addProductToBill}
          />

          <BilledProductsTable
            products={billedProducts}
            onUpdate={updateBilledProduct}
            onRemove={removeBilledProduct}
          />

          {billedProducts.length > 0 && (
            <>
              <div className="border-t bg-muted/30 p-4">
                <InvoiceSummary
                  address={billingAddress}
                  onAddressChange={setBillingAddress}
                  grandTotal={subtotal}
                  discount={totalDiscount}
                  cgst={cgst}
                  sgst={sgst}
                />
              </div>

              <TotalsFooter
                itemCount={billedProducts.length}
                totalQty={billedProducts.reduce((sum, p) => sum + p.quantity, 0)}
                netAmount={netAmount}
                onClose={handleClose}
                onSave={handleSave}
              />
            </>
          )}

          {billedProducts.length === 0 && (
            <div className="border rounded-lg p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                Search existing products to add to this list or add new product to get started!
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

// ── Root page with Suspense boundary ───────────────────────────────────────
export default function InvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="ml-3">Loading page...</span>
        </div>
      }
    >
      <InvoiceContent />
    </Suspense>
  )
}