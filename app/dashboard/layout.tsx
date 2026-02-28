import { DashboardSidebar } from "./components/DashboardSidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      {/* pt-14 on mobile to offset fixed header, 0 on desktop */}
      <main className="flex-1 overflow-auto pt-14 lg:pt-0">{children}</main>
    </div>
  )
}
