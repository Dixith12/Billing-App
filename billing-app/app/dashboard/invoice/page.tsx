'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2, Sparkles, CheckCircle2, Package, FileText, ReceiptIndianRupee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useCreateInvoice } from './hooks/useCreateInvoice'
import { CustomerSelector } from '@/components/invoice/customerSelector'
import { ProductSearcher } from '@/components/invoice/productSearcher'
import { BilledProductsTable } from '@/components/invoice/billedProductTable'
import { InvoiceSummary } from '@/components/invoice/invoice-summary'
import { TotalsFooter } from '@/components/invoice/totalFooter'

import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Invoice, InvoiceProduct } from '@/lib/firebase/invoices'
import { addQuotation } from '@/lib/firebase/quotations'
import { cleanUndefined } from '@/lib/utils/invoiceUtil'

// ── Inner content component ────────────────────────────────────────────────
function InvoiceContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const editId = searchParams.get('edit')
  const isEditMode = !!editId
  const isQuotationMode = searchParams.get('type') === 'quotation'

  const [loading, setLoading] = useState(isEditMode)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

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
    totalGross,

    saveInvoice,
    resetForm,
  } = useCreateInvoice()

  const isValidForSave = isQuotationMode
    ? !!selectedCustomer && billedProducts.length > 0
    : billedProducts.length > 0

  // Load data in edit mode (for both invoice & quotation)
  useEffect(() => {
    if (!isEditMode || !editId) return

    const loadData = async () => {
      try {
        setLoading(true)
        let data
        let collectionName = isQuotationMode ? 'quotations' : 'invoices'

        const ref = doc(db, collectionName, editId)
        const snap = await getDoc(ref)

        if (!snap.exists()) {
          setError(`${isQuotationMode ? 'Quotation' : 'Invoice'} not found`)
          return
        }

        data = { id: snap.id, ...snap.data() } as Invoice

        // Populate form
        setSelectedCustomer({
          id: data.customerId,
          name: data.customerName,
          phone: data.customerPhone,
          gstin: data.customerGstin || '',
          address: data.billingAddress || '',
        } as any)

        setBillingAddress(data.billingAddress || '')

        // Map products with defaults for missing fields
        const formProducts = data.products.map((p: InvoiceProduct) => ({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: p.name,
          quantity: p.quantity,
          measurementType: p.measurementType ?? 'height_width',
          height: p.height ?? undefined,
          width: p.width ?? undefined,
          kg: p.kg ?? undefined,
          units: p.units ?? undefined,
          wasteEnabled: p.wasteEnabled ?? false,
          wasteHeight: p.wasteHeight ?? undefined,
          wasteWidth: p.wasteWidth ?? undefined,
          wasteKg: p.wasteKg ?? undefined,
          wasteUnits: p.wasteUnits ?? undefined,
          discount: p.discount ?? '0',
          discountType: p.discountType ?? '%',
          grossTotal: p.grossTotal ?? p.total ?? 0,
          netTotal: p.total ?? 0,
        }))

        setBilledProducts(formProducts)
      } catch (err: any) {
        console.error(`Failed to load ${isQuotationMode ? 'quotation' : 'invoice'}:`, err)
        setError(`Could not load ${isQuotationMode ? 'quotation' : 'invoice'}.`)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [
    isEditMode,
    editId,
    isQuotationMode,
    setSelectedCustomer,
    setBillingAddress,
    setBilledProducts,
  ])

  // ── Save / Update handler ────────────────────────────────────────────────
  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)

    try {
      if (isQuotationMode && !selectedCustomer) {
        toast.error('Customer Required', {
          description: 'Please select a customer before saving the quotation.',
        })
        return
      }

      if (billedProducts.length === 0) {
        toast.error('No Products', {
          description: 'Please add at least one product.',
        })
        return
      }

      const productsToSave = billedProducts.map((p) =>
        cleanUndefined({
          name: p.name,
          quantity: p.quantity,
          measurementType: p.measurementType,

          ...(p.measurementType === 'height_width' && {
            height: p.height,
            width: p.width,
          }),

          ...(p.measurementType === 'kg' && {
            kg: p.kg,
          }),

          ...(p.measurementType === 'unit' && {
            units: p.units,
          }),

          wasteEnabled: p.wasteEnabled,

          ...(p.wasteEnabled && {
            wasteHeight: p.wasteHeight,
            wasteWidth: p.wasteWidth,
            wasteKg: p.wasteKg,
            wasteUnits: p.wasteUnits,
          }),

          discount: p.discount,
          discountType: p.discountType,
          total: p.netTotal,
          grossTotal: p.grossTotal ?? p.netTotal,
        }),
      )

      if (isEditMode) {
        if (!editId) throw new Error('Missing ID')

        const collectionName = isQuotationMode ? 'quotations' : 'invoices'
        const ref = doc(db, collectionName, editId)

        const updatePayload = cleanUndefined({
          customerId: selectedCustomer?.id,
          customerName: selectedCustomer?.name,
          customerPhone: selectedCustomer?.phone,
          customerGstin: selectedCustomer?.gstin || null,
          billingAddress,
          products: productsToSave,
          subtotal,
          discount: totalDiscount,
          cgst,
          sgst,
          netAmount,
          updatedAt: serverTimestamp(),
        })

        await updateDoc(ref, updatePayload)

        toast.success(`${isQuotationMode ? 'Quotation' : 'Invoice'} Updated`)
        resetForm()
        router.push(isQuotationMode ? '/dashboard/quotation' : '/dashboard')
      } else {
        if (isQuotationMode) {
          await addQuotation({
            customerId: selectedCustomer?.id || '',
            customerName: selectedCustomer?.name || '',
            customerPhone: selectedCustomer?.phone || '',
            ...(selectedCustomer?.gstin ? { customerGstin: selectedCustomer.gstin } : {}),
            billingAddress,
            products: productsToSave,
            subtotal,
            discount: totalDiscount,
            cgst,
            sgst,
            netAmount,
          })

          toast.success('Quotation Created')
          resetForm()
          router.push('/dashboard/quotation')
        } else {
          const result = await saveInvoice()
          if (result.success) {
            toast.success('Invoice Saved')
            resetForm()
            router.push('/dashboard')
          } else {
            toast.error('Save Failed', { description: result.message })
          }
        }
      }
    } catch (err: any) {
      console.error('Save failed:', err)
      toast.error('Error', {
        description: 'Failed to save. Please try again.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="text-slate-600">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-red-600 text-lg font-medium">{error}</p>
        <Button
          onClick={() => router.push(isQuotationMode ? '/dashboard/quotation' : '/dashboard')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Back to {isQuotationMode ? 'Quotations' : 'Dashboard'}
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Decorative background blobs – indigo/purple/pink theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-gradient-to-br from-pink-500/10 to-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative p-6 lg:p-8 space-y-10 max-w-[1400px] mx-auto">
        {/* Floating Hero Card – premium style */}
        <div className="relative">
          {/* Glow background */}
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-2xl"></div>

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 lg:p-8 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur-lg opacity-40"></div>
                  <div className="relative p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                    {isQuotationMode ? (
                      <FileText className="h-7 w-7 text-white" />
                    ) : (
                      <ReceiptIndianRupee className="h-7 w-7 text-white" />
                    )}
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 bg-clip-text text-transparent tracking-tight">
                    {isEditMode
                      ? isQuotationMode
                        ? 'Edit Quotation'
                        : 'Edit Invoice'
                      : isQuotationMode
                      ? 'Create New Quotation'
                      : 'Create New Invoice'}
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">
                    {isQuotationMode
                      ? 'Generate professional quotations for your clients'
                      : 'Create invoices and track payments seamlessly'}
                  </p>
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-2 text-sm pl-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-slate-600">
                  Form ready • {isEditMode ? 'Editing' : 'New'} {isQuotationMode ? 'Quotation' : 'Invoice'}
                </span>
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={isSaving || loading || !isValidForSave}
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-10 min-w-[220px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  <span className="font-semibold">
                    {isEditMode
                      ? isQuotationMode
                        ? 'Updating Quotation...'
                        : 'Updating Invoice...'
                      : isQuotationMode
                      ? 'Saving Quotation...'
                      : 'Saving Invoice...'}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-semibold">
                    {isEditMode
                      ? isQuotationMode
                        ? 'Update Quotation'
                        : 'Update Invoice'
                      : isQuotationMode
                      ? 'Save Quotation'
                      : 'Save Invoice'}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Form Content */}
        <div className="space-y-8">
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

          <section className="space-y-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Package className="h-5 w-5 text-indigo-600" />
              Products & Services
            </h2>

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
                <div className="border-t bg-slate-50/50 p-6 rounded-lg">
                  <InvoiceSummary
                    address={billingAddress}
                    onAddressChange={setBillingAddress}
                    grandTotal={totalGross}
                    discount={totalDiscount}
                    cgst={cgst}
                    sgst={sgst}
                    netAmount={netAmount}
                  />
                </div>

                <TotalsFooter
                  itemCount={billedProducts.length}
                  totalQty={billedProducts.reduce((sum, p) => sum + p.quantity, 0)}
                  netAmount={netAmount}
                  onClose={() => router.back()}
                  onSave={handleSave}
                  isEditMode={isEditMode}
                  isSaving={isSaving}
                  isQuotationMode={isQuotationMode}
                  disabled={!isValidForSave}
                />
              </>
            )}

            {billedProducts.length === 0 && (
              <div className="border border-dashed border-slate-300 rounded-xl p-12 text-center bg-slate-50/50">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Package className="h-10 w-10 text-slate-400" />
                  </div>
                </div>
                <p className="text-slate-600 font-medium mb-2">
                  No products added yet
                </p>
                <p className="text-sm text-slate-500">
                  Search and add products or services to continue
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

// ── Root page with Suspense boundary ───────────────────────────────────────
export default function InvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          <span className="text-slate-600">Loading invoice form...</span>
        </div>
      }
    >
      <InvoiceContent />
    </Suspense>
  )
}