'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Pencil } from 'lucide-react'
import { GstEditModal } from '@/components/gst/gst-modal'
import { useGst } from '@/app/dashboard/gst/hooks/useGst'

export default function GstPage() {
  const { cgst, sgst, updateGst } = useGst()
  const [isEditOpen, setIsEditOpen] = useState(false)

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center h-16 px-4 bg-background border-b">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </header>

      {/* Content */}
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">GST Settings</h1>
        </div>

        {/* GST Card */}
        <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">GST Rates</h2>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsEditOpen(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* CGST */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">CGST</div>
                <div className="text-4xl font-bold">{cgst}%</div>
              </div>

              {/* SGST */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">SGST</div>
                <div className="text-4xl font-bold">{sgst}%</div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                Total GST (CGST + SGST): <span className="font-medium text-foreground">{cgst + sgst}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info note */}
        <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
          These rates will be applied to all new invoices automatically. You can update them anytime.
        </div>
      </div>

      {/* Edit Modal */}
      <GstEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialCgst={cgst}
        initialSgst={sgst}
        onSave={updateGst}
      />
    </div>
  )
}