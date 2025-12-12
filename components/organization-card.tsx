"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Users } from "lucide-react"
import OrganizationDetailModal from "./organization-detail-modal"
import { createClient } from "@/lib/supabase/client"

interface OrganizationCardProps {
  organization: any
  currentUserId: string
}

export default function OrganizationCard({ organization, currentUserId }: OrganizationCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [memberCount, setMemberCount] = useState<number | null>(null)

  const handleOpenDetails = async () => {
    const supabase = createClient()
    const { count } = await supabase
      .from("organization_members")
      .select("*", { count: "exact", head: true })
      .eq("org_id", organization.id)
    setMemberCount(count)
    setIsOpen(true)
  }

  return (
    <>
      <Card
        className="glass group border-0 p-4 transition-all hover:scale-102 hover:shadow-xl sm:p-6 cursor-pointer"
        onClick={handleOpenDetails}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="rounded-full bg-blue-100 p-2 sm:p-3">
            <Building2 className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="mb-1 truncate text-base font-semibold sm:text-lg">{organization.name}</h4>
            {organization.description && (
              <p className="mb-3 line-clamp-2 text-xs text-muted-foreground sm:text-sm">{organization.description}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
              <Users className="h-4 w-4" />
              <span>{memberCount !== null ? memberCount : "-"} members</span>
            </div>
          </div>
          <Button size="sm" className="text-xs sm:text-sm">
            View
          </Button>
        </div>
      </Card>
      <OrganizationDetailModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        organization={organization}
        currentUserId={currentUserId}
        memberCount={memberCount}
      />
    </>
  )
}
