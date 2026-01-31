// app/vendors/components/vendor-list.tsx
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
  Building2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  MapPin,
  FileText,
  Phone,
  Landmark,
  Briefcase,
  IndianRupee,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Vendor } from '@/lib/firebase/vendors'           // ← adjust path
import { useVendors } from '@/app/dashboard/vendor/hooks/useVendors'
import { INDIAN_STATES_AND_UTS } from '@/lib/utils/india'
import { toast } from 'sonner'

// Same state code mapping
const STATE_CODES: Record<string, string> = {
  'Andhra Pradesh': 'AP',
  'Arunachal Pradesh': 'AR',
  'Assam': 'AS',
  'Bihar': 'BR',
  'Chhattisgarh': 'CG',
  'Goa': 'GA',
  'Gujarat': 'GJ',
  'Haryana': 'HR',
  'Himachal Pradesh': 'HP',
  'Jharkhand': 'JH',
  'Karnataka': 'KA',
  'Kerala': 'KL',
  'Madhya Pradesh': 'MP',
  'Maharashtra': 'MH',
  'Manipur': 'MN',
  'Meghalaya': 'ML',
  'Mizoram': 'MZ',
  'Nagaland': 'NL',
  'Odisha': 'OR',
  'Punjab': 'PB',
  'Rajasthan': 'RJ',
  'Sikkim': 'SK',
  'Tamil Nadu': 'TN',
  'Telangana': 'TG',
  'Tripura': 'TR',
  'Uttar Pradesh': 'UP',
  'Uttarakhand': 'UK',
  'West Bengal': 'WB',
  'Andaman and Nicobar Islands': 'AN',
  'Chandigarh': 'CH',
  'Dadra and Nagar Haveli and Daman and Diu': 'DN',
  'Delhi': 'DL',
  'Jammu and Kashmir': 'JK',
  'Ladakh': 'LA',
  'Lakshadweep': 'LD',
  'Puducherry': 'PY',
}

interface VendorListProps {
  items: Vendor[]
}

