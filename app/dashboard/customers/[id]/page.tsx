import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

interface PageProps {
  params: {
    id: string
  }
}

export default async function CustomerDetails({ params }: PageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (!customer) redirect("/dashboard/customers")

  const { data: deliveries } = await supabase
    .from("deliveries")
    .select("*")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false })

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">{customer.name}</h1>
        <p className="text-gray-500 mt-1">
          Customer since{" "}
          {new Date(customer.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-2 text-sm">
        <p><strong>Email:</strong> {customer.email || "—"}</p>
        <p><strong>Phone:</strong> {customer.phone}</p>
        <p><strong>Address:</strong> {customer.address || "—"}</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Deliveries</h2>

        <div className="bg-white rounded-xl border">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="p-4 text-left">Delivery</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {deliveries?.map((delivery) => (
                <tr key={delivery.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <Link
                      href={`/dashboard/deliveries/${delivery.id}`}
                      className="text-blue-600 font-medium"
                    >
                      {delivery.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="p-4 capitalize">{delivery.status}</td>
                  <td className="p-4">
                    {new Date(delivery.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {deliveries?.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-gray-500">
                    No deliveries yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}