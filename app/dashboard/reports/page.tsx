"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Package, CheckCircle, Clock, ShieldCheck, TrendingUp, Download,
  Truck, Users, Loader2, BarChart3,
} from "lucide-react"

interface DeliveryRow {
  id: string
  customer_name: string
  customer_phone: string
  driver_phone?: string | null
  driver_id?: string | null
  status: string
  created_at: string
  completed_at?: string | null
  ai_verified?: boolean | null
  ai_confidence?: number | null
  delivery_address?: string | null
}

interface DriverRow {
  id: string
  full_name: string
  phone: string
}

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
]

function fmtDuration(minutes: number): string {
  if (!isFinite(minutes)) return "—"
  if (minutes < 60) return `${Math.round(minutes)} min`
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return m ? `${h}h ${m}m` : `${h}h`
}

export default function ReportsPage() {
  const [deliveries, setDeliveries] = useState<DeliveryRow[]>([])
  const [drivers, setDrivers] = useState<DriverRow[]>([])
  const [loading, setLoading] = useState(true)
  const [rangeDays, setRangeDays] = useState(30)

  useEffect(() => {
    Promise.all([
      fetch("/api/deliveries").then((r) => r.json()).catch(() => []),
      fetch("/api/drivers").then((r) => r.json()).catch(() => []),
    ]).then(([d, dr]) => {
      if (Array.isArray(d)) setDeliveries(d)
      if (Array.isArray(dr)) setDrivers(dr)
      setLoading(false)
    })
  }, [])

  const cutoff = Date.now() - rangeDays * 86400000
  const scoped = useMemo(
    () => deliveries.filter((d) => new Date(d.created_at).getTime() >= cutoff),
    [deliveries, cutoff]
  )

  const stats = useMemo(() => {
    const total = scoped.length
    const completed = scoped.filter((d) => d.status === "completed")
    const pending = scoped.filter((d) => d.status === "pending")
    const failed = scoped.filter((d) => d.status === "failed")

    const durations = completed
      .filter((d) => d.completed_at)
      .map((d) =>
        (new Date(d.completed_at as string).getTime() - new Date(d.created_at).getTime()) / 60000
      )
      .filter((m) => m >= 0 && m < 24 * 60) // sane window
    const avgMinutes = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : NaN

    const aiChecked = completed.filter((d) => d.ai_verified != null)
    const aiPassed = aiChecked.filter((d) => d.ai_verified === true)

    return {
      total,
      completed,
      pending,
      failed,
      completionRate: total ? (completed.length / total) * 100 : 0,
      avgMinutes,
      aiPassRate: aiChecked.length ? (aiPassed.length / aiChecked.length) * 100 : null,
      avgConfidence: aiPassed.length
        ? (aiPassed.reduce((a, d) => a + (d.ai_confidence || 0), 0) / aiPassed.length) * 100
        : null,
    }
  }, [scoped])

  // Deliveries per day (bar chart data)
  const daily = useMemo(() => {
    const buckets: { date: Date; total: number; completed: number }[] = []
    for (let i = rangeDays - 1; i >= 0; i--) {
      buckets.push({
        date: new Date(Date.now() - i * 86400000),
        total: 0,
        completed: 0,
      })
    }
    scoped.forEach((d) => {
      const created = new Date(d.created_at)
      const dayIdx = Math.floor(
        (new Date(created.toDateString()).getTime() -
          new Date(new Date().toDateString()).getTime()) / 86400000
      )
      const idx = dayIdx + rangeDays - 1
      if (idx >= 0 && idx < buckets.length) {
        buckets[idx].total++
        if (d.status === "completed") buckets[idx].completed++
      }
    })
    return buckets
  }, [scoped, rangeDays])

  // Driver leaderboard
  const driverStats = useMemo(() => {
    const driverById = new Map(drivers.map((d) => [d.id, d]))
    const map = new Map<string, { name: string; completed: number; total: number; aiPassed: number; aiChecked: number }>()
    scoped.forEach((d) => {
      const key = d.driver_id || d.driver_phone || "unassigned"
      const name = d.driver_id
        ? driverById.get(d.driver_id)?.full_name || d.driver_phone || "Unknown driver"
        : d.driver_phone || "Unassigned"
      const cur = map.get(key) || { name, completed: 0, total: 0, aiPassed: 0, aiChecked: 0 }
      cur.total++
      if (d.status === "completed") cur.completed++
      if (d.ai_verified != null) {
        cur.aiChecked++
        if (d.ai_verified) cur.aiPassed++
      }
      map.set(key, cur)
    })
    return Array.from(map.values()).sort((a, b) => b.completed - a.completed || b.total - a.total).slice(0, 8)
  }, [scoped, drivers])

  // Top customers
  const topCustomers = useMemo(() => {
    const map = new Map<string, number>()
    scoped.forEach((d) => map.set(d.customer_name, (map.get(d.customer_name) || 0) + 1))
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [scoped])

  function exportCsv() {
    const header = "id,customer,status,created_at,completed_at,driver_phone,ai_verified,ai_confidence,address"
    const rows = scoped.map((d) =>
      [
        d.id,
        `"${d.customer_name.replace(/"/g, '""')}"`,
        d.status,
        d.created_at,
        d.completed_at || "",
        d.driver_phone || "",
        d.ai_verified == null ? "" : d.ai_verified ? "true" : "false",
        d.ai_confidence ?? "",
        `"${(d.delivery_address || "").replace(/"/g, '""')}"`,
      ].join(",")
    )
    const csv = [header, ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `proofdrop-deliveries-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin text-[#1e40af]" />
          <p className="text-sm">Loading reports…</p>
        </div>
      </div>
    )
  }

  const maxDaily = Math.max(1, ...daily.map((d) => d.total))

  return (
    <div className="p-4 lg:p-8 bg-slate-50 min-h-full">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="mt-1 text-sm text-slate-500">
            Delivery performance, AI verification quality and driver productivity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setRangeDays(r.days)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  rangeDays === r.days
                    ? "bg-[#1e40af] text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <KpiCard
          icon={Package}
          label="Deliveries"
          value={String(stats.total)}
          sub={`${stats.pending.length} pending · ${stats.failed.length} failed`}
          iconBg="bg-blue-50 text-blue-600"
        />
        <KpiCard
          icon={CheckCircle}
          label="Completion rate"
          value={`${stats.completionRate.toFixed(0)}%`}
          sub={`${stats.completed.length} completed`}
          iconBg="bg-green-50 text-green-600"
        />
        <KpiCard
          icon={Clock}
          label="Avg. time to complete"
          value={fmtDuration(stats.avgMinutes)}
          sub="created → confirmed"
          iconBg="bg-amber-50 text-amber-600"
        />
        <KpiCard
          icon={ShieldCheck}
          label="AI verification pass"
          value={stats.aiPassRate === null ? "—" : `${stats.aiPassRate.toFixed(0)}%`}
          sub={stats.avgConfidence !== null ? `avg confidence ${stats.avgConfidence.toFixed(0)}%` : "no AI data yet"}
          iconBg="bg-violet-50 text-violet-600"
        />
      </div>

      {/* Charts row */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Volume bar chart */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <BarChart3 className="h-4 w-4 text-slate-400" />
              Delivery volume — last {rangeDays} days
            </h2>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-green-500" /> completed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#1e40af]/70" /> pending / failed
              </span>
            </div>
          </div>
          <div className="flex items-end gap-[3px] h-40">
            {daily.map((d, i) => {
              const totalH = (d.total / maxDaily) * 100
              const compPct = d.total ? (d.completed / d.total) * 100 : 0
              return (
                <div
                  key={i}
                  className="group relative flex-1 flex flex-col justify-end h-full"
                  title={`${d.date.toLocaleDateString()} — ${d.total} deliveries (${d.completed} completed)`}
                >
                  <div
                    className="w-full rounded-t-sm overflow-hidden flex flex-col transition-opacity group-hover:opacity-80"
                    style={{ height: `${Math.max(totalH, d.total ? 3 : 0)}%` }}
                  >
                    <div
                      className="w-full bg-[#1e40af]/70"
                      style={{ height: `${100 - compPct}%` }}
                    />
                    <div
                      className="w-full bg-green-500"
                      style={{ height: `${compPct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-slate-400">
            <span>{daily[0]?.date.toLocaleDateString()}</span>
            <span>{daily[daily.length - 1]?.date.toLocaleDateString()}</span>
          </div>
        </div>

        {/* Status donut */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Status breakdown</h2>
          <StatusDonut
            completed={stats.completed.length}
            pending={stats.pending.length}
            failed={stats.failed.length}
          />
          <div className="mt-4 space-y-2">
            {[
              { label: "Completed", value: stats.completed.length, color: "bg-green-500" },
              { label: "Pending", value: stats.pending.length, color: "bg-amber-400" },
              { label: "Failed", value: stats.failed.length, color: "bg-red-400" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-sm">
                <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                <span className="text-slate-600">{s.label}</span>
                <span className="ml-auto font-semibold text-slate-900">{s.value}</span>
                <span className="text-xs text-slate-400 w-10 text-right">
                  {stats.total ? ((s.value / stats.total) * 100).toFixed(0) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Driver leaderboard + top customers */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-5 pb-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Truck className="h-4 w-4 text-slate-400" />
              Driver performance
            </h2>
          </div>
          {driverStats.length === 0 ? (
            <p className="p-5 pt-0 text-sm text-slate-400">No driver activity in this period.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                    <th className="px-5 py-2.5">Driver</th>
                    <th className="px-3 py-2.5">Completed</th>
                    <th className="px-3 py-2.5">Total</th>
                    <th className="px-3 py-2.5">Success</th>
                    <th className="px-5 py-2.5">AI pass</th>
                  </tr>
                </thead>
                <tbody>
                  {driverStats.map((d) => (
                    <tr key={d.name} className="border-b border-slate-50 last:border-0">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-[10px] font-bold text-blue-700">
                            {d.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </span>
                          <span className="font-medium text-slate-900">{d.name}</span>
                          {d.name === driverStats[0].name && d.completed > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                              <TrendingUp className="h-2.5 w-2.5" /> Top
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 font-semibold text-slate-900">{d.completed}</td>
                      <td className="px-3 py-3 text-slate-500">{d.total}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-green-500"
                              style={{ width: `${d.total ? (d.completed / d.total) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">
                            {d.total ? Math.round((d.completed / d.total) * 100) : 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {d.aiChecked ? (
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              d.aiPassed / d.aiChecked > 0.9
                                ? "bg-green-50 text-green-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {Math.round((d.aiPassed / d.aiChecked) * 100)}%
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top customers */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-4">
            <Users className="h-4 w-4 text-slate-400" />
            Top customers
          </h2>
          {topCustomers.length === 0 ? (
            <p className="text-sm text-slate-400">No customers in this period.</p>
          ) : (
            <div className="space-y-3">
              {topCustomers.map(([name, count], i) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{name}</p>
                    <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#1e40af]"
                        style={{ width: `${(count / topCustomers[0][1]) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{count}</span>
                </div>
              ))}
            </div>
          )}
          <Link
            href="/dashboard/customers"
            className="mt-4 inline-block text-xs font-medium text-[#1e40af] hover:underline"
          >
            View all customers →
          </Link>
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  iconBg,
}: {
  icon: any
  label: string
  value: string
  sub: string
  iconBg: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 lg:p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500 leading-tight">{label}</p>
          <p className="text-lg lg:text-2xl font-bold text-slate-900 leading-tight mt-0.5">{value}</p>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-slate-400 truncate">{sub}</p>
    </div>
  )
}

function StatusDonut({ completed, pending, failed }: { completed: number; pending: number; failed: number }) {
  const total = completed + pending + failed
  const R = 52
  const C = 2 * Math.PI * R
  const segs =
    total === 0
      ? []
      : [
          { value: completed, color: "#22c55e" },
          { value: pending, color: "#fbbf24" },
          { value: failed, color: "#f87171" },
        ]
  let offset = 0

  return (
    <div className="flex justify-center">
      <svg width="150" height="150" viewBox="0 0 130 130" className="-rotate-90">
        <circle cx="65" cy="65" r={R} fill="none" stroke="#f1f5f9" strokeWidth="14" />
        {segs.map((s, i) => {
          const frac = s.value / total
          const dash = frac * C
          const el = (
            <circle
              key={i}
              cx="65"
              cy="65"
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="14"
              strokeDasharray={`${dash} ${C - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          )
          offset += dash
          return el
        })}
        <text
          x="65"
          y="65"
          textAnchor="middle"
          dominantBaseline="central"
          className="rotate-90 fill-slate-900 text-2xl font-bold"
          style={{ transformOrigin: "65px 65px" }}
        >
          {total}
        </text>
      </svg>
    </div>
  )
}
