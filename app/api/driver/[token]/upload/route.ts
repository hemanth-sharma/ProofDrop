import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { verifyDeliveryPhoto, resolveMode } from "@/lib/ai"

const BUCKET = "delivery-photos"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const supabase = createAdminClient()
  const { data: delivery } = await supabase
    .from("deliveries")
    .select("id, customer_name, delivery_notes, delivery_address, product_name")
    .eq("driver_link_token", token)
    .eq("status", "pending")
    .single()
  if (!delivery) {
    return NextResponse.json({ error: "Invalid or completed delivery" }, { status: 400 })
  }
  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 })
  }

  const buf = Buffer.from(await file.arrayBuffer())

  // 1) Store the photo
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase()
  const path = `${token}/${Date.now()}.${ext}`
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buf, {
      contentType: file.type,
      upsert: false,
    })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path)

  // 2) AI verification — is this a real photo of a delivered item?
  //    Falls back to built-in offline checks when no AI key is configured,
  //    so the flow always works (demo-friendly).
  let verification
  try {
    verification = await verifyDeliveryPhoto(buf, file.type || "image/jpeg", {
      customerName: delivery.customer_name,
      address: delivery.delivery_address,
      notes: delivery.delivery_notes,
      productName: delivery.product_name,
    })
  } catch (err) {
    console.error("[upload] AI verification error:", err)
    verification = {
      verified: true,
      confidence: 0.5,
      reason: "Verification service error — photo stored, please double-check it.",
      mode: "heuristic" as const,
    }
  }

  // 3) Persist the verdict with the delivery
  await supabase
    .from("deliveries")
    .update({
      photo_url: urlData.publicUrl,
      ai_verified: verification.verified,
      ai_confidence: verification.confidence,
      ai_reason: verification.reason,
      ai_mode: verification.mode,
      ai_verified_at: new Date().toISOString(),
    })
    .eq("id", delivery.id)

  return NextResponse.json({
    url: urlData.publicUrl,
    verification,
    ai_enabled: resolveMode() !== "off",
  })
}
