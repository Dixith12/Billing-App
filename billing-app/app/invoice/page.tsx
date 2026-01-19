
"use client"

import { useState, useEffect  } from "react"
import { ArrowLeft, Plus, Search, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useSearchParams } from "next/navigation"
import { useApp } from "@/lib/app-context"
import { InvoiceSummary } from "../../components/invoice/invoice-summary"
import { Customer, addCustomer, getCustomers } from "@/lib/firebase/customers"
import { addInvoice } from "@/lib/firebase/invoices"



interface Product {
  id: string
  name: string
  quantity: number
  height: string
  width: string
  discount: string
  discountType: "%" | "₹"
  total: number
}





export default function CreateInvoicePage() {
  const { inventoryItems } = useApp()
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerSearch, setCustomerSearch] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)

  const [productSearch, setProductSearch] = useState("")
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [billedProducts, setBilledProducts] = useState<Product[]>([])

  // New customer form state
const [newCustomer, setNewCustomer] = useState({
  name: "",
  gstin: "",
  phone: "",
  address: "",
})

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: "",
  })



  const [billingAddress, setBillingAddress] = useState("")
  const calculateDiscountTotal = () => {
  return billedProducts.reduce((sum, product) => {
    const productBase =
      (parseFloat(product.height) || 0) +
      (parseFloat(product.width) || 0)

    let discount = 0
    const discountValue = parseFloat(product.discount) || 0

    if (discountValue > 0) {
      if (product.discountType === "%") {
        discount = (product.total * discountValue) / 100
      } else {
        discount = discountValue
      }
    }

    return sum + discount
  }, 0)
}

useEffect(() => {
  loadCustomers()
}, [])

const loadCustomers = async () => {
  setLoadingCustomers(true)
  try {
    const data = await getCustomers()
    setCustomers(data)
  } catch (err) {
    console.error("Failed to load customers", err)
  } finally {
    setLoadingCustomers(false)
  }
}


  // Filter customers based on search
const filteredCustomers = customers.filter((customer) => {
  const search = customerSearch.toLowerCase()

  return (
    customer.name.toLowerCase().includes(search) ||
    (customer.gstin && customer.gstin.toLowerCase().includes(search)) ||
    customer.phone.includes(search)
  )
})



  // Filter products based on search
  const filteredProducts = inventoryItems.filter((item) =>
  item.name.toLowerCase().includes(productSearch.toLowerCase())
)


const handleSelectCustomer = (customer: Customer) => {
  setSelectedCustomer(customer)
  setCustomerSearch("")
  setBillingAddress(customer.address || "")
}



  const handleRemoveCustomer = () => {
    setSelectedCustomer(null)
  }

const handleAddCustomer = async () => {
  if (!newCustomer.name || !newCustomer.phone) return

  try {
    const saved = await addCustomer(newCustomer)

    setCustomers((prev) => [...prev, saved])
    setSelectedCustomer(saved)

    setNewCustomer({
      name: "",
      gstin: "",
      phone: "",
      address: "",
    })

    setIsAddCustomerOpen(false)
  } catch (err) {
    console.error("Error saving customer", err)
  }
}


  const handleAddToBill = (item: any) => {
  const baseTotal =
    item.height * item.pricePerHeight +
    item.width * item.pricePerWidth

  const newBilledProduct: Product = {
    id: Date.now().toString(),
    name: item.name,
    quantity: 1,
    height: item.height.toString(),
    width: item.width.toString(),
    discount: "0",
    discountType: "%",
    total: baseTotal,
  }

  setBilledProducts((prev) => [...prev, newBilledProduct])
  setProductSearch("")
}


  const handleUpdateProduct = (
  id: string,
  field: keyof Product,
  value: string | number
) => {
  setBilledProducts((prev) =>
    prev.map((product) => {
      if (product.id !== id) return product

      const updated = { ...product, [field]: value }

      const height = parseFloat(updated.height) || 0
      const width = parseFloat(updated.width) || 0

      const inventory = inventoryItems.find(
        (i) => i.name === updated.name
      )
      if (!inventory) return updated

      let total =
        height * inventory.pricePerHeight +
        width * inventory.pricePerWidth

      updated.total = total * updated.quantity
      return updated
    })
  )
}


  const handleRemoveProduct = (id: string) => {
    setBilledProducts((prev) => prev.filter((product) => product.id !== id))
  }

  const calculateSubTotal = () => {
    return billedProducts.reduce((sum, product) => sum + product.total, 0)
  }

    const subtotal = calculateSubTotal()
    const discount = calculateDiscountTotal()
    const taxableAmount = subtotal - discount


      const cgst = taxableAmount * 0.09
      const sgst = taxableAmount * 0.09

const netAmount = taxableAmount + cgst + sgst

