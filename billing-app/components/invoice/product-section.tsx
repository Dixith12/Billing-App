"use client"

import { Plus, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useInvoice } from "@/app/invoice/hooks/useInvoice"

export function ProductSection({
  invoice,
}: {
  invoice: ReturnType<typeof useInvoice>
}) {
  const {
    productSearch,
    setProductSearch,
    filteredProducts,
    billedProducts,
    addProductToBill,
    updateProduct,
    removeProduct,
    grandTotal,
  } = invoice

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium">Products & Services</h2>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
        <Input
          className="pl-10"
          placeholder="Search product..."
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
        />

        {productSearch && filteredProducts.length > 0 && (
          <div className="absolute z-10 w-full bg-white border rounded-md">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                className="w-full px-4 py-2 text-left hover:bg-muted"
                onClick={() => addProductToBill(p)}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {billedProducts.map((p) => (
        <div key={p.id} className="flex gap-2 items-center">
          <span className="flex-1">{p.name}</span>

          <Input
            type="number"
            value={p.quantity}
            className="w-20"
            onChange={(e) =>
              updateProduct(p.id, "quantity", parseInt(e.target.value) || 1)
            }
          />

          <Button variant="ghost" onClick={() => removeProduct(p.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <div className="text-right text-lg font-bold">
        Grand Total: ₹{grandTotal.toFixed(2)}
      </div>
    </section>
  )
}
