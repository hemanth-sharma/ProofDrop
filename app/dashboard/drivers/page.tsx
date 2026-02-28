"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import Link from "next/link"
import { Search, Filter, Plus, Edit2, Trash2, User, X, ChevronLeft, ChevronRight, Phone, Mail, Truck } from "lucide-react"

interface Driver {
  id: string
  full_name: string
  email?: string
  phone: string
  vehicle_type?: string
  status: string
  created_at: string
}

const PAGE_SIZE = 10

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterVehicle, setFilterVehicle] = useState("")
  const [showFilter, setShowFilter] = useState(false)
  const [page, setPage] = useState(1)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/drivers")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setDrivers(data) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilter(false)
    }
    if (showFilter) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [showFilter])

  useEffect(() => { setPage(1) }, [search, filterStatus, filterVehicle])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return drivers.filter((d) => {
      const matchSearch = !q ||
        d.full_name.toLowerCase().includes(q) ||
        d.phone.toLowerCase().includes(q) ||
        (d.email?.toLowerCase().includes(q) ?? false)
      const matchStatus = !filterStatus || d.status === filterStatus
      const matchVehicle = !filterVehicle || d.vehicle_type === filterVehicle
      return matchSearch && matchStatus && matchVehicle
    })
  }, [drivers, search, filterStatus, filterVehicle])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const activeFilters = [filterStatus, filterVehicle].filter(Boolean).length

  function clearFilters() {
    setFilterStatus("")
    setFilterVehicle("")
  }

  return (
    <div className="p-6 lg:p-8 bg-slate-50 min-h-full">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Drivers</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your delivery fleet · {drivers.length} drivers</p>
        </div>
        <Link
          href="/dashboard/drivers/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#1e40af] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1d4ed8] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Driver
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Total Drivers</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{drivers.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Active</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{drivers.filter(d => d.status === "active").length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Inactive</p>
          <p className="mt-1 text-2xl font-bold text-slate-400">{drivers.filter(d => d.status === "inactive").length}</p>
        </div>
      </div>

      {/* Table card */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Search & filter bar */}
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
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
            {/* Quick status toggle */}
            <div className="flex items-center gap-1">
              {["", "active", "inactive"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    filterStatus === s
                      ? s === "active" ? "bg-green-100 text-green-700"
                        : s === "inactive" ? "bg-slate-200 text-slate-600"
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
                Filter
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
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</label>
                      <div className="mt-1.5 flex gap-1.5">
                        {["", "active", "inactive"].map((s) => (
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
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Vehicle Type</label>
                      <select
                        value={filterVehicle}
                        onChange={(e) => setFilterVehicle(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#1e40af] focus:outline-none"
                      >
                        <option value="">All vehicles</option>
                        <option value="van">Delivery Van</option>
                        <option value="truck">Box Truck</option>
                        <option value="bike">Bike / Scooter</option>
                        <option value="car">Car</option>
                      </select>
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

        {(search || activeFilters > 0) && (
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs text-slate-500">
            Showing {filtered.length} of {drivers.length} drivers
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Driver</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Vehicle</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Joined</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#1e40af] border-t-transparent" />
                      Loading drivers...
                    </div>
                  </td>
                </tr>
              ) : !paginated.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <User className="h-10 w-10" />
                      <p className="font-medium text-slate-600">
                        {search || activeFilters > 0 ? "No drivers match your search" : "No drivers yet"}
                      </p>
                      {!search && !activeFilters && (
                        <Link href="/dashboard/drivers/new" className="text-sm text-[#1e40af] hover:underline">
                          Add your first driver →
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((driver) => (
                  <tr key={driver.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700 font-medium text-sm">
                          {driver.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <p className="font-medium text-slate-900">{driver.full_name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-sm text-slate-700">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {driver.phone}
                        </div>
                        {driver.email && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Mail className="h-3 w-3" />
                            {driver.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {driver.vehicle_type ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600 capitalize">
                          <Truck className="h-3 w-3" />
                          {driver.vehicle_type === "van" ? "Delivery Van"
                            : driver.vehicle_type === "truck" ? "Box Truck"
                            : driver.vehicle_type === "bike" ? "Bike/Scooter"
                            : driver.vehicle_type.charAt(0).toUpperCase() + driver.vehicle_type.slice(1)}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        driver.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {driver.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {new Date(driver.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1 text-slate-400">
                        <button type="button" className="rounded p-1.5 hover:bg-slate-100 hover:text-slate-600 transition-colors" aria-label="Edit driver">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button type="button" className="rounded p-1.5 hover:bg-red-50 hover:text-red-600 transition-colors" aria-label="Delete driver">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
            <p className="text-sm text-slate-500">Page {page} of {totalPages} · {filtered.length} drivers</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>
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