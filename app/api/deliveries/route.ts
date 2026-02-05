import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { nanoid } from "nanoid"
import { sendDriverSMS } from "@/lib/sms"

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  // Login validation commented for testing without login
  // if (authError || !user) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  // }
  if (!user) {
    return NextResponse.json([])
  }
  const { data, error } = await supabase
    .from("deliveries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  // Login validation commented for testing without login
  // if (authError || !user) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  // }
  const userId = user?.id ?? process.env.TEST_USER_ID
  if (!userId) {
    return NextResponse.json(
      { error: "Not logged in. Set TEST_USER_ID in .env to a valid Supabase user UUID for testing." },
      { status: 401 }
    )
  }
  const body = await req.json()
  const {
    customer_name,
    customer_phone,
    customer_email,
    delivery_notes,
    delivery_address,
    driver_phone,
  } = body
  if (!customer_name || !customer_phone) {
    return NextResponse.json(
      { error: "customer_name and customer_phone required" },
      { status: 400 }
    )
  }
  const driver_link_token = nanoid(24)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const { data: delivery, error } = await supabase
    .from("deliveries")
    .insert({
      user_id: userId,
      customer_name,
      customer_phone,
      customer_email: customer_email || null,
      delivery_notes: delivery_notes || null,
      delivery_address: delivery_address || null,
      driver_link_token,
      driver_phone: driver_phone || null,
    })
    .select()
    .single()
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  const driverLink = `${baseUrl}/driver/${driver_link_token}`
  const smsError = await sendDriverSMS({
    customer_name: delivery.customer_name,
    customer_phone: delivery.customer_phone,
    driver_link: driverLink,
  })
  if (smsError) {
    console.error("SMS send failed:", smsError)
    // Still return 200; delivery was created. Optionally update status to 'failed' for notification.
  }
  return NextResponse.json(delivery)
}
