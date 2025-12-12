"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { bookTherapist } from "@/app/actions/therapist"
import { Loader2 } from "lucide-react"

interface BookTherapistModalProps {
  therapist: { id: string; full_name: string }
  onClose: () => void
}

export default function BookTherapistModal({ therapist, onClose }: BookTherapistModalProps) {
  const [loading, setLoading] = useState(false)
  const [sessionType, setSessionType] = useState<string>("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append("therapist_id", therapist.id)
    formData.append("session_type", sessionType)

    const result = await bookTherapist(formData)

    if (result.success) {
      alert("Booking request sent! The therapist will confirm your session.")
      onClose()
    } else {
      alert(result.error || "Failed to book session")
    }
    setLoading(false)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book Session with {therapist.full_name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session_date">Preferred Date & Time *</Label>
            <Input id="session_date" name="session_date" type="datetime-local" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="session_type">Session Type *</Label>
            <Select value={sessionType} onValueChange={setSessionType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select session type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video Call</SelectItem>
                <SelectItem value="audio">Audio Call</SelectItem>
                <SelectItem value="chat">Text Chat</SelectItem>
                <SelectItem value="in-person">In-Person</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea id="notes" name="notes" placeholder="Any specific topics you'd like to discuss?" rows={3} />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !sessionType} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Request Booking
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
