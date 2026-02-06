"use client"

import { Download, Printer } from "lucide-react"

export function ProofActions() {
  return (
    <div className="flex gap-2">
      <a
        href="#"
        className="inline-flex items-center gap-2 rounded-lg bg-[#1e40af] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d4ed8]"
      >
        <Download className="h-4 w-4" />
        Download PDF
      </a>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <Printer className="h-4 w-4" />
        Print
      </button>
    </div>
  )
}
