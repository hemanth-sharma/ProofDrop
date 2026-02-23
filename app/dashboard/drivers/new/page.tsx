"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, Mail, Phone, Truck, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function NewDriverPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [vehicleType, setVehicleType] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await fetch("/api/drivers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName,
        email: email || undefined,
        phone,
        vehicle_type: vehicleType || undefined,
      }),
    })
    const data = await res.json().catch(() => ({}))
    setLoading(false)
    if (!res.ok) {
      setError(data.error || "Failed to register driver")
      return
    }
    router.push("/dashboard/drivers")
    router.refresh()
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="text-sm text-slate-500">
          <Link
            href="/dashboard/drivers"
            className="text-slate-600 hover:text-slate-900"
          >
            ← Back to Drivers
          </Link>{" "}
          <span className="text-slate-400">/</span>{" "}
          <span>Register New Driver</span>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Register New Driver
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Enter the professional details below to add a new driver to your
            logistics fleet.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">
                  Full Name <span className="text-[#1e40af]">(Required)</span>
                </Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="full_name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address{" "}
                  <span className="text-slate-400">(Optional)</span>
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="driver@proofdrop.com"
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number{" "}
                  <span className="text-[#1e40af]">
                    (Required for SMS links)
                  </span>
                </Label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle_type">Vehicle Type</Label>
                <div className="relative">
                  <Truck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    id="vehicle_type"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
                  >
                    <option value="">Select vehicle type</option>
                    <option value="van">Delivery van</option>
                    <option value="truck">Box truck</option>
                    <option value="bike">Bike / scooter</option>
                    <option value="car">Car</option>
                  </select>
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <Button
                type="submit"
                className="bg-[#1e40af] px-6 py-2.5 text-sm font-semibold hover:bg-[#1d4ed8]"
                disabled={loading}
              >
                {loading ? "Registering…" : "Register Driver"}
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <Info className="h-4 w-4 text-slate-400" />
          The driver will receive an automated welcome SMS. No app download is
          required to complete deliveries.
        </div>
      </div>
    </div>
  )
}

