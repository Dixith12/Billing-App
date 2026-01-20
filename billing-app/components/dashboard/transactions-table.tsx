'use client'

import { useState, useEffect } from 'react'
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
import {
  // ... existing imports
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Eye, Send, MoreHorizontal, IndianRupee, Filter, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Invoice } from '@/lib/firebase/invoices'
import type { SortOrder } from '@/app/dashboard/hooks/useDashboard'
import { pdf } from '@react-pdf/renderer'
import InvoicePDF from '@/components/dashboard/invoice-pdf'
interface TransactionsTableProps {
  invoices: Invoice[]
  searchQuery: string
  setSearchQuery: (v: string) => void
  selectedInvoice: Invoice | null
  isPaymentDialogOpen: boolean
  setIsPaymentDialogOpen: (v: boolean) => void
  amountSort: SortOrder
  setAmountSort: (v: SortOrder) => void
  amountMin: string
  setAmountMin: (v: string) => void
  amountMax: string
  setAmountMax: (v: string) => void
  statusFilters: Invoice['status'][]
  setStatusFilters: (filters: Invoice['status'][]) => void
  modeFilters: Invoice['mode'][]
  setModeFilters: (filters: Invoice['mode'][]) => void
  filteredInvoices: Invoice[]
  uniqueModes: Invoice['mode'][]
  allStatuses: Invoice['status'][]
  formatCurrency: (amount: number) => string
  formatDate: (date: Date | undefined) => string
  getRelativeTime: (timestamp: Date | undefined) => string
  getStatusBadgeVariant: (status: Invoice['status']) => string
  handleRecordPayment: (invoice: Invoice) => void
  toggleStatusFilter: (status: Invoice['status']) => void
  toggleModeFilter: (mode: Invoice['mode']) => void
  clearAmountFilter: () => void
  datePreset: string | null
  setDatePreset: (preset: string | null) => void
  dateFrom: string
  setDateFrom: (v: string) => void
  dateTo: string
  setDateTo: (v: string) => void
  clearDateFilter: () => void
}

