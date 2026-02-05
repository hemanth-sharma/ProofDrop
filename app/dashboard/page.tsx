import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatDate } from "@/lib/utils"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // Login validation commented for testing without login
  // if (!user) return null
  const { data: deliveriesData } = user
    ? await supabase
        .from("deliveries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
    : { data: null }
  const deliveries = deliveriesData ?? []

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Deliveries</h1>
          <p className="text-muted-foreground">Create and track proof-of-delivery links</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/new">Send delivery link</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent deliveries</CardTitle>
          <CardDescription>Links sent to drivers; proof appears when they complete</CardDescription>
        </CardHeader>
        <CardContent>
          {!deliveries?.length ? (
            <p className="text-muted-foreground py-8 text-center">
              No deliveries yet. Click &quot;Send delivery link&quot; to create one.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 font-medium">Customer</th>
                    <th className="text-left py-3 font-medium">Phone</th>
                    <th className="text-left py-3 font-medium">Status</th>
                    <th className="text-left py-3 font-medium">Created</th>
                    <th className="text-right py-3 font-medium">Proof</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((d) => (
                    <tr key={d.id} className="border-b last:border-0">
                      <td className="py-3">{d.customer_name}</td>
                      <td className="py-3">{d.customer_phone}</td>
                      <td className="py-3">
                        <span
                          className={
                            d.status === "completed"
                              ? "text-green-600"
                              : d.status === "failed"
                                ? "text-destructive"
                                : "text-amber-600"
                          }
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {formatDate(d.created_at)}
                      </td>
                      <td className="py-3 text-right">
                        {d.status === "completed" ? (
                          <Link
                            href={`/proof/${d.id}`}
                            className="text-primary hover:underline"
                          >
                            View
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