const handleSave = async () => {
  if (!selectedCustomer) {
    alert("Please select a customer before saving invoice")
    return
  }

  if (billedProducts.length === 0) {
    alert("Please add at least one product to invoice")
    return
  }

  try {
    await addInvoice({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      customerGstin: selectedCustomer.gstin,
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
      discount,
      cgst,
      sgst,
      netAmount,
    })

    alert("Invoice saved successfully ✅")

    setSelectedCustomer(null)
    setBilledProducts([])
    setBillingAddress("")
  } catch (err) {
    console.error("Error saving invoice", err)
    alert("Failed to save invoice")
  }
}



  const handleClose = () => {
    // Navigate back or close
    window.history.back()
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Create Invoice</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">Save and Print</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Save</Button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto space-y-8">
        {/* Customer Details Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium">Customer details</h2>
            <Button
              variant="link"
              className="text-blue-600 p-0 h-auto"
              onClick={() => setIsAddCustomerOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add new Customer
            </Button>
          </div>

          {/* Customer Search */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search your Customers, Company Name, GSTIN..."
                className="pl-10 bg-blue-50/50 border-blue-200"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
            </div>

            {/* Customer Search Results Dropdown */}
            {customerSearch && filteredCustomers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                {filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    className="w-full px-4 py-2 text-left hover:bg-muted flex flex-col"
                    onClick={() => handleSelectCustomer(customer)}
                  >
                    <span className="font-medium">{customer.name}</span>
                    <span className="text-sm text-muted-foreground">
                      GSTIN: {customer.gstin}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Customer Chip */}
          {selectedCustomer && (
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md">
                <span className="font-medium">{selectedCustomer.name}</span>
                <button
                  onClick={handleRemoveCustomer}
                  className="hover:bg-background rounded-full p-0.5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Products & Services Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium">Products & Services</h2>
            {/* <Button
              variant="link"
              className="text-blue-600 p-0 h-auto"
              onClick={() => setIsAddProductOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add new Product
            </Button> */}
          </div>

          {/* Product Search with Add to Bill */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for existing products"
                className="pl-10 bg-blue-50/50"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />

              {/* Product Search Results Dropdown */}
              {productSearch && filteredProducts.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      className="w-full px-4 py-2 text-left hover:bg-muted flex justify-between items-center"
                      onClick={() => handleAddToBill(product)}
                    >
                      <span>{product.name}</span>
                      <span className="text-sm text-muted-foreground">
                        height: ₹{product.pricePerHeight} / width: ₹{product.pricePerWidth}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                const product = filteredProducts[0]
                if (product) handleAddToBill(product)
              }}
              disabled={!productSearch || filteredProducts.length === 0}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add to Bill
            </Button>
          </div>

          {/* Products Table */}
          {billedProducts.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Product Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Height
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Width
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Discount
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium">
                        Total
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {billedProducts.map((product) => (
                      <tr key={product.id}>
                        <td className="px-4 py-3">
                          <span className="font-medium">{product.name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            value={product.quantity}
                            onChange={(e) =>
                              handleUpdateProduct(
                                product.id,
                                "quantity",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-20"
                            min={1}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="text"
                            value={product.height}
                            onChange={(e) =>
                              handleUpdateProduct(product.id, "height", e.target.value)
                            }
                            placeholder="Height"
                            className="w-24"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="text"
                            value={product.width}
                            onChange={(e) =>
                              handleUpdateProduct(product.id, "width", e.target.value)
                            }
                            placeholder="Width"
                            className="w-24"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={product.discount}
                              onChange={(e) =>
                                handleUpdateProduct(
                                  product.id,
                                  "discount",
                                  e.target.value
                                )
                              }
                              className="w-20"
                              min={0}
                            />
                            <Select
                              value={product.discountType}
                              onValueChange={(value: "%" | "₹") =>
                                handleUpdateProduct(product.id, "discountType", value)
                              }
                            >
                              <SelectTrigger className="w-16">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white border shadow-md">
                                <SelectItem value="%">%</SelectItem>
                                <SelectItem value="₹">₹</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-semibold">
                            ₹{product.total.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleRemoveProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t bg-muted/30 p-4">
                    <InvoiceSummary
                  address={billingAddress}
                  onAddressChange={setBillingAddress}
                  grandTotal={subtotal}
                  discount={discount}
                  cgst={cgst}
                  sgst={sgst}
                />
              </div>
                

              {/* Totals and Action Buttons */}
              <div className="border-t bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Items: {billedProducts.length}, Qty:{" "}
                    {billedProducts.reduce((sum, p) => sum + p.quantity, 0)}
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-sm text-muted-foreground">Grand Total: </span>
                      <span className="text-xl font-bold">
                        ₹{netAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={handleClose}>
                        Close
                      </Button>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleSave}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
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
                Search existing products to add to this list or add new product to get
                started!
              </p>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setIsAddProductOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add New Product
              </Button>
            </div>
          )}
        </section>
      </main>

      {/* Add Customer Slider/Sheet */}
      <Sheet open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
        <SheetContent className="sm:max-w-md p-3">
          <SheetHeader>
            <SheetTitle>Add New Customer</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="customerName">Name</Label>
              <Input
                id="customerName"
                placeholder="Enter customer name"
                value={newCustomer.name}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerGstin">
                GSTIN Number <span className="text-muted-foreground">(optional)</span>
              </Label>

              <Input
                id="customerGstin"
                placeholder="Enter GSTIN number"
                value={newCustomer.gstin}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, gstin: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone Number</Label>
              <Input
                id="customerPhone"
                placeholder="Enter phone number"
                value={newCustomer.phone}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerAddress">Address</Label>
              <Input
                id="customerAddress"
                placeholder="Enter address"
                value={newCustomer.address}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, address: e.target.value })
                }
              />
            </div>

          </div>
          <SheetFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddCustomerOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-black text-white"
              onClick={handleAddCustomer}
            >
              Save
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Add Product Slider/Sheet */}
      <Sheet open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <SheetContent className="sm:max-w-md p-3">
          <SheetHeader>
            <SheetTitle>Add New Product</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                placeholder="Enter product name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
              />
            </div>
          </div>
          <SheetFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddProductOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-black text-white"
              onClick={() => {
                if (newProduct.name) {
                  handleAddToBill({
                            name: newProduct.name,
                            height: 1,
                            width: 1,
                            pricePerHeight: 0,
                            pricePerWidth: 0,
                          })

                  setNewProduct({ name: "" })
                  setIsAddProductOpen(false)
                }
              }}
            >
              Add Product
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
