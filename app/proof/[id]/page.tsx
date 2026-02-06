import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { Logo } from "@/components/landing/Logo"
import {
  Clock,
  User,
  MapPin,
  CheckCircle,
  Shield,
  Smartphone,
} from "lucide-react"
import { ProofActions } from "./ProofActions"

export default async function ProofPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()
  const { data: delivery, error } = await supabase
    .from("deliveries")
    .select("*")
    .eq("id", id)
    .eq("status", "completed")
    .single()
  if (error || !delivery) {
    notFound()
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("business_name, business_logo_url")
    .eq("id", delivery.user_id)
    .single()

  const refId = `#PD-${id.slice(-5)}`

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Logo className="text-slate-900" />
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Toggle theme"
            >
              <span className="text-lg">🌙</span>
            </button>
            <span className="text-sm font-medium text-slate-500">
              Reference: {refId}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Badge + title */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-sm font-medium text-green-800">
            <CheckCircle className="h-4 w-4" />
            Delivery Complete
          </span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Proof of Delivery</h1>
        <p className="mt-1 text-slate-600">
          Your order has been successfully delivered and verified.
        </p>

        {/* Photo card */}
        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {delivery.photo_url ? (
            <img
              src={delivery.photo_url}
              alt="Delivery"
              className="w-full object-contain max-h-[400px] bg-slate-50"
            />
          ) : (
            <div className="flex aspect-video items-center justify-center bg-[#ccfbf1]">
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <Smartphone className="h-16 w-16 text-amber-500" />
                <span className="text-sm">Delivery photo</span>
              </div>
            </div>
          )}
        </div>

        {/* Two-column details card */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left: Delivery information */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Delivery Information
              </h2>
              <ul className="mt-4 space-y-4">
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Timestamp</p>
                    <p className="font-medium text-slate-900">
                      {delivery.completed_at
                        ? formatDate(delivery.completed_at)
                        : "—"}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <User className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Driver Name</p>
                    <p className="font-medium text-slate-900">
                      {delivery.driver_phone || "Driver"}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Destination</p>
                    <p className="font-medium text-slate-900">
                      {delivery.delivery_address || "—"}
                    </p>
                  </div>
                </li>
                <li>
                  <p className="text-xs text-slate-500">Delivery notes</p>
                  <div className="mt-1 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                    {delivery.delivery_notes || "—"}
                  </div>
                </li>
              </ul>
            </div>

            {/* Right: Digital signature + security */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Digital Signature
              </h2>
              {delivery.signature_data ? (
                <div className="mt-4 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 p-4">
                  <img
                    src={delivery.signature_data}
                    alt="Signature"
                    className="mx-auto max-h-24 w-full object-contain"
                  />
                  <p className="mt-2 text-center font-medium text-slate-900">
                    {delivery.customer_name}
                  </p>
                  <p className="text-center text-xs text-green-600">
                    Verified Recipient
                  </p>
                </div>
              ) : (
                <div className="mt-4 rounded-lg border-2 border-dashed border-slate-200 p-6 text-center text-slate-500">
                  No signature captured
                </div>
              )}

              <h3 className="mt-6 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Security Verification
              </h3>
              <ul className="mt-3 space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  GPS Confirmation: Match (0.02km)
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Tamper-proof Seal: Encrypted
                </li>
                <li className="flex items-center gap-2 text-sm font-mono text-slate-500">
                  <Shield className="h-4 w-4 text-slate-400" />
                  Device Hash: {id.slice(0, 4)}-{id.slice(4, 8)}-{id.slice(8, 12)}-{id.slice(12, 16)}
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom: business logo + actions */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row">
            <div className="flex items-center gap-2 text-slate-600">
              {profile?.business_logo_url ? (
                <img
                  src={profile.business_logo_url}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                  {profile?.business_name?.slice(0, 2) || "BF"}
                </span>
              )}
              <span className="text-sm font-medium">
                {profile?.business_name || "Merchant"}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-sm text-slate-500">Delivered via ProofDrop</span>
            </div>
            <ProofActions />
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Need help with this delivery?{" "}
          <Link href="#" className="text-[#1e40af] hover:underline">
            Contact Support
          </Link>
        </p>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <Logo className="text-slate-700" />
          <p className="text-center text-sm text-slate-500">
            © 2023 ProofDrop. All rights reserved. Professional Proof of
            Delivery.
          </p>
          <div className="flex gap-4 text-sm text-slate-600">
            <Link href="#" className="hover:text-slate-900">
              Terms
            </Link>
            <Link href="#" className="hover:text-slate-900">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
