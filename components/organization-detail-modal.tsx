"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users, BarChart3, Plus, Send } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import AddMembersModal from "./add-members-modal"

interface OrganizationDetailModalProps {
  isOpen: boolean
  onClose: () => void
  organization: any
  currentUserId: string
  memberCount: number | null
}

export default function OrganizationDetailModal({
  isOpen,
  onClose,
  organization,
  currentUserId,
  memberCount,
}: OrganizationDetailModalProps) {
  const [showAddMembers, setShowAddMembers] = useState(false)
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [emotions, setEmotions] = useState<any[]>([])
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null)
  const [moodNote, setMoodNote] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [localMemberCount, setLocalMemberCount] = useState(memberCount)
  const isOwner = organization.owner_id === currentUserId

  useEffect(() => {
    if (isOpen && !showAddMembers) {
      fetchAnalytics()
      fetchEmotions()
    }
  }, [isOpen, showAddMembers, organization.id])

  const fetchEmotions = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("emotions").select("*")
    setEmotions(data || [])
  }

  const fetchAnalytics = async () => {
    setLoading(true)
    const supabase = createClient()

    // Get today's org check-ins
    const today = new Date().toISOString().split("T")[0]
    const { data: checkIns } = await supabase
      .from("check_ins")
      .select("emotion_id, emotions(name, emoji), intensity")
      .eq("org_id", organization.id)
      .gte("created_at", `${today}T00:00:00`)

    // Get updated member count
    const { count } = await supabase
      .from("organization_members")
      .select("*", { count: "exact", head: true })
      .eq("org_id", organization.id)

    setLocalMemberCount(count)

    setAnalytics({
      totalCheckIns: checkIns?.length || 0,
      emotionBreakdown: checkIns ? getEmotionBreakdown(checkIns) : [],
      suggestion: generateWellnessSuggestion(checkIns || []),
    })
    setLoading(false)
  }

  const getEmotionBreakdown = (checkIns: any[]) => {
    const breakdown: Record<string, { count: number; emoji: string }> = {}
    checkIns.forEach((ci: any) => {
      const name = ci.emotions?.name || "Unknown"
      const emoji = ci.emotions?.emoji || ""
      if (!breakdown[name]) breakdown[name] = { count: 0, emoji }
      breakdown[name].count += 1
    })
    return Object.entries(breakdown)
      .map(([emotion, data]) => ({
        emotion,
        count: data.count,
        emoji: data.emoji,
      }))
      .sort((a, b) => b.count - a.count)
  }

  const generateWellnessSuggestion = (checkIns: any[]) => {
    if (checkIns.length === 0) return "Encourage team members to check in today!"

    const emotionCounts: Record<string, number> = {}
    checkIns.forEach((ci: any) => {
      const emotion = ci.emotions?.name
      if (emotion) emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
    })

    const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0]

    const suggestions: Record<string, string> = {
      Stress: "Consider scheduling a team break or wellness session. High stress levels detected.",
      Sadness: "Team morale may need attention. Consider a supportive team meeting.",
      Anger: "Some tension in the team. Try a calming group activity or open discussion.",
      Fear: "Uncertainty detected. Provide clear communication and reassurance.",
      Tired: "Team energy is low. Consider lighter workloads or early finish today.",
      Joy: "Great team energy! Maintain momentum with positive recognition.",
      Love: "Strong team connection! Nurture these bonds with team activities.",
      Peace: "Team is balanced. Perfect time for creative or strategic work.",
    }

    return suggestions[topEmotion] || "Keep supporting each other's emotional wellness!"
  }

  const handleAnonymousCheckIn = async () => {
    if (!selectedEmotion) return
    setSubmitting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("check_ins").insert({
        user_id: currentUserId,
        emotion_id: selectedEmotion,
        intensity: 5,
        org_id: organization.id,
        triggers: moodNote ? [moodNote] : [],
      })

      if (error) throw error

      setSelectedEmotion(null)
      setMoodNote("")
      fetchAnalytics()
    } catch (error) {
      console.error("[v0] Error submitting check-in:", error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{organization.name}</DialogTitle>
            {organization.description && <p className="text-sm text-muted-foreground">{organization.description}</p>}
          </DialogHeader>

          {/* Organization Stats */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="bg-blue-50 border-0 p-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Members</p>
                  <p className="text-2xl font-bold">{localMemberCount || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-green-50 border-0 p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Today's Check-ins</p>
                  <p className="text-2xl font-bold">{analytics?.totalCheckIns || 0}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Anonymous Mood Check-in */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-0 p-4">
            <h3 className="text-sm font-semibold mb-3">Anonymous Mood Check-in</h3>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-3">
              {emotions.map((emotion) => (
                <button
                  key={emotion.id}
                  onClick={() => setSelectedEmotion(emotion.id)}
                  className={`p-2 rounded-lg text-2xl transition-all ${
                    selectedEmotion === emotion.id
                      ? "bg-purple-200 scale-110 ring-2 ring-purple-500"
                      : "bg-white hover:bg-purple-100"
                  }`}
                >
                  {emotion.emoji}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                placeholder="Why do you feel this way? (optional)"
                className="flex-1 rounded-lg border px-3 py-2 text-sm"
              />
              <Button
                size="sm"
                onClick={handleAnonymousCheckIn}
                disabled={!selectedEmotion || submitting}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Emotion Breakdown */}
          {analytics?.emotionBreakdown && analytics.emotionBreakdown.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Today's Team Emotions</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {analytics.emotionBreakdown.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <span className="text-lg">{item.emoji}</span>
                    <span className="flex-1">{item.emotion}</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                        style={{ width: `${(item.count / (analytics.totalCheckIns || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="font-semibold w-6 text-right">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wellness Suggestion */}
          {analytics?.suggestion && (
            <Card className="bg-amber-50 border-amber-200 p-4">
              <h3 className="text-sm font-semibold mb-1 text-amber-800">Wellness Insight</h3>
              <p className="text-sm text-amber-700">{analytics.suggestion}</p>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {isOwner && (
              <Button onClick={() => setShowAddMembers(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Members
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AddMembersModal
        isOpen={showAddMembers}
        onClose={() => setShowAddMembers(false)}
        organizationId={organization.id}
        onMembersAdded={() => {
          fetchAnalytics()
        }}
      />
    </>
  )
}
