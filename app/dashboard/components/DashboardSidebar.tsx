"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Logo } from "@/components/landing/Logo"
import { SignOutButton } from "./SignOutButton"
import { Truck, Users, BarChart3, Settings, User } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Deliveries", icon: Truck },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-56 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center px-4">
        <Logo className="text-slate-900" />
      </div>
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/dashboard" &&
              (pathname === "/dashboard" || pathname === "/dashboard/new"))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#1e40af] text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-slate-200 p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-700 text-white">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">
              Alex Rivers
            </p>
            <p className="truncate text-xs text-slate-500">Owner</p>
          </div>
          <SignOutButton iconOnly />
        </div>
      </div>
    </aside>
  )
}
