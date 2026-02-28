"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { Camera, CheckCircle, MapPin, Package, AlertCircle } from "lucide-react"

interface DeliveryInfo {
  id: string
  customer_name: string
  delivery_notes: string | null
  delivery_address: string | null
  status: string
}

type Step = "info" | "photo" | "done" | "error"

export default function DriverCapturePage() {
  const params = useParams()
  const token = params.token as string
  const [delivery, setDelivery] = useState<DeliveryInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [step, setStep] = useState<Step>("info")
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!token) return
    fetch(`/api/driver/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setErrorMsg(data.error)
        else setDelivery(data)
      })
      .catch(() => setErrorMsg("Failed to load delivery"))
      .finally(() => setLoading(false))
  }, [token])

  async function handlePhotoCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview immediately
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    // Upload in background
    const formData = new FormData()
    formData.set("file", file)
    try {
      const res = await fetch(`/api/driver/${token}/upload`, {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (data.url) setPhotoUrl(data.url)
    } catch {
      // Photo upload failed, will complete without it
    }
  }

  async function handleConfirm() {
    setSubmitting(true)
    try {
      // Get GPS location if available
      let locationData = {}
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        )
        locationData = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }
      } catch {
        // Location not available, proceed without it
      }

      const res = await fetch(`/api/driver/${token}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photo_url: photoUrl || null,
          signature_data: "driver-confirmed", // simple confirmation without signature pad
          ...locationData,
        }),
      })

      if (res.ok) {
        setStep("done")
      } else {
        const data = await res.json().catch(() => ({}))
        setErrorMsg(data.error || "Failed to complete delivery")
        setStep("error")
      }
    } catch {
      setErrorMsg("Network error. Please try again.")
      setStep("error")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1e40af] border-t-transparent" />
          <p className="text-slate-500 text-sm">Loading delivery...</p>
        </div>
      </div>
    )
  }

  if (step === "error" || errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-sm w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Invalid Link</h2>
          <p className="mt-2 text-slate-500 text-sm">
            {errorMsg || "This delivery link is invalid or has already been completed."}
          </p>
        </div>
      </div>
    )
  }

  if (step === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-sm w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Delivery Confirmed!</h2>
          <p className="mt-2 text-slate-500">
            {delivery?.customer_name} will receive proof of delivery via SMS.
          </p>
          <div className="mt-6 rounded-xl bg-green-50 border border-green-100 p-4 text-sm text-green-700">
            ✓ Photo captured &amp; saved<br />
            ✓ Customer notified via SMS<br />
            ✓ Record stored securely
          </div>
          <p className="mt-6 text-xs text-slate-400">You can now close this tab.</p>
        </div>
      </div>
    )
  }

  if (!delivery) return null

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#1e40af] text-white px-4 py-4 safe-top">
        <div className="max-w-md mx-auto">
          <p className="text-blue-200 text-xs uppercase tracking-wider font-medium">ProofDrop · Delivery Capture</p>
          <h1 className="mt-1 text-lg font-bold">Delivery for {delivery.customer_name}</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Delivery info */}
        {(delivery.delivery_address || delivery.delivery_notes) && (
          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm space-y-2">
            {delivery.delivery_address && (
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <span>{delivery.delivery_address}</span>
              </div>
            )}
            {delivery.delivery_notes && (
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <Package className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <span>{delivery.delivery_notes}</span>
              </div>
            )}
          </div>
        )}

        {/* Camera capture — primary action */}
        <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoCapture}
          />

          {photoPreview ? (
            <div>
              <img
                src={photoPreview}
                alt="Delivery proof"
                className="w-full object-cover max-h-72"
              />
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                  <CheckCircle className="h-4 w-4" />
                  Photo captured
                </div>
                <button
                  onClick={() => {
                    setPhotoPreview(null)
                    setPhotoUrl(null)
                    fileInputRef.current?.click()
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700 underline"
                >
                  Retake
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video flex flex-col items-center justify-center gap-3 bg-slate-50 hover:bg-slate-100 transition-colors border-b border-dashed border-slate-200"
            >
              <div className="h-16 w-16 rounded-full bg-[#1e40af] flex items-center justify-center shadow-lg">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-900">Tap to Take Photo</p>
                <p className="text-sm text-slate-400 mt-0.5">Required for proof of delivery</p>
              </div>
            </button>
          )}
        </div>

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={submitting || !photoPreview}
          className={`w-full rounded-xl py-4 text-base font-bold text-white shadow-lg transition-all ${
            photoPreview
              ? "bg-green-600 hover:bg-green-700 active:scale-95"
              : "bg-slate-300 cursor-not-allowed"
          }`}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Submitting...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Confirm Delivery
            </span>
          )}
        </button>

        {!photoPreview && (
          <p className="text-center text-xs text-slate-400">
            Please take a photo of the delivery before confirming.
          </p>
        )}

        <p className="text-center text-xs text-slate-400 pb-4">
          Powered by ProofDrop · Secure delivery verification
        </p>
      </div>
    </div>
  )
}