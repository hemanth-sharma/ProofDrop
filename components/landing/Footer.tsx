import Link from "next/link"
import { Logo } from "./Logo"

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo className="text-white" />
        <div className="flex items-center gap-6 text-sm text-slate-400">
          <Link href="#" className="hover:text-white transition-colors">
            Privacy
          </Link>
          <Link href="#" className="hover:text-white transition-colors">
            Terms
          </Link>
          <Link href="#" className="hover:text-white transition-colors">
            Contact
          </Link>
        </div>
        <p className="w-full text-center text-sm text-slate-500 sm:w-auto">
          ©2026 ProofDrop. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
