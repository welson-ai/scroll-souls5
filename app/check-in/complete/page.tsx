import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import BottomNav from "@/components/bottom-nav"

export default async function CheckInCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ emotion?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch emotion
  const { data: emotion } = await supabase.from("emotions").select("*").eq("id", params.emotion).single()

  // Fetch updated profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const getBgGradient = () => {
    if (!emotion) return "from-blue-50 to-purple-50"
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
    return emotionColors[emotion.id] || "from-blue-50 to-purple-50"
  }

  return (
    <div className={`min-h-svh bg-gradient-to-br ${getBgGradient()} p-6 pb-20`}>
      <div className="mx-auto max-w-2xl pt-12">
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            {emotion && <div className="mb-4 text-6xl">{emotion.emoji}</div>}
            <CardTitle className="text-3xl font-bold">Check-in Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 rounded-lg bg-muted/50 p-6 text-center">
              <p className="text-lg font-medium">You earned rewards!</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Badge variant="default" className="text-base">
                  +10 XP
                </Badge>
                {profile && (
                  <>
                    <Badge variant="outline" className="text-base">
                      Level {profile.current_level}
                    </Badge>
                    <Badge variant="secondary" className="text-base">
                      <span className="mr-1">🔥</span>
                      {profile.streak_days} day streak
                    </Badge>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link href="/home">Go to Home</Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent" size="lg">
                <Link href="/journal/new">Write a journal entry</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full" size="lg">
                <Link href="/analytics">View my analytics</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  )
}
