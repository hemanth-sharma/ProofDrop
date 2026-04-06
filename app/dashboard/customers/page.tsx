"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import Link from "next/link"
import { Search, Filter, X, ChevronRight, ChevronLeft, User, Phone, Mail } from "lucide-react"

interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  created_at: string
  total: number
  pending: number
  completed: number
  lastInteraction: string | null
  status: "Pending" | "Completed"
}

const PAGE_SIZE = 15

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"all" | "pending" | "completed">("all")
  const [search, setSearch] = useState("")
  const [filterMinDeliveries, setFilterMinDeliveries] = useState("")
  const [filterMaxDeliveries, setFilterMaxDeliveries] = useState("")
  const [showFilter, setShowFilter] = useState(false)
  const [page, setPage] = useState(1)
  const filterRef = useRef<HTMLDivElement>(null)


  // Fetch with delivery details for accurate pending/completed counts
  useEffect(() => {
    fetch("/api/customers?include_deliveries=true")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const formatted = data.map((c: any) => {
            const deliveries = c.deliveries || []

            const hasFullDeliveries =
              Array.isArray(deliveries) &&
              deliveries.length > 0 &&
              deliveries[0]?.status !== undefined

            const total = hasFullDeliveries
              ? deliveries.length
              : deliveries[0]?.count ?? 0

            const pending = hasFullDeliveries
              ? deliveries.filter((d: any) => d.status === "pending").length
              : 0

            const completed = hasFullDeliveries
              ? deliveries.filter((d: any) => d.status === "completed").length
              : 0

            const lastDelivery = hasFullDeliveries
              ? deliveries.sort(
                  (a: any, b: any) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                )[0]
              : null

            return {
              ...c,
              total,
              pending,
              completed,
              lastInteraction: lastDelivery?.created_at || null,
              status: pending > 0 ? "Pending" as const : "Completed" as const,
            }
          })

          setCustomers(formatted)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilter(false)
    }
    if (showFilter) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [showFilter])

  useEffect(() => { setPage(1) }, [search, tab, filterMinDeliveries, filterMaxDeliveries])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return customers.filter((c) => {
      const matchTab =
        tab === "all" ||
        (tab === "pending" && c.pending > 0) ||
        (tab === "completed" && c.pending === 0)

      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        (c.email?.toLowerCase().includes(q) ?? false)

      const matchMin = !filterMinDeliveries || c.total >= parseInt(filterMinDeliveries)
      const matchMax = !filterMaxDeliveries || c.total <= parseInt(filterMaxDeliveries)

      return matchTab && matchSearch && matchMin && matchMax
    })
  }, [customers, tab, search, filterMinDeliveries, filterMaxDeliveries])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const activeFilters = [filterMinDeliveries, filterMaxDeliveries].filter(Boolean).length

  const totalPending = customers.filter((c) => c.pending > 0).length
  const totalCompleted = customers.filter((c) => c.pending === 0).length

  function clearFilters() {
    setFilterMinDeliveries("")
    setFilterMaxDeliveries("")
  }

  return (
    <div className="p-6 lg:p-8 bg-slate-50 min-h-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage and monitor your customer base — {customers.length} total customers
        </p>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-0">
          {[
            { key: "all", label: "All Customers", count: customers.length },
            { key: "pending", label: "Pending Deliveries", count: totalPending },
            { key: "completed", label: "Completed", count: totalCompleted },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key as any)}
              className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                tab === key
                  ? "text-[#1e40af] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#1e40af] after:rounded-t"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {label}
              <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                tab === key ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search & filter bar */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-10 text-sm placeholder:text-slate-400 focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af] shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium shadow-sm transition-colors ${
                activeFilters > 0
                  ? "border-[#1e40af] bg-[#1e40af]/10 text-[#1e40af]"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFilters > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#1e40af] text-[10px] font-bold text-white">
                  {activeFilters}
                </span>
              )}
            </button>

            {showFilter && (
              <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-900">Filters</h3>
                  <button onClick={clearFilters} className="text-xs text-[#1e40af] hover:underline">Clear all</button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Delivery Count Range</label>
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-400">Min</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={filterMinDeliveries}
                          onChange={(e) => setFilterMinDeliveries(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-[#1e40af] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Max</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="Any"
                          value={filterMaxDeliveries}
                          onChange={(e) => setFilterMaxDeliveries(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-[#1e40af] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Delivery Status</label>
                    <div className="mt-1.5 flex gap-1.5">
                      {[
                        { key: "all", label: "All" },
                        { key: "pending", label: "Pending" },
                        { key: "completed", label: "Completed" },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setTab(key as any)}
                          className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                            tab === key
                              ? "border-[#1e40af] bg-[#1e40af] text-white"
                              : "border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowFilter(false)}
                  className="mt-4 w-full rounded-lg bg-[#1e40af] py-2 text-sm font-medium text-white hover:bg-[#1d4ed8] transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results count */}
      {(search || activeFilters > 0) && (
        <div className="mt-2 text-xs text-slate-500">
          Showing {filtered.length} of {customers.length} customers
        </div>
      )}

      {/* Table */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Deliveries</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Last Active</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#1e40af] border-t-transparent" />
                      Loading customers...
                    </div>
                  </td>
                </tr>
              ) : !paginated.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <User className="h-10 w-10" />
                      <p className="font-medium text-slate-600">No customers found</p>
                      <p className="text-sm">Customers are created automatically when you add a delivery</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((customer) => (
                  <tr key={customer.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/customers/${customer.id}`} className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-semibold text-xs">
                          {customer.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 hover:text-[#1e40af] transition-colors">{customer.name}</p>
                          <p className="text-xs text-slate-400">Since {new Date(customer.created_at).toLocaleDateString()}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-sm text-slate-700">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {customer.phone || "—"}
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">{customer.total}</span>
                        <span className="text-xs text-slate-400">total</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        customer.status === "Pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {customer.lastInteraction
                        ? new Date(customer.lastInteraction).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/customers/${customer.id}`}
                        className="inline-flex text-slate-300 hover:text-slate-600 transition-colors"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <p className="text-sm text-slate-500">Page {page} of {totalPages} · {filtered.length} customers</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}