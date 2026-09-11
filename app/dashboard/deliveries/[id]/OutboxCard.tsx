"use client"

import { useEffect, useState } from "react"
import { MessageSquare, Mail, Smartphone, Loader2, RefreshCw, Bot } from "lucide-react"

interface NotificationRow {
  id: string
  type: string
  channel: string | null
  recipient: string | null
  content: string | null
  status: string | null
  sent_at: string
}

const CHANNEL_META: Record<string, { label: string; icon: any; classes: string }> = {
  sms: { label: "SMS", icon: Smartphone, classes: "bg-blue-50 text-blue-700 border-blue-100" },
  whatsapp: { label: "WhatsApp", icon: MessageSquare, classes: "bg-green-50 text-green-700 border-green-100" },
  email: { label: "Email", icon: Mail, classes: "bg-violet-50 text-violet-700 border-violet-100" },
}

/**
 * Notification outbox for one delivery — every message ProofDrop sent
 * (or simulated in demo mode) for this delivery, newest first.
 */
export function OutboxCard({ deliveryId }: { deliveryId: string }) {
  const [rows, setRows] = useState<NotificationRow[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/notifications?delivery_id=${deliveryId}`)
      const data = await res.json()
      setRows(Array.isArray(data) ? data : [])
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryId])

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wide">
          <Bot className="h-4 w-4" />
          Notification Outbox
        </h2>
        <button
          onClick={load}
          className="text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Refresh"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </button>
      </div>

      {loading && !rows ? (
        <div className="flex items-center justify-center gap-2 py-8 text-slate-400 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading messages…
        </div>
      ) : !rows?.length ? (
        <p className="py-6 text-center text-sm text-slate-400">No messages recorded yet.</p>
      ) : (
        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {rows.map((n) => {
            const meta = CHANNEL_META[n.channel || "sms"] || CHANNEL_META.sms
            const Icon = meta.icon
            const isOpen = expanded === n.id
            return (
              <button
                key={n.id}
                onClick={() => setExpanded(isOpen ? null : n.id)}
                className="w-full text-left rounded-lg border border-slate-100 bg-slate-50/60 p-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.classes}`}>
                    <Icon className="h-3 w-3" />
                    {meta.label}
                  </span>
                  <span className="text-[11px] font-medium text-slate-600">
                    {n.type === "driver" ? "→ Driver" : "→ Customer"}
                  </span>
                  <span className="text-[11px] text-slate-400">{n.recipient}</span>
                  <span className="ml-auto text-[10px] text-slate-400">
                    {new Date(n.sent_at).toLocaleString()}
                  </span>
                </div>
                {!isOpen && n.content && (
                  <p className="mt-1.5 text-xs text-slate-500 line-clamp-1">{n.content.split("\n")[0]}</p>
                )}
                {isOpen && n.content && (
                  <pre className="mt-2 whitespace-pre-wrap rounded-md bg-white border border-slate-100 p-2.5 text-[11px] leading-relaxed text-slate-600 font-sans">
                    {n.content}
                  </pre>
                )}
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-medium ${
                      n.status === "sent" ? "text-green-600" : n.status === "failed" ? "text-red-500" : "text-amber-600"
                    }`}
                  >
                    {n.status === "sent"
                      ? "✓ delivered"
                      : n.status === "failed"
                        ? "✕ failed"
                        : "◇ simulated (demo mode — no provider keys configured)"}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
      <p className="mt-3 text-[11px] text-slate-400 leading-relaxed">
        Click a message to see the exact content the recipient received. Configure Twilio / Resend keys
        to send these for real.
      </p>
    </div>
  )
}
