import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { formatTime } from "@/lib/utils"
import { Search, Filter, ChevronRight, User, Plus } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: deliveriesData } = user
    ? await supabase
        .from("deliveries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
    : { data: null }
  const deliveries = deliveriesData ?? []

  const completedCount = deliveries.filter((d) => d.status === "completed").length
  const pendingCount = deliveries.filter((d) => d.status === "pending").length

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Today&apos;s Deliveries
          </h1>
          <div className="mt-1 flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-green-600">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              {completedCount} completed
            </span>
            <span className="flex items-center gap-1.5 text-amber-600">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              {pendingCount} pending
            </span>
          </div>
        </div>
        <Button asChild className="bg-[#1e40af] hover:bg-[#1d4ed8]">
          <Link href="/dashboard/new" className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Delivery
          </Link>
        </Button>
      </div>

      {/* KPI cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Avg. Completion Time
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">54 sec</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Success Rate</p>
          <p className="mt-1 text-2xl font-bold text-green-600">99.2%</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Volume</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {deliveries.length}
          </p>
        </div>
      </div>

      {/* Table card */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search customer or ID..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm placeholder:text-slate-400 focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
            />
          </div>
          <Button variant="outline" size="sm" className="inline-flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-4 py-3 text-left font-medium text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <User className="h-4 w-4" />
                    CUSTOMER
                  </span>
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">
                  STATUS
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">
                  TIME
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">
                  DRIVER
                </th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {!deliveries.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    No deliveries yet. Click &quot;New Delivery&quot; to create one.
                  </td>
                </tr>
              ) : (
                deliveries.slice(0, 15).map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={d.status === "completed" ? `/proof/${d.id}` : "#"}
                        className="flex items-center gap-3"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                          <User className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="font-medium text-slate-900">
                            {d.customer_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            #{d.id.slice(-6).toUpperCase()}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          d.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : d.status === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {d.status === "completed"
                          ? "Completed"
                          : d.status === "failed"
                            ? "Failed"
                            : "In Progress"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatTime(d.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 text-slate-600">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                          <User className="h-3 w-3" />
                        </span>
                        {d.driver_phone || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={d.status === "completed" ? `/proof/${d.id}` : "#"}
                        className="inline-flex text-slate-400 hover:text-slate-600"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {deliveries.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
            <p>
              Showing 1-{Math.min(15, deliveries.length)} of {deliveries.length}{" "}
              deliveries
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                className="rounded border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-50"
                disabled
                aria-label="Previous page"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </button>
              <button
                type="button"
                className="rounded border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-50"
                disabled={deliveries.length <= 15}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade banner */}
      <div className="mt-8 overflow-hidden rounded-xl bg-gradient-to-r from-[#1e40af] to-[#3b82f6] p-6 text-white shadow-lg">
        <div className="relative">
          <h3 className="text-lg font-bold">Grow with ProofDrop Pro</h3>
          <p className="mt-1 text-sm text-blue-100">
            Get custom branding, PDF reports, and multi-user access to streamline
            your entire delivery operation.
          </p>
          <Button
            asChild
            className="mt-4 bg-white text-[#1e40af] hover:bg-blue-50"
          >
            <Link href="#">Upgrade Now</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
