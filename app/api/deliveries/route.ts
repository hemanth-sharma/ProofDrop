import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { nanoid } from "nanoid"
import { notifyDriver } from "@/lib/notify"

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
    driver_id,
    driver_phone,
    product_name,
  } = body

  if (!customer_name || !customer_phone) {
    return NextResponse.json(
      { error: "customer_name and customer_phone required" },
      { status: 400 }
    )
  }

  /*
  ============================================
  1️⃣  FIND OR CREATE CUSTOMER
  ============================================
  */

  // Normalize phone (important to avoid duplicates)
  const normalizedPhone = customer_phone.replace(/\s+/g, "")

  let customerId: string

  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("id")
    .eq("user_id", userId)
    .eq("phone", normalizedPhone)
    .maybeSingle()

  if (existingCustomer) {
    customerId = existingCustomer.id
  } else {
    const { data: newCustomer, error: customerError } = await supabase
      .from("customers")
      .insert({
        user_id: userId,
        name: customer_name,
        phone: normalizedPhone,
        email: customer_email || null,
        address: delivery_address || null,
      })
      .select()
      .single()

    if (customerError) {
      return NextResponse.json(
        { error: customerError.message },
        { status: 500 }
      )
    }

    customerId = newCustomer.id
  }

  /*
  ============================================
  2️⃣  CREATE DELIVERY (LINKED TO CUSTOMER)
  ============================================
  */

  const driver_link_token = nanoid(24)
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    `${req.nextUrl.protocol}//${req.nextUrl.host}` ||
    "http://localhost:3000"

  // Resolve driver details (phone / email) when a driver record is assigned
  let resolvedDriverPhone = driver_phone || null
  let resolvedDriverEmail: string | null = null
  if (driver_id) {
    const { data: driverRow } = await supabase
      .from("drivers")
      .select("phone, email")
      .eq("id", driver_id)
      .eq("user_id", userId)
      .maybeSingle()
    if (driverRow) {
      resolvedDriverPhone = resolvedDriverPhone || driverRow.phone
      resolvedDriverEmail = driverRow.email || null
    }
  }

  const { data: delivery, error } = await supabase
    .from("deliveries")
    .insert({
      user_id: userId,
      customer_id: customerId, // ✅ LINKED
      customer_name,
      customer_phone: normalizedPhone,
      customer_email: customer_email || null,
      delivery_notes: delivery_notes || null,
      delivery_address: delivery_address || null,
      driver_id: driver_id || null,
      driver_link_token,
      driver_phone: resolvedDriverPhone,
      product_name: product_name || null,
      status: "pending",
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  /*
  ============================================
  3️⃣  NOTIFY THE DRIVER (SMS / WhatsApp / email)
      — message is logged to the notifications
        table even when providers are not set
        (demo mode), so nothing is silently lost.
  ============================================
  */

  const driverLink = `${baseUrl}/driver/${driver_link_token}`

  console.log("Driver link: ", driverLink)

  let notifications: Awaited<ReturnType<typeof notifyDriver>> = []
  try {
    notifications = await notifyDriver(
      { ...delivery, driver_phone: resolvedDriverPhone },
      driverLink,
      resolvedDriverEmail
    )
  } catch (err) {
    // Notifications must never block delivery creation
    console.error("Driver notification failed:", err)
  }

  return NextResponse.json({
    ...delivery,
    driver_link: driverLink,
    notifications,
  })
}