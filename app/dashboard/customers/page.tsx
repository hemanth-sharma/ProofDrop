// export default function CustomersPage() {
//   return (
//     <div className="p-6 lg:p-8">
//       <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
//       <p className="mt-2 text-slate-600">Coming soon.</p>
//     </div>
//   )
// }

import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function CustomersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: customers } = await supabase
    .from("customers")
    .select(`
      *,
      deliveries (
        id,
        status,
        created_at
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const formatted = customers?.map((customer) => {
    const deliveries = customer.deliveries || []

    const total = deliveries.length
    const pending = deliveries.filter(d => d.status === "pending").length
    const completed = deliveries.filter(d => d.status === "completed").length

    const lastDelivery = deliveries
      .sort((a, b) => 
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      )[0]

    return {
      ...customer,
      total,
      pending,
      completed,
      lastInteraction: lastDelivery?.created_at || null,
      status: pending > 0 ? "Pending" : "Completed",
    }
  }) || []

  const totalCustomers = formatted.length
  const totalPending = formatted.filter(c => c.pending > 0).length
  const totalCompleted = formatted.filter(c => c.pending === 0).length

  return (
    <div className="p-8 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold">Customers</h1>
        <p className="text-gray-500 mt-1">
          Manage and monitor your customer base and their delivery statuses.
        </p>
      </div>

      {/* TABS */}
      <div className="flex items-center justify-between">
        <div className="flex gap-6 text-sm font-medium">
          <div className="border-b-2 border-blue-600 pb-2">
            All Customers ({totalCustomers})
          </div>
          <div className="text-gray-500">
            Pending Deliveries ({totalPending})
          </div>
          <div className="text-gray-500">
            Completed Deliveries ({totalCompleted})
          </div>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 border rounded-lg text-sm">
            Filters
          </button>
          <button className="px-4 py-2 border rounded-lg text-sm">
            Export
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-left">Contact Info</th>
              <th className="p-4 text-left">Deliveries</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Last Interaction</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {formatted.map((customer) => (
              <tr key={customer.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <Link
                    href={`/dashboard/customers/${customer.id}`}
                    className="font-medium text-blue-600"
                  >
                    {customer.name}
                  </Link>
                </td>

                <td className="p-4 text-gray-600">
                  <div>{customer.phone}</div>
                  <div className="text-xs text-gray-400">
                    {customer.email || "—"}
                  </div>
                </td>

                <td className="p-4">
                  {customer.total} total
                </td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      customer.status === "Pending"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {customer.status}
                  </span>
                </td>

                <td className="p-4">
                  {customer.lastInteraction
                    ? new Date(customer.lastInteraction).toLocaleDateString()
                    : "—"}
                </td>

                <td className="p-4 text-gray-400">
                  •••
                </td>
              </tr>
            ))}

            {formatted.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}