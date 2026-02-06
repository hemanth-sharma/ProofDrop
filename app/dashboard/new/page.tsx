"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { MessageCircle, Send, User, Phone, Mail, CheckCircle, Shield } from "lucide-react"
import { Logo } from "@/components/landing/Logo"

export default function NewDeliveryPage() {
  const router = useRouter()
  const [customerName, setCustomerName] = useState("")
  const [countryCode, setCountryCode] = useState("+1")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [deliveryNotes, setDeliveryNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fullPhone = `${countryCode}${customerPhone.replace(/\D/g, "")}`
    const res = await fetch("/api/deliveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: customerName,
        customer_phone: fullPhone,
        customer_email: customerEmail || undefined,
        delivery_notes: deliveryNotes || undefined,
      }),
    })
    const data = await res.json().catch(() => ({}))
    setLoading(false)
    if (!res.ok) {
      setError(data.error || "Failed to create delivery")
      return
    }
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex-1 p-6 lg:p-8">
        <Link
          href="/dashboard"
          className="inline-flex text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to deliveries
        </Link>

        <div className="mx-auto mt-8 max-w-xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Create New Delivery
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Enter customer details to send a tracking link to your driver.
                </p>
              </div>
              <span className="rounded bg-[#1e40af] px-2.5 py-1 text-xs font-medium text-white">
                STEP 1 OF 2
              </span>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="customer_name">Customer Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="customer_name"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Sarah Mitchell"
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_phone">
                  Phone Number{" "}
                  <span className="text-[#1e40af]">Required</span>
                </Label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
                  >
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+91">+91</option>
                    <option value="+61">+61</option>
                  </select>
                  <input
                    id="customer_phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="flex-1 rounded-lg border border-slate-200 py-2.5 px-4 text-sm focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_email">
                  Email Address{" "}
                  <span className="text-slate-400">(Optional)</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="customer_email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery_notes">Delivery Notes</Label>
                <textarea
                  id="delivery_notes"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Gate code: 1234. Please leave on the front porch behind the planter."
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 py-2.5 px-4 text-sm focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MessageCircle className="h-4 w-4 shrink-0 text-slate-400" />
                Driver will receive a capture link via SMS
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-[#1e40af] py-3 hover:bg-[#1d4ed8]"
                disabled={loading}
              >
                <Send className="mr-2 h-4 w-4" />
                {loading ? "Sending…" : "Send Link to Driver"}
              </Button>
            </form>
          </div>

          {/* Feature highlight cards */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Instant confirmation</p>
                <p className="mt-0.5 text-sm text-slate-600">
                  Drivers don&apos;t need to download anything. They just tap the
                  link and snap proof.
                </p>
              </div>
            </div>
            <div className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Verified records</p>
                <p className="mt-0.5 text-sm text-slate-600">
                  Every delivery includes GPS location, photo, and customer
                  signature.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white px-6 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo className="text-slate-700" />
          <div className="flex gap-6 text-sm text-slate-600">
            <Link href="#" className="hover:text-slate-900">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-slate-900">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-slate-900">
              Contact Support
            </Link>
          </div>
          <p className="text-sm text-slate-500">
            © 2024 ProofDrop Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
