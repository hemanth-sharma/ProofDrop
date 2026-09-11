"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import {
  Camera, CheckCircle, MapPin, Package, AlertCircle, Loader2,
  ShieldCheck, RefreshCw, User, ClipboardList,
} from "lucide-react"

interface DeliveryInfo {
  id: string
  customer_name: string
  customer_phone?: string
  delivery_notes: string | null
  delivery_address: string | null
  product_name?: string | null
  status: string
}

interface Verification {
  verified: boolean
  confidence: number
  reason: string
  mode: "llm" | "heuristic"
}

type Step = "info" | "verifying" | "approved" | "rejected" | "done" | "error"

const STEPS = [
  { key: "details", label: "Details", icon: ClipboardList },
  { key: "photo", label: "Photo", icon: Camera },
  { key: "ai", label: "AI Check", icon: ShieldCheck },
  { key: "done", label: "Done", icon: CheckCircle },
]

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
  const [verification, setVerification] = useState<Verification | null>(null)
  const [aiEnabled, setAiEnabled] = useState(true)
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

    // Reset any previous verdict
    setVerification(null)
    setPhotoUrl(null)

    // Show preview immediately
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    // Upload + AI verification
    setStep("verifying")
    const formData = new FormData()
    formData.set("file", file)
    try {
      const res = await fetch(`/api/driver/${token}/upload`, {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (data.error) {
        setErrorMsg(data.error)
        setStep("error")
        return
      }
      if (data.url) setPhotoUrl(data.url)
      if (typeof data.ai_enabled === "boolean") setAiEnabled(data.ai_enabled)
      if (data.verification) {
        setVerification(data.verification)
        setStep(data.verification.verified ? "approved" : "rejected")
      } else {
        setStep("approved") // AI disabled — photo-only flow
      }
    } catch {
      setErrorMsg("Upload failed. Check your connection and try again.")
      setStep("error")
    }
  }

  function retake() {
    setPhotoPreview(null)
    setPhotoUrl(null)
    setVerification(null)
    setStep("info")
    // Re-open camera immediately
    setTimeout(() => fileInputRef.current?.click(), 100)
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
            {delivery?.customer_name} will receive proof of delivery by message &amp; email.
          </p>
          <div className="mt-6 rounded-xl bg-green-50 border border-green-100 p-4 text-sm text-green-700 text-left space-y-1.5">
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 shrink-0" /> Photo captured &amp; saved</div>
            {verification?.verified && (
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 shrink-0" /> Verified by AI ({Math.round(verification.confidence * 100)}% confidence)</div>
            )}
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 shrink-0" /> Customer notified with proof link</div>
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 shrink-0" /> Record stored securely</div>
          </div>
          <p className="mt-6 text-xs text-slate-400">You can now close this tab and move on to your next delivery.</p>
        </div>
      </div>
    )
  }

  if (!delivery) return null

  const currentStepIdx =
    step === "verifying" ? 2 : step === "approved" || step === "rejected" ? 2 : photoPreview ? 1 : 0

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#1e40af] text-white px-4 py-4 safe-top">
        <div className="max-w-md mx-auto">
          <p className="text-blue-200 text-xs uppercase tracking-wider font-medium">ProofDrop · Delivery Capture</p>
          <h1 className="mt-1 text-lg font-bold">Delivery for {delivery.customer_name}</h1>
        </div>
        {/* Step indicator */}
        <div className="max-w-md mx-auto mt-3">
          <div className="flex items-center gap-1.5">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const isActive = i === currentStepIdx
              const isDone = i < currentStepIdx || (step === "approved" && s.key === "ai")
              return (
                <div key={s.key} className="flex items-center gap-1.5 flex-1">
                  <div
                    className={`flex items-center justify-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold transition-colors ${
                      isActive
                        ? "bg-white text-[#1e40af]"
                        : isDone
                          ? "bg-green-400/30 text-green-100"
                          : "bg-blue-900/40 text-blue-200"
                    }`}
                  >
                    {isDone && !isActive ? <CheckCircle className="h-3 w-3" /> : <Icon className={`h-3 w-3 ${isActive && step === "verifying" ? "animate-pulse" : ""}`} />}
                    {s.label}
                  </div>
                  {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 rounded ${isDone ? "bg-green-400/50" : "bg-blue-900/40"}`} />}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Delivery info */}
        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm space-y-2">
          {delivery.product_name && (
            <div className="flex items-start gap-2 text-sm text-slate-700">
              <Package className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <span className="font-medium">{delivery.product_name}</span>
            </div>
          )}
          {delivery.delivery_address && (
            <div className="flex items-start gap-2 text-sm text-slate-700">
              <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <span>{delivery.delivery_address}</span>
            </div>
          )}
          {delivery.customer_phone && (
            <div className="flex items-start gap-2 text-sm text-slate-700">
              <User className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <span>{delivery.customer_phone}</span>
            </div>
          )}
          {delivery.delivery_notes && (
            <div className="flex items-start gap-2 text-sm text-slate-700 border-t border-slate-100 pt-2">
              <span className="text-amber-600">📝</span>
              <span>{delivery.delivery_notes}</span>
            </div>
          )}
        </div>

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
            <div className="relative">
              <img
                src={photoPreview}
                alt="Delivery proof"
                className={`w-full object-cover max-h-72 transition-all ${step === "verifying" ? "opacity-60" : ""}`}
              />
              {step === "verifying" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/30">
                  <Loader2 className="h-10 w-10 animate-spin text-white drop-shadow" />
                  <p className="text-white font-semibold text-sm drop-shadow">AI is verifying your photo…</p>
                  <p className="text-white/80 text-xs drop-shadow">Checking it shows the delivered item</p>
                </div>
              )}
              {step !== "verifying" && (
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                    <CheckCircle className="h-4 w-4" />
                    Photo captured
                  </div>
                  <button
                    onClick={retake}
                    className="text-xs text-slate-500 hover:text-slate-700 underline"
                  >
                    Retake
                  </button>
                </div>
              )}
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

        {/* AI verification result */}
        {step === "approved" && verification?.verified && (
          <div className="rounded-xl bg-green-50 border border-green-200 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                <ShieldCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-green-800">
                  Proof approved by AI
                  <span className="ml-2 inline-flex items-center rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {Math.round(verification.confidence * 100)}% confidence
                  </span>
                </p>
                <p className="mt-1 text-sm text-green-700 leading-snug">{verification.reason}</p>
              </div>
            </div>
          </div>
        )}

        {step === "rejected" && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-bold text-red-800">Photo not accepted</p>
                <p className="mt-1 text-sm text-red-700 leading-snug">
                  {verification?.reason || "The photo doesn't clearly show a delivered item."}
                </p>
                <button
                  onClick={retake}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retake Photo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={submitting || !photoPreview || step === "verifying" || step === "rejected"}
          className={`w-full rounded-xl py-4 text-base font-bold text-white shadow-lg transition-all ${
            photoPreview && (step === "approved" || step === "info")
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
        {photoPreview && step === "approved" && !verification?.verified && aiEnabled && (
          <p className="text-center text-xs text-slate-400">Photo saved — AI verification is optional in this mode.</p>
        )}

        <p className="text-center text-xs text-slate-400 pb-4">
          Powered by ProofDrop · AI-verified delivery proof
        </p>
      </div>
    </div>
  )
}
