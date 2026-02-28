import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Clock, User, Phone, MapPin, FileText,
  Truck, CheckCircle, AlertCircle, Timer, ExternalLink
} from "lucide-react"

export default async function DeliveryDetails({ params }: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: delivery } = await supabase
    .from("deliveries")
    .select(`
      *,
      drivers (
        id,
        full_name,
        phone,
        vehicle_type,
        status
      )
    `)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (!delivery) redirect("/dashboard")

  const statusConfig = {
    pending: {
      label: "Pending",
      bg: "bg-amber-100",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: Timer,
      dot: "bg-amber-500",
    },
    completed: {
      label: "Completed",
      bg: "bg-green-100",
      text: "text-green-700",
      border: "border-green-200",
      icon: CheckCircle,
      dot: "bg-green-500",
    },
    failed: {
      label: "Failed",
      bg: "bg-red-100",
      text: "text-red-700",
      border: "border-red-200",
      icon: AlertCircle,
      dot: "bg-red-500",
    },
  }

  const status = statusConfig[delivery.status as keyof typeof statusConfig] || statusConfig.pending
  const StatusIcon = status.icon

  return (
    <div className="p-6 lg:p-8 bg-slate-50 min-h-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        <Link href="/dashboard" className="flex items-center gap-1 hover:text-slate-700 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/dashboard/deliveries" className="hover:text-slate-700 transition-colors">Deliveries</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">#{delivery.id.slice(-6).toUpperCase()}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Delivery Details</h1>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${status.bg} ${status.text} ${status.border}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {status.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Reference: <span className="font-mono font-medium text-slate-700">#{delivery.id.slice(-6).toUpperCase()}</span>
            {" · "}
            Created {new Date(delivery.created_at).toLocaleString()}
          </p>
        </div>

        {delivery.status === "completed" && (
          <Link
            href={`/proof/${delivery.id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            View Proof of Delivery
          </Link>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              <User className="h-4 w-4" />
              Customer Information
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Full Name</p>
                <p className="font-semibold text-slate-900 text-lg">{delivery.customer_name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Phone Number</p>
                <a href={`tel:${delivery.customer_phone}`} className="flex items-center gap-1.5 font-medium text-[#1e40af] hover:underline">
                  <Phone className="h-3.5 w-3.5" />
                  {delivery.customer_phone}
                </a>
              </div>
              {delivery.customer_email && (
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Email</p>
                  <p className="text-slate-700">{delivery.customer_email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Delivery details card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              <MapPin className="h-4 w-4" />
              Delivery Details
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Delivery Address</p>
                {delivery.delivery_address ? (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <p className="text-slate-700">{delivery.delivery_address}</p>
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-sm">No address provided</p>
                )}
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1">Delivery Notes</p>
                {delivery.delivery_notes ? (
                  <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-slate-700 text-sm">{delivery.delivery_notes}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-sm">No notes</p>
                )}
              </div>
            </div>
          </div>

          {/* Proof section (for completed) */}
          {delivery.status === "completed" && (
            <div className="rounded-xl border border-green-200 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Proof of Delivery
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {delivery.photo_url && (
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Delivery Photo</p>
                    <img
                      src={delivery.photo_url}
                      alt="Delivery proof"
                      className="rounded-lg border border-slate-200 w-full object-cover max-h-48"
                    />
                  </div>
                )}
                {delivery.signature_data && (
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Customer Signature</p>
                    <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-3 flex items-center justify-center">
                      <img
                        src={delivery.signature_data}
                        alt="Signature"
                        className="max-h-24 object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
              {delivery.completed_at && (
                <p className="mt-3 text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Completed at {new Date(delivery.completed_at).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status timeline */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Timeline</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Delivery Created</p>
                  <p className="text-xs text-slate-400">{new Date(delivery.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className={`flex items-start gap-3 ${delivery.status === "pending" ? "opacity-40" : ""}`}>
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full mt-0.5 ${delivery.status !== "pending" ? "bg-green-100" : "bg-slate-100"}`}>
                  <div className={`h-2 w-2 rounded-full ${delivery.status !== "pending" ? "bg-green-500" : "bg-slate-300"}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {delivery.status === "completed" ? "Delivery Completed" : delivery.status === "failed" ? "Delivery Failed" : "Awaiting Completion"}
                  </p>
                  {delivery.completed_at && (
                    <p className="text-xs text-slate-400">{new Date(delivery.completed_at).toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Driver card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              <Truck className="h-4 w-4" />
              Driver
            </h2>
            {delivery.drivers ? (
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{delivery.drivers.full_name}</p>
                  <p className="text-sm text-slate-500">{delivery.drivers.phone}</p>
                  {delivery.drivers.vehicle_type && (
                    <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 capitalize">
                      {delivery.drivers.vehicle_type}
                    </span>
                  )}
                </div>
              </div>
            ) : delivery.driver_phone ? (
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="h-4 w-4 text-slate-400" />
                <span className="text-sm">{delivery.driver_phone}</span>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No driver assigned</p>
            )}
          </div>

          {/* Driver link */}
          {delivery.status === "pending" && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Driver Link</p>
              <p className="text-xs text-blue-600 break-all font-mono">
                {typeof window !== "undefined" ? window.location.origin : ""}/driver/{delivery.driver_link_token}
              </p>
              <p className="mt-2 text-xs text-blue-500">Share this link with the driver via SMS or WhatsApp</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}