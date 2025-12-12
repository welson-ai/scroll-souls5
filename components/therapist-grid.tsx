"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MessageCircle } from "lucide-react"
import { useState } from "react"
import TherapistProfileModal from "./therapist-profile-modal"

interface Therapist {
  id: string
  full_name: string
  specialization: string
  years_of_experience: number
  bio: string
  session_rate: string | null
  profile_image_url: string | null
  qualifications: string
  approach: string | null
  availability: string | null
  email: string
  phone: string | null
}

interface TherapistGridProps {
  therapists: Therapist[]
}

export default function TherapistGrid({ therapists }: TherapistGridProps) {
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null)

  if (therapists.length === 0) {
    return (
      <Card className="glass border-0 p-8 text-center">
        <p className="text-sm text-muted-foreground">No therapists available yet. Check back soon!</p>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {therapists.map((therapist) => (
          <Card
            key={therapist.id}
            className="glass cursor-pointer border-0 p-4 transition-all hover:scale-105"
            onClick={() => setSelectedTherapist(therapist)}
          >
            <div className="mb-3 flex items-start gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-lg font-bold text-white">
                {therapist.full_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="truncate font-semibold">{therapist.full_name}</h3>
                <p className="truncate text-xs text-muted-foreground">{therapist.specialization}</p>
              </div>
            </div>
            <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{therapist.bio}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                {therapist.years_of_experience}+ years
              </Badge>
              {therapist.session_rate && (
                <Badge variant="outline" className="text-xs">
                  {therapist.session_rate}
                </Badge>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span className="hidden sm:inline">Book</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageCircle className="h-3 w-3" />
                <span className="hidden sm:inline">Chat</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {selectedTherapist && (
        <TherapistProfileModal therapist={selectedTherapist} onClose={() => setSelectedTherapist(null)} />
      )}
    </>
  )
}
