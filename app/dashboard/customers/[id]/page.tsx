import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Phone, Mail, MapPin, Package, CheckCircle, Timer, AlertCircle, FileText } from "lucide-react"

interface PageProps {
  params: { id: string }
}

export default async function CustomerDetails({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (!customer) redirect("/dashboard/customers")

  const { data: deliveries } = await supabase
    .from("deliveries")
    .select("*")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false })

  const total = deliveries?.length ?? 0
  const completed = deliveries?.filter((d) => d.status === "completed").length ?? 0
  const pending = deliveries?.filter((d) => d.status === "pending").length ?? 0
  const failed = deliveries?.filter((d) => d.status === "failed").length ?? 0

  return (
    <div className="p-6 lg:p-8 bg-slate-50 min-h-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        <Link href="/dashboard/customers" className="flex items-center gap-1 hover:text-slate-700 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Customers
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">{customer.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-bold text-xl">
            {customer.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{customer.name}</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Customer since {new Date(customer.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#1e40af] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1d4ed8] transition-colors"
        >
          + New Delivery
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Total</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{total}</p>
        </div>
        <div className="rounded-xl border border-green-100 bg-green-50 p-4 shadow-sm">
          <p className="text-xs text-green-600 uppercase tracking-wide">Completed</p>
          <p className="mt-1 text-2xl font-bold text-green-700">{completed}</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs text-amber-600 uppercase tracking-wide">Pending</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{pending}</p>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 shadow-sm">
          <p className="text-xs text-red-500 uppercase tracking-wide">Failed</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{failed}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Contact card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <Phone className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Phone</p>
                  <a href={`tel:${customer.phone}`} className="text-sm font-medium text-[#1e40af] hover:underline">
                    {customer.phone || "—"}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="text-sm font-medium text-slate-700">{customer.email || "—"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <MapPin className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Default Address</p>
                  <p className="text-sm font-medium text-slate-700">{customer.address || "—"}</p>
                </div>
              </div>

              {customer.notes && (
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <FileText className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Notes</p>
                    <p className="text-sm text-slate-700">{customer.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Deliveries table */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-900">Delivery History</h2>
              <p className="text-xs text-slate-500 mt-0.5">{total} total deliveries</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Delivery</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Driver</th>
                    <th className="w-10 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {!deliveries?.length ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <Package className="h-8 w-8" />
                          <p className="text-slate-600 font-medium">No deliveries yet</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    deliveries.map((delivery) => {
                      const StatusIcon = delivery.status === "completed" ? CheckCircle
                        : delivery.status === "failed" ? AlertCircle : Timer
                      return (
                        <tr key={delivery.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <Link
                              href={delivery.status === "completed" ? `/proof/${delivery.id}` : `/dashboard/deliveries/${delivery.id}`}
                              className="flex items-center gap-2"
                            >
                              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                                delivery.status === "completed" ? "bg-green-100" : delivery.status === "failed" ? "bg-red-100" : "bg-amber-100"
                              }`}>
                                <StatusIcon className={`h-3.5 w-3.5 ${
                                  delivery.status === "completed" ? "text-green-600" : delivery.status === "failed" ? "text-red-600" : "text-amber-600"
                                }`} />
                              </div>
                              <span className="font-mono text-xs text-slate-600">
                                #{delivery.id.slice(-6).toUpperCase()}
                              </span>
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                              delivery.status === "completed" ? "bg-green-100 text-green-700"
                                : delivery.status === "failed" ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }`}>
                              {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">
                            {new Date(delivery.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500">
                            {delivery.driver_phone || <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              href={delivery.status === "completed" ? `/proof/${delivery.id}` : `/dashboard/deliveries/${delivery.id}`}
                              className="text-slate-300 hover:text-slate-600 transition-colors"
                            >
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path d="M9 18l6-6-6-6" />
                              </svg>
                            </Link>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}