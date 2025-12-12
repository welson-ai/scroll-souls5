"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import CheckInModal from "@/components/check-in-modal"
import { useRouter } from "next/navigation"

interface Emotion {
  id: string
  name: string
  color_primary: string
  color_secondary: string
  emoji: string
}

export default function CheckInButton({
  emotions,
  userId,
  variant = "default",
  label = "Start Check-in",
  size = "lg",
}: {
  emotions: Emotion[]
  userId?: string // Made userId optional for anonymous check-ins
  variant?: "default" | "outline"
  label?: string
  size?: "default" | "sm" | "lg"
}) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleComplete = () => {
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant={variant} size={size} className="w-full sm:w-auto">
        {label}
      </Button>
      <CheckInModal
        emotions={emotions}
        userId={userId || ""} // Pass empty string for anonymous users
        open={isOpen}
        onOpenChange={setIsOpen}
        onComplete={handleComplete}
      />
    </>
  )
}
