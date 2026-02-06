"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function SignOutButton({ iconOnly }: { iconOnly?: boolean }) {
  const router = useRouter()
  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }
  if (iconOnly) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={handleSignOut}
        aria-label="Log out"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    )
  }
  return (
    <Button type="button" variant="ghost" size="sm" onClick={handleSignOut}>
      Sign out
    </Button>
  )
}
