import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { formatTime } from "@/lib/utils"
import { User } from "lucide-react"

interface Props {
  searchParams?: {
    search?: string
    status?: string
    driver?: string
  }
}

export default async function AllDeliveriesPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  let query = supabase
    .from("deliveries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // SEARCH
  if (searchParams?.search) {
    query = query.or(
      `customer_name.ilike.%${searchParams.search}%,id.ilike.%${searchParams.search}%`
    )
  }

  // FILTERS
  if (searchParams?.status) {
    query = query.eq("status", searchParams.status)
  }

  if (searchParams?.driver) {
    query = query.eq("driver_phone", searchParams.driver)
  }

  const { data: deliveries } = await query

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-slate-900">
        All Deliveries
      </h1>

      <div className="mt-6 overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Time</th>
              <th className="px-4 py-3 text-left">Driver</th>
            </tr>
          </thead>
          <tbody>
            {deliveries?.map((d) => (
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
                      <p className="font-medium">{d.customer_name}</p>
                      <p className="text-xs text-slate-500">
                        #{d.id.slice(-6).toUpperCase()}
                      </p>
                    </div>
                  </Link>
                </td>

                <td className="px-4 py-3">
                  <span className="capitalize">{d.status}</span>
                </td>

                <td className="px-4 py-3">
                  {formatTime(d.created_at)}
                </td>

                <td className="px-4 py-3">
                  {d.driver_phone || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}