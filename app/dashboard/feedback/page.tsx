"use client"

import { useState } from "react"
import { MessageSquare, Mail, Phone, Send, CheckCircle } from "lucide-react"

export default function FeedbackPage() {
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [feedback, setFeedback] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !feedback) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone: phone || null, feedback }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to submit")
      }
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="p-4 lg:p-8 bg-slate-50 min-h-full flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Thank you!</h2>
          <p className="mt-2 text-slate-500 text-sm">
            Your feedback has been submitted. We really appreciate you taking the time to help us improve ProofDrop.
          </p>
          <button
            onClick={() => { setSubmitted(false); setEmail(""); setPhone(""); setFeedback("") }}
            className="mt-6 text-sm text-[#1e40af] hover:underline font-medium"
          >
            Submit more feedback
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 bg-slate-50 min-h-full">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1e40af]/10">
          <MessageSquare className="h-5 w-5 text-[#1e40af]" />
        </div>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900">Share Feedback</h1>
          <p className="mt-1 text-sm text-slate-500">
            Help us improve ProofDrop — your thoughts shape the product.
          </p>
        </div>
      </div>

      <div className="mt-6 max-w-xl">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email <span className="text-[#1e40af]">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">We won't spam you — just for follow-ups if needed.</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Phone <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
                />
              </div>
            </div>

            {/* Feedback */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Your Feedback <span className="text-[#1e40af]">*</span>
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us what's working, what's broken, what you'd love to see next...&#10;&#10;• Feature request: ...&#10;• Bug: ...&#10;• General thoughts: ..."
                rows={6}
                required
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm placeholder:text-slate-400 focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af] resize-none"
              />
              <p className="mt-1 text-xs text-slate-400">{feedback.length} characters</p>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email || !feedback}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1e40af] py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info card */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">What happens next?</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-[#1e40af] font-bold shrink-0">1.</span>
              Your feedback is stored and reviewed by our team weekly.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#1e40af] font-bold shrink-0">2.</span>
              Top requests get added to our roadmap.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#1e40af] font-bold shrink-0">3.</span>
              If you've shared a bug, we'll reach out if we need more info.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}