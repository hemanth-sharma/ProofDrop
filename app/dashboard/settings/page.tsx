"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  User, Building, Phone, Mail, LogOut, Moon, Sun,
  Shield, Bell, CreditCard, ChevronRight, Check, Zap
} from "lucide-react"

interface Profile {
  id: string
  email: string
  business_name: string
  phone?: string
  business_logo_url?: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [businessName, setBusinessName] = useState("")
  const [phone, setPhone] = useState("")
  const [darkMode, setDarkMode] = useState(false)
  const [activeSection, setActiveSection] = useState("profile")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push("/login"); return }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      if (data) {
        setProfile(data)
        setBusinessName(data.business_name || "")
        setPhone(data.phone || "")
      }
      setLoading(false)
    })
  }, [])

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { error: err } = await supabase
      .from("profiles")
      .update({ business_name: businessName, phone, updated_at: new Date().toISOString() })
      .eq("id", profile.id)
    setSaving(false)
    if (err) { setError(err.message); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const navItems = [
    { id: "profile", label: "Profile & Business", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "billing", label: "Billing & Plan", icon: CreditCard },
    { id: "security", label: "Security", icon: Shield },
  ]

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1e40af] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 bg-slate-50 min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account and business preferences</p>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        {/* Sidebar nav */}
        <div className="lg:w-52 shrink-0">
          <nav className="space-y-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left ${
                  activeSection === id
                    ? "bg-[#1e40af] text-white"
                    : "text-slate-600 hover:bg-white hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            ))}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign Out
            </button>
          </nav>
        </div>

        {/* Content area */}
        <div className="flex-1 space-y-6">
          {/* Profile section */}
          {activeSection === "profile" && (
            <>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900 mb-5">Business Information</h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">Business Name</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="My Business"
                        className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={profile?.email || ""}
                        disabled
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-400 cursor-not-allowed"
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#1e40af]"
                      />
                    </div>
                  </div>
                </div>

                {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

                <div className="mt-5 flex items-center gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#1e40af] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8] transition-colors disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Saving...
                      </>
                    ) : saved ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Saved!
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </div>

              {/* Appearance */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900 mb-2">Appearance</h2>
                <p className="text-sm text-slate-500 mb-5">Customize how the dashboard looks</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {darkMode ? <Moon className="h-5 w-5 text-slate-600" /> : <Sun className="h-5 w-5 text-amber-500" />}
                    <div>
                      <p className="text-sm font-medium text-slate-900">Dark Mode</p>
                      <p className="text-xs text-slate-500">Switch between light and dark theme</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      darkMode ? "bg-[#1e40af]" : "bg-slate-200"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      darkMode ? "translate-x-6" : "translate-x-1"
                    }`} />
                  </button>
                </div>
                <p className="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  Dark mode is coming soon — stay tuned!
                </p>
              </div>
            </>
          )}

          {/* Notifications section */}
          {activeSection === "notifications" && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-5">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: "Delivery completed", desc: "Get notified when a driver completes a delivery", default: true },
                  { label: "Delivery failed", desc: "Get notified when a delivery attempt fails", default: true },
                  { label: "New customer", desc: "Get notified when a new customer is added", default: false },
                  { label: "Weekly summary", desc: "Receive a weekly digest of your delivery stats", default: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-start justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    <div className="shrink-0 ml-4">
                      <div className={`relative inline-flex h-5 w-10 items-center rounded-full ${item.default ? "bg-[#1e40af]" : "bg-slate-200"}`}>
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${item.default ? "translate-x-5" : "translate-x-1"}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-400">Notification settings are coming soon.</p>
            </div>
          )}

          {/* Billing section */}
          {activeSection === "billing" && (
            <div className="space-y-6">
              {/* Current plan */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Current Plan</h2>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-700">
                        Free Trial
                      </span>
                      <span className="text-sm text-slate-500">· 14 days remaining</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { label: "Deliveries this month", value: "—" },
                    { label: "SMS sent", value: "—" },
                    { label: "Storage used", value: "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upgrade card */}
              <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-[#1e40af] to-[#3b82f6] p-6 text-white shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Upgrade to Pro</h3>
                    <p className="text-blue-100 text-sm mt-1">Unlimited deliveries, custom branding, PDF reports, and more.</p>
                    <p className="mt-3 text-2xl font-bold">$29 <span className="text-base font-normal text-blue-200">/month</span></p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {["Unlimited delivery proofs", "Custom branding & logo", "PDF export & reports", "Priority support"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-blue-200 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <button className="mt-5 w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-[#1e40af] hover:bg-blue-50 transition-colors">
                  Upgrade Now
                </button>
              </div>
            </div>
          )}

          {/* Security section */}
          {activeSection === "security" && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-5">Security</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Change Password</p>
                    <p className="text-xs text-slate-500">Update your account password</p>
                  </div>
                  <button className="text-sm text-[#1e40af] hover:underline font-medium">Change →</button>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Two-Factor Authentication</p>
                    <p className="text-xs text-slate-500">Add an extra layer of security</p>
                  </div>
                  <span className="text-xs text-slate-400 italic">Coming soon</span>
                </div>
                <div className="pt-3">
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out of All Devices
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}