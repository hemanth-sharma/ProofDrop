"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown, CheckCircle } from "lucide-react"

/**
 * Customer reaction widget shown on the public proof page.
 * Lets the recipient confirm they received the delivery / leave a note.
 * Posts to /api/feedback so the business sees it in their dashboard.
 */
export function CustomerReaction({
  deliveryId,
  customerName,
  customerEmail,
}: {
  deliveryId: string
  customerName: string
  customerEmail?: string | null
}) {
  const [submitted, setSubmitted] = useState(false)
  const [rating, setRating] = useState<"positive" | "negative" | null>(null)
  const [comment, setComment] = useState("")
  const [sending, setSending] = useState(false)

  async function submit(r: "positive" | "negative") {
    setRating(r)
    setSending(true)
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // The feedback API expects an email; use the customer's when known
          email: customerEmail || `customer-${deliveryId.slice(0, 8)}@proofdrop.delivery`,
          feedback: `[Proof reaction — ${r === "positive" ? "👍 Received, all good" : "👎 Issue reported"}] ${comment.trim() || "(no comment)"} — delivery #${deliveryId.slice(0, 8).toUpperCase()}, ${customerName}`,
        }),
      })
    } catch {
      // Never bother the customer with errors here
    } finally {
      setSending(false)
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-800">Thanks for your feedback!</p>
          <p className="text-xs text-green-700 mt-0.5">
            {rating === "positive"
              ? "Glad your delivery arrived safely. ProofDrop has let the business know."
              : "Sorry to hear that. Your report was sent to the business so they can follow up."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-900">How was your delivery?</p>
      <p className="text-xs text-slate-500 mt-0.5">Let {customerName.split(" ")[0]}&apos;s sender know everything arrived okay.</p>
      {comment.length === 0 && rating === null && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => submit("positive")}
            disabled={sending}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors disabled:opacity-60"
          >
            <ThumbsUp className="h-4 w-4" />
            Received, all good
          </button>
          <button
            onClick={() => {
              setRating("negative")
            }}
            disabled={sending}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-60"
          >
            <ThumbsDown className="h-4 w-4" />
            Report an issue
          </button>
        </div>
      )}
      {rating === "negative" && (
        <div className="mt-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="What went wrong? (optional)"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#1e40af] focus:outline-none resize-none"
          />
          <button
            onClick={() => submit("negative")}
            disabled={sending}
            className="mt-2 w-full rounded-lg bg-red-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {sending ? "Sending…" : "Send report"}
          </button>
        </div>
      )}
    </div>
  )
}
