import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

const BUCKET = "delivery-photos"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const supabase = createAdminClient()
  const { data: delivery } = await supabase
    .from("deliveries")
    .select("id")
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
  const ext = file.name.split(".").pop() || "jpg"
  const path = `${token}/${Date.now()}.${ext}`
  const buf = Buffer.from(await file.arrayBuffer())
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
  return NextResponse.json({ url: urlData.publicUrl })
}
