import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendCustomerSMS } from "@/lib/sms"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const body = await req.json()
  const { photo_url, signature_data } = body
  if (!signature_data) {
    return NextResponse.json(
      { error: "signature_data required" },
      { status: 400 }
    )
  }
  const supabase = createAdminClient()
  const { data: delivery, error } = await supabase
    .from("deliveries")
    .update({
      photo_url: photo_url || null,
      signature_data,
      completed_at: new Date().toISOString(),
      status: "completed",
    })
    .eq("driver_link_token", token)
    .select()
    .single()
  if (error || !delivery) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const proofLink = `${baseUrl}/proof/${delivery.id}`
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from("profiles")
    .select("business_name")
    .eq("id", delivery.user_id)
    .single()
  const businessName = profile?.business_name || "Your merchant"
  const smsErr = await sendCustomerSMS({
    business_name: businessName,
    customer_phone: delivery.customer_phone,
    proof_link: proofLink,
  })
  if (smsErr) {
    console.error("Customer SMS failed:", smsErr)
  }
  return NextResponse.json(delivery)
}
