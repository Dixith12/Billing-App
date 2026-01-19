'use client'

import { useState, useMemo } from 'react'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Eye, Send, MoreHorizontal, IndianRupee, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { Invoice } from '@/lib/types'
import { cn } from '@/lib/utils'

interface TransactionsTableProps {
  invoices: Invoice[]
}

type SortOrder = 'asc' | 'desc' | null

export function TransactionsTable({ invoices }: TransactionsTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  
  // Filter states
  const [amountSort, setAmountSort] = useState<SortOrder>(null)
  const [amountMin, setAmountMin] = useState('')
  const [amountMax, setAmountMax] = useState('')
  const [statusFilters, setStatusFilters] = useState<Invoice['status'][]>([])
  const [modeFilters, setModeFilters] = useState<Invoice['mode'][]>([])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  const getRelativeTime = () => {
    return '6 hours ago'
  }

  // Get unique modes from invoices
  const uniqueModes = useMemo(() => {
  const modes = invoices.map(inv => inv.mode)
  return [...new Set(modes)]
}, [invoices])


  const allStatuses: Invoice['status'][] = ['paid', 'pending', 'partially paid', 'cancelled', 'draft']

  const filteredInvoices = useMemo(() => {
    let result = invoices.filter((invoice) => {
      // Search filter
      const matchesSearch =
        invoice.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.billNo.toLowerCase().includes(searchQuery.toLowerCase())
      
      // Amount filter
      const minAmount = amountMin ? parseFloat(amountMin) : null
      const maxAmount = amountMax ? parseFloat(amountMax) : null
      const matchesAmount = 
        (minAmount === null || invoice.amount >= minAmount) &&
        (maxAmount === null || invoice.amount <= maxAmount)
      
      // Status filter
      const matchesStatus = statusFilters.length === 0 || statusFilters.includes(invoice.status)
      
      // Mode filter
      const matchesMode = modeFilters.length === 0 || (invoice.mode && modeFilters.includes(invoice.mode))
      
      return matchesSearch && matchesAmount && matchesStatus && matchesMode
    })

    // Sort by amount if selected
    if (amountSort) {
      result = [...result].sort((a, b) => {
        return amountSort === 'asc' ? a.amount - b.amount : b.amount - a.amount
      })
    }

    return result
  }, [invoices, searchQuery, amountMin, amountMax, statusFilters, modeFilters, amountSort])

  const getStatusBadgeVariant = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'partially paid':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return ''
    }
  }

  const handleRecordPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsPaymentDialogOpen(true)
  }

  const toggleStatusFilter = (status: Invoice['status']) => {
    setStatusFilters(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    )
  }

  const toggleModeFilter = (mode: Invoice['mode']) => {
    if (!mode) return
    setModeFilters(prev => 
      prev.includes(mode) 
        ? prev.filter(m => m !== mode)
        : [...prev, mode]
    )
  }

  const clearAmountFilter = () => {
    setAmountMin('')
    setAmountMax('')
    setAmountSort(null)
  }

  return (
    <div className="space-y-4">
      {/* Header with Transaction count */}
      <div className="flex items-center gap-6 border-b">
        <div className="pb-3 text-sm font-medium border-b-2 border-primary text-foreground">
          Transactions
          <span className="ml-2 bg-muted px-2 py-0.5 rounded text-xs">
            {filteredInvoices.length}
          </span>
        </div>
      </div>

      {/* Search Only */}
      <div className="flex items-center">
        <Input
          placeholder="Search by transaction, customers, invoice etc.."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-medium">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-1 hover:text-foreground">
                      Amount
                      <Filter className={cn("h-3 w-3", (amountMin || amountMax || amountSort) ? "text-primary" : "text-muted-foreground")} />
                      {amountSort === 'asc' && <ChevronUp className="h-3 w-3" />}
                      {amountSort === 'desc' && <ChevronDown className="h-3 w-3" />}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3 bg-white dark:bg-background border shadow-lg z-50" align="start">
                    <div className="space-y-3">
                      <div className="font-medium text-sm">Filter by Amount</div>
                      <div className="flex gap-2">
                        <Button 
                          variant={amountSort === 'asc' ? 'default' : 'outline'} 
                          size="sm"
                          onClick={() => setAmountSort(amountSort === 'asc' ? null : 'asc')}
                          className={amountSort === 'asc' ? '' : 'bg-transparent'}
                        >
                          <ChevronUp className="h-3 w-3 mr-1" /> Low to High
                        </Button>
                        <Button 
                          variant={amountSort === 'desc' ? 'default' : 'outline'} 
                          size="sm"
                          onClick={() => setAmountSort(amountSort === 'desc' ? null : 'desc')}
                          className={amountSort === 'desc' ? '' : 'bg-transparent'}
                        >
                          <ChevronDown className="h-3 w-3 mr-1" /> High to Low
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground">Min</label>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            value={amountMin}
                            onChange={(e) => setAmountMin(e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Max</label>
                          <Input 
                            type="number" 
                            placeholder="Any" 
                            value={amountMax}
                            onChange={(e) => setAmountMax(e.target.value)}
                            className="h-8"
                          />
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={clearAmountFilter} className="w-full">
                        Clear Filter
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </TableHead>
              <TableHead className="font-medium">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-1 hover:text-foreground">
                      Status
                      <Filter className={cn("h-3 w-3", statusFilters.length > 0 ? "text-primary" : "text-muted-foreground")} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-3 bg-white dark:bg-background border shadow-lg z-50" align="start">
                    <div className="space-y-2">
                      <div className="font-medium text-sm">Filter by Status</div>
                      {allStatuses.map(status => (
                        <label key={status} className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={statusFilters.includes(status)}
                            onChange={() => toggleStatusFilter(status)}
                            className="rounded"
                          />
                          <Badge
                            variant="outline"
                            className={cn('text-xs capitalize', getStatusBadgeVariant(status))}
                          >
                            {status}
                          </Badge>
                        </label>
                      ))}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setStatusFilters([])} 
                        className="w-full mt-2"
                      >
                        Clear Filter
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </TableHead>
              <TableHead className="font-medium">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-1 hover:text-foreground">
                      Mode
                      <Filter className={cn("h-3 w-3", modeFilters.length > 0 ? "text-primary" : "text-muted-foreground")} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-3 bg-white dark:bg-background border shadow-lg z-50" align="start">
                    <div className="space-y-2">
                      <div className="font-medium text-sm">Filter by Mode</div>
                      {uniqueModes.map(mode => (
                        <label key={mode} className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={modeFilters.includes(mode)}
                            onChange={() => toggleModeFilter(mode)}
                            className="rounded"
                          />
                          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                            {mode}
                          </Badge>
                        </label>
                      ))}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setModeFilters([])} 
                        className="w-full mt-2"
                      >
                        Clear Filter
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </TableHead>
              <TableHead className="font-medium">Customer</TableHead>
              <TableHead className="font-medium">
                <div className="flex items-center gap-1">
                  Date
                  <span className="text-xs text-muted-foreground">Created time</span>
                </div>
              </TableHead>
              <TableHead className="font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>
                  <div className="font-medium">{formatCurrency(invoice.amount)}</div>
                  {invoice.pendingAmount && (
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(invoice.pendingAmount)} Pending
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Badge
                      variant="outline"
                      className={cn('text-xs', getStatusBadgeVariant(invoice.status))}
                    >
                      {invoice.status}
                    </Badge>
                    {(invoice.status === 'pending' || invoice.status === 'partially paid') && (
                      <span className="text-orange-500 text-lg">!</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {invoice.mode && (
                    <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                      {invoice.mode}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium">{invoice.customer.name}</div>
                  <div className="text-xs text-muted-foreground">{invoice.customer.phone}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{formatDate(invoice.date)}</div>
                  <div className="text-xs text-muted-foreground">{getRelativeTime()}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-foreground"
                      onClick={() => handleRecordPayment(invoice)}
                      title="Record Payment"
                    >
                      <IndianRupee className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1 bg-transparent"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="h-8 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Send className="h-4 w-4" />
                      Send
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Record Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              View invoice details and record payment
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Bill No:</span>
                  <p className="font-medium">{selectedInvoice.billNo}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Amount:</span>
                  <p className="font-medium">{formatCurrency(selectedInvoice.amount)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Customer:</span>
                  <p className="font-medium">{selectedInvoice.customer.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    variant="outline"
                    className={cn('text-xs ml-1', getStatusBadgeVariant(selectedInvoice.status))}
                  >
                    {selectedInvoice.status}
                  </Badge>
                </div>
                {selectedInvoice.pendingAmount && (
                  <div>
                    <span className="text-muted-foreground">Pending Amount:</span>
                    <p className="font-medium text-orange-600">
                      {formatCurrency(selectedInvoice.pendingAmount)}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setIsPaymentDialogOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
