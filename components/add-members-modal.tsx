"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { addMembersToOrganization } from "@/app/actions/organizations"

interface AddMembersModalProps {
  isOpen: boolean
  onClose: () => void
  organizationId: string
  onMembersAdded: () => void
}

export default function AddMembersModal({ isOpen, onClose, organizationId, onMembersAdded }: AddMembersModalProps) {
  const [email, setEmail] = useState("")
  const [selectedEmails, setSelectedEmails] = useState<{ email: string; userId: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [validating, setValidating] = useState(false)

  const handleAddEmail = async () => {
    if (!email.trim()) return

    setError("")
    setValidating(true)

    try {
      const supabase = createClient()

      console.log("[v0] Searching for email:", email.trim())

      // Check if user exists in profiles table
      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", email.trim())
        .single()

      console.log("[v0] Profile query result:", { userProfile, profileError })

      if (profileError || !userProfile) {
        const { data: allProfiles, error: allError } = await supabase.from("profiles").select("id, email")

        console.log("[v0] All profiles in database:", allProfiles)
        console.log("[v0] Query error:", allError)

        setError("User with this email not found in the database")
        setValidating(false)
        return
      }

      // Check if already added to the list
      if (selectedEmails.some((e) => e.userId === userProfile.id)) {
        setError("This user is already in the list")
        setValidating(false)
        return
      }

      // Check if user is already a member of the organization
      const { data: existingMember } = await supabase
        .from("organization_members")
        .select("user_id")
        .eq("org_id", organizationId)
        .eq("user_id", userProfile.id)
        .single()

      if (existingMember) {
        setError("This user is already a member of this organization")
        setValidating(false)
        return
      }

      // Add to selected list
      setSelectedEmails([...selectedEmails, { email: userProfile.email, userId: userProfile.id }])
      setEmail("")
    } catch (error) {
      console.error("[v0] Error validating email:", error)
      setError("Error validating email")
    } finally {
      setValidating(false)
    }
  }

  const handleRemoveEmail = (userId: string) => {
    setSelectedEmails(selectedEmails.filter((e) => e.userId !== userId))
  }

  const handleAddMembers = async () => {
    if (selectedEmails.length === 0) return

    setLoading(true)
    try {
      const userIds = selectedEmails.map((e) => e.userId)
      const result = await addMembersToOrganization(organizationId, userIds)

      if (result.success) {
        setSelectedEmails([])
        setEmail("")
        onMembersAdded()
        onClose()
      } else {
        setError(result.error || "Failed to add members")
      }
    } catch (error) {
      console.error("[v0] Error adding members:", error)
      setError("Failed to add members")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Members</DialogTitle>
          <p className="text-sm text-muted-foreground">Enter email addresses to add members to your organization</p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Member Email</label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError("")
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddEmail()
                  }
                }}
                disabled={validating}
              />
              <Button onClick={handleAddEmail} disabled={!email.trim() || validating} variant="outline">
                {validating ? "Checking..." : "Add"}
              </Button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          {selectedEmails.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Members to add ({selectedEmails.length})</label>
              <div className="max-h-[200px] overflow-y-auto space-y-2 rounded-lg border p-2">
                {selectedEmails.map((item) => (
                  <div
                    key={item.userId}
                    className="flex items-center justify-between rounded-md bg-purple-50 px-3 py-2 text-sm"
                  >
                    <span className="truncate">{item.email}</span>
                    <button
                      onClick={() => handleRemoveEmail(item.userId)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
            onClick={handleAddMembers}
            disabled={loading || selectedEmails.length === 0}
          >
            {loading ? "Adding..." : `Add ${selectedEmails.length} Member${selectedEmails.length !== 1 ? "s" : ""}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
