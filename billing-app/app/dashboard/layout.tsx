// app/dashboard/layout.tsx    ← or app/(dashboard)/layout.tsx
'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
const [sidebarOpen, setSidebarOpen] = useState(true)
  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar – always present */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile-only hamburger menu button */}
        <header className="sticky top-0 z-30 flex items-center h-16 px-4 bg-background border-b lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-muted rounded focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Optional: small app name or page title on mobile */}
          <span className="ml-4 font-medium lg:hidden">BigBotCo</span>
        </header>

        {/* The actual page content goes here */}
        {children}
      </main>
    </div>
  )
}