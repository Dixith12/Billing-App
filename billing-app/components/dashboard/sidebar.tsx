'use client'

import { cn } from '@/lib/utils'
import {
  FileText,
  Package,
  Users,
  Calculator,
  ReceiptText,
  FilePlus2,
  X,
  User2,
  Printer,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { label: 'Invoices',    href: '/dashboard',         icon: FileText    },
  { label: 'Inventory',   href: '/dashboard/inventory', icon: Package    },
  { label: 'Customers',   href: '/dashboard/customer',  icon: Users      },
  { label: 'GST',         href: '/dashboard/gst',       icon: Calculator },
  { label: 'Expenses',    href: '/dashboard/expenses',  icon: ReceiptText},
  { label: 'Quotation',   href: '/dashboard/quotation', icon: FilePlus2  },
  { label: 'Vendors',     href: '/dashboard/vendor',  icon:User2},
  { label: 'Purchase',     href: '/dashboard/purchase',  icon:Printer}
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [activePath, setActivePath] = useState(pathname)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setActivePath(pathname)
    }, 80)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <>
      {/* Mobile backdrop with blur */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-white to-slate-50 border-r border-slate-200 shadow-xl',
          'transition-all duration-500 ease-out lg:transform-none',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full relative">
          {/* Logo / Header */}
          <div className="relative h-16 px-6 flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-indigo-50/80 to-purple-50/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-2xl">B</span>
                </div>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent group-hover:tracking-wide transition-all">
                BigBotCo
              </span>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 active:scale-95 transition-all"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                activePath === item.href ||
                (item.href !== '/dashboard' && activePath.startsWith(item.href + '/'))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={cn(
                    'group relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-300',
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/15 to-purple-600/10 text-indigo-700 font-semibold shadow-sm scale-[1.02]'
                      : 'text-slate-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 hover:text-slate-900 hover:shadow-md hover:scale-[1.015]'
                  )}
                >
                  {/* Active bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-r-full shadow-md" />
                  )}

                  {/* Icon container */}
                  <div className="relative">
                    <Icon
                      className={cn(
                        'h-5 w-5 transition-all duration-300',
                        isActive
                          ? 'text-indigo-600 scale-110'
                          : 'text-slate-500 group-hover:text-indigo-600 group-hover:scale-110 group-hover:-rotate-6'
                      )}
                    />
                  </div>

                  <span className="flex-1 truncate">{item.label}</span>

                  {/* Subtle hover arrow */}
                  {hoveredItem === item.href && !isActive && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-1.5 h-1.5 border-r-2 border-t-2 border-slate-400 rotate-45 transform translate-x-0.5" />
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>          
        </div>
      </aside>
    </>
  )
}