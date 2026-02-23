import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DeliveryDetails({ params }: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: delivery } = await supabase
    .from("deliveries")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (!delivery) redirect("/dashboard")

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Delivery Details</h1>

      <div className="space-y-2 text-sm">
        <p><strong>Status:</strong> {delivery.status}</p>
        <p><strong>Customer:</strong> {delivery.customer_name}</p>
        <p><strong>Phone:</strong> {delivery.customer_phone}</p>
        <p><strong>Address:</strong> {delivery.delivery_address}</p>
        <p><strong>Notes:</strong> {delivery.delivery_notes}</p>
        <p><strong>Driver Phone:</strong> {delivery.driver_phone}</p>
        <p><strong>Created:</strong> {new Date(delivery.created_at).toLocaleString()}</p>
      </div>
    </div>
  )
}