"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Loader2 } from "lucide-react"
import { createMoodPost } from "@/app/actions/mood-wall"
import { useRouter } from "next/navigation"

interface CreateMoodPostButtonProps {
  emotions: any[]
}

export default function CreateMoodPostButton({ emotions }: CreateMoodPostButtonProps) {
  const [open, setOpen] = useState(false)
  const [selectedEmotion, setSelectedEmotion] = useState<any>(null)
  const [intensity, setIntensity] = useState(3)
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    if (!selectedEmotion || !content.trim()) return

    setIsSubmitting(true)
    console.log("[v0] Submitting mood post:", {
      emotionId: selectedEmotion.id,
      intensity,
      content: content.substring(0, 50),
    })

    const formData = new FormData()
    formData.append("emotionId", selectedEmotion.id)
    formData.append("content", content)
    formData.append("intensity", intensity.toString())

    const result = await createMoodPost(formData)
    console.log("[v0] Mood post result:", result)

    if (result.success) {
      setOpen(false)
      setSelectedEmotion(null)
      setContent("")
      setIntensity(3)
      router.refresh()
    }

    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Your Mood</DialogTitle>
          <DialogDescription>Post anonymously to the community mood wall</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">How are you feeling?</label>
            <div className="grid grid-cols-4 gap-2">
              {emotions.map((emotion) => (
                <button
                  key={emotion.id}
                  onClick={() => setSelectedEmotion(emotion)}
                  className={`flex flex-col items-center gap-1 rounded-lg border-2 p-2 transition-all sm:p-3 ${
                    selectedEmotion?.id === emotion.id
                      ? "scale-105 border-primary bg-primary/10"
                      : "border-transparent bg-accent hover:bg-accent/80"
                  }`}
                >
                  <span className="text-xl sm:text-2xl">{emotion.emoji}</span>
                  <span className="text-xs font-medium">{emotion.name}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedEmotion && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium">Intensity</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setIntensity(level)}
                      className={`h-10 flex-1 rounded-lg border-2 text-sm transition-all ${
                        intensity === level
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Share your thoughts</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={4}
                  className="resize-none"
                />
              </div>

              <Button onClick={handleSubmit} disabled={isSubmitting || !content.trim()} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post Anonymously"
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
