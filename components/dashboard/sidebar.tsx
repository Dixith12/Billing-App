"use client";

import { cn } from "@/lib/utils";
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
  BarChart,
  TrendingUp,
  LineChart,
  PieChart,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: "Invoices", href: "/dashboard", icon: FileText },
  { label: "Inventory", href: "/dashboard/inventory", icon: Package },
  { label: "Customers", href: "/dashboard/customer", icon: Users },
  { label: "GST", href: "/dashboard/gst", icon: Calculator },
  { label: "Expenses", href: "/dashboard/expenses", icon: ReceiptText },
  { label: "Quotation", href: "/dashboard/quotation", icon: FilePlus2 },
  { label: "Vendors", href: "/dashboard/vendor", icon: User2 },
  { label: "Purchase", href: "/dashboard/purchase", icon: Printer },
  { label: "Insight", href :"/dashboard/insight", icon:BarChart}
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [activePath, setActivePath] = useState(pathname);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActivePath(pathname);
    }, 80);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {/* Mobile backdrop with blur */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-65 border-r border-slate-200",
          "transition-all duration-500 ease-out lg:transform-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full bg-white relative">
          {/* Logo / Header */}
          <div className="relative h-16 px-6 flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center gap-3 group">
              <span className="font-bold text-xl">BigBotCo</span>
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
              const Icon = item.icon;
              const isActive =
                activePath === item.href ||
                (item.href !== "/dashboard" &&
                  activePath.startsWith(item.href + "/"));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={cn(
                    "group relative flex items-center gap-2.5 px-4 py-2 rounded-md text-[15px] font-medium transition-all duration-300",
                    isActive
                      ? "bg-gray-100 hover:bg-gray-200 font-semibold scale-[1.02]"
                      : "hover:text-primary",
                  )}
                >
                  {/* Icon container */}
                  <div className="relative">
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-all duration-300",
                        isActive
                          ? "text-black"
                          : "text-slate-500 group-hover:text-primary group-hover:scale-110 group-hover:-rotate-6",
                      )}
                    />
                  </div>

                  <span className="flex-1 text-sm truncate">{item.label}</span>

                  {/* Subtle hover arrow */}
                  {hoveredItem === item.href && !isActive && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-1.5 h-1.5 border-r-2 border-t-2 border-primary rotate-45 transform translate-x-0.5" />
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
