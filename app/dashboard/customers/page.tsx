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
      deliveries(count)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Customers</h1>

      <div className="bg-white rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Phone</th>
              <th className="text-left p-4">Total Deliveries</th>
              <th className="text-left p-4">Created</th>
            </tr>
          </thead>
          <tbody>
            {customers?.map((customer) => (
              <tr key={customer.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <Link
                    href={`/dashboard/customers/${customer.id}`}
                    className="font-medium text-blue-600"
                  >
                    {customer.name}
                  </Link>
                </td>
                <td className="p-4">{customer.phone}</td>
                <td className="p-4">
                  {customer.deliveries?.[0]?.count ?? 0}
                </td>
                <td className="p-4">
                  {new Date(customer.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}