"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import TherapistRegistrationModal from "./therapist-registration-modal"

export default function TherapistRegistrationButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <UserPlus className="h-4 w-4" />
        <span className="hidden sm:inline">Apply as Therapist</span>
        <span className="sm:hidden">Apply</span>
      </Button>
      <TherapistRegistrationModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
