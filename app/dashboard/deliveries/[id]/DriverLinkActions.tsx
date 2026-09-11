"use client"

import { useState } from "react"
import { Copy, ExternalLink, Check, Smartphone } from "lucide-react"

/**
 * Driver link display with copy + open actions.
 * "Open" is handy for demos — it simulates the driver tapping the SMS link.
 */
export function DriverLinkActions({ token }: { token: string }) {
  const [copied, setCopied] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)

  const link =
    typeof window !== "undefined" ? `${window.location.origin}/driver/${token}` : `/driver/${token}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — select fallback
      const el = document.createElement("textarea")
      el.value = link
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
    }
    setCopied(true)
    setAcknowledged(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-blue-200 bg-white p-3">
        <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wide mb-1">Driver capture link</p>
        <p className="text-xs text-slate-700 break-all font-mono leading-relaxed">{link}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={copy}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied!" : "Copy link"}
        </button>
        <a
          href={`/driver/${token}`}
          target="_blank"
          rel="noreferrer"
          onClick={() => setAcknowledged(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1e40af] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8] transition-colors"
        >
          <Smartphone className="h-3.5 w-3.5" />
          Open driver view
        </a>
      </div>
      <p className="text-[11px] text-blue-500 leading-relaxed">
        {acknowledged
          ? "Sent to the driver via SMS / WhatsApp — or paste it in a chat yourself. Opens the phone capture flow with AI verification."
          : "Sent to the driver via SMS / WhatsApp when the delivery was created. Tap \u201cOpen driver view\u201d to see exactly what the driver sees."}
      </p>
      <ExternalLink className="hidden" />
    </div>
  )
}
