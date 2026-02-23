import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Search, Plus, Edit2, Trash2, User } from "lucide-react"

export default async function DriversPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: drivers } = user
    ? await supabase
        .from("drivers")
        .select("*")
        .eq("user_id", user.id)
        .order("full_name", { ascending: true })
    : { data: null }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Drivers</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your active fleet and onboarding.
          </p>
        </div>
        <Link
          href="/dashboard/drivers/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#1e40af] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1d4ed8]"
        >
          <Plus className="h-4 w-4" />
          Add Driver
        </Link>
      </div>

      <div className="mt-6 text-sm font-medium text-slate-700">
        Active Fleet
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 p-4">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search drivers..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm placeholder:text-slate-400 focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-4 py-3 text-left font-medium text-slate-500">
                  DRIVER
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">
                  STATUS
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">
                  TOTAL DELIVERIES
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-500">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {!drivers?.length ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    No drivers added yet. Click &quot;Add Driver&quot; to get
                    started.
                  </td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <tr
                    key={driver.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-slate-700">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {driver.full_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {driver.email || driver.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          driver.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {driver.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {/* Placeholder for now; wire to real count if needed */}
                      0
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2 text-slate-400">
                        <button
                          type="button"
                          className="rounded p-1 hover:bg-slate-100 hover:text-slate-600"
                          aria-label="Edit driver"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="rounded p-1 hover:bg-slate-100 hover:text-red-600"
                          aria-label="Delete driver"
                        >
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
        {drivers?.length ? (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
            <p>Showing 1-{drivers.length} of {drivers.length} drivers</p>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded border border-slate-200 px-3 py-1.5 hover:bg-slate-50"
                disabled
              >
                Previous
              </button>
              <button
                type="button"
                className="rounded border border-slate-200 px-3 py-1.5 hover:bg-slate-50"
                disabled
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

