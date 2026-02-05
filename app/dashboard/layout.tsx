// import { redirect } from "next/navigation"
// import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { SignOutButton } from "./components/SignOutButton"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // const supabase = await createClient()
  // const { data: { user } } = await supabase.auth.getUser()
  // if (!user) {
  //   redirect("/login")
  // }
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/dashboard" className="font-semibold">
            ProofDrop
          </Link>
          <SignOutButton />
        </div>
      </header>
      {children}
    </div>
  )
}
