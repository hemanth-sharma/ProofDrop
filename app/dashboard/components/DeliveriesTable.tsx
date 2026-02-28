"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { formatTime } from "@/lib/utils"
import { User, ChevronRight } from "lucide-react"

export function DeliveriesTable({ deliveries }: any) {
  const [search, setSearch] = useState("")

  const filteredDeliveries = useMemo(() => {
    if (!search) return deliveries

    return deliveries.filter((d: any) =>
      d.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, deliveries])

  return (
    <>
      {/* Search */}
      <div className="border-b p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer or ID..."
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-4 text-sm"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            {filteredDeliveries.map((d: any) => (
              <tr
                key={d.id}
                className="border-b hover:bg-slate-50 cursor-pointer"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/deliveries/${d.id}`}
                    className="flex items-center gap-3"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
                      <User className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-medium">
                        {d.customer_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        #{d.id.slice(-6).toUpperCase()}
                      </p>
                    </div>
                  </Link>
                </td>

                <td className="px-4 py-3 capitalize">
                  {d.status}
                </td>

                <td className="px-4 py-3">
                  {formatTime(d.created_at)}
                </td>

                <td className="px-4 py-3">
                  {d.driver_phone || "—"}
                </td>

                <td className="px-4 py-3">
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}