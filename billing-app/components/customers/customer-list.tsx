// app/customers/components/customer-list.tsx
'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Pencil,
  Trash2,
  Users,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  MapPin,
  FileText,
  Phone,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Customer } from '@/lib/firebase/customers'
import { useCustomers, useEditCustomerForm } from '@/app/dashboard/customer/hooks/useCustomers'

interface CustomerListProps {
  items: Customer[]
}

export function CustomerList({ items }: CustomerListProps) {
  const { deleteCustomer } = useCustomers()

  const [searchQuery, setSearchQuery] = useState('')
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const { form, updateField, submit, error } = useEditCustomerForm(
    editingCustomer,
    () => {
      setIsEditDialogOpen(false)
      setEditingCustomer(null)
    }
  )

  const filteredCustomers = items.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery)) ||
      (c.gstin && c.gstin.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setIsEditDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await submit()
    if (success) {
      // dialog closes via hook callback
    }
  }

  return (
    <div className="space-y-6 ml-3 mr-3 mb-3">
      {/* Search Input – optional but useful */}
      <div className="relative max-w-md ml-1 mt-2.5">
        <Input
          placeholder="Search by name, phone or GSTIN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-slate-300 focus:border-indigo-400 focus:ring-indigo-200"
        />
        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
      </div>

      {/* Table / Empty State */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-16 bg-slate-50/70 rounded-xl border border-slate-200">
          <Users className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <p className="text-lg font-medium text-slate-700">No customers found</p>
          <p className="text-sm text-slate-500 mt-2">
            {searchQuery
              ? 'Try adjusting your search'
              : 'Add your first customer to get started'}
          </p>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 border-b border-slate-200">
                <TableHead className="font-semibold text-slate-700">Name</TableHead>
                <TableHead className="font-semibold text-slate-700">GSTIN</TableHead>
                <TableHead className="font-semibold text-slate-700">Phone</TableHead>
                <TableHead className="font-semibold text-slate-700">Address</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredCustomers.map((customer, idx) => (
                <TableRow
                  key={customer.id}
                  className={cn(
                    "hover:bg-slate-50/70 transition-colors",
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                  )}
                >
                  <TableCell className="font-medium text-slate-900">
                    {customer.name}
                  </TableCell>
                  <TableCell>
                    {customer.gstin ? (
                      <Badge
                        variant="outline"
                        className="bg-indigo-50 text-indigo-700 border-indigo-200 px-2.5 py-0.5"
                      >
                        {customer.gstin}
                      </Badge>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {customer.phone || '—'}
                  </TableCell>
                  <TableCell className="text-slate-600 max-w-md truncate">
                    {customer.address || '—'}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                        onClick={() => handleEdit(customer)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          if (confirm("Delete this customer? This cannot be undone.")) {
                            deleteCustomer(customer.id)
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog – premium style */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-white border-slate-200">
          <DialogHeader className="pb-5 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-sm">
                <Users className="h-7 w-7 text-white" strokeWidth={2.2} />
              </div>

              <div>
                <DialogTitle className="text-2xl font-bold text-slate-800">
                  Edit Customer
                </DialogTitle>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  Update customer details
                </p>
              </div>
            </div>
          </DialogHeader>

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-800">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6 pt-2">
            {/* Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-600" />
                Customer Name <span className="text-red-500 text-xs">*</span>
              </Label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300 pointer-events-none" />
                <Input
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="relative border-slate-300 focus:border-indigo-400 focus:ring-indigo-200 h-11"
                />
              </div>
            </div>

            {/* GSTIN */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <FileText className="h-4 w-4 text-violet-600" />
                GSTIN <span className="text-xs text-slate-500">(optional)</span>
              </Label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300 pointer-events-none" />
                <Input
                  value={form.gstin || ''}
                  onChange={(e) => updateField('gstin', e.target.value)}
                  className="relative border-slate-300 focus:border-violet-400 focus:ring-violet-200 h-11"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-600" />
                Phone Number <span className="text-red-500 text-xs">*</span>
              </Label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300 pointer-events-none" />
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="relative border-slate-300 focus:border-emerald-400 focus:ring-emerald-200 h-11"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-600" />
                Full Address <span className="text-red-500 text-xs">*</span>
              </Label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300 pointer-events-none" />
                <Textarea
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className="relative border-slate-300 focus:border-amber-400 focus:ring-amber-200 min-h-[100px] resize-none"
                />
              </div>
            </div>

            <DialogFooter className="gap-3 pt-5 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border-slate-300 hover:bg-slate-50 min-w-[110px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px] shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}