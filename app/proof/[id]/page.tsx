import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ProofPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()
  const { data: delivery, error } = await supabase
    .from("deliveries")
    .select("*")
    .eq("id", id)
    .eq("status", "completed")
    .single()
  if (error || !delivery) {
    notFound()
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("business_name, business_logo_url")
    .eq("id", delivery.user_id)
    .single()

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            {profile?.business_logo_url && (
              <img
                src={profile.business_logo_url}
                alt={profile.business_name || ""}
                className="h-12 mx-auto mb-2 object-contain"
              />
            )}
            <CardTitle>
              Proof of delivery
            </CardTitle>
            <CardDescription>
              {profile?.business_name || "Merchant"}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Delivery to {delivery.customer_name}</CardTitle>
            <CardContent className="pt-0 space-y-4">
              {delivery.completed_at && (
                <p className="text-sm text-muted-foreground">
                  Completed {formatDate(delivery.completed_at)}
                </p>
              )}
              {delivery.delivery_notes && (
                <p className="text-sm"><span className="font-medium">Notes:</span> {delivery.delivery_notes}</p>
              )}
              {delivery.delivery_address && (
                <p className="text-sm"><span className="font-medium">Address:</span> {delivery.delivery_address}</p>
              )}
            </CardContent>
          </CardHeader>
        </Card>
        {delivery.photo_url && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Photo</CardTitle>
              <CardContent className="pt-0">
                <img
                  src={delivery.photo_url}
                  alt="Delivery"
                  className="rounded-lg w-full object-contain max-h-96"
                />
              </CardContent>
            </CardHeader>
          </Card>
        )}
        {delivery.signature_data && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Signature</CardTitle>
              <CardContent className="pt-0">
                <img
                  src={delivery.signature_data}
                  alt="Signature"
                  className="rounded-lg border bg-white max-h-32 object-contain"
                />
              </CardContent>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  )
}
