"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { saveCheckIn } from "@/app/actions/check-in"
import { saveJournalEntry } from "@/app/actions/journal"
import { CheckCircle, Sparkles, ArrowLeft } from "lucide-react"

interface Emotion {
  id: string
  name: string
  color_primary: string
  color_secondary: string
  emoji: string
}

const COMMON_TRIGGERS = [
  "Work",
  "Relationships",
  "Family",
  "Health",
  "Money",
  "Sleep",
  "Exercise",
  "Social Media",
  "Weather",
  "News",
]

export default function CheckInModal({
  emotions,
  userId,
  open,
  onOpenChange,
  onComplete,
}: {
  emotions: Emotion[]
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: () => void
}) {
  const [step, setStep] = useState<"emotion" | "intensity" | "triggers" | "journal" | "complete">("emotion")
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null)
  const [intensity, setIntensity] = useState([3])
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([])
  const [journalContent, setJournalContent] = useState("")
  const [checkInId, setCheckInId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [earnedXP, setEarnedXP] = useState(0)
  const [levelUp, setLevelUp] = useState(false)

  const resetModal = () => {
    setStep("emotion")
    setSelectedEmotion(null)
    setIntensity([3])
    setSelectedTriggers([])
    setJournalContent("")
    setCheckInId(null)
    setEarnedXP(0)
    setLevelUp(false)
  }

  const handleClose = () => {
    resetModal()
    onOpenChange(false)
    if (onComplete) onComplete()
  }

  const handleEmotionSelect = (emotion: Emotion) => {
    setSelectedEmotion(emotion)
    setStep("intensity")
  }

  const handleIntensityNext = () => {
    setStep("triggers")
  }

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers((prev) => (prev.includes(trigger) ? prev.filter((t) => t !== trigger) : [...prev, trigger]))
  }

  const handleTriggersNext = async () => {
    if (!selectedEmotion) return

    setIsLoading(true)
    try {
      const result = await saveCheckIn({
        userId: userId || "",
        emotionId: selectedEmotion.id,
        intensity: intensity[0],
        triggers: selectedTriggers,
        isAnonymous: !userId, // Anonymous if no userId provided
      })

      if (result.success) {
        setCheckInId(result.checkInId)
        setEarnedXP(userId ? 10 : 0) // No XP for anonymous check-ins
        setLevelUp(result.levelUp || false)
        setStep("journal")
      }
    } catch (error) {
      console.error("Error saving check-in:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleJournalSubmit = async () => {
    if (!selectedEmotion || !checkInId) return

    if (journalContent.trim() && userId) {
      setIsLoading(true)
      try {
        const result = await saveJournalEntry({
          userId,
          emotionId: selectedEmotion.id,
          title: `${selectedEmotion.name} - ${new Date().toLocaleDateString()}`,
          content: journalContent,
          checkInId,
        })

        if (result.success) {
          setEarnedXP((prev) => prev + 20)
        }
      } catch (error) {
        console.error("Error saving journal:", error)
      } finally {
        setIsLoading(false)
      }
    }

    setStep("complete")
  }

  const handleSkipJournal = () => {
    setStep("complete")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Step 1: Emotion Selection */}
        {step === "emotion" && (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl text-center">How are you feeling?</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {emotions.map((emotion) => (
                <Card
                  key={emotion.id}
                  className="cursor-pointer border-2 p-3 text-center transition-all hover:scale-105 hover:shadow-md sm:p-4"
                  onClick={() => handleEmotionSelect(emotion)}
                >
                  <div className="mb-1 text-2xl sm:text-3xl">{emotion.emoji}</div>
                  <p className="text-xs font-medium sm:text-sm">{emotion.name}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Intensity Selection */}
        {step === "intensity" && selectedEmotion && (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-center">
                <div className="mb-2 text-4xl">{selectedEmotion.emoji}</div>
                How intense is your {selectedEmotion.name}?
              </DialogTitle>
            </DialogHeader>

            <Card className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <div
                    className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white"
                    style={{ backgroundColor: selectedEmotion.color_primary }}
                  >
                    {intensity[0]}
                  </div>
                </div>

                <div className="space-y-2">
                  <Slider value={intensity} onValueChange={setIntensity} min={1} max={5} step={1} className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Mild</span>
                    <span>Moderate</span>
                    <span>Intense</span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button onClick={() => setStep("emotion")} variant="outline" className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleIntensityNext} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Triggers Selection */}
        {step === "triggers" && selectedEmotion && (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-center">
                <div className="mb-2 text-4xl">{selectedEmotion.emoji}</div>
                What triggered this feeling?
              </DialogTitle>
            </DialogHeader>

            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block text-sm font-medium">Common triggers (optional)</Label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_TRIGGERS.map((trigger) => (
                      <Badge
                        key={trigger}
                        variant={selectedTriggers.includes(trigger) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTrigger(trigger)}
                      >
                        {trigger}
                      </Badge>
                    ))}
                  </div>
                </div>

                {selectedTriggers.length > 0 && (
                  <div>
                    <Label className="mb-2 block text-sm font-medium">Selected</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedTriggers.map((trigger) => (
                        <Badge key={trigger}>
                          {trigger}
                          <button onClick={() => toggleTrigger(trigger)} className="ml-1 hover:text-destructive">
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex gap-3">
              <Button onClick={() => setStep("intensity")} variant="outline" className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleTriggersNext} disabled={isLoading} className="flex-1">
                {isLoading ? "Saving..." : "Continue"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Optional Journal Entry */}
        {step === "journal" && selectedEmotion && (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-center">
                <div className="mb-2 text-4xl">{selectedEmotion.emoji}</div>
                Want to talk about it?
              </DialogTitle>
              <p className="text-center text-sm text-muted-foreground">Optional - Write a journal entry (+20 XP)</p>
            </DialogHeader>

            <Card className="p-4">
              <Textarea
                placeholder="What's on your mind? How are you feeling about this..."
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </Card>

            <div className="flex gap-3">
              <Button onClick={handleSkipJournal} variant="outline" className="flex-1 bg-transparent">
                Skip
              </Button>
              <Button onClick={handleJournalSubmit} disabled={isLoading || !journalContent.trim()} className="flex-1">
                {isLoading ? "Saving..." : "Save Journal"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Complete */}
        {step === "complete" && selectedEmotion && (
          <div className="space-y-6 py-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>

            <div>
              <h3 className="mb-2 text-2xl font-bold">Check-in Complete!</h3>
              {userId ? (
                <>
                  <p className="text-muted-foreground">You earned {earnedXP} XP!</p>
                  {levelUp && (
                    <div className="mt-2 flex items-center justify-center gap-2 text-yellow-600">
                      <Sparkles className="h-5 w-5" />
                      <span className="font-semibold">Level Up!</span>
                      <Sparkles className="h-5 w-5" />
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">Thank you for sharing your feelings!</p>
              )}
            </div>

            <Button onClick={handleClose} className="w-full" size="lg">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
