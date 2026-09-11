import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { nanoid } from "nanoid"
import { buildDriverMessage, buildCustomerMessage } from "@/lib/notify"

/**
 * POST /api/demo/seed   { action: "seed" | "reset" }
 *
 * Loads (or resets) a realistic demo dataset for the logged-in account so
 * the whole product story is visible in one click:
 * drivers, customers, 30 days of deliveries with AI-verified photo proof,
 * and the notification outbox (recorded as "simulated" sends).
 *
 * action "seed"  → only seeds when the account has no deliveries yet
 * action "reset" → wipes the account's demo data and reseeds fresh
 */

// Deterministic PRNG so reseeding produces a stable, curated dataset
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const DEMO_PHOTOS = [
  "proof-parcel-porch.jpg",
  "proof-parcel-dropbox.jpg",
  "proof-parcel-doormat.jpg",
  "proof-parcel-stack.jpg",
  "proof-bouquet-doorstep.jpg",
  "proof-bouquet-doorhang.jpg",
]

const AI_REASONS = [
  "Photo shows a parcel resting on the doorstep of a residential entrance — matches the delivery location.",
  "Package is clearly visible in front of the customer's door with legible surroundings.",
  "Delivered item photographed at a residential porch; image is sharp and unmodified.",
  "Bouquet left at the door as requested in the delivery notes; scene matches a doorstep drop-off.",
  "Parcel photographed at the delivery address with sufficient detail and lighting.",
]

const DRIVERS = [
  { full_name: "Marco Rivera", phone: "+15550101", email: "marco@torikoflowers.demo", vehicle_type: "van" },
  { full_name: "Jenna Okafor", phone: "+15550102", email: "jenna@torikoflowers.demo", vehicle_type: "bike" },
  { full_name: "Liam Murphy", phone: "+15550103", email: null, vehicle_type: "car" },
  { full_name: "Aisha Khan", phone: "+15550104", email: null, vehicle_type: "van" },
]

const CUSTOMERS = [
  { name: "Sarah Mitchell", phone: "+15551201", email: "sarah.m@example.com", address: "42 Maple Street, Springfield" },
  { name: "Emma Thompson", phone: "+15551202", email: "emma.t@example.com", address: "12 Oak Avenue, Springfield" },
  { name: "James Carter", phone: "+15551203", email: null, address: "8 Birch Lane, Springfield" },
  { name: "Olivia Bennett", phone: "+15551204", email: "olivia.b@example.com", address: "301 Cedar Court, Springfield" },
  { name: "Noah Patel", phone: "+15551205", email: null, address: "77 Elm Drive, Springfield" },
  { name: "Mia Rodriguez", phone: "+15551206", email: "mia.r@example.com", address: "19 Willow Way, Springfield" },
  { name: "Lucas Weber", phone: "+15551207", email: null, address: "5 Chestnut Row, Springfield" },
  { name: "Ava Novak", phone: "+15551208", email: "ava.n@example.com", address: "640 Pine Terrace, Springfield" },
  { name: "Ethan Kim", phone: "+15551209", email: null, address: "23 Aspen Close, Springfield" },
  { name: "Chloe Dubois", phone: "+15551210", email: "chloe.d@example.com", address: "88 Magnolia Blvd, Springfield" },
]

const PRODUCTS = [
  "Spring Sunrise Bouquet",
  "Rose Elegance Arrangement",
  "Potted Orchid — White",
  "Tulip Bundle — Mixed",
  "Lavender Basket",
  "Peony Box — Blush",
  "Sunflower Bunch",
  "Fern & Eucalyptus Trio",
  "Gift Wrapped Parcel",
  "Anniversary Vase Set",
]

