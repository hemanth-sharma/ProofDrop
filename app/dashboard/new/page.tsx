"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function NewDeliveryPage() {
  const router = useRouter()
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [deliveryNotes, setDeliveryNotes] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await fetch("/api/deliveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || undefined,
        delivery_notes: deliveryNotes || undefined,
        delivery_address: deliveryAddress || undefined,
      }),
    })
    const data = await res.json().catch(() => ({}))
    setLoading(false)
    if (!res.ok) {
      setError(data.error || "Failed to create delivery")
      return
    }
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="container mx-auto max-w-lg py-8 px-4">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to dashboard
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Create delivery</CardTitle>
          <CardDescription>
            Enter customer details. We&apos;ll send an SMS link to the driver (customer phone).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer name *</Label>
              <Input
                id="customer_name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Jane Smith"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_phone">Customer phone *</Label>
              <Input
                id="customer_phone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+1 555 123 4567"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_email">Customer email (optional)</Label>
              <Input
                id="customer_email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="jane@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery_address">Delivery address (optional)</Label>
              <Input
                id="delivery_address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="123 Main St"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery_notes">Delivery notes (optional)</Label>
              <Input
                id="delivery_notes"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Leave at door"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending link…" : "Send link to driver"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
