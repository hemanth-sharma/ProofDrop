import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const BUCKET = "delivery-photos"

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // Login validation commented for testing without login
  // if (!user) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  // }
  const uploaderId = user?.id ?? process.env.TEST_USER_ID ?? "anonymous"
  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 })
  }
  const ext = file.name.split(".").pop() || "jpg"
  const name = `${uploaderId}/${Date.now()}.${ext}`
  const buf = Buffer.from(await file.arrayBuffer())
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(name, buf, {
      contentType: file.type,
      upsert: false,
    })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path)
  return NextResponse.json({ url: urlData.publicUrl })
}
