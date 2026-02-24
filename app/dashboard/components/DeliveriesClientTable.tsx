"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, Filter, ChevronRight, User } from "lucide-react"
import { formatTime } from "@/lib/utils"

interface Delivery {
  id: string
  customer_name: string
  status: string
  created_at: string
  driver_phone?: string
}

interface Props {
  deliveries: Delivery[]
}

export function DeliveriesClientTable({ deliveries }: Props) {
  const [search, setSearch] = useState("")

  // Filtered deliveries based on search input
  const filteredDeliveries = useMemo(() => {
    const query = search.toLowerCase()
    return deliveries.filter(
      (d) =>
        d.customer_name.toLowerCase().includes(query) ||
        d.id.toLowerCase().includes(query) ||
        (d.driver_phone?.toLowerCase().includes(query) ?? false)
    )
  }, [search, deliveries])

  return (
    <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search by customer, ID or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm placeholder:text-slate-400 focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded border border-slate-200 px-3 py-1 text-sm hover:bg-slate-50">
          <Filter className="h-4 w-4" />
          Filter
        </button>
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
              <th className="px-4 py-3 text-left font-medium text-slate-500">STATUS</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">TIME</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">DRIVER</th>
              <th className="w-10 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {!filteredDeliveries.length ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                  No deliveries match your search.
                </td>
              </tr>
            ) : (
              filteredDeliveries.slice(0, 15).map((d) => (
                <tr key={d.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
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
                        <p className="text-xs text-slate-500">#{d.id.slice(-6).toUpperCase()}</p>
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
                      {d.status === "completed" ? "Completed" : d.status === "failed" ? "Failed" : "In Progress"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatTime(d.created_at)}</td>
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
                      href={d.status === "completed" ? `/proof/${d.id}` : `/dashboard/deliveries/${d.id}`}
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
    </div>
  )
}