"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Mail, Phone } from "lucide-react"
import { approveTherapist, rejectTherapist } from "@/app/actions/therapist"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Therapist {
  id: string
  full_name: string
  email: string
  phone: string
  specialization: string
  license_number: string
  years_of_experience: number
  qualifications: string
  bio: string
  approach: string
  session_rate: string
  availability: string
  status: string
}

export default function TherapistApprovalList({ therapists }: { therapists: Therapist[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleApprove = async (therapistId: string) => {
    setLoading(therapistId)
    const result = await approveTherapist(therapistId)
    if (result.success) {
      router.refresh()
    }
    setLoading(null)
  }

  const handleReject = async (therapistId: string) => {
    setLoading(therapistId)
    const result = await rejectTherapist(therapistId)
    if (result.success) {
      router.refresh()
    }
    setLoading(null)
  }

  return (
    <div className="space-y-4">
      {therapists.map((therapist) => (
        <Card key={therapist.id} className="glass border-0 p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold sm:text-lg">{therapist.full_name}</h3>
                <p className="text-sm text-purple-600">{therapist.specialization}</p>
              </div>
              <Badge variant="secondary">{therapist.status}</Badge>
            </div>

            <div className="grid gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="truncate">{therapist.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{therapist.phone}</span>
              </div>
            </div>

            <div className="space-y-2 rounded-lg bg-background/50 p-3 text-sm">
              <div>
                <span className="font-medium">License:</span> {therapist.license_number}
              </div>
              <div>
                <span className="font-medium">Experience:</span> {therapist.years_of_experience} years
              </div>
              <div>
                <span className="font-medium">Rate:</span> {therapist.session_rate}
              </div>
              <div>
                <span className="font-medium">Availability:</span> {therapist.availability}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p className="font-medium">Qualifications:</p>
              <p className="text-muted-foreground">{therapist.qualifications}</p>
            </div>

            <div className="space-y-2 text-sm">
              <p className="font-medium">Bio:</p>
              <p className="text-muted-foreground">{therapist.bio}</p>
            </div>

            <div className="space-y-2 text-sm">
              <p className="font-medium">Therapeutic Approach:</p>
              <p className="text-muted-foreground">{therapist.approach}</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => handleReject(therapist.id)}
                variant="outline"
                className="flex-1"
                disabled={loading === therapist.id}
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button
                onClick={() => handleApprove(therapist.id)}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                disabled={loading === therapist.id}
              >
                <Check className="mr-2 h-4 w-4" />
                {loading === therapist.id ? "Approving..." : "Approve"}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
