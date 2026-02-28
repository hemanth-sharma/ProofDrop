"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import Link from "next/link"
import { formatTime } from "@/lib/utils"
import {
  Search, Filter, ChevronRight, User, Plus, X,
  Package, TrendingUp, Zap
} from "lucide-react"

interface Delivery {
  id: string
  customer_name: string
  customer_phone: string
  status: string
  created_at: string
  driver_phone?: string
  driver_id?: string
  delivery_address?: string
}

export default function DashboardPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("pending")
  const [filterDriver, setFilterDriver] = useState("")
  const [filterDateFrom, setFilterDateFrom] = useState("")
  const [filterDateTo, setFilterDateTo] = useState("")
  const [showFilter, setShowFilter] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/deliveries")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Sort by created_at descending (newest first)
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

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return deliveries.filter((d) => {
      const matchSearch =
        !q ||
        d.customer_name.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        (d.customer_phone?.toLowerCase().includes(q) ?? false) ||
        (d.driver_phone?.toLowerCase().includes(q) ?? false)

      const matchStatus = !filterStatus || d.status === filterStatus
      const matchDriver = !filterDriver || (d.driver_phone?.toLowerCase().includes(filterDriver.toLowerCase()) ?? false)
      const matchFrom = !filterDateFrom || new Date(d.created_at) >= new Date(filterDateFrom)
      const matchTo = !filterDateTo || new Date(d.created_at) <= new Date(filterDateTo + "T23:59:59")

      return matchSearch && matchStatus && matchDriver && matchFrom && matchTo
    })
  }, [deliveries, search, filterStatus, filterDriver, filterDateFrom, filterDateTo])

  const completedCount = deliveries.filter((d) => d.status === "completed").length
  const pendingCount = deliveries.filter((d) => d.status === "pending").length
  const activeFilters = [filterStatus, filterDriver, filterDateFrom, filterDateTo].filter(Boolean).length

  function clearFilters() {
    setFilterStatus("pending")
    setFilterDriver("")
    setFilterDateFrom("")
    setFilterDateTo("")
  }

  return (
    <div className="p-4 lg:p-8 bg-slate-50 min-h-full">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900">Today's Deliveries</h1>
          <div className="mt-1 flex items-center gap-3 text-xs lg:text-sm">
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
        <Link
          href="/dashboard/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#1e40af] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1d4ed8] transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          New Delivery
        </Link>
      </div>

      {/* KPI cards — compact horizontal row on all screen sizes */}
      <div className="mt-4 grid grid-cols-3 gap-2 lg:gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3 lg:p-5 shadow-sm">
          <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-3">
            <div className="hidden lg:flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] lg:text-sm text-slate-500 leading-tight">Avg. Completion</p>
              <p className="text-base lg:text-xl font-bold text-slate-900">54 sec</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 lg:p-5 shadow-sm">
          <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-3">
            <div className="hidden lg:flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] lg:text-sm text-slate-500 leading-tight">Success Rate</p>
              <p className="text-base lg:text-xl font-bold text-green-600">99.2%</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 lg:p-5 shadow-sm">
          <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-3">
            <div className="hidden lg:flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-[10px] lg:text-sm text-slate-500 leading-tight">Total Volume</p>
              <p className="text-base lg:text-xl font-bold text-slate-900">{deliveries.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="mt-4 lg:mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Search & Filter bar */}
        <div className="flex flex-col gap-3 border-b border-slate-200 p-3 lg:p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search customer, ID, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm placeholder:text-slate-400 focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Quick status pills — hidden on small mobile */}
            <div className="hidden sm:flex items-center gap-1">
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
                <span className="hidden sm:inline">Filter</span>
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
                        className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#1e40af] focus:outline-none"
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

        {/* Mobile status pills row */}
        <div className="flex sm:hidden items-center gap-1 border-b border-slate-100 px-3 py-2 overflow-x-auto">
          {["", "pending", "completed", "failed"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filterStatus === s
                  ? s === "pending" ? "bg-amber-100 text-amber-700"
                    : s === "completed" ? "bg-green-100 text-green-700"
                    : s === "failed" ? "bg-red-100 text-red-700"
                    : "bg-[#1e40af] text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Results count */}
        {(search || activeFilters > 0) && (
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs text-slate-500">
            Showing {filtered.length} of {deliveries.length} deliveries
            {activeFilters > 0 && (
              <button onClick={clearFilters} className="ml-2 text-[#1e40af] hover:underline">
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-3 lg:px-4 py-3 text-left font-medium text-slate-500 text-xs uppercase tracking-wide">Customer</th>
                <th className="px-3 lg:px-4 py-3 text-left font-medium text-slate-500 text-xs uppercase tracking-wide">Status</th>
                <th className="hidden md:table-cell px-4 py-3 text-left font-medium text-slate-500 text-xs uppercase tracking-wide">Time</th>
                <th className="hidden md:table-cell px-4 py-3 text-left font-medium text-slate-500 text-xs uppercase tracking-wide">Driver</th>
                <th className="w-10 px-3 lg:px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#1e40af] border-t-transparent" />
                      Loading deliveries...
                    </div>
                  </td>
                </tr>
              ) : !filtered.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Package className="h-8 w-8" />
                      <p className="font-medium text-slate-600">No deliveries found</p>
                      <p className="text-sm">
                        {search || activeFilters > 0 ? "Try adjusting your search or filters" : 'Click "New Delivery" to create one'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 15).map((d) => (
                  <tr key={d.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-3 lg:px-4 py-3">
                      <Link
                        href={d.status === "completed" ? `/proof/${d.id}` : `/dashboard/deliveries/${d.id}`}
                        className="flex items-center gap-2 lg:gap-3"
                      >
                        <span className="flex h-7 w-7 lg:h-8 lg:w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600">
                          <User className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                        </span>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{d.customer_name}</p>
                          <p className="text-xs text-slate-400">#{d.id.slice(-6).toUpperCase()}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-3 lg:px-4 py-3">
                      <span className={`inline-flex items-center gap-1 lg:gap-1.5 rounded-full px-2 lg:px-2.5 py-0.5 text-xs font-medium ${
                        d.status === "completed" ? "bg-green-100 text-green-700"
                          : d.status === "failed" ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current hidden sm:block" />
                        {d.status === "completed" ? "Done" : d.status === "failed" ? "Failed" : "Pending"}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-slate-500 text-xs">{formatTime(d.created_at)}</td>
                    <td className="hidden md:table-cell px-4 py-3">
                      <span className="text-sm text-slate-600">{d.driver_phone || <span className="text-slate-300">—</span>}</span>
                    </td>
                    <td className="px-3 lg:px-4 py-3">
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

        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-3 lg:px-4 py-3 text-sm text-slate-500">
            <div className="flex items-center gap-3">
              <p className="text-xs lg:text-sm">Showing 1–{Math.min(15, filtered.length)} of {filtered.length}</p>
              <Link href="/dashboard/deliveries" className="text-[#1e40af] font-medium hover:underline text-xs lg:text-sm">
                View All
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade banner */}
      <div className="mt-4 lg:mt-6 overflow-hidden rounded-xl bg-gradient-to-r from-[#1e40af] to-[#3b82f6] p-4 lg:p-6 text-white shadow-lg">
        <h3 className="text-base lg:text-lg font-bold">Grow with ProofDrop Pro</h3>
        <p className="mt-1 text-xs lg:text-sm text-blue-100">Custom branding, PDF reports, and multi-user access.</p>
        <Link href="#" className="mt-3 inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#1e40af] hover:bg-blue-50 transition-colors">
          Upgrade Now
        </Link>
      </div>
    </div>
  )
}