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
import { useState } from "react"

interface Props {
  inventoryItems: any[]
  billedProducts: any[]
  onAdd: (item: any) => void
  onUpdate: (id: string, field: any, value: any) => void
  onRemove: (id: string) => void
  onOpenAddProduct: () => void
  grandTotal: number
}

export default function ProductsSection({
  inventoryItems,
  billedProducts,
  onAdd,
  onUpdate,
  onRemove,
  onOpenAddProduct,
  grandTotal,
}: Props) {
  const [search, setSearch] = useState("")

    const addedProductNames = billedProducts.map((p) => p.name)
  const filtered = inventoryItems.filter(
  (i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) &&
    !addedProductNames.includes(i.name)
)

  return (
    <section className="space-y-4">
      {/* Title + Add new product */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-medium">Products & Services</h2>
        <Button
          variant="link"
          className="text-blue-600 p-0 h-auto"
          onClick={onOpenAddProduct}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add new Product
        </Button>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for existing products"
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && filtered.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
              {filtered.map((product) => (
                <button
                  key={product.id}
                  className="w-full px-4 py-2 text-left hover:bg-muted flex justify-between"
                  onClick={() => onAdd(product)}
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
          disabled={!search || filtered.length === 0}
          onClick={() => {
            onAdd(filtered[0])
            setSearch("")   // 👈 IMPORTANT
          }}
        >

          <Plus className="h-4 w-4 mr-1" />
          Add to Bill
        </Button>
      </div>

      {/* Table / Empty */}
      {billedProducts.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left">Product Name</th>
                <th className="px-4 py-3">Height</th>
                <th className="px-4 py-3">Width</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {billedProducts.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{p.name}</td>

                  <td className="px-4 py-3">
                    <Input
                      value={p.height}
                      onChange={(e) =>
                        onUpdate(p.id, "height", e.target.value)
                      }
                    />
                  </td>

                  <td className="px-4 py-3">
                    <Input
                      value={p.width}
                      onChange={(e) =>
                        onUpdate(p.id, "width", e.target.value)
                      }
                    />
                  </td>

                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      value={p.quantity}
                      onChange={(e) =>
                        onUpdate(p.id, "quantity", Number(e.target.value))
                      }
                    />
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Input
                        value={p.discount}
                        onChange={(e) =>
                          onUpdate(p.id, "discount", e.target.value)
                        }
                      />
                      <Select
                        value={p.discountType}
                        onValueChange={(v) =>
                          onUpdate(p.id, "discountType", v)
                        }
                      >
                        <SelectTrigger className="w-16">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="%">%</SelectItem>
                          <SelectItem value="₹">₹</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right font-semibold">
                    ₹{p.total}
                  </td>

                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(p.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t p-4 text-right font-bold">
            Grand Total: ₹{grandTotal}
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-12 text-center text-muted-foreground">
          <p className="font-medium">No products added</p>
          <p className="text-sm">
            Search existing products to add to this list.
          </p>
        </div>
      )}
    </section>
  )
}
