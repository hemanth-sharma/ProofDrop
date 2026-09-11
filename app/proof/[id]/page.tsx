import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { Logo } from "@/components/landing/Logo"
import {
  Clock,
  User,
  MapPin,
  Package,
  CheckCircle,
  Shield,
  Smartphone,
  ShieldCheck,
  Navigation,
} from "lucide-react"
import { ProofActions } from "./ProofActions"
import { CustomerReaction } from "./CustomerReaction"

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
  const aiConfidencePct = delivery.ai_confidence
    ? Math.round(delivery.ai_confidence * 100)
    : null

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
          {delivery.ai_verified && (
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-800">
              <ShieldCheck className="h-4 w-4" />
              AI-Verified Photo
              {aiConfidencePct !== null && (
                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                  {aiConfidencePct}%
                </span>
              )}
            </span>
          )}
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

        {/* AI verification card */}
        {delivery.ai_verified && (
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-blue-900">
                  AI Photo Verification — Passed
                  {aiConfidencePct !== null && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {aiConfidencePct}% confidence
                    </span>
                  )}
                </p>
                <p className="mt-1 text-sm text-blue-800 leading-snug">
                  {delivery.ai_reason || "The uploaded photo was checked by AI to confirm it shows the delivered item."}
                </p>
                <p className="mt-2 text-[11px] text-blue-500">
                  Checked {delivery.ai_verified_at ? formatDate(delivery.ai_verified_at) : "at upload"}
                  {delivery.ai_mode === "llm" ? " · vision model" : " · offline checks"}
                </p>
              </div>
            </div>
          </div>
        )}

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
                {delivery.product_name && (
                  <li className="flex items-start gap-3">
                    <Package className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Item</p>
                      <p className="font-medium text-slate-900">{delivery.product_name}</p>
                    </div>
                  </li>
                )}
                <li className="flex items-start gap-3">
                  <User className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Delivered To</p>
                    <p className="font-medium text-slate-900">{delivery.customer_name}</p>
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

            {/* Right: Delivery confirmation + security */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Delivery Confirmation
              </h2>
              <div className="mt-4 rounded-lg border-2 border-dashed border-green-200 bg-green-50/50 p-4 text-center">
                <CheckCircle className="mx-auto h-8 w-8 text-green-500" />
                <p className="mt-2 font-medium text-slate-900">
                  Confirmed by driver
                  {delivery.driver_phone ? (
                    <span className="block text-xs font-normal text-slate-500 mt-0.5">
                      Driver {delivery.driver_phone}
                    </span>
                  ) : null}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {delivery.completed_at ? formatDate(delivery.completed_at) : ""}
                </p>
              </div>

              <h3 className="mt-6 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Security Verification
              </h3>
              <ul className="mt-3 space-y-2">
                {delivery.delivery_lat != null && delivery.delivery_lng != null ? (
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>
                      GPS captured at drop-off: {delivery.delivery_lat.toFixed(4)}, {delivery.delivery_lng.toFixed(4)}
                    </span>
                    <a
                      href={`https://www.google.com/maps?q=${delivery.delivery_lat},${delivery.delivery_lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#1e40af] hover:underline"
                    >
                      <Navigation className="h-3 w-3" />
                      Map
                    </a>
                  </li>
                ) : (
                  <li className="flex items-center gap-2 text-sm text-slate-500">
                    <Shield className="h-4 w-4 text-slate-400" />
                    GPS: not captured for this delivery
                  </li>
                )}
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Tamper-proof Seal: Encrypted
                </li>
                <li className="flex items-center gap-2 text-sm font-mono text-slate-500">
                  <Shield className="h-4 w-4 text-slate-400" />
                  Device Hash: {id.slice(0, 4)}-{id.slice(4, 8)}-{id.slice(8, 12)}-{id.slice(12, 16)}
                </li>
              </ul>

              {/* Customer reaction */}
              <CustomerReaction
                deliveryId={delivery.id}
                customerName={delivery.customer_name}
                customerEmail={delivery.customer_email}
              />
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
