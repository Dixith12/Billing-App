'use client'

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCreateInvoice } from './hooks/useCreateInvoice'
import { CustomerSelector } from '@/components/invoice/customerSelector'
import { ProductSearcher } from '@/components/invoice/productSearcher'
import { BilledProductsTable } from '@/components/invoice/billedProductTable'
import { InvoiceSummary } from '@/components/invoice/invoice-summary'
import { TotalsFooter } from '@/components/invoice/totalFooter'

export default function CreateInvoicePage() {
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

    subtotal,
    totalDiscount,
    cgst,
    sgst,
    netAmount,

    saveInvoice,
    resetForm,
  } = useCreateInvoice()

  const handleSave = async () => {
    const result = await saveInvoice()
    if (result.success) {
      alert('Invoice saved successfully ✅')
      resetForm()
      window.history.back()
    } else {
      alert(result.message || 'Failed to save')
    }
  }

  const handleClose = () => window.history.back()

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 bg-background border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Create Invoice</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">Save and Print</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave}>
              Save
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
              {/* empty state SVG + text – keep as is */}
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                  <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                Search existing products to add to this list or add new product to get started!
              </p>
              {/* You can add "Add New Product" button here if you want to re-enable it */}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}