export function TransactionsTable(props: TransactionsTableProps) {
  const {
    searchQuery,
    setSearchQuery,
    selectedInvoice,
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,
    amountSort,
    setAmountSort,
    amountMin,
    setAmountMin,
    amountMax,
    setAmountMax,
    statusFilters,
    setStatusFilters,
    modeFilters,
    setModeFilters,
    filteredInvoices,
    uniqueModes,
    allStatuses,
    formatCurrency,
    formatDate,
    getRelativeTime,
    getStatusBadgeVariant,
    handleRecordPayment,
    toggleStatusFilter,
    toggleModeFilter,
    clearAmountFilter,
    datePreset,
    setDatePreset,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    clearDateFilter,
  } = props

  // PDF modal states
  const [pdfModalOpen, setPdfModalOpen] = useState(false)
  const [selectedPdfInvoice, setSelectedPdfInvoice] = useState<Invoice | null>(null)
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [pendingDownloadInvoice, setPendingDownloadInvoice] = useState<Invoice | null>(null);

  // Cleanup blob URL when modal closes or component unmounts
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl)
        setPdfBlobUrl(null)
      }
    }
  }, [pdfBlobUrl])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-6 border-b">
        <div className="pb-3 text-sm font-medium border-b-2 border-primary text-foreground">
          Transactions
          <span className="ml-2 bg-muted px-2 py-0.5 rounded text-xs">
            {filteredInvoices.length}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center">
        <Input
          placeholder="Search by transaction, customers, invoice etc.."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-medium">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-1 hover:text-foreground">
                      Amount
                      <Filter
                        className={cn(
                          'h-3 w-3',
                          amountMin || amountMax || amountSort ? 'text-primary' : 'text-muted-foreground'
                        )}
                      />
                      {amountSort === 'asc' && <ChevronUp className="h-3 w-3" />}
                      {amountSort === 'desc' && <ChevronDown className="h-3 w-3" />}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-3 bg-white" align="start">
                    <div className="space-y-3">
                      <div className="font-medium text-sm">Filter by Amount</div>
                      <div className="flex gap-2">
                        <Button
                          variant={amountSort === 'asc' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setAmountSort(amountSort === 'asc' ? null : 'asc')}
                        >
                          <ChevronUp className="h-3 w-3 mr-1" /> Low to High
                        </Button>
                        <Button
                          variant={amountSort === 'desc' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setAmountSort(amountSort === 'desc' ? null : 'desc')}
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAmountFilter}
                        className="w-full"
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
                      Status
                      <Filter
                        className={cn(
                          'h-3 w-3',
                          statusFilters.length > 0 ? 'text-primary' : 'text-muted-foreground'
                        )}
                      />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-3 bg-white" align="start">
                    <div className="space-y-2">
                      <div className="font-medium text-sm">Filter by Status</div>
                      {allStatuses.map((status) => (
                        <label
                          key={`status-${status}`}
                          className="flex items-center gap-2 cursor-pointer"
                        >
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
                      <Filter
                        className={cn(
                          'h-3 w-3',
                          modeFilters.length > 0 ? 'text-primary' : 'text-muted-foreground'
                        )}
                      />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-3 bg-white" align="start">
                    <div className="space-y-2">
                      <div className="font-medium text-sm">Filter by Mode</div>
                      {uniqueModes.map((mode) => (
                        <label
                          key={`mode-${mode ?? 'unknown'}`}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={modeFilters.includes(mode)}
                            onChange={() => toggleModeFilter(mode)}
                            className="rounded"
                          />
                          <Badge
                            variant="outline"
                            className="bg-gray-100 text-gray-700 border-gray-200"
                          >
                            {mode ?? '—'}
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
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-1 hover:text-foreground">
                      Date
                      <Filter
                        className={cn(
                          'h-3 w-3',
                          datePreset || dateFrom || dateTo ? 'text-primary' : 'text-muted-foreground'
                        )}
                      />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4 bg-white" align="start">
                    <div className="space-y-4">
                      <div className="font-medium text-sm">Filter by Date</div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'All', value: null },
                          { label: 'Today', value: 'today' },
                          { label: 'Yesterday', value: 'yesterday' },
                          { label: 'This Month', value: 'thisMonth' },
                          { label: 'Last 30 days', value: 'last30days' },
                        ].map((item) => (
                          <Button
                            key={item.value ?? 'all'}
                            variant={datePreset === item.value ? 'default' : 'outline'}
                            size="sm"
                            className="transition-none"
                            onClick={() => {
                              setDatePreset(item.value)
                              if (item.value) {
                                setDateFrom('')
                                setDateTo('')
                              }
                            }}
                          >
                            {item.label}
                          </Button>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">Custom range</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1">From</label>
                            <Input
                              type="date"
                              value={dateFrom}
                              onChange={(e) => {
                                setDateFrom(e.target.value)
                                setDatePreset(null)
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1">To</label>
                            <Input
                              type="date"
                              value={dateTo}
                              onChange={(e) => {
                                setDateTo(e.target.value)
                                setDatePreset(null)
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={clearDateFilter}
                      >
                        Clear Date Filter
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </TableHead>

              <TableHead className="font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>
                  <div className="font-medium">{formatCurrency(invoice.netAmount)}</div>
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
                  <div className="text-sm font-medium">{invoice.customerName}</div>
                  <div className="text-xs text-muted-foreground">{invoice.customerPhone}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{formatDate(invoice.createdAt?.toDate())}</div>
                  <div className="text-xs text-muted-foreground">
                    {getRelativeTime(invoice.createdAt?.toDate())}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 flex-wrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-foreground"
                      onClick={() => handleRecordPayment(invoice)}
                      title="Record Payment"
                    >
                      <IndianRupee className="h-4 w-4" />
                    </Button>

                    {/* VIEW BUTTON → opens PDF popup */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (isGeneratingPdf) return; 
                        console.log("InvoicePDF:", InvoicePDF);           // ← should log a function
                        console.log("InvoicePDF type:", typeof InvoicePDF);

                        setIsGeneratingPdf(true);
                        setSelectedPdfInvoice(invoice);
                        setPdfModalOpen(true);

                        try {
                          const element = <InvoicePDF invoice={invoice} />;
                          console.log("JSX element:", element);           // ← should be object with type = function

                          const blob = await pdf(element).toBlob();
                          const url = URL.createObjectURL(blob);
                          setPdfBlobUrl(url);
                        } catch (err) {
                          console.error("PDF error:", err);
                          alert("Failed to generate PDF");
                        } finally {
                          setIsGeneratingPdf(false);
                        }
                      }}
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 bg-white">
                        <DropdownMenuItem
                          onClick={async () => {
                            if (isGeneratingPdf) return;

                            setIsGeneratingPdf(true);
                            try {
                              const element = <InvoicePDF invoice={invoice} />;
                              const blob = await pdf(element).toBlob();

                              // Trigger download
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `Invoice-${invoice.id || 'draft'}-${invoice.customerName || 'client'}.pdf`;
                              document.body.appendChild(link);
                              link.click();

                              // Cleanup
                              document.body.removeChild(link);
                              URL.revokeObjectURL(url);
                            } catch (err) {
                              console.error("PDF download failed:", err);
                              alert("Failed to generate PDF for download");
                            } finally {
                              setIsGeneratingPdf(false);
                            }
                          }}
                        >
                          Download PDF
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => {
                            // Placeholder — implement thermal print logic later
                            alert("Thermal print not implemented yet");
                            // Future: use react-thermal-printer or qz-tray or browser print @media print
                          }}
                        >
                          Thermal Print
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => {
                            alert("Edit functionality coming soon");
                            // Future: open edit modal / form with invoice data
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Payment Dialog - unchanged */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>View invoice details and record payment</DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Amount:</span>
                  <p className="font-medium">{formatCurrency(selectedInvoice.netAmount)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Customer:</span>
                  <p className="font-medium">{selectedInvoice.customerName}</p>
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
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setIsPaymentDialogOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* PDF Preview Popup */}
      <Dialog
        open={pdfModalOpen}
        onOpenChange={(open) => {
          setPdfModalOpen(open)
          if (!open) {
            // Cleanup when closing
            if (pdfBlobUrl) {
              URL.revokeObjectURL(pdfBlobUrl)
              setPdfBlobUrl(null)
            }
            setSelectedPdfInvoice(null)
          }
        }}
      >
        <DialogContent className="max-w-6xl h-[90vh] p-0 flex flex-col">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="flex items-center justify-between">
              <span>
                Invoice 
                {/* {selectedPdfInvoice?.id || '—'}{' '} */}
                {selectedPdfInvoice?.customerName ? ` - ${selectedPdfInvoice.customerName}` : ''}
              </span>

      
            </DialogTitle>
            <DialogDescription>
              {selectedPdfInvoice
                ? `Created: ${formatDate(selectedPdfInvoice.createdAt?.toDate())} • ${getRelativeTime(
                    selectedPdfInvoice.createdAt?.toDate()
                  )}`
                : 'Loading invoice...'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 bg-gray-50 overflow-hidden">
            {isGeneratingPdf ? (
              <div className="h-full flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Generating invoice PDF...</p>
              </div>
            ) : pdfBlobUrl ? (
              <iframe
                src={`${pdfBlobUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-full border-0"
                title={`Invoice ${selectedPdfInvoice?.id || 'preview'}`}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Failed to load PDF preview
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t flex justify-end gap-3">
            <Button variant="outline" onClick={() => setPdfModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}