export function VendorList({ items }: VendorListProps) {
  const { deleteVendor } = useVendors()

  const [searchQuery, setSearchQuery] = useState('')
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const {
    form,
    updateField,
    setBalanceType,
    submit,
    formError: error,
    isSubmitting: isLoading,
    resetForm,
  } = useVendors().useVendorForm(     // ← using the embedded form logic
    () => {
      setIsEditDialogOpen(false)
      setEditingVendor(null)
      toast.success("Vendor updated successfully", {
        description: "Changes have been saved.",
        duration: 4000,
      })
    },
    editingVendor   // pass initial data for edit
  )

  const filteredVendors = items.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.phone && v.phone.includes(searchQuery)) ||
      (v.gstin && v.gstin.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.state && v.state.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const getStateCode = (fullState?: string): string => {
    if (!fullState || !fullState.trim()) return '—'
    const trimmed = fullState.trim()
    return STATE_CODES[trimmed] || '—'
  }

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor)
    setIsEditDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    await submit()
  }

  return (
    <div className="space-y-6 ml-3 mr-3 mb-3">
      {/* Search */}
      <div className="relative max-w-md ml-1 mt-2.5">
        <Input
          placeholder="Search by name, phone, GSTIN or state..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-slate-300 focus:border-indigo-400 focus:ring-indigo-200"
        />
        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
      </div>

      {/* Table */}
      {filteredVendors.length === 0 ? (
        <div className="text-center py-16 bg-slate-50/70 rounded-xl border border-slate-200">
          <Building2 className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <p className="text-lg font-medium text-slate-700">No vendors found</p>
          <p className="text-sm text-slate-500 mt-2">
            {searchQuery ? 'Try adjusting your search' : 'Add your first vendor to get started'}
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
                <TableHead className="font-semibold text-slate-700 text-center">State</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor, idx) => (
                <TableRow
                  key={vendor.id}
                  className={cn(
                    'hover:bg-slate-50/70 transition-colors',
                    idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                  )}
                >
                  <TableCell className="font-medium text-slate-900">{vendor.name}</TableCell>
                  <TableCell>
                    {vendor.gstin ? (
                      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 px-2.5 py-0.5">
                        {vendor.gstin}
                      </Badge>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-700">{vendor.phone || '—'}</TableCell>
                  <TableCell className="text-slate-600 max-w-md truncate">{vendor.address || '—'}</TableCell>
                  <TableCell className="text-center text-slate-700 font-medium">
                    <span className={cn(getStateCode(vendor.state) === '—' ? 'text-slate-400' : 'text-purple-700')}>
                      {getStateCode(vendor.state)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                        onClick={() => handleEdit(vendor)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          if (confirm('Delete this vendor? This cannot be undone.')) {
                            deleteVendor(vendor.id)
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

      {/* Edit Dialog - almost identical structure, just renamed */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-white border-slate-200 max-h-[90vh] overflow-hidden">
          <DialogHeader className="pb-5 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-sm">
                <Building2 className="h-7 w-7 text-white" strokeWidth={2.2} />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-slate-800">Edit Vendor</DialogTitle>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  Update vendor details
                </p>
              </div>
            </div>
          </DialogHeader>

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 mx-1">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <div className="max-h-[70vh] overflow-y-auto px-1 py-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-indigo-600" />
                  Vendor Name <span className="text-red-500 text-xs">*</span>
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="border-slate-300 focus:border-indigo-400 focus:ring-indigo-200 h-11"
                />
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                  Company Name <span className="text-xs text-slate-500">(optional)</span>
                </Label>
                <Input
                  value={form.companyName || ''}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  className="border-slate-300 focus:border-blue-400 focus:ring-blue-200 h-11"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-emerald-600" />
                  Phone Number <span className="text-red-500 text-xs">*</span>
                </Label>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="border-slate-300 focus:border-emerald-400 focus:ring-emerald-200 h-11"
                />
              </div>

              {/* GSTIN */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-violet-600" />
                  GSTIN <span className="text-xs text-slate-500">(optional)</span>
                </Label>
                <Input
                  value={form.gstin || ''}
                  onChange={(e) => updateField('gstin', e.target.value)}
                  className="border-slate-300 focus:border-violet-400 focus:ring-violet-200 h-11"
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-amber-600" />
                  Address <span className="text-red-500 text-xs">*</span>
                </Label>
                <Textarea
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className="border-slate-300 focus:border-amber-400 focus:ring-amber-200 min-h-[100px] resize-none"
                />
              </div>

              {/* State */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-purple-600" />
                  State / UT <span className="text-xs text-slate-500">(optional)</span>
                </Label>
                <select
                  value={form.state || ''}
                  onChange={(e) => updateField('state', e.target.value)}
                  className={cn(
                    'w-full h-11 px-4 py-2.5 border border-slate-300 rounded-lg',
                    'focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none',
                    'bg-white text-slate-900 shadow-sm transition-all duration-200',
                    'hover:border-purple-400 hover:shadow-md'
                  )}
                >
                  <option value="">Select state / union territory</option>
                  {INDIAN_STATES_AND_UTS.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              {/* Opening Balance */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/40 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-rose-600" />
                  Opening Balance
                </h3>

                <div className="space-y-5">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700">Current Opening Balance</Label>

                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="debit-edit-vendor"
                          name="balanceType-edit-vendor"
                          checked={form.openingBalanceType === 'debit'}
                          onChange={() => setBalanceType('debit')}
                          className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                        />
                        <Label htmlFor="debit-edit-vendor" className="cursor-pointer">
                          Debit
                        </Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="credit-edit-vendor"
                          name="balanceType-edit-vendor"
                          checked={form.openingBalanceType === 'credit'}
                          onChange={() => setBalanceType('credit')}
                          className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                        />
                        <Label htmlFor="credit-edit-vendor" className="cursor-pointer">
                          Credit
                        </Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="relative flex items-center border border-slate-300 rounded-lg h-11 overflow-hidden focus-within:border-rose-400 focus-within:ring-rose-200 shadow-sm">
                        <span className="px-4 text-slate-600 font-medium bg-slate-100">₹</span>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={form.openingBalanceAmount}
                          onChange={(e) => updateField('openingBalanceAmount', e.target.value)}
                          className="border-0 focus:ring-0 h-full rounded-none bg-transparent px-3"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      {/* Small message card like in add modal */}
                      {form.openingBalanceAmount && Number(form.openingBalanceAmount) > 0 && (
                        <div
                          className={cn(
                            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
                            form.openingBalanceType === 'debit'
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-green-50 text-green-700 border border-green-200"
                          )}
                        >
                          <IndianRupee className="h-3.5 w-3.5" />
                          {form.openingBalanceType === 'debit'
                            ? 'Vendor pays you'
                            : 'You pay the vendor'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-3 pt-6 border-t border-slate-200 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-slate-300 hover:bg-slate-50 min-w-[110px]"
                  disabled={isLoading}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px] shadow-sm",
                    isLoading && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}