"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { saveCheckIn } from "@/app/actions/check-in"

interface Emotion {
  id: string
  name: string
  color_primary: string
  color_secondary: string
  emoji: string
}

interface Profile {
  id: string
  display_name: string
  current_level: number
  total_xp: number
  streak_days: number
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
  "Personal Growth",
  "Creativity",
]

export default function EmotionCheckIn({
  emotions,
  profile,
  userId,
}: {
  emotions: Emotion[]
  profile: Profile | null
  userId: string
}) {
  const [step, setStep] = useState<"emotion" | "intensity" | "triggers">("emotion")
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null)
  const [intensity, setIntensity] = useState([3])
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([])
  const [customTrigger, setCustomTrigger] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

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

  const addCustomTrigger = () => {
    if (customTrigger.trim() && !selectedTriggers.includes(customTrigger.trim())) {
      setSelectedTriggers((prev) => [...prev, customTrigger.trim()])
      setCustomTrigger("")
    }
  }

  const handleSubmit = async () => {
    if (!selectedEmotion) return

    setIsLoading(true)
    try {
      const result = await saveCheckIn({
        userId,
        emotionId: selectedEmotion.id,
        intensity: intensity[0],
        triggers: selectedTriggers,
      })

      if (result.success) {
        router.push(`/check-in/complete?emotion=${selectedEmotion.id}`)
      }
    } catch (error) {
      console.error("[v0] Error saving check-in:", error)
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

  const getEmotionColor = (emotionId: string) => {
    const emotion = emotions.find((e) => e.id === emotionId)
    return emotion?.color_primary || "#3B82F6"
  }

  return (
    <div className={`min-h-svh bg-gradient-to-br ${getBgGradient()} pb-20 transition-colors duration-500`}>
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">Scroll Souls</h1>
          </div>
          {profile && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Level {profile.current_level}</Badge>
              <Badge variant="outline">
                <span className="mr-1">🔥</span>
                {profile.streak_days} day{profile.streak_days !== 1 ? "s" : ""}
              </Badge>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-6 py-12">
        {/* Progress indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div
            className={`h-2 w-16 rounded-full transition-colors ${step === "emotion" ? "bg-primary" : "bg-primary/30"}`}
          />
          <div
            className={`h-2 w-16 rounded-full transition-colors ${
              step === "intensity" ? "bg-primary" : "bg-primary/30"
            }`}
          />
          <div
            className={`h-2 w-16 rounded-full transition-colors ${
              step === "triggers" ? "bg-primary" : "bg-primary/30"
            }`}
          />
        </div>

        {/* Step 1: Emotion Selection */}
        {step === "emotion" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-balance">How are you feeling?</h2>
              <p className="mt-2 text-muted-foreground">Select the emotion that best describes your current state</p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {emotions.map((emotion) => (
                <Card
                  key={emotion.id}
                  className="cursor-pointer border-2 p-6 text-center transition-all hover:scale-105 hover:shadow-lg"
                  style={{
                    borderColor: selectedEmotion?.id === emotion.id ? emotion.color_primary : "transparent",
                  }}
                  onClick={() => handleEmotionSelect(emotion)}
                >
                  <div className="mb-2 text-4xl">{emotion.emoji}</div>
                  <p className="font-medium">{emotion.name}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Intensity Selection */}
        {step === "intensity" && selectedEmotion && (
          <div className="space-y-6">
            <button onClick={() => setStep("emotion")} className="mb-4 text-sm text-muted-foreground hover:underline">
              ← Back
            </button>

            <div className="text-center">
              <div className="mb-4 text-6xl">{selectedEmotion.emoji}</div>
              <h2 className="text-3xl font-bold text-balance">How intense is your {selectedEmotion.name}?</h2>
              <p className="mt-2 text-muted-foreground">Slide to rate the intensity of your feeling</p>
            </div>

            <Card className="p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <div
                    className="inline-flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white"
                    style={{ backgroundColor: getEmotionColor(selectedEmotion.id) }}
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

            <Button onClick={handleIntensityNext} className="w-full" size="lg">
              Continue
            </Button>
          </div>
        )}

        {/* Step 3: Triggers Selection */}
        {step === "triggers" && selectedEmotion && (
          <div className="space-y-6">
            <button onClick={() => setStep("intensity")} className="mb-4 text-sm text-muted-foreground hover:underline">
              ← Back
            </button>

            <div className="text-center">
              <div className="mb-4 text-6xl">{selectedEmotion.emoji}</div>
              <h2 className="text-3xl font-bold text-balance">What triggered this feeling?</h2>
              <p className="mt-2 text-muted-foreground">Select or add what influenced your emotional state</p>
            </div>

            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <Label className="mb-3 block text-sm font-medium">Common triggers</Label>
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

                <div>
                  <Label htmlFor="custom-trigger" className="mb-2 block text-sm font-medium">
                    Add custom trigger
                  </Label>
                  <div className="flex gap-2">
                    <input
                      id="custom-trigger"
                      type="text"
                      value={customTrigger}
                      onChange={(e) => setCustomTrigger(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCustomTrigger()}
                      placeholder="Type something..."
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <Button onClick={addCustomTrigger} variant="outline" size="default">
                      Add
                    </Button>
                  </div>
                </div>

                {selectedTriggers.length > 0 && (
                  <div>
                    <Label className="mb-2 block text-sm font-medium">Selected triggers</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedTriggers.map((trigger) => (
                        <Badge key={trigger} variant="default">
                          {trigger}
                          <button onClick={() => toggleTrigger(trigger)} className="ml-2 hover:text-destructive">
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
              <Button onClick={handleSubmit} disabled={isLoading} className="flex-1" size="lg">
                {isLoading ? "Saving..." : "Complete Check-in"}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
