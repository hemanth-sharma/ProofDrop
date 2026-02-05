"use client"

import { Logo } from "./Logo"
import Link from "next/link"

const navLinks = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
]

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo className="text-slate-900" />
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-[#1e40af] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1d4ed8]"
          >
            Start Free
          </Link>
        </div>
      </div>
    </header>
  )
}
