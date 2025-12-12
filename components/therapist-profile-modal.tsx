"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MessageCircle, Mail, Phone } from "lucide-react"
import { useState } from "react"
import BookTherapistModal from "./book-therapist-modal"
import ChatWithTherapistModal from "./chat-with-therapist-modal"

interface Therapist {
  id: string
  full_name: string
  email: string
  phone: string | null
  specialization: string
  years_of_experience: number
  bio: string
  qualifications: string
  approach: string | null
  availability: string | null
  session_rate: string | null
}

interface TherapistProfileModalProps {
  therapist: Therapist
  onClose: () => void
}

export default function TherapistProfileModal({ therapist, onClose }: TherapistProfileModalProps) {
  const [showBooking, setShowBooking] = useState(false)
  const [showChat, setShowChat] = useState(false)

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-2xl font-bold text-white">
                {therapist.full_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle>{therapist.full_name}</DialogTitle>
                <p className="text-sm text-muted-foreground">{therapist.specialization}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="secondary">{therapist.years_of_experience}+ years experience</Badge>
                  {therapist.session_rate && <Badge variant="outline">{therapist.session_rate}</Badge>}
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold">About</h3>
              <p className="text-sm text-muted-foreground">{therapist.bio}</p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">Qualifications</h3>
              <p className="text-sm text-muted-foreground">{therapist.qualifications}</p>
            </div>

            {therapist.approach && (
              <div>
                <h3 className="mb-2 font-semibold">Therapeutic Approach</h3>
                <p className="text-sm text-muted-foreground">{therapist.approach}</p>
              </div>
            )}

            {therapist.availability && (
              <div>
                <h3 className="mb-2 font-semibold">Availability</h3>
                <p className="text-sm text-muted-foreground">{therapist.availability}</p>
              </div>
            )}

            <div>
              <h3 className="mb-2 font-semibold">Contact</h3>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {therapist.email}
                </div>
                {therapist.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {therapist.phone}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={() => setShowBooking(true)} className="flex-1 gap-2">
                <Calendar className="h-4 w-4" />
                Book Session
              </Button>
              <Button onClick={() => setShowChat(true)} variant="outline" className="flex-1 gap-2">
                <MessageCircle className="h-4 w-4" />
                Chat
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showBooking && <BookTherapistModal therapist={therapist} onClose={() => setShowBooking(false)} />}
      {showChat && <ChatWithTherapistModal therapist={therapist} onClose={() => setShowChat(false)} />}
    </>
  )
}
