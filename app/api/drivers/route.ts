import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json([])
  }
  const { data, error } = await supabase
    .from("drivers")
    .select("*")
    .eq("user_id", user.id)
    .order("full_name", { ascending: true })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const userId = user?.id ?? process.env.TEST_USER_ID
  if (!userId) {
    return NextResponse.json(
      {
        error:
          "Not logged in. Set TEST_USER_ID in .env to a valid Supabase user UUID for testing.",
      },
      { status: 401 },
    )
  }

  const body = await req.json()
  const { full_name, email, phone, vehicle_type } = body
  if (!full_name || !phone) {
    return NextResponse.json(
      { error: "full_name and phone are required" },
      { status: 400 },
    )
  }

  const { data, error } = await supabase
    .from("drivers")
    .insert({
      user_id: userId,
      full_name,
      email: email || null,
      phone,
      vehicle_type: vehicle_type || null,
    })
    .select()
    .single()
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

