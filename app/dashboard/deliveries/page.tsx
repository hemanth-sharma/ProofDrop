"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import Link from "next/link"
import { formatTime } from "@/lib/utils"
import {
  Search, Filter, ChevronRight, ChevronLeft, User, X, Package, ArrowLeft
} from "lucide-react"

interface Delivery {
  id: string
  customer_name: string
  customer_phone: string
  status: string
  created_at: string
  driver_phone?: string
  delivery_address?: string
}

const PAGE_SIZE = 20

export default function AllDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterDriver, setFilterDriver] = useState("")
  const [filterDateFrom, setFilterDateFrom] = useState("")
  const [filterDateTo, setFilterDateTo] = useState("")
  const [showFilter, setShowFilter] = useState(false)
  const [page, setPage] = useState(1)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/deliveries")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const sorted = [...data].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          setDeliveries(sorted)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false)
      }
    }
    if (showFilter) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [showFilter])

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [search, filterStatus, filterDriver, filterDateFrom, filterDateTo])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return deliveries.filter((d) => {
      const matchSearch =
        !q ||
        d.customer_name.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        (d.customer_phone?.toLowerCase().includes(q) ?? false) ||
        (d.driver_phone?.toLowerCase().includes(q) ?? false) ||
        (d.delivery_address?.toLowerCase().includes(q) ?? false)

      const matchStatus = !filterStatus || d.status === filterStatus
      const matchDriver = !filterDriver || (d.driver_phone?.toLowerCase().includes(filterDriver.toLowerCase()) ?? false)
      const matchFrom = !filterDateFrom || new Date(d.created_at) >= new Date(filterDateFrom)
      const matchTo = !filterDateTo || new Date(d.created_at) <= new Date(filterDateTo + "T23:59:59")

      return matchSearch && matchStatus && matchDriver && matchFrom && matchTo
    })
  }, [deliveries, search, filterStatus, filterDriver, filterDateFrom, filterDateTo])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const activeFilters = [filterStatus, filterDriver, filterDateFrom, filterDateTo].filter(Boolean).length

  function clearFilters() {
    setFilterStatus("")
    setFilterDriver("")
    setFilterDateFrom("")
    setFilterDateTo("")
  }

  return (
    <div className="p-6 lg:p-8 bg-slate-50 min-h-full">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href="/dashboard" className="flex items-center gap-1 hover:text-slate-700 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">All Deliveries</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">All Deliveries</h1>
          <p className="text-sm text-slate-500 mt-0.5">{deliveries.length} total deliveries</p>
        </div>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#1e40af] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1d4ed8] transition-colors"
        >
          + New Delivery
        </Link>
      </div>

      {/* Table card */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Search & Filter bar */}
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer name, ID, phone, address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-10 text-sm placeholder:text-slate-400 focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick status pills */}
            <div className="hidden md:flex items-center gap-1">
              {["", "pending", "completed", "failed"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    filterStatus === s
                      ? s === "pending" ? "bg-amber-100 text-amber-700"
                        : s === "completed" ? "bg-green-100 text-green-700"
                        : s === "failed" ? "bg-red-100 text-red-700"
                        : "bg-[#1e40af] text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {/* Filter popup */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
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
                <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-900">Filters</h3>
                    <button onClick={clearFilters} className="text-xs text-[#1e40af] hover:underline">Clear all</button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</label>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {["", "pending", "completed", "failed"].map((s) => (
                          <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                              filterStatus === s
                                ? "border-[#1e40af] bg-[#1e40af] text-white"
                                : "border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Driver Phone</label>
                      <input
                        type="text"
                        placeholder="Search driver phone..."
                        value={filterDriver}
                        onChange={(e) => setFilterDriver(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Date Range</label>
                      <div className="mt-1.5 grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-slate-400">From</label>
                          <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-[#1e40af] focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400">To</label>
                          <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-[#1e40af] focus:outline-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowFilter(false)}
                    className="mt-4 w-full rounded-lg bg-[#1e40af] py-2 text-sm font-medium text-white hover:bg-[#1d4ed8] transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results info */}
        {(search || activeFilters > 0) && (
          <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 text-xs text-blue-700 flex items-center justify-between">
            <span>Showing {filtered.length} of {deliveries.length} deliveries</span>
            {activeFilters > 0 && (
              <button onClick={clearFilters} className="text-[#1e40af] hover:underline font-medium">Clear filters</button>
            )}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Driver</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Address</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#1e40af] border-t-transparent" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : !paginated.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Package className="h-10 w-10" />
                      <p className="font-medium text-slate-600">No deliveries found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((d) => (
                  <tr key={d.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={d.status === "completed" ? `/proof/${d.id}` : `/dashboard/deliveries/${d.id}`}
                        className="flex items-center gap-3"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                          <User className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="font-medium text-slate-900">{d.customer_name}</p>
                          <p className="text-xs text-slate-400">#{d.id.slice(-6).toUpperCase()}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        d.status === "completed" ? "bg-green-100 text-green-700"
                          : d.status === "failed" ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatTime(d.created_at)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{d.driver_phone || <span className="text-slate-300">—</span>}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 max-w-[200px] truncate">
                      {d.delivery_address || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={d.status === "completed" ? `/proof/${d.id}` : `/dashboard/deliveries/${d.id}`}
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
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
            <p>Page {page} of {totalPages} · {filtered.length} results</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                      page === pageNum
                        ? "border-[#1e40af] bg-[#1e40af] text-white"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}