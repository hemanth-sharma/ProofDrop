"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Sparkles, Loader2, Play, } from "lucide-react"

export function DemoButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDemoLogin() {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { error: err } = await supabase.auth.signInWithPassword({
      email: process.env.NEXT_PUBLIC_DEMO_EMAIL!,
      password: process.env.NEXT_PUBLIC_DEMO_PASSWORD!,
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    window.location.href = "/dashboard"
  }

  return (
    <div className="flex flex-col items-center gap-1 w-full sm:w-auto">
      <button
        type="button"
        onClick={handleDemoLogin}
        disabled={loading}
        className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-2 overflow-hidden rounded-xl bg-green-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-600/30 transition-all duration-300 hover:bg-emerald-500 hover:shadow-emerald-500/50 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-75 cursor-pointer z-10"
      >
        {/* Continuous Shimmer Light Sweep Effect */}
        <span className="absolute inset-0 z-0 h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

        <span className="relative z-10 flex items-center gap-2">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : (
            <Sparkles className="h-5 w-5 text-emerald-200 animate-pulse" />
          )}
          {loading ? "Logging in..." : "Try Live Demo Instantly"}
        </span>
      </button>

      {error && (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      )}
    </div>
  )
}