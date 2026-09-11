import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/notifications?delivery_id=<uuid>&limit=20
 * Returns the notification outbox for the logged-in user, newest first.
 * RLS on the notifications table already scopes reads to deliveries owned
 * by the requesting user.
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const deliveryId = req.nextUrl.searchParams.get("delivery_id")
  const limit = Math.min(
    parseInt(req.nextUrl.searchParams.get("limit") || "50", 10) || 50,
    100
  )

  let query = supabase
    .from("notifications")
    .select("*, deliveries!inner(user_id)")
    .eq("deliveries.user_id", user.id)
    .order("sent_at", { ascending: false })
    .limit(limit)

  if (deliveryId) {
    query = query.eq("delivery_id", deliveryId)
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Flatten out the join column — the client only needs the notification rows
  const rows = (data || []).map(({ deliveries: _d, ...row }: any) => row)
  return NextResponse.json(rows)
}
