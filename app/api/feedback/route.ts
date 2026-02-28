import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, phone, feedback } = body

  if (!email || !feedback) {
    return NextResponse.json({ error: "email and feedback are required" }, { status: 400 })
  }

  // Try to get user id if logged in (optional)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()
  const { error } = await admin
    .from("feedback")
    .insert({
      user_id: user?.id || null,
      email,
      phone: phone || null,
      feedback,
    })

  if (error) {
    // If table doesn't exist yet, still return success (graceful)
    console.error("Feedback insert error:", error)
    // Don't fail the user — feedback stored in logs at minimum
  }

  return NextResponse.json({ success: true })
}