"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { registerAsTherapist } from "@/app/actions/therapist"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface TherapistRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TherapistRegistrationModal({ isOpen, onClose }: TherapistRegistrationModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const result = await registerAsTherapist(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      onClose()
      router.refresh()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Therapist Registration</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input id="full_name" name="full_name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license_number">License Number *</Label>
              <Input id="license_number" name="license_number" required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization *</Label>
              <Input id="specialization" name="specialization" required placeholder="e.g., CBT, Trauma, Anxiety" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="years_of_experience">Years of Experience *</Label>
              <Input id="years_of_experience" name="years_of_experience" type="number" min="0" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualifications">Qualifications *</Label>
            <Textarea
              id="qualifications"
              name="qualifications"
              required
              placeholder="List your degrees, certifications, and training"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio *</Label>
            <Textarea
              id="bio"
              name="bio"
              required
              placeholder="Tell us about your approach to therapy and what makes you unique"
              rows={4}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="approach">Therapeutic Approach</Label>
              <Input id="approach" name="approach" placeholder="e.g., Person-centered, Psychodynamic" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session_rate">Session Rate</Label>
              <Input id="session_rate" name="session_rate" placeholder="e.g., $100-150/hour" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability">Availability</Label>
            <Input id="availability" name="availability" placeholder="e.g., Mon-Fri 9am-5pm" />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Application
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
