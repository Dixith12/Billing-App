'use client'

import { cn } from '@/lib/utils'
import { Package, FileText, X, PersonStanding, Calculator, BellElectricIcon, DropletIcon, NotebookPenIcon, FilePlus2, ReceiptText, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  {
    label: 'Invoices',
    href: '/dashboard',
    icon: FileText,
  },
  {
    label: 'Inventory',
    href: '/dashboard/inventory',
    icon: Package,
  },
  {
    label:'Customers',
    href:'/dashboard/customer',
    icon: Users,
  },
  {
    label:'GST',
    href:'/dashboard/gst',
    icon:Calculator
  },
  {
    label:'Expenses',
    href:'/dashboard/expenses',
    icon: ReceiptText
  },
  {
    label:'Quotation',
    href:'/dashboard/quotation',
    icon:FilePlus2
  }
  
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out lg:transform-none',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
                <span className="text-foreground font-bold text-sm">S</span>
              </div>
              <span className="font-semibold text-lg">BigBotCo</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 hover:bg-muted rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}
