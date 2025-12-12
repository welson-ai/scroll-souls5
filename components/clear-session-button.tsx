"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function ClearSessionButton() {
  const router = useRouter()

  const handleClearSession = async () => {
    const cookies = document.cookie.split(";")

    for (const cookie of cookies) {
      const eqPos = cookie.indexOf("=")
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim()

      if (name.includes("supabase") || name.includes("sb-")) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      }
    }

    // Force a hard refresh to clear all state
    window.location.href = "/auth/login"
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClearSession}>
      Clear Session & Restart
    </Button>
  )
}