const NOTES = [
  "Gate code 1234 — please leave behind the planter.",
  "Ring the bell twice, then leave at the door.",
  "Fragile — keep upright.",
  "Leave with the concierge if not home.",
  "Birthday gift — do not leave in the sun.",
  null,
  null,
]

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Please log in first." }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const action = body?.action === "reset" ? "reset" : "seed"

  const admin = createAdminClient()
  const rand = mulberry32(42)
  const now = Date.now()
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`

  // ---------------------------------------------------------------- resets
  if (action === "reset") {
    // notifications cascade-delete with deliveries
    await admin.from("deliveries").delete().eq("user_id", user.id)
    await admin.from("customers").delete().eq("user_id", user.id)
    await admin.from("drivers").delete().eq("user_id", user.id)
  } else {
    const { count } = await admin
      .from("deliveries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
    if ((count ?? 0) > 0) {
      return NextResponse.json({
        seeded: false,
        message: "This account already has deliveries. Use action=reset to reload demo data.",
      })
    }
  }

  // ------------------------------------------------------------ brand the demo account
  const { data: profile } = await admin.from("profiles").select("business_name").eq("id", user.id).single()
  if (profile && !profile.business_name) {
    await admin.from("profiles").update({ business_name: "Toriko Flowers" }).eq("id", user.id)
  }
  const businessName = profile?.business_name || "Toriko Flowers"

  // ---------------------------------------------------------------- drivers
  const { data: driverRows, error: driverErr } = await admin
    .from("drivers")
    .insert(DRIVERS.map((d) => ({ ...d, user_id: user.id, status: "active" })))
    .select("id, phone, full_name")
  if (driverErr || !driverRows) {
    return NextResponse.json({ error: driverErr?.message || "Failed to create drivers" }, { status: 500 })
  }

  // ---------------------------------------------------------------- customers
  const { data: customerRows, error: customerErr } = await admin
    .from("customers")
    .insert(CUSTOMERS.map((c) => ({ ...c, user_id: user.id })))
    .select("id, name, phone, email, address")
  if (customerErr || !customerRows) {
    return NextResponse.json({ error: customerErr?.message || "Failed to create customers" }, { status: 500 })
  }

  // ---------------------------------------------------------------- deliveries
  type SeedDelivery = {
    user_id: string
    customer_id: string
    driver_id: string
    customer_name: string
    customer_phone: string
    customer_email: string | null
    delivery_notes: string | null
    delivery_address: string
    driver_link_token: string
    driver_phone: string
    product_name: string
    photo_url: string | null
    signature_data: string | null
    completed_at: string | null
    status: string
    created_at: string
    ai_verified: boolean | null
    ai_confidence: number | null
    ai_reason: string | null
    ai_mode: string | null
    ai_verified_at: string | null
    delivery_lat: number | null
    delivery_lng: number | null
    driver_name?: string
  }

  const deliveries: SeedDelivery[] = []
  let photoIdx = 0

  const makeDelivery = (daysAgo: number, hour: number, status: "completed" | "pending" | "failed"): SeedDelivery => {
    const customer = customerRows[Math.floor(rand() * customerRows.length)]
    const driver = driverRows[Math.floor(rand() * driverRows.length)]
    const created = new Date(now - daysAgo * 86400000)
    created.setHours(hour, Math.floor(rand() * 59), 0, 0)

    const d: SeedDelivery = {
      user_id: user.id,
      customer_id: customer.id,
      driver_id: driver.id,
      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_email: customer.email,
      delivery_notes: NOTES[Math.floor(rand() * NOTES.length)],
      delivery_address: customer.address,
      driver_link_token: nanoid(24),
      driver_phone: driver.phone,
      product_name: PRODUCTS[Math.floor(rand() * PRODUCTS.length)],
      photo_url: null,
      signature_data: null,
      completed_at: null,
      status,
      created_at: created.toISOString(),
      ai_verified: null,
      ai_confidence: null,
      ai_reason: null,
      ai_mode: null,
      ai_verified_at: null,
      delivery_lat: null,
      delivery_lng: null,
      driver_name: (driver as any).full_name,
    }

    if (status === "completed") {
      const minutes = 18 + Math.floor(rand() * 55)
      const completed = new Date(created.getTime() + minutes * 60000)
      d.photo_url = `${baseUrl}/demo/${DEMO_PHOTOS[photoIdx++ % DEMO_PHOTOS.length]}`
      d.signature_data = "driver-confirmed"
      d.completed_at = completed.toISOString()
      d.ai_verified = true
      d.ai_confidence = Math.round((0.88 + rand() * 0.1) * 100) / 100
      d.ai_reason = AI_REASONS[Math.floor(rand() * AI_REASONS.length)]
      d.ai_mode = "llm"
      d.ai_verified_at = new Date(completed.getTime() - 60000).toISOString()
      // GPS around Springfield, MA with jitter
      d.delivery_lat = Math.round((42.1014 + (rand() - 0.5) * 0.06) * 10000) / 10000
      d.delivery_lng = Math.round((-71.8022 + (rand() - 0.5) * 0.06) * 10000) / 10000
    }

    return d
  }

  // 21 completed deliveries across the last 30 days (1–3 per day)
  for (let day = 30; day >= 1; day--) {
    const perDay = 1 + Math.floor(rand() * 2.4)
    for (let k = 0; k < perDay && deliveries.length < 21; k++) {
      deliveries.push(makeDelivery(day, 9 + Math.floor(rand() * 9), "completed"))
    }
  }
  // 3 more completed this morning (today's early runs)
  for (let i = 0; i < 3; i++) deliveries.push(makeDelivery(0, 9 + i, "completed"))
  // 6 pending (today / yesterday) + 3 failed (this week)
  for (let i = 0; i < 6; i++) deliveries.push(makeDelivery(i === 0 ? 0 : 1, 8 + Math.floor(rand() * 10), "pending"))
  for (let i = 0; i < 3; i++) deliveries.push(makeDelivery(1 + Math.floor(rand() * 4), 10 + Math.floor(rand() * 8), "failed"))

  const { data: deliveryRows, error: deliveryErr } = await admin
    .from("deliveries")
    .insert(
      deliveries.map(({ driver_name: _dn, ...d }) => d)
    )
    .select("id, customer_name, customer_phone, customer_email, delivery_address, delivery_notes, product_name, driver_phone, photo_url, completed_at, status, created_at")
  if (deliveryErr || !deliveryRows) {
    return NextResponse.json({ error: deliveryErr?.message || "Failed to create deliveries" }, { status: 500 })
  }

  // ---------------------------------------------------------------- notifications
  type SeedNotification = {
    delivery_id: string
    type: string
    channel: string
    recipient: string
    content: string
    status: string
    sent_at: string
  }
  const notifications: SeedNotification[] = []

  deliveryRows.forEach((d) => {
    const driverText = buildDriverMessage(d, `${baseUrl}/driver/…`)
    notifications.push({
      delivery_id: d.id,
      type: "driver",
      channel: "whatsapp",
      recipient: d.driver_phone || "+15550101",
      content: driverText,
      status: "simulated",
      sent_at: new Date(new Date(d.created_at).getTime() + 60000).toISOString(),
    })
    if (d.status === "completed" && d.completed_at) {
      const proofLink = `${baseUrl}/proof/${d.id}`
      const customerText = buildCustomerMessage({
        business_name: businessName,
        customer_name: d.customer_name,
        proof_link: proofLink,
      })
      notifications.push({
        delivery_id: d.id,
        type: "customer",
        channel: "whatsapp",
        recipient: d.customer_phone,
        content: customerText,
        status: "simulated",
        sent_at: new Date(new Date(d.completed_at).getTime() + 60000).toISOString(),
      })
      if (d.customer_email) {
        notifications.push({
          delivery_id: d.id,
          type: "customer",
          channel: "email",
          recipient: d.customer_email,
          content: `Your delivery from ${businessName} is confirmed ✅\n\n${proofLink}`,
          status: "simulated",
          sent_at: new Date(new Date(d.completed_at).getTime() + 90000).toISOString(),
        })
      }
    }
  })

  // Insert in batches (Supabase REST payload limits)
  for (let i = 0; i < notifications.length; i += 50) {
    await admin.from("notifications").insert(notifications.slice(i, i + 50))
  }

  return NextResponse.json({
    seeded: true,
    action,
    counts: {
      drivers: driverRows.length,
      customers: customerRows.length,
      deliveries: deliveryRows.length,
      notifications: notifications.length,
    },
  })
}
