import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { notifyCustomer } from "@/lib/notify"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const body = await req.json()
  const { photo_url, signature_data, lat, lng } = body

  // signature_data now just needs to be present (can be "driver-confirmed" for photo-only)
  if (!signature_data) {
    return NextResponse.json(
      { error: "signature_data required" },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  // Load the current row so we keep the AI verdict + photo from the upload step
  const { data: current } = await supabase
    .from("deliveries")
    .select("id, photo_url, ai_verified, ai_confidence, ai_reason, ai_mode")
    .eq("driver_link_token", token)
    .single()
  if (!current) {
    return NextResponse.json({ error: "Delivery not found" }, { status: 404 })
  }

  const updateData: any = {
    photo_url: photo_url || current.photo_url || null,
    signature_data,
    completed_at: new Date().toISOString(),
    status: "completed",
  }

  // Store GPS if provided
  if (lat && lng) {
    updateData.delivery_lat = lat
    updateData.delivery_lng = lng
  }

  const { data: delivery, error } = await supabase
    .from("deliveries")
    .update(updateData)
    .eq("driver_link_token", token)
    .select()
    .single()

  if (error || !delivery) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    `${req.nextUrl.protocol}//${req.nextUrl.host}` ||
    "http://localhost:3000"
  const proofLink = `${baseUrl}/proof/${delivery.id}`
  const { data: profile } = await supabase
    .from("profiles")
    .select("business_name")
    .eq("id", delivery.user_id)
    .single()

  const businessName = profile?.business_name || "Your merchant"

  // Notify the customer (SMS / WhatsApp / email).
  // Messages are logged to the notifications table even in demo mode
  // (no provider keys), so the proof link is never silently lost.
  let notifications: Awaited<ReturnType<typeof notifyCustomer>> = []
  try {
    notifications = await notifyCustomer(delivery, proofLink, businessName)
  } catch (err) {
    console.error("Customer notification failed:", err)
  }

  return NextResponse.json({ ...delivery, proof_link: proofLink, notifications })
}
