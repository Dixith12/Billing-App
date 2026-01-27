'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus } from 'lucide-react'
import { QuotationTable } from '@/components/quotation/quotation-table'
import { useQuotation } from '@/app/dashboard/quotation/hooks/useQuotation'
import { Quotation } from '@/lib/firebase/quotations'

export default function QuotationPage() {
  const { quotations, deleteQuotation, convertToInvoice } = useQuotation()
  const router = useRouter()

  const handleCreateQuotation = () => {
    router.push('/dashboard/invoice?type=quotation')  // ← Opens full invoice page in quotation mode
  }

  const handleEditQuotation = (quotation: Quotation) => {
    router.push(`/dashboard/invoice?type=quotation&edit=${quotation.id}`)  // ← Edit mode
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-30 flex items-center h-16 px-4 bg-background border-b">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </header>

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Quotations</h1>
          <Button
            onClick={handleCreateQuotation}
            className="gap-3 bg-black text-white"
          >
            <Plus className="h-4 w-4" />
            Create Quotation
          </Button>
        </div>

        <QuotationTable
          quotations={quotations}
          onEdit={handleEditQuotation}           // ← NEW: pass edit handler
          onDelete={deleteQuotation}
          onConvertToInvoice={convertToInvoice}
        />
      </div>
    </div>
  )
}