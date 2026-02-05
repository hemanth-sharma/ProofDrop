"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SignaturePad, type SignaturePadRef } from "@/components/SignaturePad"

interface DeliveryInfo {
  id: string
  customer_name: string
  delivery_notes: string | null
  delivery_address: string | null
  status: string
}

export default function DriverCapturePage() {
  const params = useParams()
  const token = params.token as string
  const [delivery, setDelivery] = useState<DeliveryInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const signatureRef = useRef<SignaturePadRef>(null)

  useEffect(() => {
    if (!token) return
    fetch(`/api/driver/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setDelivery(data)
        }
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false))
  }, [token])

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.set("file", file)
    const res = await fetch(`/api/driver/${token}/upload`, {
      method: "POST",
      body: formData,
    })
    const data = await res.json()
    if (data.url) setPhotoUrl(data.url)
  }

  async function handleConfirm() {
    const signatureData = signatureRef.current?.getDataURL() ?? null
    if (!signatureData) {
      alert("Please sign above first.")
      return
    }
    setSubmitting(true)
    const res = await fetch(`/api/driver/${token}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        photo_url: photoUrl,
        signature_data: signatureData,
      }),
    })
    setSubmitting(false)
    if (res.ok) {
      setDone(true)
    } else {
      const data = await res.json().catch(() => ({}))
      alert(data.error || "Failed to complete")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    )
  }
  if (error || !delivery) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
        <Card className="max-w-sm w-full">
          <CardHeader>
            <CardTitle>Invalid link</CardTitle>
            <CardContent className="pt-0">
              <p className="text-muted-foreground">{error || "This delivery link is invalid or already completed."}</p>
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    )
  }
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
        <Card className="max-w-sm w-full text-center">
          <CardHeader>
            <CardTitle className="text-green-600">Delivery confirmed</CardTitle>
            <CardContent className="pt-0">
              <p className="text-muted-foreground">The customer will receive proof of delivery shortly.</p>
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 pb-8 bg-slate-100">
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Delivery for {delivery.customer_name}</CardTitle>
            {delivery.delivery_notes && (
              <p className="text-sm text-muted-foreground">Notes: {delivery.delivery_notes}</p>
            )}
            {delivery.delivery_address && (
              <p className="text-sm text-muted-foreground">Address: {delivery.delivery_address}</p>
            )}
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Photo (optional)</CardTitle>
            <CardContent className="pt-0 space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoChange}
              />
              {photoUrl ? (
                <div className="space-y-2">
                  <img src={photoUrl} alt="Delivery" className="rounded-lg w-full max-h-48 object-cover" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change photo
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Take photo
                </Button>
              )}
            </CardContent>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Signature *</CardTitle>
            <CardContent className="pt-0">
              <SignaturePad ref={signatureRef} />
            </CardContent>
          </CardHeader>
        </Card>

        <Button
          className="w-full"
          size="lg"
          onClick={handleConfirm}
          disabled={submitting}
        >
          {submitting ? "Submitting…" : "Confirm delivery"}
        </Button>
      </div>
    </div>
  )
}
