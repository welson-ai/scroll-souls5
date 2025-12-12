"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { saveJournalEntry } from "@/app/actions/journal"
import BottomNav from "@/components/bottom-nav"

interface Emotion {
  id: string
  name: string
  color_primary: string
  color_secondary: string
  emoji: string
}

interface CheckIn {
  id: string
  emotion_id: string
  emotions: Emotion
}

export default function JournalEntryForm({
  emotions,
  userId,
  latestCheckIn,
}: {
  emotions: Emotion[]
  userId: string
  latestCheckIn?: CheckIn | null
}) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(latestCheckIn?.emotions || emotions[0] || null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmotion || !content.trim()) return

    setIsLoading(true)
    try {
      const result = await saveJournalEntry({
        userId,
        emotionId: selectedEmotion.id,
        title: title.trim(),
        content: content.trim(),
        checkInId: latestCheckIn?.id,
      })

      if (result.success) {
        router.push("/journal")
      }
    } catch (error) {
      console.error("[v0] Error saving journal entry:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getBgGradient = () => {
    if (!selectedEmotion) return "from-blue-50 to-purple-50"
    const emotionColors: Record<string, string> = {
      joy: "from-yellow-50 to-amber-50",
      sadness: "from-blue-50 to-sky-50",
      anger: "from-red-50 to-orange-50",
      fear: "from-purple-50 to-violet-50",
      stress: "from-teal-50 to-cyan-50",
      peace: "from-green-50 to-emerald-50",
      love: "from-pink-50 to-rose-50",
      tired: "from-gray-50 to-slate-50",
    }
    return emotionColors[selectedEmotion.id] || "from-blue-50 to-purple-50"
  }

  return (
    <div className={`min-h-svh bg-gradient-to-br ${getBgGradient()} pb-20 transition-colors duration-500`}>
      <header className="border-b bg-white/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <h1 className="text-xl font-bold">New Journal Entry</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <form onSubmit={handleSubmit}>
          <Card className="p-6 shadow-lg">
            <div className="space-y-6">
              {/* Emotion Selection */}
              <div>
                <Label className="mb-3 block text-sm font-medium">How are you feeling?</Label>
                <div className="flex flex-wrap gap-2">
                  {emotions.map((emotion) => (
                    <Badge
                      key={emotion.id}
                      variant={selectedEmotion?.id === emotion.id ? "default" : "outline"}
                      className="cursor-pointer text-base"
                      onClick={() => setSelectedEmotion(emotion)}
                      style={
                        selectedEmotion?.id === emotion.id
                          ? { backgroundColor: emotion.color_primary, borderColor: "transparent" }
                          : {}
                      }
                    >
                      <span className="mr-1">{emotion.emoji}</span>
                      {emotion.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title" className="mb-2 block text-sm font-medium">
                  Title (optional)
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your entry a title..."
                  maxLength={100}
                />
              </div>

              {/* Content */}
              <div>
                <Label htmlFor="content" className="mb-2 block text-sm font-medium">
                  Your thoughts
                </Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Express yourself freely... What's on your mind?"
                  rows={12}
                  required
                  className="resize-none"
                />
                <p className="mt-2 text-sm text-muted-foreground">{content.length} characters</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !content.trim()} className="flex-1">
                  {isLoading ? "Saving..." : "Save Entry"}
                </Button>
              </div>
            </div>
          </Card>
        </form>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
