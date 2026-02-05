import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("deliveries")
    .select("id, customer_name, customer_phone, delivery_notes, delivery_address, status")
    .eq("driver_link_token", token)
    .single()
  if (error || !data) {
    return NextResponse.json({ error: "Delivery not found" }, { status: 404 })
  }
  if (data.status === "completed") {
    return NextResponse.json({ error: "Delivery already completed" }, { status: 400 })
  }
  return NextResponse.json(data)
}
