"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import CreateOrganizationModal from "./create-organization-modal"

export default function CreateOrganizationButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button className="w-full gap-2 text-sm sm:text-base" onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4" />
        Create Organization
      </Button>
      <CreateOrganizationModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
