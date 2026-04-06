import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const includeDeliveries = searchParams.get("include_deliveries") === "true"

  const { data, error } = await supabase
    .from("customers")
    .select(
      includeDeliveries
        ? `
          *,
          deliveries (
            id,
            status,
            created_at
          )
        `
        : `
          *,
          deliveries(count)
        `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}