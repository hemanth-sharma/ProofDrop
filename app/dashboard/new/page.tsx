"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { MessageCircle, Send, User, Mail, CheckCircle, Shield, Users, Plus, X } from "lucide-react"
import { Logo } from "@/components/landing/Logo"

// Toast notification component
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-white shadow-2xl animate-in slide-in-from-bottom-4 duration-300 max-w-sm">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500">
        <CheckCircle className="h-4 w-4" />
      </div>
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-auto text-slate-400 hover:text-white shrink-0">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export default function NewDeliveryPage() {
  const router = useRouter()
  const [drivers, setDrivers] = useState<any[]>([])
  const [selectedDriverId, setSelectedDriverId] = useState<string>("")
  const [customerName, setCustomerName] = useState("")
  const [countryCode, setCountryCode] = useState("+1")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [deliveryNotes, setDeliveryNotes] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/drivers")
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setDrivers(data) })
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fullPhone = `${countryCode}${customerPhone.replace(/\D/g, "")}`
    const selectedDriver = drivers.find((d) => d.id === selectedDriverId)
    const res = await fetch("/api/deliveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: customerName,
        customer_phone: fullPhone,
        customer_email: customerEmail || undefined,
        delivery_notes: deliveryNotes || undefined,
        delivery_address: deliveryAddress || undefined,
        driver_id: selectedDriver?.id,
        driver_phone: selectedDriver?.phone,
      }),
    })
    const data = await res.json().catch(() => ({}))
    setLoading(false)
    if (!res.ok) {
      setError(data.error || "Failed to create delivery")
      return
    }

    // Show toast then redirect
    const driverName = selectedDriver?.full_name || selectedDriver?.phone || "driver"
    setToast(`✓ Delivery link sent to ${driverName} via SMS`)
    
    setTimeout(() => {
      router.push("/dashboard")
      router.refresh()
    }, 1500)
  }

  return (
    <div className="flex min-h-full flex-col">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="flex-1 p-4 lg:p-8">
        <Link
          href="/dashboard"
          className="inline-flex text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to deliveries
        </Link>

        <div className="mx-auto mt-6 lg:mt-8 max-w-xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-slate-900">
                  Create New Delivery
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Enter customer details to send a tracking link to your driver.
                </p>
              </div>
              <span className="rounded bg-[#1e40af] px-2.5 py-1 text-xs font-medium text-white shrink-0">
                STEP 1 OF 2
              </span>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 lg:mt-8 space-y-5">
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

              {/* Driver selection */}
              <div className="space-y-2">
                <Label htmlFor="driver">
                  Driver <span className="text-slate-400 font-normal">(Optional)</span>
                </Label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      id="driver"
                      value={selectedDriverId}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-8 text-sm focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
                    >
                      <option value="">Select driver (optional)</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.full_name} — {driver.phone}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Link
                    href="/dashboard/drivers/new"
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 shrink-0"
                  >
                    <Plus className="h-3 w-3" />
                    Add Driver
                  </Link>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_phone">
                  Phone Number <span className="text-[#1e40af]">Required</span>
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
                    <option value="+49">+49</option>
                    <option value="+33">+33</option>
                    <option value="+92">+92</option>
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
                  Email Address <span className="text-slate-400 font-normal">(Optional)</span>
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
                <Label htmlFor="delivery_address">
                  Delivery Address <span className="text-slate-400 font-normal">(Optional)</span>
                </Label>
                <input
                  id="delivery_address"
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="123 Main St, City, State"
                  className="w-full rounded-lg border border-slate-200 py-2.5 px-4 text-sm focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery_notes">Delivery Notes</Label>
                <textarea
                  id="delivery_notes"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Gate code: 1234. Please leave on the front porch behind the planter."
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 py-2.5 px-4 text-sm focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af] resize-none"
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5">
                <MessageCircle className="h-4 w-4 shrink-0 text-slate-400" />
                Driver will receive a capture link via SMS
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-[#1e40af] py-3 hover:bg-[#1d4ed8] text-base"
                disabled={loading}
              >
                <Send className="mr-2 h-4 w-4" />
                {loading ? "Sending…" : "Send Link to Driver"}
              </Button>
            </form>
          </div>

          {/* Feature highlight cards */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Instant confirmation</p>
                <p className="mt-0.5 text-sm text-slate-600">
                  Drivers don't need to download anything. They just tap the link and snap proof.
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
                  Every delivery includes GPS location, photo, and customer signature.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}